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
  // ✅ CORRECTION BUG: Validation stricte du contenu
  if (!contentMarkdown || contentMarkdown.trim().length < 10) {
    console.error('❌ buildExportHtml: Content is empty or too short')
    throw new Error('Content is required for export (minimum 10 characters)')
  }
  
  console.log('🔨 Building export HTML:', {
    contentLength: contentMarkdown.length,
    contentPreview: contentMarkdown.substring(0, 200) + '...',
    hasIllustrations: !!illustrations?.length
  })
  
  const title = cover.title || 'Mon Ebook'
  const author = cover.author || 'Auteur'
  const subtitle = cover.subtitle || ''
  const primary = cover.colors?.primary || '#ffffff'
  // ✅ CORRECTION : Utiliser la vraie couleur du texte (blanc si spécifié)
  const textColor = cover.colors?.text || '#111827'
  console.log('📝 Text color for export:', textColor)
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
  const md = contentMarkdown.trim()
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
  
  console.log('✅ HTML body generated, length:', htmlBody.length)

  let illustrationsHtml = ''
  if (illustrations && illustrations.length) {
    console.log('📸 Processing illustrations for export:', illustrations.length)
    const items: string[] = []
    for (const ill of illustrations) {
      if (!ill?.src) {
        console.warn('⚠️ Illustration without src:', ill)
        continue
      }
      console.log('🔄 Fetching illustration:', ill.src.substring(0, 100))
      try {
        // ✅ CORRECTION : Les images en base64 ne nécessitent pas de fetch
        let dataUrl = ill.src
        if (!ill.src.startsWith('data:')) {
          const res = await fetch(ill.src)
          if (!res.ok) {
            console.error('❌ Failed to fetch illustration:', res.status)
            continue
          }
          const buf = Buffer.from(await res.arrayBuffer())
          const mime = ill.src.toLowerCase().includes('.jpg') || ill.src.toLowerCase().includes('.jpeg') ? 'image/jpeg' : 'image/png'
          dataUrl = `data:${mime};base64,${buf.toString('base64')}`
        }
        console.log('✅ Illustration ready:', ill.caption || 'no caption')
        items.push(`
          <div class="page" style="display: flex; align-items: center; justify-content: center; height: 100vh; page-break-after: always;">
            <figure style="margin: 0; width: 100%; height: 100%;">
              <img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: contain;"/>
              ${ill.caption ? `<figcaption style="text-align: center; padding: 12px; font-size: 14px; color: ${textColor};">${escapeHtml(ill.caption)}</figcaption>` : ''}
            </figure>
          </div>
        `)
      } catch (err) {
        console.error('❌ Error processing illustration:', err)
      }
    }
    if (items.length) {
      console.log('✅ Generated', items.length, 'illustration pages')
      illustrationsHtml = items.join('\n')
    } else {
      console.warn('⚠️ No illustrations were successfully processed')
    }
  } else {
    console.log('ℹ️ No illustrations provided for export')
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
    .cover .meta { 
      position: relative; 
      z-index: 2; 
      padding: 24px; 
      background: ${textColor === '#ffffff' || textColor === '#fff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'}; 
      border-radius: 8px; 
      color: ${textColor};
    }
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
      <h1 style="color: ${textColor};">${safeTitle}</h1>
      ${subtitle ? `<h2 style="color: ${textColor};">${safeSubtitle}</h2>` : ''}
      <p style="color: ${textColor};">par ${safeAuthor}</p>
    </div>
  </section>
  <main>
    ${htmlBody}
    ${illustrationsHtml}
  </main>
</body>
</html>`
}
