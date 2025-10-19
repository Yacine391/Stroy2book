import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, genre, style } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu requis' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Basé sur ce contenu d'ebook, génère UN SEUL titre accrocheur et professionnel. 
Genre: ${genre || 'Fiction'}
Style: ${style || 'Standard'}

Contenu (extrait):
${content.substring(0, 1000)}

Réponds UNIQUEMENT avec le titre, rien d'autre. Pas de guillemets, pas d'explication, juste le titre.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Nettoyer le titre (enlever guillemets, etc.)
    title = title.replace(/^["']|["']$/g, '').trim();

    console.log('✨ Titre généré:', title);

    return NextResponse.json({
      success: true,
      title
    });

  } catch (error: any) {
    console.error('Erreur génération titre:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
