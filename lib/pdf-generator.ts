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
}

// Fonction de nettoyage du contenu
const cleanContent = (content: string): string => {
  return content
    // Supprimer les signatures d'unicité HTML
    .replace(/<!--\s*Signature d'unicité:.*?-->/gi, '')
    // Supprimer les mentions de nombre de mots entre parenthèses
    .replace(/\(\d+\s*mots?\)/gi, '')
    // Supprimer les astérisques autour des titres
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Supprimer les astérisques simples
    .replace(/\*(.*?)\*/g, '$1')
    // Supprimer les dièses de markdown mais garder les espaces pour la hiérarchie
    .replace(/^#{1,6}\s*/gm, '')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    // Nettoyer les espaces en début/fin de ligne
    .replace(/^\s+|\s+$/gm, '')
    // Supprimer les lignes vides multiples
    .replace(/\n\s*\n\s*\n/g, '\n\n')
}

export async function generatePDF(ebookData: EbookData): Promise<Blob> {
  // Créer un nouveau document PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Configuration de base avec debugging amélioré
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin

  // Debug: Afficher les dimensions (A4 = 210x297mm)
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

  // Fonction pour mapper les polices (jsPDF supporte un nombre limité)
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

  // Fonction pour ajouter une nouvelle page avec couleur de fond - AMÉLIORÉE
  const checkAndAddNewPage = (neededHeight: number) => {
    const availableSpace = pageHeight - margin - currentY
    console.log('Checking page:', { currentY, neededHeight, availableSpace, pageHeight })
    
    // Seuil plus conservateur pour forcer les sauts de page
    if (availableSpace < neededHeight || currentY > pageHeight - margin - 50) {
      console.log('Adding new page - current:', currentY, 'needed:', neededHeight)
      pdf.addPage()
      // Appliquer la couleur de fond à la nouvelle page
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      // Ajouter le filigrane si activé
      if (ebookData.hasWatermark) {
        addWatermark()
      }
      currentY = margin
      return true
    }
    return false
  }

  // Fonction spéciale pour les titres de chapitres - AMÉLIORÉE
  const checkAndAddNewPageForChapter = (titleHeight: number) => {
    const minSpaceAfterTitle = 80 // Augmenté à 80 pour plus d'espace
    const totalNeeded = titleHeight + minSpaceAfterTitle
    const availableSpace = pageHeight - margin - currentY
    
    console.log('Checking chapter page:', { currentY, titleHeight, minSpaceAfterTitle, totalNeeded, availableSpace })
    
    // Plus agressif pour les chapitres
    if (availableSpace < totalNeeded || currentY > pageHeight - margin - 100) {
      console.log('Adding new page for chapter')
      pdf.addPage()
      // Appliquer la couleur de fond à la nouvelle page
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      // Ajouter le filigrane si activé
      if (ebookData.hasWatermark) {
        addWatermark()
      }
      currentY = margin
      return true
    }
    return false
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
  pdf.addPage()
  pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')
  // Ajouter le filigrane si activé
  if (ebookData.hasWatermark) {
    addWatermark()
  }
  currentY = margin

  // Configuration pour le contenu - Taille de police plus grande et meilleure lisibilité
  pdf.setFont(selectedFont, 'normal')
  pdf.setFontSize(13) // Augmenté de 12 à 13
  pdf.setTextColor(40, 40, 40)

  // Traitement du contenu markdown nettoyé
  const cleanedContent = cleanContent(ebookData.content)
  const contentLines = cleanedContent.split('\n')
  
  console.log('Processing content lines:', contentLines.length)
  let lineCount = 0 // Compteur pour forcer les sauts de page
  const maxLinesPerPage = 25 // Réduit à 25 lignes maximum par page
  let contentHeight = 0 // Hauteur du contenu accumulé
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim()
    
    // Forcer un saut de page si trop de lignes traitées
    if (lineCount > maxLinesPerPage && line.length > 0) {
      console.log('Force page break after', lineCount, 'lines')
      pdf.addPage()
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      if (ebookData.hasWatermark) {
        addWatermark()
      }
      currentY = margin
      lineCount = 0
    }
    
    if (!line) {
      // Ligne vide - ajouter un espacement plus généreux
      currentY += 10 // Augmenté de 6 à 10
      continue
    }
    
    lineCount++ // Incrémenter le compteur de lignes

    if (line.startsWith('# ')) {
      // Titre principal (chapitre) - Plus d'espace et meilleure visibilité
      checkAndAddNewPageForChapter(30) // Augmenté de 20 à 30
      lineCount = 0 // Réinitialiser le compteur pour nouveau chapitre
      
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(20) // Augmenté de 18 à 20
      pdf.setTextColor(80, 80, 80)
      
      const titleText = line.substring(2)
      const lines = splitTextToLines(titleText, contentWidth, 20)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 10)) // Augmenté de 8 à 10
      })
      
      currentY += lines.length * 10 + 15 // Augmenté de 8+10 à 10+15
      console.log('Added chapter title, currentY now:', currentY)
      
    } else if (line.startsWith('## ')) {
      // Sous-titre (section importante) - Amélioration espacement
      checkAndAddNewPageForChapter(25) // Augmenté de 18 à 25
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(16) // Augmenté de 14 à 16
      pdf.setTextColor(60, 60, 60)
      
      const chapterText = line.substring(3)
      const lines = splitTextToLines(chapterText, contentWidth, 16)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 8)) // Augmenté de 6 à 8
      })
      
      currentY += lines.length * 8 + 12 // Augmenté de 6+8 à 8+12
      
    } else if (line.startsWith('### ')) {
      // Sous-sous-titre - Amélioration lisibilité
      checkAndAddNewPage(20) // Augmenté de 15 à 20
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(14) // Augmenté de 12 à 14
      pdf.setTextColor(80, 80, 80)
      
      const subTitleText = line.substring(4)
      const lines = splitTextToLines(subTitleText, contentWidth, 14)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 7)) // Augmenté de 5 à 7
      })
      
      currentY += lines.length * 7 + 10 // Augmenté de 5+6 à 7+10
      
    } else if (line.startsWith('*') && line.endsWith('*')) {
      // Texte en italique
      checkAndAddNewPage(10)
      pdf.setFont(selectedFont, 'italic')
      pdf.setFontSize(11)
      pdf.setTextColor(100, 100, 100)
      
      const italicText = line.substring(1, line.length - 1)
      const lines = splitTextToLines(italicText, contentWidth, 11)
      
      lines.forEach((textLine, index) => {
        const textWidth = pdf.getTextWidth(textLine)
        const x = (pageWidth - textWidth) / 2 // Centrer le texte italique
        pdf.text(textLine, x, currentY + (index * 5))
      })
      
      currentY += lines.length * 5 + 8
      
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Texte en gras
      checkAndAddNewPage(10)
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(60, 60, 60)
      
      const boldText = line.substring(2, line.length - 2)
      const lines = splitTextToLines(boldText, contentWidth, 12)
      
      lines.forEach((textLine, index) => {
        const textWidth = pdf.getTextWidth(textLine)
        const x = (pageWidth - textWidth) / 2 // Centrer le texte en gras
        pdf.text(textLine, x, currentY + (index * 5))
      })
      
      currentY += lines.length * 5 + 8
      
    } else if (line === '---') {
      // Séparateur
      checkAndAddNewPage(10)
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineWidth(0.5)
      pdf.line(margin + 20, currentY, pageWidth - margin - 20, currentY)
      currentY += 10
      
    } else if (line.length > 0) {
      // Paragraphe normal - Amélioration lisibilité et espacement
      pdf.setFont(selectedFont, 'normal')
      pdf.setFontSize(12) // Augmenté de 11 à 12
      pdf.setTextColor(50, 50, 50)
      
      const lines = splitTextToLines(line, contentWidth, 12)
      console.log('Processing paragraph with', lines.length, 'lines, currentY:', currentY)
      
      // Contrôle strict de la hauteur de page - Plus agressif
      const neededHeight = lines.length * 6 + 12
      const remainingSpace = pageHeight - margin - currentY
      
      console.log('Space check:', { neededHeight, remainingSpace, currentY, pageHeight })
      
      // Si pas assez d'espace OU si on est déjà trop bas sur la page
      if (remainingSpace < neededHeight || currentY > pageHeight * 0.75) {
        console.log('FORCING page break - remaining space:', remainingSpace, 'needed:', neededHeight)
        pdf.addPage()
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        if (ebookData.hasWatermark) {
          addWatermark()
        }
        currentY = margin
        lineCount = 0
      }
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 6)) // Augmenté de 5 à 6
      })
      
      currentY += lines.length * 6 + 12 // Augmenté de 5+8 à 6+12
      console.log('After paragraph, currentY:', currentY)
    }
  }

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