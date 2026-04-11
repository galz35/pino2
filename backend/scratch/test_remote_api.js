const axios = require('axios');

async function testApi() {
  const BASE_URL = 'https://www.rhclaroni.com/api-dev';
  const testEmail = `tester_${Date.now()}@lospinos.com`;
  const testPassword = 'SafePassword123!';

  console.log('--- Probando API en ' + BASE_URL + ' ---');

  // 1. Probar Registro
  try {
    console.log(`\n1. Intentando registrar: ${testEmail}...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: 'Tester Antigravity',
      role: 'master-admin'
    });
    console.log('✅ Registro exitoso:', regRes.status, regRes.data);
  } catch (err) {
    console.log('❌ Error en registro:', err.response?.status, err.response?.data || err.message);
  }

  // 2. Probar Login
  try {
    console.log(`\n2. Intentando login con ${testEmail}...`);
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Login exitoso:', loginRes.status);
    if (loginRes.data.access_token) {
      console.log('🔑 Token recibido carácteres iniciales:', loginRes.data.access_token.substring(0, 20) + '...');
    }
  } catch (err) {
    console.log('❌ Error en login:', err.response?.status, err.response?.data || err.message);
  }
}

testApi();
