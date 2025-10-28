import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, genre, targetAudience, length, exactPages } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Idée requise' },
        { status: 400 }
      );
    }

    // ✅ Utiliser gemini-pro et vérifier disponibilité via ListModels
    try {
      // @ts-ignore types
      const models = await (genAI as any).listModels?.() || []
      const names = Array.isArray(models?.models) ? models.models.map((m: any) => m.name) : []
      console.log('Gemini models available:', names.slice(0, 5))
    } catch (e) {
      console.warn('ListModels not available; proceeding with gemini-pro')
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Calculer le nombre de mots nécessaires
    // En moyenne : 250 mots par page pour un livre standard
    const wordsPerPage = 250;
    const targetWords = exactPages ? exactPages * wordsPerPage : 5000; // Par défaut 20 pages

    const prompt = `Tu es un écrivain professionnel. Écris un ebook complet avec ces caractéristiques :

SUJET : ${idea}
GENRE : ${genre || 'Fiction'}
PUBLIC : ${targetAudience || 'Tout public'}
LONGUEUR : ${targetWords} mots (environ ${Math.round(targetWords / 250)} pages)

INSTRUCTIONS IMPORTANTES :
1. Crée un titre accrocheur
2. Structure le livre avec au moins ${Math.max(5, Math.round(exactPages / 4))} chapitres
3. Chaque chapitre doit avoir un titre et du contenu développé
4. Écris ${targetWords} mots minimum (c'est TRÈS important !)
5. Développe vraiment l'histoire avec des descriptions, dialogues, et détails
6. Format markdown avec ## pour les chapitres
7. Commence directement par le contenu (pas de préambule)

FORMAT ATTENDU :
# [Titre du livre]

## Chapitre 1: [Titre]
[Contenu détaillé du chapitre 1 - au moins ${Math.round(targetWords / Math.max(5, Math.round(exactPages / 4)))} mots]

## Chapitre 2: [Titre]
[Contenu détaillé du chapitre 2...]

[etc...]

COMMENCE L'ÉCRITURE MAINTENANT :`;

    console.log(`🚀 Génération d'un ebook de ${targetWords} mots (${Math.round(targetWords / 250)} pages)...`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();

    // Extraire le titre
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Ebook Généré par IA';

    // Description pour la couverture
    const coverPrompt = `Décris en UNE phrase courte et visuelle l'image de couverture idéale pour un livre intitulé "${title}" (genre: ${genre}). Sois descriptif et visuel.`;
    
    const coverResult = await model.generateContent(coverPrompt);
    const coverResponse = await coverResult.response;
    const coverDescription = coverResponse.text().trim();

    // Stats du contenu généré
    const wordCount = content.split(/\s+/).length;
    const pageCount = Math.round(wordCount / 250);

    console.log(`✅ Ebook généré : ${wordCount} mots, ~${pageCount} pages`);

    return NextResponse.json({
      success: true,
      title,
      content,
      coverDescription,
      stats: {
        wordCount,
        pageCount,
        characterCount: content.length
      }
    });

  } catch (error: any) {
    console.error('Erreur génération ebook:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
