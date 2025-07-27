"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface EbookPreviewProps {
  formData: {
    title: string
    author: string
    content: string
    backgroundColor: string
    fontFamily: string
    hasWatermark: boolean
    coverImage: File | null
    coverDescription?: string
  }
}

export default function EbookPreview({ formData }: EbookPreviewProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    if (formData.coverImage) {
      const url = URL.createObjectURL(formData.coverImage)
      setCoverImageUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [formData.coverImage])

  // Détection et formatage du contenu religieux multilingue
  const formatReligiousContent = (text: string): string => {
    // Escape HTML pour sécurité puis appliquer le formatage
    let formattedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
    
    // Détecter et formater les termes arabes avec translittération
    formattedText = formattedText.replace(
      /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)\s*\(([^)]+)\)/g,
      '<span class="arabic-inline">$1</span> <span class="transliteration">($2)</span>'
    )
    
    // Détecter et formater les termes latins
    formattedText = formattedText.replace(
      /\b([A-Z][a-z]+)\s*\(([^)]+en latin[^)]*)\)/g,
      '<span class="latin-term">$1</span> <span class="translation">($2)</span>'
    )
    
    // Détecter et formater les termes grecs
    formattedText = formattedText.replace(
      /([\u0370-\u03FF\u1F00-\u1FFF]+)\s*\(([^)]+)\)/g,
      '<span class="greek-term">$1</span> <span class="transliteration">($2)</span>'
    )
    
    return formattedText
  }

  // Fonction de nettoyage du contenu
  const cleanContent = (content: string): string => {
    let cleaned = content
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
    
    // Appliquer le formatage religieux multilingue
    return formatReligiousContent(cleaned)
  }

  // Diviser le contenu nettoyé en pages (simulation) - Ajusté pour des contenus plus longs
  const wordsPerPage = 200 // Réduit pour une meilleure lisibilité avec le scroll
  const cleanedContent = cleanContent(formData.content)
  const words = cleanedContent.split(" ")
  const pages = []

  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(" "))
  }

  const totalPages = Math.max(1, pages.length)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Aperçu de votre ebook</h3>
        <p className="text-gray-600">
          Page {currentPage + 1} sur {totalPages + 1} (couverture incluse)
        </p>
      </div>

      {/* Book Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <Card className="w-[400px] h-[600px] shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <CardContent
              className="p-8 h-full flex flex-col"
              style={{ backgroundColor: formData.backgroundColor }}
            >
              {currentPage === 0 ? (
                // Page de couverture
                <div className="text-center space-y-6 flex flex-col justify-center h-full">
                  <div className="flex justify-center mb-6">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt="Couverture personnalisée"
                        className="max-w-48 max-h-48 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="max-w-48 max-h-48 w-48 h-48 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-md flex items-center justify-center text-white text-center p-4">
                        <div>
                          <div className="text-4xl mb-2">📚</div>
                          <div className="text-sm font-medium leading-tight">
                            {formData.coverDescription || "Ebook généré par IA"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight break-words">{cleanContent(formData.title)}</h1>
                    {formData.author && <p className="text-xl text-gray-700 font-medium break-words">par {formData.author}</p>}
                  </div>
                  <div className="mt-auto">
                    <div className="w-16 h-0.5 bg-gray-400 mx-auto" />
                  </div>
                </div>
              ) : (
                // Pages de contenu avec scroll
                <div className="space-y-4 h-full flex flex-col">
                  <div className="text-sm text-gray-500 text-center">Chapitre {currentPage}</div>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="pr-2">
                      <div 
                        className="text-gray-800 leading-relaxed text-justify whitespace-pre-wrap break-words religious-content multilingual-text"
                        style={{ 
                          fontFamily: formData.fontFamily,
                          fontSize: '14px',
                          lineHeight: '1.7'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: (pages[currentPage - 1] || "Contenu de la page...").replace(/\n/g, '<br/>') 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-2">{currentPage}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Page précédente
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Page suivante
        </button>
      </div>

      {/* Page indicators */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentPage === i ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}