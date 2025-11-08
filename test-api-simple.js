#!/usr/bin/env node

/**
 * 🧪 TEST ULTRA-SIMPLE DE L'API GOOGLE GEMINI
 * 
 * Ce script teste DIRECTEMENT l'API sans passer par le code de l'app.
 * 
 * UTILISATION:
 *   node test-api-simple.js VOTRE_CLE_API
 * 
 * EXEMPLE:
 *   node test-api-simple.js AIzaSyC1qilwIQEDwfF6B4LLKq7kB9h4oJKzlCo
 */

const https = require('https');

// Récupérer la clé API depuis la ligne de commande
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ ERREUR: Vous devez fournir une clé API');
  console.error('');
  console.error('USAGE:');
  console.error('  node test-api-simple.js VOTRE_CLE_API');
  console.error('');
  console.error('EXEMPLE:');
  console.error('  node test-api-simple.js AIzaSyC1qilwIQEDwfF6B4LLKq7kB9h4oJKzlCo');
  process.exit(1);
}

console.log('🧪 TEST ULTRA-SIMPLE DE L\'API GEMINI');
console.log('=====================================');
console.log('');
console.log('📝 Clé API:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
console.log('');

// Test 1: Vérifier si la clé est valide avec l'API la plus simple
console.log('🔍 Test 1: Vérification du format de la clé...');

if (!apiKey.startsWith('AIza')) {
  console.error('❌ ERREUR: La clé API doit commencer par "AIza"');
  console.error('   Votre clé commence par:', apiKey.substring(0, 4));
  process.exit(1);
}

console.log('✅ Format OK');
console.log('');

// Test 2: Appeler l'API Gemini avec un prompt simple
console.log('🔍 Test 2: Appel de l\'API Gemini...');
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
  path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('📡 URL:', `https://${options.hostname}${options.path.replace(/key=.*/, 'key=***')}`);
console.log('📦 Modèle: gemini-pro');
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
          console.log('🎉 L\'API Gemini fonctionne parfaitement !');
          console.log('');
          console.log('📝 Réponse de l\'IA:');
          console.log('─────────────────────');
          console.log(generatedText);
          console.log('─────────────────────');
          console.log('');
          console.log('✅ CETTE CLÉ API EST VALIDE ET FONCTIONNELLE !');
          console.log('');
          console.log('📋 PROCHAINES ÉTAPES:');
          console.log('  1. Copiez cette clé dans votre fichier .env.local');
          console.log('  2. Redémarrez npm run dev');
          console.log('  3. Testez les actions IA dans l\'application');
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
    } else if (res.statusCode === 400) {
      console.error('❌ ERREUR 400: Bad Request');
      console.error('');
      console.error('🔍 CAUSE PROBABLE:');
      console.error('  - Le format de la requête est incorrect');
      console.error('  - Le modèle "gemini-pro" n\'est pas disponible');
      console.error('');
      console.error('📄 Réponse:');
      console.error(data);
    } else if (res.statusCode === 403) {
      console.error('❌ ERREUR 403: Forbidden');
      console.error('');
      console.error('🔍 CAUSE PROBABLE:');
      console.error('  - La clé API n\'a pas les permissions nécessaires');
      console.error('  - Vous avez atteint la limite de requêtes');
      console.error('  - L\'API Gemini n\'est pas activée pour votre projet');
      console.error('');
      console.error('✅ SOLUTION:');
      console.error('  1. Allez sur https://aistudio.google.com/app/apikey');
      console.error('  2. Créez une NOUVELLE clé API');
      console.error('  3. Retestez avec cette nouvelle clé');
      console.error('');
      console.error('📄 Réponse:');
      console.error(data);
    } else if (res.statusCode === 404) {
      console.error('❌ ERREUR 404: Not Found');
      console.error('');
      console.error('🔍 CAUSE PROBABLE:');
      console.error('  - Cette clé vient de Google Cloud Console (PAS AI Studio)');
      console.error('  - Le modèle "gemini-pro" n\'existe pas pour cette clé');
      console.error('  - La clé API est invalide ou expirée');
      console.error('');
      console.error('✅ SOLUTION:');
      console.error('  1. ⚠️  N\'UTILISEZ PAS Google Cloud Console !');
      console.error('  2. ✅ Allez sur https://aistudio.google.com/app/apikey');
      console.error('  3. ✅ Créez une clé avec "Create API key in new project"');
      console.error('  4. ✅ Utilisez CETTE nouvelle clé');
      console.error('');
      console.error('📄 Réponse:');
      console.error(data);
    } else {
      console.error(`❌ ERREUR ${res.statusCode}`);
      console.error('');
      console.error('📄 Réponse:');
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERREUR RÉSEAU');
  console.error('');
  console.error('🔍 CAUSE:');
  console.error(' ', error.message);
  console.error('');
  console.error('✅ VÉRIFIEZ:');
  console.error('  - Votre connexion internet');
  console.error('  - Pas de firewall bloquant');
  console.error('  - Pas de proxy');
});

req.write(requestData);
req.end();
