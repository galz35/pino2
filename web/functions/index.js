const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({ origin: true });

// URL Real del Backend (Usando IP verificada para anonimato total)
const TARGET_URL = 'http://190.56.16.85/api-dev';

exports.api = functions.https.onRequest({ invoker: 'public', cors: true }, (req, res) => {
  return cors(req, res, async () => {
    try {
      const { method, url, body, headers } = req;
      
      // Limpiamos los headers para que no causen conflictos
      const proxyHeaders = { ...headers };
      delete proxyHeaders.host;
      delete proxyHeaders.origin;

      // Limpiamos la ruta: quitamos el prefijo "/api" que viene de Firebase Hosting
      const cleanUrl = url.replace(/^\/api/, '');
      
      console.log(`Proxying ${method} request to: ${TARGET_URL}${cleanUrl}`);

      const response = await axios({
        method: method,
        url: `${TARGET_URL}${cleanUrl}`,
        data: body,
        headers: proxyHeaders,
        validateStatus: () => true // Dejamos que el frontend maneje los errores 400, 500, etc.
      });

      // Enviamos la respuesta de vuelta al frontend
      res.status(response.status).send(response.data);
      
    } catch (error) {
      console.error('Error en el puente Proxy:', error.message);
      res.status(500).send({ error: 'Error de conexión con el backend real.' });
    }
  });
});
