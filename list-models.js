#!/usr/bin/env node

/**
 * 📋 LISTE LES MODÈLES GEMINI DISPONIBLES
 * 
 * Ce script liste tous les modèles Gemini disponibles pour votre clé API.
 * 
 * UTILISATION:
 *   node list-models.js VOTRE_CLE_API
 * 
 * EXEMPLE:
 *   node list-models.js AIzaSyDomh29-ozaS4k2AMonHJHFTf4aOIo1FqQ
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ ERREUR: Vous devez fournir une clé API');
  console.error('');
  console.error('USAGE:');
  console.error('  node list-models.js VOTRE_CLE_API');
  process.exit(1);
}

console.log('📋 LISTE DES MODÈLES GEMINI DISPONIBLES');
console.log('=========================================');
console.log('');
console.log('📝 Clé API:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
console.log('');
console.log('⏳ Récupération de la liste...');
console.log('');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Réponse reçue!');
    console.log('');

    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        
        if (response.models && response.models.length > 0) {
          console.log('✅ MODÈLES DISPONIBLES:');
          console.log('');
          
          // Filtrer les modèles qui supportent generateContent
          const contentModels = response.models.filter(model => 
            model.supportedGenerationMethods && 
            model.supportedGenerationMethods.includes('generateContent')
          );
          
          if (contentModels.length > 0) {
            console.log('🎯 MODÈLES POUR GÉNÉRATION DE CONTENU:');
            console.log('');
            
            contentModels.forEach((model, index) => {
              console.log(`${index + 1}. ${model.name}`);
              console.log(`   Description: ${model.description || 'N/A'}`);
              console.log(`   Version: ${model.version || 'N/A'}`);
              console.log(`   Méthodes: ${model.supportedGenerationMethods.join(', ')}`);
              console.log('');
            });
            
            console.log('');
            console.log('🎯 MODÈLE RECOMMANDÉ POUR HB_CREATOR:');
            console.log('');
            
            // Trouver le meilleur modèle
            const flashModel = contentModels.find(m => m.name.includes('gemini-1.5-flash'));
            const proModel = contentModels.find(m => m.name.includes('gemini-1.5-pro'));
            const geminiPro = contentModels.find(m => m.name === 'models/gemini-pro');
            
            const recommended = flashModel || proModel || geminiPro || contentModels[0];
            
            console.log(`   ✅ ${recommended.name}`);
            console.log(`   📝 ${recommended.description || 'Modèle recommandé'}`);
            console.log('');
            console.log('📋 PROCHAINE ÉTAPE:');
            console.log(`   Testez ce modèle avec: node test-model.js ${apiKey.substring(0, 15)}... ${recommended.name.replace('models/', '')}`);
            console.log('');
          } else {
            console.log('❌ Aucun modèle ne supporte generateContent');
            console.log('');
            console.log('📄 Tous les modèles:');
            response.models.forEach(model => {
              console.log(`- ${model.name}: ${model.supportedGenerationMethods.join(', ')}`);
            });
          }
          
        } else {
          console.log('❌ Aucun modèle trouvé');
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
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERREUR RÉSEAU');
  console.error('');
  console.error('🔍 CAUSE:');
  console.error(' ', error.message);
});

req.end();
