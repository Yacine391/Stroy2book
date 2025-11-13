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

interface IllustrationWithPosition {
  id: string
  chapterIndex: number
  targetChapterIndex: number
  position: 'top' | 'middle' | 'bottom'
  imageUrl: string
  chapterTitle: string
}

interface EbookData {
  title: string
  subtitle?: string
  author: string
  content: string
  backgroundColor: string
  fontFamily: string
  hasWatermark: boolean
  coverImage?: string
  includeIllustrationInPDF?: boolean
  imagePosition?: { x: number; y: number; scale: number }
  exactPages?: number
  length?: string
  // ✅ NOUVEAU : Illustrations avec positionnement
  illustrations?: IllustrationWithPosition[]
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
    const watermarkText = 'HB Creator'
    const textWidth = pdf.getTextWidth(watermarkText)
    const x = (pageWidth - textWidth) / 2
    const y = pageHeight / 2
    
    // Ajouter le texte en diagonale (simulation de rotation)
    pdf.text(watermarkText, x, y)
    
    // Restaurer la couleur de remplissage
    pdf.setFillColor(originalFillColor)
  }

  // ✅ NOUVELLE FONCTION : Ajouter une illustration pleine page
  const addFullPageIllustration = (illustration: IllustrationWithPosition) => {
    try {
      console.log('📸 Ajout illustration pleine page:', illustration.chapterTitle)
      
      // Créer une nouvelle page dédiée à l'illustration
      pdf.addPage()
      
      // Fond de la page
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Ajouter l'illustration en pleine page
      pdf.addImage(illustration.imageUrl, 'PNG', 0, 0, pageWidth, pageHeight)
      
      console.log('✅ Illustration pleine page ajoutée')
      
      // Réinitialiser currentY pour la page suivante
      currentY = margin
      
      return true
    } catch (err) {
      console.error('❌ Erreur ajout illustration pleine page:', err)
      return false
    }
  }

  // Fonction pour diviser le texte en lignes
  const splitTextToLines = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize)
    return pdf.splitTextToSize(text, maxWidth)
  }

  // ✅ PAGE DE COUVERTURE AVEC IMAGE PLEINE PAGE (si disponible)
  if (ebookData.coverImage) {
    try {
      console.log('📸 Création page de couverture avec image pleine page')
      
      // Image en pleine page (de bord à bord)
      pdf.addImage(ebookData.coverImage, 'PNG', 0, 0, pageWidth, pageHeight)
      console.log('✅ Image de couverture pleine page ajoutée')
      
      // Préparer le titre pour calculer la zone
      const cleanedTitle = cleanContent(ebookData.title)
      const titleY = pageHeight / 3  // Position titre
      
      // ✅ PAS D'OVERLAY - Texte avec OMBRE PORTÉE pour lisibilité
      // Cette approche laisse l'image 100% visible et le texte "imprégné" dessus
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(32)
      const titleLines = splitTextToLines(cleanedTitle, contentWidth - 20, 32)
      
      // Dessiner le titre avec ombre portée (effet "imprégné")
      titleLines.forEach((line, index) => {
        const textWidth = pdf.getTextWidth(line)
        const x = (pageWidth - textWidth) / 2
        const y = titleY + (index * 16)
        
        // Ombre portée (gris foncé, légèrement décalée)
        pdf.setTextColor(40, 40, 40)
        pdf.text(line, x + 0.5, y + 0.5)
        
        // Texte principal (blanc éclatant)
        pdf.setTextColor(255, 255, 255)
        pdf.text(line, x, y)
      })

      // Auteur avec ombre portée
      if (ebookData.author) {
        pdf.setFont(selectedFont, 'normal')
        pdf.setFontSize(20)
        
        const authorText = `par ${ebookData.author}`
        const authorWidth = pdf.getTextWidth(authorText)
        const authorX = (pageWidth - authorWidth) / 2
        const authorY = titleY + (titleLines.length * 16) + 30
        
        // Ombre
        pdf.setTextColor(40, 40, 40)
        pdf.text(authorText, authorX + 0.5, authorY + 0.5)
        
        // Texte
        pdf.setTextColor(255, 255, 255)
        pdf.text(authorText, authorX, authorY)
      }
      
      // Signature avec ombre portée
      pdf.setFont(selectedFont, 'italic')
      pdf.setFontSize(11)
      const signature = 'Généré par HB Creator'
      const signatureWidth = pdf.getTextWidth(signature)
      const signatureX = (pageWidth - signatureWidth) / 2
      
      // Ombre
      pdf.setTextColor(60, 60, 60)
      pdf.text(signature, signatureX + 0.3, pageHeight - 29.7)
      
      // Texte
      pdf.setTextColor(255, 255, 255)
      pdf.text(signature, signatureX, pageHeight - 30)
      
      console.log('✅ Couverture créée: image pleine page + texte avec ombre portée')
      
    } catch (err) {
      console.error('❌ Erreur création couverture pleine page, fallback simple:', err)
      // Fallback: Couverture simple sans image
      createSimpleCover()
    }
  } else {
    // Pas d'image: couverture simple avec couleur
    createSimpleCover()
  }
  
  // Fonction pour créer une couverture simple (fallback)
  function createSimpleCover() {
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    if (ebookData.hasWatermark) {
      addWatermark()
    }

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

    if (ebookData.author) {
      pdf.setFont(selectedFont, 'normal')
      pdf.setFontSize(16)
      pdf.setTextColor(100, 100, 100)
      
      const authorText = `par ${ebookData.author}`
      const authorWidth = pdf.getTextWidth(authorText)
      const authorX = (pageWidth - authorWidth) / 2
      pdf.text(authorText, authorX, titleY + (titleLines.length * 12) + 20)
    }

    pdf.setFont(selectedFont, 'italic')
    pdf.setFontSize(10)
    pdf.setTextColor(150, 150, 150)
    const signature = 'Généré par HB Creator'
    const signatureWidth = pdf.getTextWidth(signature)
    pdf.text(signature, (pageWidth - signatureWidth) / 2, pageHeight - 30)
  }

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
  
  // NOUVELLE STRATÉGIE: Diviser les paragraphes trop longs pour forcer la pagination
  const preprocessContent = (content: string): string[] => {
    const lines = content.split('\n')
    const processedLines: string[] = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Si c'est un titre ou une ligne courte, garder tel quel
      if (trimmedLine.startsWith('#') || trimmedLine.length < 200) {
        processedLines.push(trimmedLine)
        continue
      }
      
      // Si c'est un paragraphe long, le diviser en segments plus courts
      if (trimmedLine.length > 200) {
        const sentences = trimmedLine.split(/[.!?]+/)
        let currentParagraph = ''
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i].trim()
          if (!sentence) continue
          
          // Ajouter la ponctuation si ce n'est pas la dernière phrase
          const punctuation = i < sentences.length - 1 ? '. ' : ''
          const sentenceWithPunct = sentence + punctuation
          
          // Si ajouter cette phrase rendrait le paragraphe trop long
          if (currentParagraph.length + sentenceWithPunct.length > 300) {
            if (currentParagraph) {
              processedLines.push(currentParagraph.trim())
              processedLines.push('') // Ligne vide pour espacer
            }
            currentParagraph = sentenceWithPunct
          } else {
            currentParagraph += sentenceWithPunct
          }
        }
        
        // Ajouter le dernier paragraphe s'il existe
        if (currentParagraph.trim()) {
          processedLines.push(currentParagraph.trim())
        }
      } else {
        processedLines.push(trimmedLine)
      }
    }
    
    return processedLines
  }
  
  const contentLines = preprocessContent(cleanedContent)
  
  console.log('Processing content lines after preprocessing:', contentLines.length)
  console.log('Original content length:', ebookData.content.length, 'characters')
  console.log('Cleaned content length:', cleanedContent.length, 'characters')
  
  // CALCUL INTELLIGENT DU NOMBRE DE PAGES
  const getOptimalPagination = () => {
    const totalLines = contentLines.length
    const wordsCount = cleanedContent.split(/\s+/).length
    
    let targetPages = 0
    
    // Déterminer le nombre de pages cible
    if (ebookData.exactPages && ebookData.exactPages > 0) {
      targetPages = ebookData.exactPages
      console.log('Using exact pages:', targetPages)
    } else if (ebookData.length) {
      // Estimation basée sur la longueur
      switch(ebookData.length) {
        case 'court': targetPages = Math.max(8, Math.min(15, Math.ceil(wordsCount / 400))); break
        case 'moyen': targetPages = Math.max(15, Math.min(35, Math.ceil(wordsCount / 350))); break  
        case 'long': targetPages = Math.max(35, Math.min(60, Math.ceil(wordsCount / 300))); break
        default: targetPages = Math.ceil(wordsCount / 350)
      }
      console.log('Estimated pages for', ebookData.length, ':', targetPages)
    } else {
      targetPages = Math.ceil(wordsCount / 350) // Par défaut
      console.log('Default pages calculation:', targetPages)
    }
    
    // Calculer l'espacement optimal pour atteindre le nombre de pages
    const linesPerPage = Math.ceil(totalLines / Math.max(targetPages - 1, 1)) // -1 pour la couverture
    const paragraphsPerPage = Math.ceil(linesPerPage / 3) // Estimation 3 lignes par paragraphe
    
    console.log('PAGINATION TARGET:', {
      targetPages,
      totalLines,
      wordsCount,
      linesPerPage,
      paragraphsPerPage
    })
    
    return {
      targetPages,
      maxLinesPerPage: Math.max(linesPerPage, 200), // SUPPRESSION LIMITES: 80 → 200 (quasi illimité)
      maxParagraphsPerPage: Math.max(paragraphsPerPage, 100) // SUPPRESSION LIMITES: 30 → 100 (quasi illimité)
    }
  }
  
  const pagination = getOptimalPagination()
  
  let lineCount = 0 // Compteur pour forcer les sauts de page
  const maxLinesPerPage = pagination.maxLinesPerPage
  let contentHeight = 0 // Hauteur du contenu accumulé
  let paragraphCount = 0 // Compteur de paragraphes
  const maxParagraphsPerPage = pagination.maxParagraphsPerPage
  let processedLines = 0 // Compteur pour debug
  
  // ✅ NOUVEAU : Gestion des illustrations par chapitre
  let currentChapterIndex = -1  // Chapitre actuel
  const illustrationsByChapter = new Map<number, IllustrationWithPosition[]>()
  
  // Organiser les illustrations par chapitre cible
  if (ebookData.illustrations && ebookData.illustrations.length > 0) {
    ebookData.illustrations.forEach(ill => {
      const targetChapter = ill.targetChapterIndex
      if (!illustrationsByChapter.has(targetChapter)) {
        illustrationsByChapter.set(targetChapter, [])
      }
      illustrationsByChapter.get(targetChapter)!.push(ill)
    })
    console.log('📚 Illustrations organisées par chapitre:', Object.fromEntries(illustrationsByChapter))
  }
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim()
    
    // DÉSACTIVATION COMPLÈTE de toutes les limites - FORCER TOUT LE CONTENU
    console.log('ALL LIMITS DISABLED - Processing line', i+1, 'of', contentLines.length, '- Line:', line.substring(0, 50) + '...')
    
    // SAUT DE PAGE seulement si VRAIMENT plus de place du tout
    if (currentY > pageHeight - margin - 15 && line.length > 0) {
      console.log('ABSOLUTE PHYSICAL LIMIT: Force page break - currentY:', currentY)
      pdf.addPage()
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      if (ebookData.hasWatermark) {
        addWatermark()
      }
      currentY = margin
      lineCount = 0
      paragraphCount = 0
    }
    
    processedLines++ // Debug: compteur de lignes traitées (AVANT toute condition)
    
    if (!line) {
      // Ligne vide - espacement livre classique
      currentY += 4 // Réduit de 10 à 4 pour style livre
      continue
    }
    
    lineCount++ // Incrémenter le compteur de lignes

          if (line.startsWith('# ')) {
        // ✅ INSÉRER ILLUSTRATIONS EN POSITION 'BOTTOM' du chapitre précédent (avant nouveau chapitre)
        if (currentChapterIndex >= 0) {
          const prevChapIllustrations = illustrationsByChapter.get(currentChapterIndex) || []
          const bottomIllustrations = prevChapIllustrations.filter(ill => ill.position === 'bottom')
          
          for (const ill of bottomIllustrations) {
            console.log('📸 Insertion illustration BOTTOM fin chapitre', currentChapterIndex)
            addFullPageIllustration(ill)
          }
        }
        
        // ✅ NOUVEAU : Détection de nouveau chapitre - Incrémenter le compteur
        currentChapterIndex++
        console.log('📖 Nouveau chapitre détecté, index:', currentChapterIndex)
        
        // ✅ INSÉRER ILLUSTRATIONS EN POSITION 'TOP' (avant le titre)
        const chapIllustrations = illustrationsByChapter.get(currentChapterIndex) || []
        const topIllustrations = chapIllustrations.filter(ill => ill.position === 'top')
        
        for (const ill of topIllustrations) {
          console.log('📸 Insertion illustration TOP avant chapitre', currentChapterIndex)
          addFullPageIllustration(ill)
        }
        
        // Titre principal (chapitre) - Plus d'espace et meilleure visibilité
        checkAndAddNewPageForChapter(40) // Augmenté de 30 à 40 pour plus d'espace
      lineCount = 0 // Réinitialiser le compteur pour nouveau chapitre
      
      pdf.setFont(selectedFont, 'bold')
      pdf.setFontSize(20) // Augmenté de 18 à 20
      pdf.setTextColor(80, 80, 80)
      
      const titleText = line.substring(2)
      const lines = splitTextToLines(titleText, contentWidth, 20)
      
      lines.forEach((textLine, index) => {
        pdf.text(textLine, margin, currentY + (index * 10)) // Augmenté de 8 à 10
      })
      
      currentY += lines.length * 8 + 20 // AUGMENTÉ pour plus d'espace: 12 → 20
      console.log('Added chapter title, currentY now:', currentY)
      
      // ✅ INSÉRER ILLUSTRATIONS EN POSITION 'MIDDLE' (après le titre, avant le contenu)
      const middleIllustrations = chapIllustrations.filter(ill => ill.position === 'middle')
      
      for (const ill of middleIllustrations) {
        console.log('📸 Insertion illustration MIDDLE après titre chapitre', currentChapterIndex)
        addFullPageIllustration(ill)
      }
      
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
      
      currentY += lines.length * 6 + 8 // Style livre: 6+8
      
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
      
      currentY += lines.length * 5 + 6 // Style livre: 5+6
      
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
      
                      // DÉSACTIVATION TOTALE contrôle d'espace - ABSOLUMENT TOUT LE CONTENU
        console.log('SPACE CHECK COMPLETELY DISABLED - Processing paragraph with', lines.length, 'lines')
        
        // Pas de saut de page préventif - on gère après si débordement
      
      lines.forEach((textLine, index) => {
        const lineY = currentY + (index * 4.5)
        
        // Vérifier si on déborde - créer nouvelle page si nécessaire
        if (lineY > pageHeight - margin - 10) {
          console.log('OVERFLOW DETECTED - Creating new page at line', index, 'lineY:', lineY)
          pdf.addPage()
          pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
          pdf.rect(0, 0, pageWidth, pageHeight, 'F')
          if (ebookData.hasWatermark) {
            addWatermark()
          }
          currentY = margin
          pdf.text(textLine, margin, currentY)
          currentY += 4.5
        } else {
          pdf.text(textLine, margin, lineY)
        }
      })
      
      // Ajuster currentY seulement si pas de débordement
      if (currentY + (lines.length * 4.5) <= pageHeight - margin - 10) {
        currentY += lines.length * 4 + 6 // Style livre classique: 4+6
      } else {
        currentY += 6 // Juste l'espacement de paragraphe
      }
      paragraphCount++ // Incrémenter le compteur de paragraphes
      console.log('After paragraph, currentY:', currentY, 'paragraphCount:', paragraphCount)
    }
  }

  console.log('FINAL STATS: Total lines to process:', contentLines.length, 'Lines actually processed:', processedLines)
  
  // ✅ INSÉRER ILLUSTRATIONS EN POSITION 'BOTTOM' du dernier chapitre (à la fin)
  if (currentChapterIndex >= 0) {
    const lastChapIllustrations = illustrationsByChapter.get(currentChapterIndex) || []
    const bottomIllustrations = lastChapIllustrations.filter(ill => ill.position === 'bottom')
    
    for (const ill of bottomIllustrations) {
      console.log('📸 Insertion illustration BOTTOM fin dernier chapitre', currentChapterIndex)
      addFullPageIllustration(ill)
    }
  }
  
  // VÉRIFICATION CRITIQUE RENFORCÉE: S'assurer que tout le contenu a été traité
  const missingLines = contentLines.length - processedLines
  
  if (missingLines > 0) {
    console.error('❌ CONTENT TRUNCATION DETECTED!')
    console.error('Missing lines:', missingLines, '/', contentLines.length)
    console.error('Processing ALL remaining lines...')
    
    // NOUVEAU: Traiter TOUTES les lignes manquantes sans exception
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim()
      
      // Skip si la ligne a déjà été traitée (approximation)
      if (i < processedLines && line.length > 0) continue
      
      // Ajouter TOUT le contenu manquant, même les lignes vides
      if (currentY > pageHeight - margin - 40) {
        pdf.addPage()
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        if (ebookData.hasWatermark) {
          addWatermark()
        }
        currentY = margin
      }
      
      if (!line) {
        currentY += 4 // Espacement pour lignes vides
        continue
      }
      
      // Ajouter le contenu de récupération
      pdf.setFont(selectedFont, 'normal')
      pdf.setFontSize(12)
      pdf.setTextColor(50, 50, 50)
      
      const lines = splitTextToLines(line, contentWidth, 12)
      lines.forEach((textLine, index) => {
        // Vérifier l'espace pour chaque ligne
        if (currentY + (index * 4.5) > pageHeight - margin - 10) {
          pdf.addPage()
          pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b)
          pdf.rect(0, 0, pageWidth, pageHeight, 'F')
          if (ebookData.hasWatermark) {
            addWatermark()
          }
          currentY = margin
        }
        pdf.text(textLine, margin, currentY + (index * 4.5))
      })
      
      currentY += lines.length * 4.5 + 6
      console.log('RECOVERY: Added line', i+1, '/', contentLines.length, '- Content:', line.substring(0, 50) + '...')
    }
    
    console.log('✅ ALL missing content has been FORCEFULLY added to PDF')
  } else {
    console.log('✅ All content processed successfully on first pass')
  }
  
  const finalPages = pdf.getNumberOfPages()
  console.log('PDF GENERATION COMPLETE:')
  console.log('- Target pages:', pagination.targetPages)  
  console.log('- Actual pages:', finalPages)
  console.log('- Content fully included:', processedLines >= contentLines.length ? '✅' : '❌')

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