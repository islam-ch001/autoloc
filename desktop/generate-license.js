#!/usr/bin/env node
/**
 * Générateur de clés de licence AutoLoc.
 *
 * Utilisation :
 *   node generate-license.js              → 1 clé
 *   node generate-license.js 5            → 5 clés
 *   node generate-license.js 10 nom.txt   → 10 clés sauvegardées dans nom.txt
 *
 * Les clés générées sont valides à vie (verrouillées au PC lors de l'activation).
 */

const { generateKey } = require('./backend/lib/license');
const fs = require('fs');

const count = parseInt(process.argv[2]) || 1;
const outFile = process.argv[3];

const keys = [];
for (let i = 0; i < count; i++) {
  keys.push(generateKey());
}

if (outFile) {
  // Sauvegarde avec date + horodatage
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const content = `# Clés AutoLoc générées le ${now}\n# (${count} clé(s))\n\n${keys.join('\n')}\n`;
  fs.writeFileSync(outFile, content);
  console.log(`✅ ${count} clé(s) sauvegardée(s) dans : ${outFile}`);
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🔑 ${count} CLÉ${count > 1 ? 'S' : ''} D'ACTIVATION AUTOLOC`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
keys.forEach((k, i) => {
  if (count > 1) console.log(`${String(i + 1).padStart(2, ' ')}. ${k}`);
  else console.log(`   ${k}`);
});
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Envoyez cette clé au client par WhatsApp');
console.log('   après réception du paiement (6 900 DA).');
console.log('   Chaque clé n\'est utilisable que sur UN seul PC.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
