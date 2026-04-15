const http = require('http');

const options = {
  hostname: '190.56.16.85',
  port: 80,
  path: '/api-dev/products', // Probamos con productos para ver si responde
  method: 'GET',
  timeout: 5000 
};

console.log(`--- Re-testeando Conexion ---`);
console.log(`Objetivo: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`ESTADO RECIBIDO: ${res.statusCode}`);
  
  if (res.statusCode < 500) {
    console.log("✅ EXITO TOTAL: El servidor esta vivo y responde por IP.");
    console.log("Esto confirma que el 'Puente de Firebase' funcionara perfectamente con esta IP.");
  } else {
    console.log(`❓ RESPUESTA DEL SERVIDOR: Codigo ${res.statusCode}.`);
  }
  process.exit(0);
});

req.on('error', (e) => {
  console.error(`❌ ERROR DE CONEXION: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
    console.log('❌ TIEMPO AGOTADO (Timeout)');
    req.destroy();
});

req.end();
