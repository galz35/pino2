import axios from 'axios';

const BASE_URL = 'http://localhost:3010/api';

const endpoints = [
  { method: 'POST', path: '/auth/login' },
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/products' },
  { method: 'GET', path: '/sales/dashboard-stats' },
  { method: 'GET', path: '/sync/statuses' },
  { method: 'GET', path: '/orders' },
  { method: 'GET', path: '/stores' },
  { method: 'GET', path: '/health' },
];

async function testEndpoints() {
  console.log('--- Testing API Endpoints ---');
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        validateStatus: () => true, // Don't throw on 4xx/5xx
      });
      console.log(`[${endpoint.method}] ${endpoint.path} -> ${response.status}`);
    } catch (error: any) {
      console.log(`[${endpoint.method}] ${endpoint.path} -> ERROR: ${error.message}`);
    }
  }
}

testEndpoints();
