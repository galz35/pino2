

const BASE_URL = 'http://localhost:3010/api/v1';

async function runE2ETest() {
  console.log('--- EMPEZANDO PRUEBA 2.1 E2E ---');
  
  // 0. Get global stores
  const rawStores = await fetch(`${BASE_URL}/stores`).then(r => r.json());
  const stores = Array.isArray(rawStores) ? rawStores : rawStores.data || [];
  if (!stores.length) { console.error("No hay tiendas"); return; }
  const STORE_ID = stores[0].id;
  console.log("STORE_ID ->", STORE_ID);

  // 1. Get users
  const rawUsers = await fetch(`${BASE_URL}/users?storeId=${STORE_ID}`).then(r => r.json());
  const usersRes = Array.isArray(rawUsers) ? rawUsers : rawUsers.data || [];
  const gestor = usersRes.find(u => u.role === 'store_admin' || u.role === 'sales_manager' || u.name.toLowerCase().includes('gestor'));
  const vendedor = usersRes.find(u => u.role === 'vendor' || u.role === 'Vendedor Ambulante' || u.name.toLowerCase().includes('vendedor'));
  const rutero = usersRes.find(u => u.role === 'rutero' || u.role === 'Personal de Ruta (Rutero)' || u.name.toLowerCase().includes('rutero'));

  if (!gestor || !vendedor || !rutero) {
    console.log("USERS AVAILABLE:", usersRes.map(u => ({name: u.name, role: u.role})));
    console.error('Faltan usuarios:', { gestor: !!gestor, vendedor: !!vendedor, rutero: !!rutero });
    return;
  }
  console.log('Usuarios encontrados:', { Gestor: gestor.name, Vendedor: vendedor.name, Rutero: rutero.name });

  // 2. Get Products & Clients
  const rawProducts = await fetch(`${BASE_URL}/products?storeId=${STORE_ID}`).then(r => r.json());
  const products = Array.isArray(rawProducts) ? rawProducts : rawProducts.data || [];
  const rawClients = await fetch(`${BASE_URL}/clients?storeId=${STORE_ID}`).then(r => r.json());
  const clients = Array.isArray(rawClients) ? rawClients : rawClients.data || [];
  
  if (!products.length || !clients.length) {
    console.error('No hay productos o clientes.');
    return;
  }

  // 3. Crear 3 pedidos (Vendedor)
  console.log('\n--> VENDEDOR: Creando 3 pedidos (1 contado, 2 credito)...');
  const items = [{ productId: products[0].id, description: products[0].description, quantity: 2, unitPrice: products[0].salePrice || 10, costPrice: 0 }];
  const total = items[0].quantity * items[0].unitPrice;
  
  const createOrder = async (client, type, status) => {
    return await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId: STORE_ID,
        vendorId: vendedor.id || vendedor.uid,
        cashierName: vendedor.name,
        clientId: client.id,
        clientName: client.name,
        items, subtotal: total, tax: 0, total,
        paymentType: type, status, type: 'venta_directa'
      })
    }).then(r => r.json());
  };

  const o1 = await createOrder(clients[0], 'CONTADO', 'RECIBIDO');
  const o2 = await createOrder(clients[1], 'CREDITO', 'Pendiente de Pago');
  const o3 = await createOrder(clients[2] || clients[0], 'CREDITO', 'Pendiente de Pago');
  
  console.log('Pedidos creados:', [o1.id, o2.id, o3.id]);

  // 4. Asignar ruta (Gestor)
  console.log('\n--> GESTOR: Verificando pending deliveries y asignando a rutero...');
  const pending = await fetch(`${BASE_URL}/pending-deliveries?storeId=${STORE_ID}&status=Pendiente&unassigned=true`).then(r => r.json());
  
  const toAssignIds = pending.filter(p => [o1.id, o2.id, o3.id].includes(p.id)).map(p => p.id);
  console.log(`Se encontraron ${toAssignIds.length} pedidos pendientes de los recién creados`);
  
  await fetch(`${BASE_URL}/pending-deliveries/assign-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deliveryIds: toAssignIds,
      ruteroId: rutero.id || rutero.uid,
      ruteroName: rutero.name,
      assignedBy: gestor.name,
      storeId: STORE_ID
    })
  });
  console.log('Ruta asignada a:', rutero.name);

  // 5. Entregar (Rutero)
  console.log('\n--> RUTERO: Marcando entregas...');
  await fetch(`${BASE_URL}/pending-deliveries/${toAssignIds[0]}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Entregado', updatedBy: rutero.id || rutero.uid })
  });
  console.log('Entrega 1: Entregado');

  await fetch(`${BASE_URL}/pending-deliveries/${toAssignIds[1]}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Entregado', updatedBy: rutero.id || rutero.uid })
  });
  console.log('Entrega 2: Entregado (Crédito, genera CXC)');

  await fetch(`${BASE_URL}/pending-deliveries/${toAssignIds[2]}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'No Entregado', updatedBy: rutero.id || rutero.uid })
  });
  console.log('Entrega 3: No Entregado');

  // 6. Verificar Cobranzas (Gestor/Rutero)
  console.log('\n--> FINANZAS: Verificando Cuenta por Cobrar generada...');
  const receivables = await fetch(`${BASE_URL}/accounts-receivable?storeId=${STORE_ID}`).then(r => r.json());
  const cxc = receivables.find(r => r.orderId === toAssignIds[1]);
  if (cxc) {
    console.log('Cuenta por cobrar generada exitosamente por:', cxc.balance);
    
    console.log('Cobrando cuenta...');
    await fetch(`${BASE_URL}/accounts-receivable/${cxc.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: cxc.balance / 2, // pago parcial
        method: 'Efectivo',
        reference: 'Pago Parcial',
        cashierName: rutero.name
      })
    });
    console.log('Abono registrado exitosamente.');
  } else {
    console.log('ERROR: No se encontró CXC para el crédito entregado.');
  }

  console.log('\n--- PRUEBA E2E FLUIDA 2.1 COMPLETADA CON EXITO ---');
}

runE2ETest().catch(console.error);
