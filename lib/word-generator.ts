import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

interface EbookData {
  title: string
  author: string
  content: string
  backgroundColor?: string
  fontFamily?: string
  hasWatermark?: boolean
}

// 🔥 FONCTION DE NETTOYAGE ROBUSTE WORD - IDENTIQUE AU PDF
const cleanContent = (content: string): string => {
  console.log('🧽 NETTOYAGE ROBUSTE WORD - Longueur entrée:', content.length)
  
  let cleaned = content
    // 1. SUPPRIMER LES ÉLÉMENTS PARASITES
    .replace(/<!--\s*Signature d'unicité:.*?-->/gi, '')
    .replace(/\(\d+\s*mots?\)/gi, '')
    .replace(/environ\s+\d+\s+mots?/gi, '')
    
    // 2. SUPPRIMER LES MÉTA-DONNÉES DU DÉBUT
    .replace(/^.*?par\s+\w+\s*$/gm, '')           // "par yacine"
    .replace(/^.*?Généré par.*?AI\s*$/gm, '')      // "Généré par Story2book AI"
    .replace(/^\s*\d+\s*$/gm, '')                  // Numéros de page isolés
    
    // 3. CORRIGER LES MARKDOWN MAL FORMATÉS
    .replace(/\*\*(.*?)\*\*/g, '$1')              // **texte** → texte
    .replace(/\*([^*]+)\*/g, '$1')                // *texte* → texte
    
    // 4. 🚨 CORRECTION CRITIQUE: CONVERTIR ## EN # POUR LES TITRES PRINCIPAUX
    .replace(/^##\s+/gm, '# ')                    // ## Titre → # Titre
    .replace(/^###\s+/gm, '## ')                  // ### Titre → ## Titre
    
    // 5. CORRIGER LES BLOCS DE TEXTE SANS RETOURS À LA LIGNE
    // Ajouter des retours à la ligne avant les titres cachés dans le texte
    .replace(/(\w)\s*\*\*\s*(Chapitre\s+\d+[^*]*)\*\*/g, '$1\n\n# $2')
    .replace(/(\w)\s*(Chapitre\s+\d+\s*[:\-])/g, '$1\n\n# $2')
    .replace(/(\w)\s*(Introduction\s*:)/g, '$1\n\n# $2')
    .replace(/(\w)\s*(Conclusion\s*:)/g, '$1\n\n# $2')
    
    // 🚨 CORRECTION CRITIQUE: Séparer les chapitres même sans ** - PATTERN PLUS ROBUSTE
    .replace(/(\w|\.)\s+(Chapitre\s+\d+\s*:)/g, '$1\n\n# $2')
    .replace(/(\w|\.)\s+(Chapitre\s+\d+\s*\-)/g, '$1\n\n# $2')
    .replace(/(\w|\.)\s+(Conclusion\s*:)/g, '$1\n\n# $2')
    .replace(/(\w|\.)\s+(Introduction\s*:)/g, '$1\n\n# $2')
    
    // 6. NETTOYER LES ESPACES (en préservant les retours à la ligne)
    .replace(/[ \t]+/g, ' ')                      // Espaces multiples → 1 espace
    .replace(/[ \t]+$/gm, '')                     // Espaces en fin de ligne
    
    // 7. NORMALISER LES LIGNES VIDES
    .replace(/\n\s*\n\s*\n+/g, '\n\n')           // Max 2 lignes vides
    
    // 8. ASSURER QUE LES TITRES SONT BIEN FORMATÉS
    .replace(/^\s*(#+\s*)/gm, '$1')              // Supprimer espaces avant #
    
    // 9. SUPPRIMER LES LIGNES VIDES AU DÉBUT ET À LA FIN
    .trim()
  
  // 10. 🔧 SUPPRESSION DU # EN DÉBUT DE TITRE PRINCIPAL  
  cleaned = cleaned.replace(/^#\s+(.+)/m, '$1')
  
  // 11. 🚨 VÉRIFICATION CRITIQUE: S'assurer qu'on a du contenu structuré
  if (!cleaned.includes('# ')) {
    console.warn('⚠️ AUCUN TITRE DÉTECTÉ - Ajout d\'une structure minimale')
    // Si aucun titre détecté, ajouter au moins un titre principal
    if (cleaned.length > 0) {
      cleaned = `Guide Expert\n\n${cleaned}`  // SANS # au début
    }
  }
  
  console.log('✅ NETTOYAGE WORD TERMINÉ - Longueur sortie:', cleaned.length)
  console.log('📊 Titres détectés:', (cleaned.match(/^# /gm) || []).length)
  
  return cleaned
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