const axios = require('axios');

const BASE_URL = 'http://localhost:3010/api';
let token = '';

async function testNewFeatures() {
  console.log('🧪 TESTEANDO NUEVA FUNCIONALIDAD (FASE 2: GRUPOS Y CRÉDITO)\n');

  try {
    // 1. LOGIN
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'audit_test@example.com',
      password: 'password123'
    });
    token = login.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Portador de token JWT obtenido.\n');

    // 2. CREAR GRUPO ECONÓMICO
    console.log('[+] Testeando Grupos Económicos...');
    const gePayload = {
      storeId: '9321856d-19ba-42b8-ba47-cf35c0d133dd',
      nombre: `Grupo Test ${Date.now()}`,
      limiteCreditoGlobal: 50000,
      descripcion: 'Grupo para pruebas de auditoría'
    };
    const geCreate = await axios.post(`${BASE_URL}/grupos-economicos`, gePayload, { headers });
    const geId = geCreate.data.id;
    console.log(`  ✅ POST /grupos-economicos: Creado con ID ${geId}`);

    const geList = await axios.get(`${BASE_URL}/grupos-economicos?storeId=9321856d-19ba-42b8-ba47-cf35c0d133dd`, { headers });
    console.log(`  ✅ GET /grupos-economicos: ${geList.data.length} grupos en total.\n`);

    // 3. CREAR GRUPO DE CLIENTES
    console.log('[+] Testeando Grupos de Clientes (Rutas)...');
    const gcPayload = {
       storeId: '9321856d-19ba-42b8-ba47-cf35c0d133dd',
       nombre: `Ruta Norte ${Date.now()}`,
       description: 'Canal de distribución mayorista'
    };
    const gcCreate = await axios.post(`${BASE_URL}/grupos-clientes`, gcPayload, { headers });
    const gcId = gcCreate.data.id;
    console.log(`  ✅ POST /grupos-clientes: Creado con ID ${gcId}`);

    const gcList = await axios.get(`${BASE_URL}/grupos-clientes?storeId=9321856d-19ba-42b8-ba47-cf35c0d133dd`, { headers });
    console.log(`  ✅ GET /grupos-clientes: ${gcList.data.length} canales en total.\n`);

    // 4. TEST DE MORA CRUZADA (Simulación)
    console.log('[+] Verificando Lógica de Crédito...');
    const clients = await axios.get(`${BASE_URL}/clients`, { headers });
    if (clients.data.length > 0) {
        const client = clients.data[0];
        const ec = await axios.get(`${BASE_URL}/clients/${client.id}/estado-cuenta`, { headers });
        console.log(`  ✅ GET /clients/${client.id}/estado-cuenta:`, {
            saldoIndividual: ec.data.saldoIndividual,
            limiteIndividual: ec.data.limiteIndividual,
            limiteGrupo: ec.data.limiteGrupo,
            disponibleGrupo: ec.data.disponibleGrupo
        });
    }

    // 5. TEST DE REASIGNACIÓN (Fase 2)
    console.log('\n[+] Testeando Reasignación de Cliente...');
    if (clients.data.length > 0) {
        const clientId = clients.data[0].id;
        // Asumiendo que tenemos un preventaId (tomaremos el mismo audit_test id temporalmente para probar el endpoint)
        const me = await axios.get(`${BASE_URL}/auth/me`, { headers });
        const res = await axios.post(`${BASE_URL}/clients/${clientId}/reasignar`, {
            preventaId: me.data.id,
            motivo: 'Criterio de optimización de ruta'
        }, { headers });
        console.log(`  ✅ POST /clients/:id/reasignar: ${res.statusText}`);
    }

    console.log('\n=============================================');
    console.log('🏆 TODOS LOS ENDPOINTS DE FASE 2 TESTEADOS');
    console.log('=============================================');

  } catch (error) {
    console.error('\n❌ ERROR EN TEST DE FUNCIONALIDAD:', error.response?.data || error.message);
  }
}

testNewFeatures();
