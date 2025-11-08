import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI, getProviderName, isAIConfigured } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, style, desiredPages } = body;

    console.log('📥 Generate-content request:', { action, style: style || 'general', textLength: text?.length || 0, desiredPages: desiredPages || 'not specified' });
    console.log('🤖 AI Provider:', getProviderName());

    // Vérifier que l'IA est configurée
    if (!isAIConfigured()) {
      console.error('❌ No AI API key configured');
      return NextResponse.json(
        { error: 'Clé API non configurée. Consultez GUIDE-CLE-API-COMPLET.md pour obtenir votre clé gratuite.' },
        { status: 500 }
      );
    }

    if (!text || text.trim().length < 10) {
      console.error('❌ Text too short or missing');
      return NextResponse.json(
        { error: 'Texte requis (minimum 10 caractères)' },
        { status: 400 }
      );
    }

    console.log('🤖 Calling AI for action:', action, 'with style:', style || 'general', 'desired pages:', desiredPages);

    // ✅ Utiliser le système multi-IA avec le style et nombre de pages
    let processedText = await generateWithAI(action, text, style || 'general', desiredPages);

    console.log('✅ AI response received, length:', processedText?.length || 0);

    // ✅ VALIDATION: Vérifier que la réponse n'est pas vide
    if (!processedText || processedText.trim().length < 10) {
      console.error('❌ AI returned empty or too short response');
      throw new Error('L\'IA n\'a pas retourné de contenu valide. Veuillez réessayer.');
    }

    console.log('✅ Processed text ready, final length:', processedText.length);
    console.log('📄 Preview:', processedText.substring(0, 200) + '...');

    return NextResponse.json({
      success: true,
      processedText,
      provider: getProviderName()
    });

  } catch (error: any) {
    console.error('❌ Erreur génération contenu:', error);
    console.error('Stack:', error.stack);
    
    let errorMessage = error.message || 'Erreur lors de la génération IA';
    
    // Messages d'erreur spécifiques selon le problème
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = 'Clé API invalide. Obtenez une nouvelle clé sur https://makersuite.google.com/app/apikey';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Quota API dépassé. Attendez 24h ou créez une nouvelle clé.';
    } else if (error.message?.includes('unauthorized') || error.message?.includes('403')) {
      errorMessage = 'Clé API non autorisée. Vérifiez votre configuration.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
