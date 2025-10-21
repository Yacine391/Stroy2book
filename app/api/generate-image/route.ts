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
      realistic: 'photorealistic, highly detailed, professional photography, 4k quality, cinematic lighting',
      cartoon: 'cartoon style illustration, colorful, fun, playful, animated style, vibrant colors',
      watercolor: 'watercolor painting, artistic, soft flowing colors, traditional art, delicate brush strokes',
      fantasy: 'fantasy art, magical atmosphere, mystical, epic fantasy illustration, enchanted',
      minimalist: 'minimalist design, clean lines, simple composition, modern art, geometric, elegant',
      vintage: 'vintage style, retro aesthetic, nostalgic atmosphere, classic art, aged paper texture',
      digital_art: 'digital art, modern illustration, vibrant colors, contemporary style, digital painting',
      sketch: 'pencil sketch, hand-drawn, artistic line work, detailed shading, traditional drawing'
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.realistic}`;

    // Ajouter un seed aléatoire pour assurer l'unicité de chaque image
    const uniqueSeed = Date.now() + Math.random();

    // Utiliser Pollinations AI avec seed pour unicité
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&seed=${uniqueSeed}&nologo=true`;

    console.log(`🎨 Génération image : ${style} - ${prompt.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
      style
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
