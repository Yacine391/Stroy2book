import JSZip from 'jszip'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

export async function exportEPUB(title: string, author: string, content: string): Promise<Blob> {
  // Very basic EPUB (EPUB 3 simplified) creation
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip')
  zip.folder('META-INF')?.file('container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <roots>
    <root full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </roots>
</container>`)
  const oebps = zip.folder('OEBPS')!
  const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(title)}</title>
  <meta charset="utf-8" />
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  <h2>${escapeXml(author)}</h2>
  ${content
    .split('\n')
    .map((line) => {
      if (line.startsWith('# ')) return `<h2>${escapeXml(line.slice(2))}</h2>`
      if (line.startsWith('## ')) return `<h3>${escapeXml(line.slice(3))}</h3>`
      return `<p>${escapeXml(line)}</p>`
    })
    .join('\n')}
</body>
</html>`
  oebps.file('index.xhtml', xhtml)
  const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>fr</dc:language>
  </metadata>
  <manifest>
    <item id="content" href="index.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`
  oebps.file('content.opf', contentOpf)
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export async function exportDOCX(title: string, author: string, content: string): Promise<Blob> {
  const children: Paragraph[] = []
  children.push(new Paragraph({ text: title, heading: HeadingLevel.TITLE }))
  children.push(new Paragraph({ text: `par ${author}`, spacing: { after: 400 } }))
  for (const line of content.split('\n')) {
    if (!line.trim()) {
      children.push(new Paragraph({ text: '' }))
      continue
    }
    if (line.startsWith('# ')) {
      children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }))
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }))
    } else {
      children.push(new Paragraph({ children: [new TextRun(line)] }))
    }
  }
  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  return blob
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
