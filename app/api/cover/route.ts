import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, subtitle, author, size } = body as { title: string; subtitle?: string; author?: string; size?: '1024x1024' | '2048x2048' }
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 })

    const openai = new OpenAI({ apiKey })

    const coverPrompt = `Couverture d'ebook au format portrait 2048x3072, style moderne, 
illustration centrale, typographie élégante pour le titre. 
Titre: ${title}${subtitle ? `, Sous-titre: ${subtitle}` : ''}${author ? `, Auteur: ${author}` : ''}. 
Palette harmonieuse, composition équilibrée, lisible en miniature.`

    const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
    const res = await openai.images.generate({ model, prompt: coverPrompt, size: (size as any) || '1024x1024', n: 1 })
    const b64 = res.data?.[0]?.b64_json
    if (!b64) return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    return NextResponse.json({ imageBase64: b64 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
