import { NextRequest, NextResponse } from 'next/server'
import Epub from 'epub-gen-memory'
import { inlineImage } from '@/lib/export-html'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cover, content } = body as { cover: any, content: string }

    if (!cover || !content) {
      return NextResponse.json({ error: 'cover and content required' }, { status: 400 })
    }

    const img = cover.includeIllustrationInPDF !== false ? await inlineImage(cover) : undefined

    const sections = content.split(/\n(?=##\s|#\s)/g).map((part: string, i: number) => ({
      title: part.startsWith('#') ? part.split('\n')[0].replace(/^#+\s*/, '') : `Section ${i+1}`,
      data: `<div>${part.replace(/^#+\s.*$/m, '').split('\n').map(p => p ? `<p>${p}</p>` : '<br/>').join('\n')}</div>`
    }))

    const options = {
      title: cover.title || 'Mon Ebook',
      author: cover.author || 'Auteur',
      cover: img, // data URL ok, will be embedded
      content: sections,
      appendChapterTitles: false,
      version: 3
    } as any

    const result = await Epub(options).promise
    const buffer: Buffer = result as any

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': 'attachment; filename="export.epub"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (e: any) {
    console.error('EPUB export error:', e)
    return NextResponse.json({ error: e?.message || 'epub error' }, { status: 500 })
  }
}
