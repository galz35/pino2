const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('eslint_report.json', 'utf8'));
  const errorFiles = data.filter(d => d.errorCount > 0);
  
  for (const file of errorFiles) {
    console.log('\n--- ' + file.filePath + ' ---');
    for (const msg of file.messages) {
      if (msg.severity === 2) {
        console.log(`Linea ${msg.line}: ${msg.ruleId} - ${msg.message}`);
      }
    }
  }
} catch (e) {
  console.error("No se pudo leer el reporte", e);
}
