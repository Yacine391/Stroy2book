import { NextRequest, NextResponse } from 'next/server'
import { default as EpubModule } from 'epub-gen-memory'
import { promises as fs } from 'fs'
import path from 'path'
import { inlineImage } from '@/lib/export-html'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cover, content, illustrations } = body as { cover: any, content: string, illustrations?: { src: string; caption?: string }[] }

    if (!cover || !content) {
      return NextResponse.json({ error: 'cover and content required' }, { status: 400 })
    }

    const img = cover.includeIllustrationInPDF !== false ? await inlineImage(cover) : undefined

    const sections = content.split(/\n(?=##\s|#\s)/g).map((part: string, i: number) => ({
      title: part.startsWith('#') ? part.split('\n')[0].replace(/^#+\s*/, '') : `Section ${i+1}`,
      content: `<div>${part.replace(/^#+\s.*$/m, '').split('\n').map(p => p ? `<p>${p}</p>` : '<br/>').join('\n')}</div>`
    }))

    if (illustrations && illustrations.length) {
      const items: string[] = []
      for (const ill of illustrations) {
        try {
          const res = await fetch(ill.src)
          if (!res.ok) continue
          const buf = Buffer.from(await res.arrayBuffer())
          const mime = ill.src.toLowerCase().includes('.jpg') || ill.src.toLowerCase().includes('.jpeg') ? 'image/jpeg' : 'image/png'
          const dataUrl = `data:${mime};base64,${buf.toString('base64')}`
          items.push(`<figure><img src="${dataUrl}"/>${ill.caption ? `<figcaption>${ill.caption}</figcaption>` : ''}</figure>`)
        } catch {}
      }
      if (items.length) {
        sections.push({ title: 'Illustrations', content: items.join('\n') })
      }
    }

    const options = {
      title: cover.title || 'Mon Ebook',
      author: cover.author || 'Auteur',
      cover: img, // data URL ok, will be embedded
      appendChapterTitles: false,
      version: 3
    } as any

    // Module default is a class EPub: new EPub(options, content?)
    // But the package exports default helper too; use constructor
    const EPub: any = (EpubModule as any).EPub || (EpubModule as any).default?.EPub || (EpubModule as any)
    const instance = new EPub(options, sections)
    const { epub } = await instance.promise
    const buffer: Buffer = epub as Buffer

    // Save to /tmp/exports
    try {
      const dir = '/tmp/exports'
      await fs.mkdir(dir, { recursive: true })
      const filename = `${(cover?.title || 'export').replace(/[^a-z0-9]/gi, '_')}.epub`
      await fs.writeFile(path.join(dir, filename), buffer)
      console.log('EPUB saved to', path.join(dir, filename))
    } catch (e) {
      console.warn('Cannot save EPUB to /tmp/exports:', e)
    }

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
