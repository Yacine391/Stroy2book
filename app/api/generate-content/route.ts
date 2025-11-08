import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini avec la clé API
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text } = body;

    console.log('📥 Generate-content request:', { action, textLength: text?.length || 0 });

    if (!text || text.trim().length < 10) {
      console.error('❌ Text too short or missing');
      return NextResponse.json(
        { error: 'Texte requis (minimum 10 caractères)' },
        { status: 400 }
      );
    }

    // ✅ CORRECTION: Utiliser gemini-pro (modèle stable et disponible)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    const langHint = `
RÈGLES STRICTES - TU DOIS ABSOLUMENT LES SUIVRE:
1. Conserve EXACTEMENT la langue d'origine du texte
2. Retourne UNIQUEMENT le texte transformé, SANS préambule, SANS explication, SANS balises, SANS commentaires
3. Ne commence PAS par "Voici le texte..." ou "Le texte amélioré est..."
4. Retourne DIRECTEMENT le texte transformé, rien d'autre
5. INTERDICTION de mettre des balises HTML ou Markdown autour du texte
6. COMMENCE directement par le contenu transformé
`;
    
    switch (action) {
      case 'improve':
        prompt = `Tu es un écrivain professionnel. Améliore ce texte en enrichissant le style, en développant les idées, en améliorant la fluidité et en corrigeant les erreurs. Garde le même sens mais rends-le beaucoup plus captivant, professionnel et détaillé. DÉVELOPPE le contenu pour qu'il soit plus riche et complet.
${langHint}

TEXTE À AMÉLIORER:
${text}

TEXTE AMÉLIORÉ (commence directement, sans introduction):`;
        break;
      case 'shorten':
        prompt = `Tu es un rédacteur expert. Condense ce texte en gardant uniquement les idées principales et essentielles. Réduis d'environ 30% tout en préservant le sens et la clarté.
${langHint}

TEXTE À CONDENSER:
${text}

TEXTE CONDENSÉ (commence directement):`;
        break;
      case 'expand':
        prompt = `Tu es un écrivain expert. Développe ce texte en ajoutant beaucoup plus de détails, d'exemples concrets, d'explications et de descriptions. Enrichis le contenu pour le rendre beaucoup plus complet et captivant. AUGMENTE le contenu d'au moins 100%.
${langHint}

TEXTE À DÉVELOPPER:
${text}

TEXTE DÉVELOPPÉ (commence directement):`;
        break;
      case 'simplify':
        prompt = `Tu es un expert en vulgarisation. Simplifie ce texte pour le rendre très accessible et facile à comprendre. Utilise un vocabulaire simple, des phrases courtes et claires.
${langHint}

TEXTE À SIMPLIFIER:
${text}

TEXTE SIMPLIFIÉ (commence directement):`;
        break;
      case 'correct':
        prompt = `Tu es un correcteur professionnel. Corrige toutes les erreurs de grammaire, d'orthographe, de ponctuation et de syntaxe dans ce texte. Ne change que ce qui est incorrect. Garde le style et le sens original.
${langHint}

TEXTE À CORRIGER:
${text}

TEXTE CORRIGÉ (commence directement):`;
        break;
      case 'reformulate':
        prompt = `Tu es un rédacteur créatif. Réécris complètement ce texte avec un style totalement différent tout en gardant exactement le même message et les mêmes informations. Sois très créatif dans la reformulation.
${langHint}

TEXTE À REFORMULER:
${text}

TEXTE REFORMULÉ (commence directement):`;
        break;
      default:
        prompt = `Tu es un écrivain professionnel. Améliore ce texte pour le rendre plus captivant et professionnel.
${langHint}

TEXTE:
${text}

TEXTE AMÉLIORÉ (commence directement):`;
    }

    console.log('🤖 Calling Gemini API for action:', action);

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

    console.log('✅ Gemini response received, length:', processedText?.length || 0);

    // ✅ VALIDATION: Vérifier que la réponse n'est pas vide
    if (!processedText || processedText.trim().length < 10) {
      console.error('❌ Gemini returned empty or too short response');
      throw new Error('L\'IA n\'a pas retourné de contenu valide. Veuillez réessayer.');
    }

    // ✅ NETTOYAGE: Enlever les préambules éventuels
    processedText = processedText
      .replace(/^(Voici le texte.*?:|Le texte.*?est.*?:|Texte.*?:)\s*/i, '')
      .replace(/^```.*?\n/g, '')
      .replace(/\n```$/g, '')
      .trim();

    console.log('✅ Processed text ready, final length:', processedText.length);
    console.log('📄 Preview:', processedText.substring(0, 200) + '...');

    return NextResponse.json({
      success: true,
      processedText
    });

  } catch (error: any) {
    console.error('❌ Erreur génération contenu:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération IA. Vérifiez votre clé API Google.' },
      { status: 500 }
    );
  }
}
