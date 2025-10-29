export interface CoverData {
  title: string
  subtitle?: string
  author: string
  imageBase64?: string
  imageUrl?: string
  includeIllustrationInPDF?: boolean
  imagePosition?: { x: number; y: number; scale: number }
  colors?: { primary: string; secondary: string; text: string }
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function inlineImage(cover: CoverData): Promise<string | undefined> {
  if (cover.imageBase64 && cover.imageBase64.length > 64) {
    return `data:image/png;base64,${cover.imageBase64}`
  }
  if (cover.imageUrl) {
    try {
      const res = await fetch(cover.imageUrl)
      if (!res.ok) return undefined
      const buf = Buffer.from(await res.arrayBuffer())
      const mime = cover.imageUrl.toLowerCase().endsWith('.jpg') || cover.imageUrl.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {
      return undefined
    }
  }
  return undefined
}

export async function buildExportHtml(cover: CoverData, contentMarkdown: string, illustrations?: { src: string; caption?: string }[]): Promise<string> {
  const title = cover.title || 'Mon Ebook'
  const author = cover.author || 'Auteur'
  const subtitle = cover.subtitle || ''
  const primary = cover.colors?.primary || '#ffffff'
  const textColor = cover.colors?.text || '#111827'
  const includeImage = cover.includeIllustrationInPDF !== false
  const imgDataUrl = includeImage ? await inlineImage(cover) : undefined
  const pos = cover.imagePosition || { x: 0, y: 0, scale: 1 }

  const safeTitle = escapeHtml(title)
  const safeAuthor = escapeHtml(author)
  const safeSubtitle = escapeHtml(subtitle)

  const imageCss = imgDataUrl ? `
    .cover-image {
      position: absolute;
      inset: 0;
      background-image: url('${imgDataUrl}');
      background-size: ${Math.max(100, Math.round(100 * pos.scale))}% auto;
      background-repeat: no-repeat;
      background-position: ${pos.x}px ${pos.y}px;
      filter: none;
    }
  ` : ''

  // Minimal markdown to HTML (very simple, for server render)
  const md = contentMarkdown || ''
  const htmlBody = md
    .split('\n')
    .map(line => {
      if (/^\s*#\s+/.test(line)) {
        return `<h1>${escapeHtml(line.replace(/^\s*#\s+/, ''))}</h1>`
      }
      if (/^\s*##\s+/.test(line)) {
        return `<h2>${escapeHtml(line.replace(/^\s*##\s+/, ''))}</h2>`
      }
      if (!line.trim()) return '<br/>'
      return `<p>${escapeHtml(line)}</p>`
    })
    .join('\n')

  let illustrationsHtml = ''
  if (illustrations && illustrations.length) {
    const items: string[] = []
    for (const ill of illustrations) {
      if (!ill?.src) continue
      try {
        const res = await fetch(ill.src)
        if (!res.ok) continue
        const buf = Buffer.from(await res.arrayBuffer())
        const mime = ill.src.toLowerCase().includes('.jpg') || ill.src.toLowerCase().includes('.jpeg') ? 'image/jpeg' : 'image/png'
        const dataUrl = `data:${mime};base64,${buf.toString('base64')}`
        items.push(`<figure><img src="${dataUrl}" style="max-width:100%;height:auto"/>${ill.caption ? `<figcaption>${escapeHtml(ill.caption)}</figcaption>` : ''}</figure>`)
      } catch {}
    }
    if (items.length) {
      illustrationsHtml = `<section class="page"><h1>Illustrations</h1>${items.join('\n')}</section>`
    }
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    @page { margin: 20mm; }
    html, body { padding: 0; margin: 0; }
    body { font-family: Georgia, serif; color: ${textColor}; }
    .cover {
      height: 100vh;
      position: relative;
      background: ${primary};
      display: flex; align-items: center; justify-content: center;
      text-align: center;
    }
    .cover .meta { position: relative; z-index: 2; padding: 24px; background: rgba(255,255,255,0.6); border-radius: 8px; }
    ${imageCss}
    .page { page-break-after: always; }
    h1 { font-size: 24px; margin: 16px 0; }
    h2 { font-size: 20px; margin: 12px 0; }
    p { font-size: 12px; line-height: 1.6; margin: 8px 0; }
  </style>
</head>
<body>
  <section class="cover page">
    ${imgDataUrl ? '<div class="cover-image"></div>' : ''}
    <div class="meta">
      <h1>${safeTitle}</h1>
      ${subtitle ? `<h2>${safeSubtitle}</h2>` : ''}
      <p>par ${safeAuthor}</p>
    </div>
  </section>
  <main>
    ${htmlBody}
    ${illustrationsHtml}
  </main>
</body>
</html>`
}
