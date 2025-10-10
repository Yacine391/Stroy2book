import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, size } = body as { prompt: string; size?: '512x512' | '1024x1024' | '2048x2048' }
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 })
    const openai = new OpenAI({ apiKey })
    const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
    const res = await openai.images.generate({ model, prompt, size: size || '1024x1024', n: 1 })
    const b64 = res.data?.[0]?.b64_json
    if (!b64) return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    return NextResponse.json({ imageBase64: b64 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
