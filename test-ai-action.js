#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST DES ACTIONS IA
 * 
 * Ce script teste directement l'API Google Gemini pour vérifier 
 * que les actions IA fonctionnent correctement.
 * 
 * Usage: node test-ai-action.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;

async function testAIAction() {
  console.log('🧪 TEST DES ACTIONS IA\n');
  console.log('─'.repeat(60) + '\n');

  // Vérifier la clé API
  if (!API_KEY || API_KEY === 'REMPLACEZ_PAR_VOTRE_CLE_API') {
    console.log('❌ ERREUR : Clé API non configurée\n');
    console.log('📋 Pour configurer votre clé API Google Gemini :');
    console.log('   1. Allez sur : https://makersuite.google.com/app/apikey');
    console.log('   2. Créez une clé API (gratuit, pas de CB requise)');
    console.log('   3. Ouvrez le fichier .env.local');
    console.log('   4. Remplacez REMPLACEZ_PAR_VOTRE_CLE_API par votre clé');
    console.log('   5. Relancez ce test\n');
    console.log('📖 Guide complet : CONFIGURATION-CLE-API.md\n');
    process.exit(1);
  }

  console.log('🔑 Clé API trouvée :', API_KEY.substring(0, 15) + '...\n');

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const testText = "Fais moi un ebook sur l'indépendance de l'Algérie";
    
    console.log('📝 Texte de test :', testText);
    console.log('🎯 Action : Améliorer (improve)\n');

    const prompt = `Tu es un écrivain professionnel. Améliore ce texte en enrichissant le style, en développant les idées, en améliorant la fluidité et en corrigeant les erreurs. Garde le même sens mais rends-le beaucoup plus captivant, professionnel et détaillé. DÉVELOPPE le contenu pour qu'il soit plus riche et complet.

RÈGLES STRICTES - TU DOIS ABSOLUMENT LES SUIVRE:
1. Conserve EXACTEMENT la langue d'origine du texte
2. Retourne UNIQUEMENT le texte transformé, SANS préambule, SANS explication, SANS balises, SANS commentaires
3. Ne commence PAS par "Voici le texte..." ou "Le texte amélioré est..."
4. Retourne DIRECTEMENT le texte transformé, rien d'autre
5. INTERDICTION de mettre des balises HTML ou Markdown autour du texte
6. COMMENCE directement par le contenu transformé

TEXTE À AMÉLIORER:
${testText}

TEXTE AMÉLIORÉ (commence directement, sans introduction):`;

    console.log('🤖 Appel à l\'API Google Gemini...\n');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const response = await result.response;
    let processedText = response.text();

    // Nettoyage (même logique que l'API)
    processedText = processedText
      .replace(/^(Voici le texte.*?:|Le texte.*?est.*?:|Texte.*?:)\s*/i, '')
      .replace(/^```.*?\n/g, '')
      .replace(/\n```$/g, '')
      .trim();

    console.log('✅ SUCCÈS ! L\'API a répondu.\n');
    console.log('─'.repeat(60));
    console.log('📊 STATISTIQUES :');
    console.log('   • Longueur originale  :', testText.length, 'caractères');
    console.log('   • Longueur transformée:', processedText.length, 'caractères');
    console.log('   • Ratio               :', (processedText.length / testText.length).toFixed(2) + 'x');
    console.log('   • Mots ajoutés        :', 
      processedText.split(/\s+/).length - testText.split(/\s+/).length, 'mots');
    console.log('─'.repeat(60) + '\n');
    
    console.log('📄 RÉSULTAT (extrait) :\n');
    const lines = processedText.split('\n').slice(0, 10);
    lines.forEach(line => {
      if (line.trim()) {
        console.log('   ' + line.substring(0, 70) + (line.length > 70 ? '...' : ''));
      }
    });
    if (processedText.split('\n').length > 10) {
      console.log('   [...]\n');
    }

    // Vérifications
    console.log('🔍 VÉRIFICATIONS :\n');

    if (processedText.includes('[Texte amélioré par l\'IA') || 
        processedText.includes('[Texte raccourci') ||
        processedText.includes('[Développements supplémentaires')) {
      console.log('   ❌ La réponse contient un placeholder fallback');
      console.log('   → L\'API n\'a pas vraiment généré de contenu.\n');
      process.exit(1);
    }
    console.log('   ✅ Pas de placeholder détecté');

    if (processedText === testText) {
      console.log('   ⚠️  Le texte n\'a pas été transformé\n');
    } else {
      console.log('   ✅ Le texte a été transformé');
    }

    if (processedText.length < testText.length * 1.5) {
      console.log('   ⚠️  Le texte n\'a pas beaucoup augmenté');
      console.log('      (normal pour un texte court)\n');
    } else {
      console.log('   ✅ Le texte a été significativement développé');
    }

    console.log('\n' + '─'.repeat(60));
    console.log('✅ TEST RÉUSSI ! Les actions IA fonctionnent correctement.');
    console.log('─'.repeat(60) + '\n');
    console.log('🚀 Vous pouvez maintenant utiliser l\'application :');
    console.log('   npm run dev\n');

  } catch (error) {
    console.log('\n' + '─'.repeat(60));
    console.log('❌ ERREUR LORS DU TEST\n');
    console.log('Message :', error.message);
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('\n💡 SOLUTION :');
      console.log('   Votre clé API n\'est pas valide ou a expiré.\n');
      console.log('   1. Allez sur : https://makersuite.google.com/app/apikey');
      console.log('   2. Créez une NOUVELLE clé API');
      console.log('   3. Remplacez-la dans .env.local');
      console.log('   4. Relancez ce test\n');
    } else if (error.message.includes('403')) {
      console.log('\n💡 SOLUTION :');
      console.log('   La clé API existe mais n\'est pas autorisée.\n');
      console.log('   1. Vérifiez que l\'API Gemini est activée');
      console.log('   2. Vérifiez les restrictions de la clé');
      console.log('   3. Créez une nouvelle clé si nécessaire\n');
    } else if (error.message.includes('429')) {
      console.log('\n💡 SOLUTION :');
      console.log('   Quota dépassé (limite de requêtes).\n');
      console.log('   1. Attendez quelques heures');
      console.log('   2. OU créez une nouvelle clé API\n');
    } else {
      console.log('\n💡 SOLUTIONS POSSIBLES :');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Vérifiez que la clé est complète (pas d\'espace)');
      console.log('   3. Créez une nouvelle clé API');
      console.log('   4. Voir : CONFIGURATION-CLE-API.md\n');
    }
    
    console.log('─'.repeat(60) + '\n');
    process.exit(1);
  }
}

// Vérifier que dotenv est installé
try {
  require('dotenv');
} catch (e) {
  console.log('⚠️  Module dotenv non trouvé. Installation...\n');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
  console.log('\n✅ dotenv installé. Relancez le test.\n');
  process.exit(0);
}

testAIAction();
