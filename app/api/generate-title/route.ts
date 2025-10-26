import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'
);

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

    // ✅ CORRECTION: Utiliser gemini-1.5-flash (plus rapide et stable)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construire le contenu à analyser
    let textToAnalyze = content || '';
    if (chapters && chapters.length > 0) {
      textToAnalyze = chapters.join('. ') + '. ' + textToAnalyze;
    }

    const prompt = `Basé sur ce contenu d'ebook, génère UN SEUL titre accrocheur et professionnel en français. 

Contenu des chapitres/idées:
${textToAnalyze.substring(0, 1500)}

Génère un titre court (max 8 mots), impactant et mémorable qui capture l'essence du contenu.
Réponds UNIQUEMENT avec le titre, sans guillemets ni explications.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

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
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du titre' },
      { status: 500 }
    );
  }
}
