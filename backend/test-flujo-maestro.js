const axios = require('axios');

const API = 'http://localhost:3010/api';

async function runTest() {
  console.log('🚀 INICIANDO AUDITORÍA PUNTA A PUNTA DEL FLUJO COMERCIAL Y KARDEX\n');
  try {
    // ===== 1. LOGIN ADMIN =====
    console.log('1️⃣  Autenticando (Admin)...');
    let res = await axios.post(`${API}/auth/login`, { email: 'admin@multitienda.com', password: '123' });
    const token = res.data.accessToken;
    const ax = { headers: { Authorization: `Bearer ${token}` } };

    // Buscar tienda
    let storeId;
    if (res.data.user.userStores && res.data.user.userStores.length > 0) {
      storeId = res.data.user.userStores[0].storeId;
    } else {
      const storesRes = await axios.get(`${API}/stores`, ax);
      if (storesRes.data.length === 0) throw new Error('No hay tiendas');
      storeId = storesRes.data[0].id;
    }
    console.log(`   ✅ Login OK. Tienda: ${storeId}\n`);

    // ===== 2. CREAR PRODUCTO =====
    console.log('2️⃣  Registrando nuevo producto en Almacén...');
    const tag = 'T' + Date.now().toString().slice(-6);
    res = await axios.post(`${API}/products`, {
      storeId,
      description: `Producto Auditoría ${tag}`,
      salePrice: 15,
      costPrice: 8,
      currentStock: 100,
      minStock: 5,
      barcode: `BAR-${tag}`,
    }, ax);
    const productId = res.data.id;
    console.log(`   ✅ Producto creado. ID: ${productId}`);
    console.log(`   📦 Stock Bodega Inicial: ${res.data.currentStock}\n`);

    // ===== 3. KARDEX INICIAL =====
    console.log('3️⃣  Verificando Kardex inicial...');
    res = await axios.get(`${API}/inventory/movements?storeId=${storeId}&productId=${productId}`, ax);
    const kardexInicial = res.data;
    if (kardexInicial.length > 0 && kardexInicial[0].type === 'IN' && kardexInicial[0].quantity === 100) {
      console.log(`   ✅ Kardex OK: Mov. tipo IN, Cantidad: 100, Balance: ${kardexInicial[0].balance}\n`);
    } else {
      console.log(`   ⚠️  Kardex: ${JSON.stringify(kardexInicial[0])}\n`);
    }

    // ===== 4. BUSCAR VENDEDOR =====
    console.log('4️⃣  Identificando vendedor/rutero...');
    res = await axios.get(`${API}/users?storeId=${storeId}`, ax);
    const vendors = res.data.filter(u => {
      const r = (u.role || '').toLowerCase();
      return r.includes('vendor') || r.includes('rutero') || r.includes('vendedor');
    });
    if (vendors.length === 0) throw new Error('No hay vendedores. Crea uno primero.');
    const vendor = vendors[0];
    console.log(`   ✅ Usando: ${vendor.email} (${vendor.role})\n`);

    // ===== 5. ASIGNAR MERCANCÍA AL VENDEDOR =====
    console.log('5️⃣  Asignando 30 unidades al vendedor desde bodega...');
    await axios.post(`${API}/vendor-inventories/transaction`, {
      storeId,
      vendorId: vendor.id,
      productId,
      quantity: 30,
      type: 'ASSIGN',
    }, ax);

    // Verificar stock bodega
    res = await axios.get(`${API}/products/${productId}?storeId=${storeId}`, ax);
    const stockBodegaPostAsign = res.data.currentStock;
    console.log(`   📦 Stock Bodega: 100 - 30 = 70 → DB: ${stockBodegaPostAsign} ${stockBodegaPostAsign === 70 ? '✅' : '❌ DESCUADRE'}`);

    // Verificar stock vendedor
    res = await axios.get(`${API}/vendor-inventories/${vendor.id}`, ax);
    const vi = res.data.find(v => v.productId === productId);
    console.log(`   🧑‍💼 Stock Vendedor: 0 + 30 = 30 → DB: ${vi.currentQuantity} ${vi.currentQuantity === 30 ? '✅' : '❌ DESCUADRE'}\n`);

    // ===== 6. VENTA DIRECTA (el vendedor vende 5 uds en calle) =====
    console.log('6️⃣  Vendedor realiza venta directa (5 unidades)...');
    // Login como vendedor
    res = await axios.post(`${API}/auth/login`, { email: vendor.email, password: '123' });
    const vendorAx = { headers: { Authorization: `Bearer ${res.data.accessToken}` } };

    res = await axios.post(`${API}/orders`, {
      storeId,
      vendorId: vendor.id,
      type: 'venta_directa',
      paymentType: 'CONTADO',
      notes: 'Venta rápida auditoría',
      items: [{ productId, quantity: 5, unitPrice: 15 }],
    }, vendorAx);
    const ventaDirectaId = res.data.id;
    console.log(`   ✅ Pedido VD creado: ${ventaDirectaId} (status: ${res.data.status})`);

    // Verificar stock vendedor bajó
    res = await axios.get(`${API}/vendor-inventories/${vendor.id}`, ax);
    const viPostVD = res.data.find(v => v.productId === productId);
    console.log(`   🧑‍💼 Stock Vendedor: 30 - 5 = 25 → DB: ${viPostVD.currentQuantity} ${viPostVD.currentQuantity === 25 ? '✅' : '❌ DESCUADRE'}`);
    // Bodega NO debe cambiar (la venta directa es del inventario del vendedor)
    res = await axios.get(`${API}/products/${productId}?storeId=${storeId}`, ax);
    console.log(`   📦 Stock Bodega (no cambia): 70 → DB: ${res.data.currentStock} ${res.data.currentStock === 70 ? '✅' : '❌ DESCUADRE'}\n`);

    // ===== 7. PEDIDO PREVENTA (flujo completo de despacho) =====
    console.log('7️⃣  Creando pedido preventa (15 unidades, flujo RECIBIDO→CARGADO_CAMION)...');
    res = await axios.post(`${API}/orders`, {
      storeId,
      vendorId: vendor.id,
      type: 'pedido',
      paymentType: 'CONTADO',
      notes: 'Pedido preventa auditoría',
      items: [{ productId, quantity: 15, unitPrice: 15 }],
    }, vendorAx);
    const pedidoId = res.data.id;
    console.log(`   ✅ Pedido creado: ${pedidoId} (status: ${res.data.status})`);

    // Seguir cadena de estados
    console.log('   🔄 RECIBIDO → EN_PREPARACION');
    await axios.patch(`${API}/orders/${pedidoId}/status`, { status: 'EN_PREPARACION' }, ax);
    console.log('   🔄 EN_PREPARACION → ALISTADO');
    await axios.patch(`${API}/orders/${pedidoId}/status`, { status: 'ALISTADO' }, ax);
    console.log('   🔄 ALISTADO → CARGADO_CAMION (descuenta bodega, suma a rutero)');
    await axios.patch(`${API}/orders/${pedidoId}/status`, { status: 'CARGADO_CAMION', vendorId: vendor.id }, ax);

    // Verificar stock bodega bajó 15 más
    res = await axios.get(`${API}/products/${productId}?storeId=${storeId}`, ax);
    const stockBodegaPostCarga = res.data.currentStock;
    console.log(`   📦 Stock Bodega: 70 - 15 = 55 → DB: ${stockBodegaPostCarga} ${stockBodegaPostCarga === 55 ? '✅' : '❌ DESCUADRE'}`);

    // Stock vendedor debe subir 15 (ya tenía 25)
    res = await axios.get(`${API}/vendor-inventories/${vendor.id}`, ax);
    const viPostCarga = res.data.find(v => v.productId === productId);
    console.log(`   🧑‍💼 Stock Vendedor: 25 + 15 = 40 → DB: ${viPostCarga.currentQuantity} ${viPostCarga.currentQuantity === 40 ? '✅' : '❌ DESCUADRE'}\n`);

    // ===== 8. ENTREGA DEL PEDIDO =====
    console.log('8️⃣  Entregando pedido (descuenta del vendedor)...');
    console.log('   🔄 CARGADO_CAMION → EN_ENTREGA');
    await axios.patch(`${API}/orders/${pedidoId}/status`, { status: 'EN_ENTREGA' }, ax);
    console.log('   🔄 EN_ENTREGA → ENTREGADO (descuenta 15 del vendedor)');
    await axios.patch(`${API}/orders/${pedidoId}/status`, { status: 'ENTREGADO' }, ax);

    res = await axios.get(`${API}/vendor-inventories/${vendor.id}`, ax);
    const viPostEntrega = res.data.find(v => v.productId === productId);
    console.log(`   🧑‍💼 Stock Vendedor: 40 - 15 = 25 → DB: ${viPostEntrega.currentQuantity} ${viPostEntrega.currentQuantity === 25 ? '✅' : '❌ DESCUADRE'}`);
    // Bodega NO debe cambiar
    res = await axios.get(`${API}/products/${productId}?storeId=${storeId}`, ax);
    console.log(`   📦 Stock Bodega (no cambia): 55 → DB: ${res.data.currentStock} ${res.data.currentStock === 55 ? '✅' : '❌ DESCUADRE'}\n`);

    // ===== 9. AUDITORÍA FINAL DEL KARDEX =====
    console.log('9️⃣  Auditoría Kardex completa del producto...');
    res = await axios.get(`${API}/inventory/movements?storeId=${storeId}&productId=${productId}`, ax);
    console.log('   ┌─────────────────────────────────────────────────────────────────────┐');
    console.log('   │  TIPO  │  CANTIDAD  │  BALANCE  │  REFERENCIA                       │');
    console.log('   ├─────────────────────────────────────────────────────────────────────┤');
    for (const m of res.data) {
      const tipo = (m.type || '').padEnd(5);
      const cant = String(m.quantity).padStart(5);
      const bal = String(m.balance).padStart(6);
      const ref = (m.reference || 'N/A').substring(0, 40);
      console.log(`   │  ${tipo} │   ${cant}    │  ${bal}   │  ${ref}`);
    }
    console.log('   └─────────────────────────────────────────────────────────────────────┘');

    // ===== 10. CUADRE MATEMÁTICO FINAL =====
    console.log('\n🔢 CUADRE MATEMÁTICO FINAL:');
    console.log('   Stock Inicial Bodega:        100');
    console.log('   - Asignación a Vendedor:     -30  (Bodega→Vendedor)');
    console.log('   - Carga Camión (Pedido):     -15  (Bodega→Vendedor por despacho)');
    console.log('   = Stock Bodega Esperado:      55');
    res = await axios.get(`${API}/products/${productId}?storeId=${storeId}`, ax);
    const finalBodega = res.data.currentStock;
    console.log(`   = Stock Bodega Real:          ${finalBodega} ${finalBodega === 55 ? '✅' : '❌'}`);

    console.log('\n   Vendedor recibió:             30 (asignación) + 15 (carga camión) = 45');
    console.log('   - Venta Directa:             -5');
    console.log('   - Entrega Pedido:             -15');
    console.log('   = Stock Vendedor Esperado:    25');
    res = await axios.get(`${API}/vendor-inventories/${vendor.id}`, ax);
    const finalVendor = res.data.find(v => v.productId === productId);
    const finalVendorStock = finalVendor.currentQuantity;
    console.log(`   = Stock Vendedor Real:        ${finalVendorStock} ${finalVendorStock === 25 ? '✅' : '❌'}`);

    console.log(`\n   TOTAL SISTEMA: Bodega(${finalBodega}) + Vendedor(${finalVendorStock}) + Vendido(5+15=20) = ${finalBodega + finalVendorStock + 20}`);
    console.log(`   ESPERADO:      100 ${(finalBodega + finalVendorStock + 20) === 100 ? '✅ CUADRA PERFECTO' : '❌ NO CUADRA'}`);

    console.log('\n🎉 PRUEBA DE FLUJO COMPLETO Y CUADRE FINALIZADA');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA AUDITORÍA:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error('   Data:', JSON.stringify(error.response.data));
      console.error(`   URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    } else {
      console.error('  ', error.message);
    }
  }
}

runTest();
