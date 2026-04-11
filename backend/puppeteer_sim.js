const puppeteer = require('puppeteer');

(async () => {
  console.log('Abriendo el navegador en vivo para la simulación...');
  
  // headless: false hace que el usuario vea la ventana
  // args: ['--start-maximized'] maximiza la ventana
  const browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized'] 
  });
  
  const page = await browser.newPage();
  
  console.log('Navegando a la pantalla de Login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  // Esperar a que los inputs estén listos
  await page.waitForSelector('input[type="email"]');
  
  console.log('Escribiendo credenciales...');
  await page.type('input[type="email"]', 'admin_test@lospinos.com', { delay: 80 });
  await page.type('input[type="password"]', 'admin123', { delay: 80 });
  
  console.log('Haciendo clic en iniciar sesión...');
  // Asumiendo que el botón es tipo submit
  await page.click('button[type="submit"]');

  // Esperar a que cargue el dashboard
  console.log('Esperando que cargue el panel de control...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  
  console.log('Simulación exitosa visualmente. Dejando navegador abierto unos segundos...');
  
  // Dejar que el usuario vea el resultado un rato
  await new Promise(r => setTimeout(r, 8000));
  
  console.log('Cerrando navegador...');
  await browser.close();
})();
