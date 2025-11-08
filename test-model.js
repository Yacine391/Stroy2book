#!/usr/bin/env node

/**
 * 🧪 TEST D'UN MODÈLE GEMINI SPÉCIFIQUE
 * 
 * Ce script teste un modèle Gemini spécifique avec votre clé API.
 * 
 * UTILISATION:
 *   node test-model.js VOTRE_CLE_API NOM_DU_MODELE
 * 
 * EXEMPLE:
 *   node test-model.js AIzaSyDomh29-ozaS4k2AMonHJHFTf4aOIo1FqQ gemini-1.5-flash
 */

const https = require('https');

const apiKey = process.argv[2];
const modelName = process.argv[3];

if (!apiKey || !modelName) {
  console.error('❌ ERREUR: Vous devez fournir une clé API et un nom de modèle');
  console.error('');
  console.error('USAGE:');
  console.error('  node test-model.js VOTRE_CLE_API NOM_DU_MODELE');
  console.error('');
  console.error('EXEMPLE:');
  console.error('  node test-model.js AIzaSyDomh29-ozaS4k2AMonHJHFTf4aOIo1FqQ gemini-1.5-flash');
  process.exit(1);
}

console.log('🧪 TEST D\'UN MODÈLE GEMINI SPÉCIFIQUE');
console.log('======================================');
console.log('');
console.log('📝 Clé API:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
console.log('📦 Modèle:', modelName);
console.log('');

const requestData = JSON.stringify({
  contents: [{
    parts: [{
      text: "Réponds juste 'Bonjour' en français."
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('📡 URL:', `https://${options.hostname}/v1beta/models/${modelName}:generateContent?key=***`);
console.log('💬 Prompt: "Réponds juste \'Bonjour\' en français."');
console.log('');
console.log('⏳ Envoi de la requête...');
console.log('');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Réponse reçue!');
    console.log('');
    console.log('📊 Status Code:', res.statusCode);
    console.log('');

    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        
        if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          const generatedText = response.candidates[0].content.parts[0].text;
          
          console.log('✅ ✅ ✅ SUCCÈS ! ✅ ✅ ✅');
          console.log('');
          console.log('🎉 Le modèle', modelName, 'fonctionne parfaitement !');
          console.log('');
          console.log('📝 Réponse de l\'IA:');
          console.log('─────────────────────');
          console.log(generatedText);
          console.log('─────────────────────');
          console.log('');
          console.log('✅ CE MODÈLE EST FONCTIONNEL !');
          console.log('');
          console.log('📋 PROCHAINES ÉTAPES:');
          console.log(`  1. Utilisez ce modèle dans votre code: "${modelName}"`);
          console.log('  2. Mettez à jour .env.local avec cette clé');
          console.log('  3. Redémarrez npm run dev');
          console.log('');
        } else {
          console.error('❌ Réponse invalide de l\'API');
          console.error('');
          console.error('📄 Réponse complète:');
          console.error(JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error('❌ Erreur lors du parsing de la réponse');
        console.error('');
        console.error('📄 Réponse brute:');
        console.error(data);
      }
    } else {
      console.error(`❌ ERREUR ${res.statusCode}`);
      console.error('');
      console.error('📄 Réponse:');
      try {
        const response = JSON.parse(data);
        console.error(JSON.stringify(response, null, 2));
      } catch {
        console.error(data);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERREUR RÉSEAU');
  console.error('');
  console.error('🔍 CAUSE:');
  console.error(' ', error.message);
});

req.write(requestData);
req.end();
