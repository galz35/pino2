const fs = require('fs');
const BASE_URL = 'http://localhost:3010/api';
let storeId = '9321856d-19ba-42b8-ba47-cf35c0d133dd';

async function logStep(step, action) {
  console.log(`\n▶ [Paso ${step}] ${action}...`);
}

async function simulate() {
  try {
    logStep(1, 'Login Vendedor');
    const resVendor = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vender@lospinos.com', password: 'ventas123' })
    });
    
    if (!resVendor.ok) {
        fs.writeFileSync('simulate_out.log', await resVendor.text());
        return;
    }
    const vendorData = await resVendor.json();
    const vendorToken = vendorData.accessToken;

    logStep(2, 'Obteniendo Catálogo');
    const resProducts = await fetch(`${BASE_URL}/products?storeId=${storeId}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const products = await resProducts.json();
    if (!products.length) return;
    const targetProduct = products[0];

    logStep(3, 'Apertura de Caja / Buscando Turno Activo');
    let shiftId = null;
    const resActiveShift = await fetch(`${BASE_URL}/cash-shifts?storeId=${storeId}&status=OPEN`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const shiftsData = await resActiveShift.json();
    
    if (shiftsData && shiftsData.length > 0) {
      shiftId = shiftsData[0].id;
    } else {
      const resOpen = await fetch(`${BASE_URL}/cash-shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${vendorToken}`
        },
        body: JSON.stringify({ storeId, startingCash: 2000 })
      });
      if (!resOpen.ok) {
        fs.writeFileSync('simulate_out.log', "OPEN_FAIL: " + await resOpen.text());
        return;
      }
      const openData = await resOpen.json();
      shiftId = openData.id;
    }

    logStep(4, 'Procesando Venta');
    const salePayload = {
      storeId,
      shiftId,
      cashierId: vendorData.user.id,
      cashierName: vendorData.user.name,
      paymentMethod: 'Efectivo',
      paymentCurrency: 'NIO',
      amountReceived: targetProduct.salePrice * 2,
      change: 0,
      items: [
        {
          id: targetProduct.id,
          description: targetProduct.description,
          quantity: 2,
          salePrice: targetProduct.salePrice,
          costPrice: targetProduct.costPrice || 0,
          usesInventory: targetProduct.usesInventory,
          currentStock: targetProduct.currentStock
        }
      ]
    };
    
    const resSale = await fetch(`${BASE_URL}/sales/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vendorToken}`
      },
      body: JSON.stringify(salePayload)
    });
    
    if (!resSale.ok) {
        fs.writeFileSync('simulate_out.log', await resSale.text());
        return;
    }
    
    fs.writeFileSync('simulate_out.log', "EXITO TOTAL");

  } catch (error) {
    fs.writeFileSync('simulate_out.log', error.message);
  }
}
simulate();
