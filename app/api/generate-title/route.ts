import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialiser les APIs avec fallback
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
);

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Fonction de retry avec exponential backoff pour Gemini
 */
async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentative ${attempt}/${maxRetries} avec modèle ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        console.log(`✅ Succès avec ${modelName} à la tentative ${attempt}`);
        return text;
        
      } catch (error: any) {
        const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded');
        console.warn(`⚠️ Tentative ${attempt}/${maxRetries} échouée avec ${modelName}:`, error.message);
        
        if (attempt < maxRetries && isOverloaded) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Attente de ${delay}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (attempt === maxRetries) {
          // Essayer le modèle suivant
          console.log(`❌ Échec avec ${modelName}, passage au modèle suivant...`);
          break;
        }
      }
    }
  }
  
  throw new Error('Tous les modèles Gemini sont surchargés. Veuillez réessayer dans quelques instants.');
}

/**
 * Fonction pour appeler Groq en fallback
 */
async function callGroq(prompt: string): Promise<string> {
  if (!groq) {
    throw new Error('Groq API non configurée');
  }
  
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Tu es un expert en création de titres accrocheurs pour des livres.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    max_tokens: 100,
  });
  
  return completion.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, genre, style, chapters } = body;

    console.log('📚 Demande génération titre:', { content: content?.substring(0, 100), genre, style, chaptersCount: chapters?.length });

    if (!content && (!chapters || chapters.length === 0)) {
      return NextResponse.json(
        { error: 'Contenu ou chapitres requis' },
        { status: 400 }
      );
    }

    // Construire le contenu à analyser
    let textToAnalyze = content || '';
    if (chapters && chapters.length > 0) {
      textToAnalyze = chapters.join('. ') + '. ' + textToAnalyze;
    }

    const prompt = `Basé sur ce contenu d'ebook, génère UN SEUL titre accrocheur et professionnel en français. 

Contenu des chapitres/idées:
${textToAnalyze.substring(0, 1500)}

IMPORTANT: 
- Génère un titre UNIQUE et ORIGINAL qui n'a jamais été utilisé
- Maximum 8 mots
- Impactant et mémorable
- Capture l'essence du contenu
- Seed unique: ${Date.now() + Math.random()}

Réponds UNIQUEMENT avec le titre, sans guillemets ni explications.`;

    let title = '';
    
    // Essayer d'abord avec Gemini (avec retry et fallback)
    try {
      console.log('🤖 Tentative avec Gemini...');
      title = await callGeminiWithRetry(prompt);
    } catch (geminiError: any) {
      console.warn('⚠️ Gemini a échoué, tentative avec Groq...', geminiError.message);
      
      // Fallback vers Groq
      if (groq) {
        try {
          title = await callGroq(prompt);
          console.log('✅ Succès avec Groq (fallback)');
        } catch (groqError) {
          console.error('❌ Groq a également échoué:', groqError);
          throw geminiError; // Propager l'erreur originale de Gemini
        }
      } else {
        throw geminiError;
      }
    }

    // Nettoyer le titre (enlever guillemets, astérisques, etc.)
    title = title.replace(/^["'*]+|["'*]+$/g, '').trim();
    title = title.replace(/^Titre\s*:\s*/i, '').trim();

    console.log('✨ Titre généré:', title);

    return NextResponse.json({
      success: true,
      title
    });

  } catch (error: any) {
    console.error('❌ Erreur génération titre:', error);
    
    // Message d'erreur plus clair
    let errorMessage = error.message || 'Erreur lors de la génération du titre';
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      errorMessage = 'Le service IA est temporairement surchargé. Le système a réessayé plusieurs fois. Veuillez cliquer à nouveau sur la baguette magique.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
