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
  coverImage?: string
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

  // Fonction pour ajouter une nouvelle page si nécessaire
  const checkAndAddNewPage = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
      return true
    }
    return false
  }

  // Fonction pour diviser le texte en lignes
  const splitTextToLines = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize)
    return pdf.splitTextToSize(text, maxWidth)
  }

  // Page de couverture
  pdf.setFillColor(250, 250, 250) // Couleur de fond claire
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Titre de la couverture
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(24)
  pdf.setTextColor(60, 60, 60)
  
  const titleLines = splitTextToLines(ebookData.title, contentWidth - 20, 24)
  let titleY = pageHeight / 3
  
  titleLines.forEach((line, index) => {
    const textWidth = pdf.getTextWidth(line)
    const x = (pageWidth - textWidth) / 2
    pdf.text(line, x, titleY + (index * 12))
  })

  // Auteur
  if (ebookData.author) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(16)
    pdf.setTextColor(100, 100, 100)
    
    const authorText = `par ${ebookData.author}`
    const authorWidth = pdf.getTextWidth(authorText)
    const authorX = (pageWidth - authorWidth) / 2
    pdf.text(authorText, authorX, titleY + (titleLines.length * 12) + 20)
  }

  // Logo/signature en bas
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(10)
  pdf.setTextColor(150, 150, 150)
  const signature = 'Généré par Story2book AI'
  const signatureWidth = pdf.getTextWidth(signature)
  pdf.text(signature, (pageWidth - signatureWidth) / 2, pageHeight - 30)

  // Nouvelle page pour le contenu
  pdf.addPage()
  currentY = margin

  // Configuration pour le contenu
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  pdf.setTextColor(40, 40, 40)

  // Traitement du contenu markdown
  const contentLines = ebookData.content.split('\n')
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim()
    
    if (!line) {
      // Ligne vide - ajouter un espacement
      currentY += 6
      continue
    }

    if (line.startsWith('# ')) {
      // Titre principal
      checkAndAddNewPage(20)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(80, 80, 80)
      
      const titleText = line.substring(2)
      const lines = splitTextToLines(titleText, contentWidth, 18)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 8))
      })
      
      currentY += lines.length * 8 + 10
      
    } else if (line.startsWith('## ')) {
      // Sous-titre (chapitre)
      checkAndAddNewPage(18)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(60, 60, 60)
      
      const chapterText = line.substring(3)
      const lines = splitTextToLines(chapterText, contentWidth, 14)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 6))
      })
      
      currentY += lines.length * 6 + 8
      
    } else if (line.startsWith('### ')) {
      // Sous-sous-titre
      checkAndAddNewPage(15)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(80, 80, 80)
      
      const subTitleText = line.substring(4)
      const lines = splitTextToLines(subTitleText, contentWidth, 12)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 5))
      })
      
      currentY += lines.length * 5 + 6
      
    } else if (line.startsWith('*') && line.endsWith('*')) {
      // Texte en italique
      checkAndAddNewPage(10)
      pdf.setFont('helvetica', 'italic')
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
      pdf.setFont('helvetica', 'bold')
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
      // Paragraphe normal
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(50, 50, 50)
      
      const lines = splitTextToLines(line, contentWidth, 11)
      
      // Vérifier si on a besoin d'une nouvelle page
      checkAndAddNewPage(lines.length * 5 + 5)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 5))
      })
      
      currentY += lines.length * 5 + 8
    }
  }

  // Ajouter les numéros de page
  const totalPages = pdf.getNumberOfPages()
  for (let i = 2; i <= totalPages; i++) { // Commencer à la page 2 (après la couverture)
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
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