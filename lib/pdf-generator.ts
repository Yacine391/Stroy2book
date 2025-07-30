// @ts-ignore
import jsPDF from 'jspdf'

// Déclaration de types pour jsPDF (simple)
declare module 'jspdf' {
  interface jsPDF {
    splitTextToSize(text: string, maxWidth: number): string[]
    getTextWidth(text: string): number
    getNumberOfPages(): number
    setPage(page: number): void
  }
}

interface EbookData {
  title: string
  author: string
  content: string
  backgroundColor: string
  fontFamily: string
  hasWatermark: boolean
  coverImage?: string
  exactPages?: number
  length?: string
}

// Fonction de nettoyage du contenu - PRÉSERVER LES RETOURS À LA LIGNE ET TITRES MARKDOWN
const cleanContent = (content: string): string => {
  return content
    // Supprimer les signatures d'unicité HTML
    .replace(/<!--\s*Signature d'unicité:.*?-->/gi, '')
    // Supprimer les mentions de nombre de mots entre parenthèses
    .replace(/\(\d+\s*mots?\)/gi, '')
    // Supprimer les astérisques autour des titres SAUF dans les listes
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // NE PAS supprimer les dièses - ils sont nécessaires pour détecter les titres !
    
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

export async function generatePDF(ebookData: EbookData): Promise<Blob> {
  // Créer un nouveau document PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Configuration de base
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin

  console.log('PDF Dimensions:', { pageWidth, pageHeight, margin, contentWidth })

  // Fonction pour convertir hex en RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  const bgColor = hexToRgb(ebookData.backgroundColor)

  // Fonction pour mapper les polices
  const getFontMapping = (fontFamily: string): string => {
    const fontMap: { [key: string]: string } = {
      'Arial': 'helvetica',
      'Helvetica': 'helvetica',
      'Times New Roman': 'times',
      'Georgia': 'times',
      'Verdana': 'helvetica',
      'Trebuchet MS': 'helvetica',
      'Palatino': 'times',
      'Garamond': 'times'
    }
    return fontMap[fontFamily] || 'helvetica'
  }

  const selectedFont = getFontMapping(ebookData.fontFamily)

  // Fonction pour ajouter une nouvelle page avec couleur de fond - SIMPLIFIÉE
  const addNewPage = () => {
    console.log('Adding new page - currentY was:', currentY)
    pdf.addPage()
    // Appliquer la couleur de fond à la nouvelle page
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    // Ajouter le filigrane si activé
    if (ebookData.hasWatermark) {
      addWatermark()
    }
    currentY = margin
  }

  // Fonction pour vérifier si on a besoin d'une nouvelle page - SIMPLIFIÉE
  const needsNewPage = (requiredHeight: number): boolean => {
    const availableSpace = pageHeight - margin - currentY
    return availableSpace < requiredHeight
  }

  // Fonction pour ajouter un filigrane
  const addWatermark = () => {
    // Sauvegarder les paramètres actuels
    const originalFillColor = pdf.getFillColor()
    
    // Configurer le filigrane
    pdf.setFont(selectedFont, 'normal')
    pdf.setFontSize(48)
    pdf.setTextColor(220, 220, 220) // Gris très clair
    
    // Calculer position centrale
    const watermarkText = 'Story2book AI'
    const textWidth = pdf.getTextWidth(watermarkText)
    const x = (pageWidth - textWidth) / 2
    const y = pageHeight / 2
    
    // Ajouter le texte en diagonale (simulation de rotation)
    pdf.text(watermarkText, x, y)
    
    // Restaurer la couleur de remplissage
    pdf.setFillColor(originalFillColor)
  }

  // Fonction pour diviser le texte en lignes
  const splitTextToLines = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize)
    return pdf.splitTextToSize(text, maxWidth)
  }

  // Page de couverture avec couleur personnalisée
  pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Ajouter le filigrane sur la couverture si activé
  if (ebookData.hasWatermark) {
    addWatermark()
  }

  // Titre de la couverture
  pdf.setFont(selectedFont, 'bold')
  pdf.setFontSize(24)
  pdf.setTextColor(60, 60, 60)
  
  const cleanedTitle = cleanContent(ebookData.title)
  const titleLines = splitTextToLines(cleanedTitle, contentWidth - 20, 24)
  let titleY = pageHeight / 3
  
  titleLines.forEach((line, index) => {
    const textWidth = pdf.getTextWidth(line)
    const x = (pageWidth - textWidth) / 2
    pdf.text(line, x, titleY + (index * 12))
  })

  // Auteur
  if (ebookData.author) {
    pdf.setFont(selectedFont, 'normal')
    pdf.setFontSize(16)
    pdf.setTextColor(100, 100, 100)
    
    const authorText = `par ${ebookData.author}`
    const authorWidth = pdf.getTextWidth(authorText)
    const authorX = (pageWidth - authorWidth) / 2
    pdf.text(authorText, authorX, titleY + (titleLines.length * 12) + 20)
  }

  // Logo/signature en bas
  pdf.setFont(selectedFont, 'italic')
  pdf.setFontSize(10)
  pdf.setTextColor(150, 150, 150)
  const signature = 'Généré par Story2book AI'
  const signatureWidth = pdf.getTextWidth(signature)
  pdf.text(signature, (pageWidth - signatureWidth) / 2, pageHeight - 30)

  // Nouvelle page pour le contenu
  addNewPage()

  // Configuration pour le contenu
  pdf.setFont(selectedFont, 'normal')
  pdf.setFontSize(12)
  pdf.setTextColor(40, 40, 40)

  // Traitement du contenu markdown nettoyé
  const cleanedContent = cleanContent(ebookData.content)
  const contentLines = cleanedContent.split('\n').map(line => line.trim())
  
  console.log('Processing content lines:', contentLines.length)
  console.log('Total content length:', cleanedContent.length, 'characters')
  
    // LOGIQUE AMÉLIORÉE POUR MISE EN PAGE PROPRE
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i]
    
    console.log(`Processing line ${i+1}/${contentLines.length}: ${line.substring(0, 50)}...`)
    
    if (!line) {
      // Ligne vide - espacement minimal
      currentY += 3
      continue
    }

    // Déterminer le type de ligne et ses paramètres
    let fontSize = 12
    let fontStyle = 'normal'
    let textColor = [50, 50, 50]
    let lineSpacing = 5
    let afterSpacing = 6
    let displayText = line
    let isSpecialElement = false
    
    if (line.startsWith('# ')) {
      // Titre principal (chapitre) - Espacement spécial pour introduction
      fontSize = 16
      fontStyle = 'bold'
      textColor = [80, 80, 80]
      displayText = line.substring(2)
      isSpecialElement = true
      
      // Espacement spécial pour "Introduction"
      if (displayText.toLowerCase().includes('introduction')) {
        afterSpacing = 12 // 2 lignes d'espacement comme demandé
      } else {
        afterSpacing = 8 // 1 ligne d'espacement pour les chapitres
      }
      
      // Vérifier si on a besoin d'une nouvelle page
      const neededSpace = 30 + afterSpacing
      if (needsNewPage(neededSpace)) {
        addNewPage()
      }
      
    } else if (line.startsWith('## ')) {
      // Sous-titre
      fontSize = 14
      fontStyle = 'bold'
      textColor = [60, 60, 60]
      afterSpacing = 6
      displayText = line.substring(3)
      isSpecialElement = true
      
      if (needsNewPage(25)) {
        addNewPage()
      }
      
    } else if (line.startsWith('### ')) {
      // Sous-sous-titre
      fontSize = 13
      fontStyle = 'bold'
      textColor = [80, 80, 80]
      afterSpacing = 5
      displayText = line.substring(4)
      isSpecialElement = true
      
      if (needsNewPage(20)) {
        addNewPage()
      }
      
    } else if (line.startsWith('*') && line.endsWith('*')) {
      // Texte en italique
      fontSize = 11
      fontStyle = 'italic'
      textColor = [100, 100, 100]
      displayText = line.substring(1, line.length - 1)
      
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Texte en gras
      fontSize = 12
      fontStyle = 'bold'
      textColor = [60, 60, 60]
      displayText = line.substring(2, line.length - 2)
      
    } else if (line === '---') {
      // Séparateur
      if (needsNewPage(10)) {
        addNewPage()
      }
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineWidth(0.5)
      pdf.line(margin + 20, currentY, pageWidth - margin - 20, currentY)
      currentY += 10
      continue
    }
    
    // Configurer le style
    pdf.setFont(selectedFont, fontStyle)
    pdf.setFontSize(fontSize)
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    
    // Diviser le texte en lignes qui tiennent dans la largeur
    const lines = splitTextToLines(displayText, contentWidth, fontSize)
    
    // Calculer l'espace total nécessaire
    const totalHeight = lines.length * lineSpacing + afterSpacing
    
    // Vérifier si on a assez d'espace pour TOUT le contenu
    if (needsNewPage(totalHeight)) {
      addNewPage()
    }
    
    // Afficher toutes les lignes du contenu
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const textLine = lines[lineIndex]
      const y = currentY + (lineIndex * lineSpacing)
      
      // Vérification de sécurité absolue
      if (y > pageHeight - margin - 15) {
        console.log('EMERGENCY: Creating new page mid-content')
        addNewPage()
        // Reprendre l'affichage des lignes restantes sur la nouvelle page
        for (let remainingIndex = lineIndex; remainingIndex < lines.length; remainingIndex++) {
          const remainingLine = lines[remainingIndex]
          const newY = currentY + ((remainingIndex - lineIndex) * lineSpacing)
          pdf.text(remainingLine, margin, newY)
        }
        currentY += (lines.length - lineIndex) * lineSpacing + afterSpacing
        break
      } else {
        pdf.text(textLine, margin, y)
        if (lineIndex === lines.length - 1) {
          // Dernière ligne : mettre à jour currentY
          currentY = y + lineSpacing + afterSpacing
        }
      }
    }
    
    console.log(`Line ${i+1} processed, currentY now: ${currentY}, isSpecial: ${isSpecialElement}`)
  }

  console.log('✅ ALL CONTENT PROCESSED - Total lines:', contentLines.length)
  
  const finalPages = pdf.getNumberOfPages()
  console.log('PDF GENERATION COMPLETE:')
  console.log('- Final pages:', finalPages)
  console.log('- All content included: ✅')

  // Ajouter les numéros de page
  const totalPages = pdf.getNumberOfPages()
  for (let i = 2; i <= totalPages; i++) { // Commencer à la page 2 (après la couverture)
    pdf.setPage(i)
    pdf.setFont(selectedFont, 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(150, 150, 150)
    
    const pageText = `${i - 1}`
    const pageWidth = pdf.internal.pageSize.getWidth()
    const textWidth = pdf.getTextWidth(pageText)
    pdf.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 15)
  }

  // Retourner le blob PDF
  const pdfBlob = pdf.output('blob')
  return pdfBlob
}

// Fonction utilitaire pour télécharger le PDF
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Nettoyer l'URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}