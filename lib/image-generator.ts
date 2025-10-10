"use client"

import OpenAI from 'openai'

export type ImageStyle = 'realiste' | 'cartoon' | 'aquarelle' | 'fantasy' | 'minimaliste' | 'retro' | 'noir-et-blanc'

const openaiKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '') : ''

const getOpenAI = () => {
  try {
    if (!openaiKey) return null
    return new OpenAI({ apiKey: openaiKey })
  } catch {
    return null
  }
}

function styleToPrompt(style: ImageStyle): string {
  switch (style) {
    case 'realiste': return 'ultra realistic, detailed, photographic lighting'
    case 'cartoon': return 'cartoon, bold outlines, vibrant colors, flat shading'
    case 'aquarelle': return 'watercolor painting, soft brush strokes, pastel tones'
    case 'fantasy': return 'epic fantasy illustration, dramatic lighting, intricate details'
    case 'minimaliste': return 'minimalist, clean shapes, negative space, muted palette'
    case 'retro': return 'retro vintage poster style, grain, halftone, limited palette'
    case 'noir-et-blanc': return 'black and white, high contrast, ink drawing'
    default: return 'high quality illustration'
  }
}

export async function generateCoverImage(
  title: string,
  subtitle: string | undefined,
  author: string,
  style: ImageStyle = 'realiste'
): Promise<string> {
  const openai = getOpenAI()
  const prompt = `Ebook cover illustration for title: "${title}"${subtitle ? `, subtitle: "${subtitle}"` : ''}, author: ${author}. Style: ${styleToPrompt(style)}. Composition: centered title area with space for text, aesthetically pleasing, modern publishing design, richly detailed background related to the theme. Portrait aspect.`

  try {
    if (openai) {
      const result = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1536'
      })
      const b64 = (result as any).data?.[0]?.b64_json
      if (b64) return `data:image/png;base64,${b64}`
    }
  } catch (e) {
    console.warn('OpenAI image generation failed, using placeholder', e)
  }
  // Fallback placeholder
  return '/placeholder.svg'
}

export async function generateChapterImage(
  chapterTitle: string,
  bookTitle: string,
  style: ImageStyle = 'realiste'
): Promise<string> {
  const openai = getOpenAI()
  const prompt = `Illustration for chapter: "${chapterTitle}" from ebook "${bookTitle}". Style: ${styleToPrompt(style)}. Single compelling scene capturing the essence, no text overlay, portrait composition.`
  try {
    if (openai) {
      const result = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024'
      })
      const b64 = (result as any).data?.[0]?.b64_json
      if (b64) return `data:image/png;base64,${b64}`
    }
  } catch (e) {
    console.warn('OpenAI chapter image generation failed, using placeholder', e)
  }
  return '/placeholder.svg'
}
