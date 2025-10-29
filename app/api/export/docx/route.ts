import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } from 'docx'
import { inlineImage } from '@/lib/export-html'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cover, content, illustrations } = body as { cover: any, content: string, illustrations?: { src: string; caption?: string }[] }

    if (!cover || !content) {
      return NextResponse.json({ error: 'cover and content required' }, { status: 400 })
    }

    const children: any[] = []
    const doc = new Document({ sections: [] })

    // Title
    children.push(new Paragraph({ text: cover.title || 'Mon Ebook', heading: HeadingLevel.TITLE }))

    if (cover.subtitle) {
      children.push(new Paragraph({ text: cover.subtitle, heading: HeadingLevel.HEADING_2 }))
    }

    children.push(new Paragraph({ text: `par ${cover.author || 'Auteur'}` }))

    // Image (embedded)
    if (cover.includeIllustrationInPDF !== false) {
      const dataUrl = await inlineImage(cover)
      if (dataUrl?.startsWith('data:')) {
        const base64 = dataUrl.split(',')[1]
        const imgRun = new ImageRun({ data: Buffer.from(base64, 'base64'), transformation: { width: 600, height: 900 } })
        children.push(new Paragraph({ children: [imgRun] }))
      }
    }

    // Basic markdown-ish split
    const lines = content.split('\n')
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) { children.push(new Paragraph({ text: '' })); continue }
      if (line.startsWith('## ')) { children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 })); continue }
      if (line.startsWith('# ')) { children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })); continue }
      children.push(new Paragraph({ children: [new TextRun(line)] }))
    }

    // Additional illustrations
    if (illustrations && illustrations.length) {
      for (const ill of illustrations) {
        try {
          const res = await fetch(ill.src)
          if (!res.ok) continue
          const buf = Buffer.from(await res.arrayBuffer())
          const imgRun = new ImageRun({ data: buf, transformation: { width: 600, height: 900 } })
          children.push(new Paragraph({ children: [imgRun] }))
          if (ill.caption) children.push(new Paragraph({ children: [new TextRun(ill.caption)] }))
        } catch {}
      }
    }

    const finalDoc = new Document({ sections: [{ properties: {}, children }] })
    const buffer = await Packer.toBuffer(finalDoc)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="export.docx"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (e: any) {
    console.error('DOCX export error:', e)
    return NextResponse.json({ error: e?.message || 'docx error' }, { status: 500 })
  }
}
