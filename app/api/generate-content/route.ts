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

    if (!text) {
      return NextResponse.json(
        { error: 'Texte requis' },
        { status: 400 }
      );
    }

    // ✅ CORRECTION DÉFINITIVE: Utiliser gemini-pro (stable, testé, fonctionne)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    
    switch (action) {
      case 'improve':
        prompt = `Améliore ce texte en enrichissant le style, en améliorant la fluidité et en corrigeant les erreurs. Garde le même sens mais rends-le plus captivant et professionnel :\n\n${text}`;
        break;
      case 'shorten':
        prompt = `Condense ce texte en gardant uniquement les idées principales. Réduis d'environ 30% tout en préservant l'essentiel :\n\n${text}`;
        break;
      case 'expand':
        prompt = `Développe ce texte en ajoutant plus de détails, d'exemples et d'explications. Enrichis le contenu pour le rendre plus complet (augmente d'environ 50%) :\n\n${text}`;
        break;
      case 'simplify':
        prompt = `Simplifie ce texte pour le rendre plus accessible et facile à comprendre. Utilise un vocabulaire plus simple et des phrases plus courtes :\n\n${text}`;
        break;
      case 'correct':
        prompt = `Corrige toutes les erreurs de grammaire, d'orthographe et de syntaxe dans ce texte. Ne change que ce qui est nécessaire :\n\n${text}`;
        break;
      case 'reformulate':
        prompt = `Réécris complètement ce texte avec un style différent tout en gardant le même message. Sois créatif dans la reformulation :\n\n${text}`;
        break;
      default:
        prompt = `Améliore ce texte :\n\n${text}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const processedText = response.text();

    return NextResponse.json({
      success: true,
      processedText
    });

  } catch (error: any) {
    console.error('Erreur génération contenu:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
