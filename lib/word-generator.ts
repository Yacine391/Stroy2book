import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

interface EbookData {
  title: string
  author: string
  content: string
  backgroundColor?: string
  fontFamily?: string
  hasWatermark?: boolean
}

// Fonction de nettoyage du contenu - CORRIGÉE POUR PRÉSERVER MARKDOWN ET RETOURS À LA LIGNE
const cleanContent = (content: string): string => {
  return content
    // Supprimer les signatures d'unicité HTML
    .replace(/<!--\s*Signature d'unicité:.*?-->/gi, '')
    // Supprimer les mentions de nombre de mots entre parenthèses
    .replace(/\(\d+\s*mots?\)/gi, '')
    // Supprimer les astérisques autour du texte (gras/italique) mais garder le contenu
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    
    // 🚨 NE PAS SUPPRIMER LES # - ils sont nécessaires pour détecter les titres !
    // 🚨 CORRECTION MAJEURE : PRÉSERVER LES RETOURS À LA LIGNE
    
    // Nettoyer les espaces multiples EN LIGNE seulement (pas entre les lignes)
    .replace(/[ \t]+/g, ' ')  // Seulement espaces et tabs en excès
    
    // Nettoyer les espaces en fin de ligne
    .replace(/[ \t]+$/gm, '')
    
    // Supprimer les lignes vides multiples (max 2 lignes vides)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    
    // S'assurer qu'il n'y a pas d'espaces avant les titres markdown
    .replace(/^\s*(#+ )/gm, '$1')
}

export async function generateWord(ebookData: EbookData): Promise<Blob> {
  const cleanedContent = cleanContent(ebookData.content)
  const contentLines = cleanedContent.split('\n').map(line => line.trim()).filter(line => line)

  console.log('Generating Word document with', contentLines.length, 'lines')

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Page de titre
          new Paragraph({
            children: [
              new TextRun({
                text: ebookData.title,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `par ${ebookData.author}`,
                size: 24,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Généré par Story2book AI',
                size: 16,
                color: '888888',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),

          // Saut de page
          new Paragraph({
            children: [new TextRun({ text: '', break: 1 })],
            pageBreakBefore: true,
          }),

          // Contenu
          ...contentLines.map(line => {
            if (!line) {
              return new Paragraph({
                children: [new TextRun({ text: '' })],
                spacing: { after: 120 },
              })
            }

            // Détecter le type de ligne
            if (line.startsWith('# ')) {
              // Titre principal
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line.substring(2),
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              })
            } else if (line.startsWith('## ')) {
              // Sous-titre
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line.substring(3),
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
              })
            } else if (line.startsWith('### ')) {
              // Sous-sous-titre
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line.substring(4),
                    bold: true,
                    size: 20,
                  }),
                ],
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
              })
            } else if (line.startsWith('*') && line.endsWith('*')) {
              // Texte en italique
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line.substring(1, line.length - 1),
                    italics: true,
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
              })
            } else if (line.startsWith('**') && line.endsWith('**')) {
              // Texte en gras
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line.substring(2, line.length - 2),
                    bold: true,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
              })
            } else if (line === '---') {
              // Séparateur
              return new Paragraph({
                children: [
                  new TextRun({
                    text: '_______________________________________________',
                    color: 'CCCCCC',
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
              })
            } else {
              // Paragraphe normal
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                  }),
                ],
                spacing: { after: 120 },
                alignment: AlignmentType.JUSTIFIED,
              })
            }
          }),

          // Filigrane si activé
          ...(ebookData.hasWatermark ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: '',
                }),
              ],
            }),
          ] : []),
        ],
      },
    ],
  })

  console.log('Word document structure created, generating blob...')

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  console.log('✅ Word document generated successfully')
  return blob
}

// Fonction utilitaire pour télécharger le document Word
export function downloadWord(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Nettoyer l'URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}