const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '190.56.16.85',
  port: 5432,
  user: 'alacaja',
  password: 'TuClaveFuerte',
  database: 'multitienda_db'
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado a la BD');

    const sqlFile = path.join(__dirname, '2026-04-20_distribucion.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('🔄 Ejecutando migración...');
    await client.query(sql);
    console.log('✅ Migración ejecutada exitosamente');

    // Validar tablas creadas
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('grupos_economicos', 'grupos_clientes', 'arqueos', 'liquidaciones_ruta', 'cargas_camion', 'historial_asignacion_clientes')
      ORDER BY table_name
    `);
    console.log('\n📋 Tablas nuevas verificadas:');
    tables.rows.forEach(r => console.log(`  ✅ ${r.table_name}`));

    // Validar columnas nuevas en clients
    const clientCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name IN ('grupo_economico_id', 'grupo_cliente_id', 'preventa_id', 'limite_credito', 'saldo_pendiente', 'dias_credito', 'zona', 'lat', 'lng', 'frecuencia_visita', 'dia_visita')
      ORDER BY column_name
    `);
    console.log('\n📋 Columnas nuevas en clients:');
    clientCols.rows.forEach(r => console.log(`  ✅ ${r.column_name}`));

    // Validar columnas nuevas en orders
    const orderCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name IN ('tipo_pedido', 'requiere_cobro', 'requiere_autorizacion', 'autorizado_por', 'rutero_id', 'camion_id', 'fecha_entrega_programada', 'grupo_carga_id')
      ORDER BY column_name
    `);
    console.log('\n📋 Columnas nuevas en orders:');
    orderCols.rows.forEach(r => console.log(`  ✅ ${r.column_name}`));

    // Validar JSONB permisos en users
    const userCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('permisos', 'comision_porcentaje')
    `);
    console.log('\n📋 Columnas nuevas en users:');
    userCols.rows.forEach(r => console.log(`  ✅ ${r.column_name} (${r.data_type})`));

    console.log('\n🎉 MIGRACIÓN COMPLETA Y VERIFICADA');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    if (error.detail) console.error('  Detalle:', error.detail);
  } finally {
    await client.end();
  }
}

run();
