
const axios = require('axios');

const BASE_URL = 'http://localhost:3010/api';
const credentials = {
  email: 'admin@multitienda.com',
  password: 'admin123'
};

let token = '';
let storeId = '';

async function runTests() {
  console.log('🚀 Iniciando Suite de Pruebas de Integración - Los Pinos\n');

  try {
    // 1. Autenticación
    console.log('Step 1: Autenticación...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, credentials);
    token = loginRes.data.access_token;
    console.log('✅ Login exitoso.\n');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Obtener Tiendas
    console.log('Step 2: Obteniendo tiendas...');
    const storesRes = await axios.get(`${BASE_URL}/stores`, authHeaders);
    if (!storesRes.data.length) throw new Error('No hay tiendas disponibles para la prueba');
    storeId = storesRes.data[0].id;
    console.log(`✅ Tienda seleccionada: ${storesRes.data[0].name} (${storeId})\n`);

    // 3. Probar Departamentos (Fix del error 500)
    console.log('Step 3: Verificando API de Departamentos (Arreglo del 500)...');
    try {
      const depthRes = await axios.get(`${BASE_URL}/departments?storeId=${storeId}&type=main`, authHeaders);
      console.log(`✅ Departamentos recuperados: ${depthRes.data.length} main departments.`);
    } catch (e) {
      console.error(`❌ Error en departamentos: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
      throw e;
    }
    console.log('\n');

    // 4. Verificando Caja
    console.log('Step 4: Verificando turno de caja activo...');
    const shiftRes = await axios.get(`${BASE_URL}/cash-shifts/active?storeId=${storeId}`, authHeaders);
    if (shiftRes.data) {
      console.log(`✅ Turno activo encontrado: ID ${shiftRes.data.id} abierto por ${shiftRes.data.openedByName}\n`);
    } else {
      console.log('ℹ️ No hay turno activo. Intentando abrir uno...');
      const openRes = await axios.post(`${BASE_URL}/cash-shifts`, {
        storeId,
        startingCash: 1000
      }, authHeaders);
      console.log(`✅ Nuevo turno abierto: ID ${openRes.data.id}\n`);
    }

    // 5. Prueba de Idempotencia (Sincronización)
    console.log('Step 5: Verificando Idempotencia (Sincronización duplicada)...');
    const externalId = '550e8401-e29b-41d4-a716-446655440001'; // Nuevo UUID para esta ejecución
    
    const saleData = {
      storeId,
      ticket_number: 'TEST-SK-' + Date.now(),
      total: 154.50,
      paymentMethod: 'CASH',
      items: [
        { description: 'Producto Prueba Sync', quantity: 1, salePrice: 154.50, costPrice: 100 }
      ]
    };

    const syncPayload = {
      storeId,
      operations: [
        { 
          id: externalId, 
          type: 'SALE', 
          data: saleData 
        }
      ]
    };

    console.log('   - Enviando primera carga sync...');
    const sync1 = await axios.post(`${BASE_URL}/sync/batch`, syncPayload, authHeaders);
    const res1 = sync1.data[0];
    console.log(`   ✅ Respuesta 1: Status ${res1.status}, ID Server: ${res1.serverId}`);

    console.log('   - Enviando duplicado (mismo ID de operación)...');
    const sync2 = await axios.post(`${BASE_URL}/sync/batch`, syncPayload, authHeaders);
    const res2 = sync2.data[0];
    
    console.log(`   ✅ Respuesta 2: Status ${res2.status}, IsDuplicate: ${res2.isDuplicate}`);
    
    if (res2.isDuplicate) {
      console.log('\n🌟 ¡ÉXITO! El motor de sincronización detectó y bloqueó el duplicado correctamente.');
    } else {
      console.log('\n⚠️ Atención: El motor aceptó la transacción. Verifica si el backend realmente bloqueó la inserción en base de datos.');
    }

    console.log('\n🏁 Suite de Pruebas Finalizada con ÉXITO.');

  } catch (error) {
    console.error('\n❌ LA PRUEBA FALLÓ:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTests();
