import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt requis' },
        { status: 400 }
      );
    }

    // Construire le prompt complet avec le style
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, highly detailed, 4k quality',
      cartoon: 'cartoon style, colorful, fun illustration',
      watercolor: 'watercolor painting, artistic, soft colors',
      fantasy: 'fantasy art, magical, epic fantasy style',
      minimalist: 'minimalist design, clean, simple, modern',
      vintage: 'vintage style, retro, nostalgic atmosphere',
      digital_art: 'digital art, modern illustration, vibrant',
      sketch: 'pencil sketch, hand-drawn, artistic'
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.realistic}`;

    // Utiliser Pollinations AI (gratuit et sans API key)
    // Alternative gratuite à DALL-E / Midjourney
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true`;

    // Attendre 2 secondes pour laisser l'image se générer
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt
    });

  } catch (error: any) {
    console.error('Erreur génération image:', error);
    
    // En cas d'erreur, retourner une image placeholder
    const placeholderUrl = `https://via.placeholder.com/1024x1024/6366f1/ffffff?text=${encodeURIComponent('Image IA')}`;
    
    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
      prompt: 'Placeholder image',
      note: 'Erreur génération, image placeholder utilisée'
    });
  }
}
