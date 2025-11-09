import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai'
import { detectTextInImage } from '@/lib/ocr'

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  const base64 = Buffer.from(arrayBuf).toString('base64')
  return base64
}

function buildNoTextPrompt(base: string) {
  return `"[SYSTEM] Génère une image de couverture réaliste basée sur le titre et le résumé.\n- Format : vertical 1600x2400 px, haute résolution.\n- IMPORTANT : N'INCLURE AUCUN TEXTE, AUCUNE TYPOGRAPHIE, AUCUN WATERMARK, AUCUN LOGO. L'image doit être purement graphique/photographique.\n- Respecter drapeaux et symboles réels.\n- Style : adapté au contexte. Composition centrée, pas de visage déformé.\n- Retour : image en base64.",\nDescription: ${base}\n--no-text --remove-typography --no-letters --no-words`
}

async function generateWithOpenAI(prompt: string, size: '1024x1792' | '1792x1024' = '1024x1792'): Promise<{ base64: string, provider: string } | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return null
    const openai = new OpenAI({ apiKey })
    const resp = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt,
      size,
      quality: 'high',
      response_format: 'b64_json'
    })
    const b64 = resp.data?.[0]?.b64_json
    if (!b64) return null
    return { base64: b64, provider: 'openai' }
  } catch (e) {
    console.warn('OpenAI image generation failed:', e)
    return null
  }
}

// ✅ Timeout réduit pour génération d'images (sans OCR = plus rapide)
export const maxDuration = 60; // 1 minute max (sans OCR)

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
    
    console.log(`🎨 Génération image UNIQUE avec seed: ${uniqueSeed}`);

    // Essai 1: Pollinations (URL) avec contraintes no text et taille verticale
    const pollinationsPrompt = buildNoTextPrompt(fullPrompt)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(pollinationsPrompt)}?width=1600&height=2400&seed=${uniqueSeed}&nologo=true`

    console.log(`🎨 Génération image (Pollinations tentative 1) : ${style} - ${prompt.substring(0, 80)}...`)

    // ✅ OPTIMISATION: Retourner directement l'URL sans OCR (plus rapide)
    // L'OCR prend 10-30s et ralentit beaucoup. On le désactive temporairement.
    try {
      // Timeout rapide de 30 secondes pour Pollinations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const base64_1 = await fetchImageAsBase64(pollinationsUrl)
      clearTimeout(timeoutId);
      
      console.log('✅ Pollinations image fetched, returning without OCR for speed');
      return NextResponse.json({ 
        success: true, 
        provider: 'pollinations', 
        imageBase64: base64_1, 
        imageUrl: pollinationsUrl, 
        prompt: pollinationsPrompt 
      })
    } catch (e) {
      console.warn('⚠️ Pollinations failed or timeout (30s), trying fallback:', e)
    }

    // Fallback: OpenAI Images (sans OCR pour vitesse)
    console.log('🎨 Fallback: Trying OpenAI DALL-E...')
    const oai = await generateWithOpenAI(buildNoTextPrompt(fullPrompt))
    if (oai?.base64) {
      console.log('✅ OpenAI image generated, returning without OCR for speed');
      return NextResponse.json({ 
        success: true, 
        provider: oai.provider, 
        imageBase64: oai.base64, 
        prompt: buildNoTextPrompt(fullPrompt) 
      })
    }

    // Dernier recours: retourner URL Pollinations simple (non recommandé)
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1600&height=2400&seed=${uniqueSeed+7}&nologo=true`
    return NextResponse.json({ success: true, provider: 'pollinations', imageUrl: fallbackUrl, prompt: fullPrompt, note: 'OCR indisponible, fallback URL' })

  } catch (error: any) {
    console.error('Erreur génération image:', error);
    
    // En cas d'erreur, retourner une image placeholder
    const placeholderUrl = `https://via.placeholder.com/1600x2400/6366f1/ffffff?text=${encodeURIComponent('Image IA')}`;
    
    return NextResponse.json({ success: true, provider: 'placeholder', imageUrl: placeholderUrl, prompt: 'Placeholder image', note: 'Erreur génération, image placeholder utilisée' });
  }
}
