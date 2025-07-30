"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Eye } from "lucide-react"
import EbookPreview from "@/components/ebook-preview"
import { generatePDF, downloadPDF } from "@/lib/pdf-generator"
import { generateWord, downloadWord } from "@/lib/word-generator"

interface EbookGeneratorProps {
  formData: {
    title: string
    author: string
    content: string
    backgroundColor: string
    fontFamily: string
    hasWatermark: boolean
    coverImage: File | null
    exactPages: number
    length: string
  }
  onBack: () => void
}

export default function EbookGenerator({ formData, onBack }: EbookGeneratorProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadType, setDownloadType] = useState<'pdf' | 'word' | null>(null)

  const handleDownload = async (type: 'pdf' | 'word') => {
    setIsDownloading(true)
    setDownloadType(type)

    try {
      const baseFilename = formData.title.replace(/[^a-zA-Z0-9]/g, '_')
      
      if (type === 'pdf') {
        // Générer le PDF
        const pdfBlob = await generatePDF({
          title: formData.title,
          author: formData.author,
          content: formData.content,
          backgroundColor: formData.backgroundColor,
          fontFamily: formData.fontFamily,
          hasWatermark: formData.hasWatermark,
          exactPages: formData.exactPages,
          length: formData.length
        })

        downloadPDF(pdfBlob, `${baseFilename}.pdf`)
        
      } else if (type === 'word') {
        // Générer le document Word
        const wordBlob = await generateWord({
          title: formData.title,
          author: formData.author,
          content: formData.content,
          backgroundColor: formData.backgroundColor,
          fontFamily: formData.fontFamily,
          hasWatermark: formData.hasWatermark
        })

        downloadWord(wordBlob, `${baseFilename}.docx`)
      }
      
    } catch (error) {
      console.error(`Erreur lors de la génération du ${type.toUpperCase()}:`, error)
      alert(`Erreur lors de la génération du ${type.toUpperCase()}. Veuillez réessayer.`)
    } finally {
      setIsDownloading(false)
      setDownloadType(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'éditeur</span>
        </Button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Ebook généré avec succès!</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Aperçu de votre ebook</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Votre ebook "<strong>{formData.title}</strong>" a été généré avec succès! Vous pouvez maintenant le
            prévisualiser et le télécharger au format PDF.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => handleDownload('pdf')} 
                disabled={isDownloading} 
                className="flex items-center space-x-2"
                variant={downloadType === 'pdf' ? 'default' : 'default'}
              >
                {isDownloading && downloadType === 'pdf' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Génération PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Télécharger PDF</span>
                  </>
                )}
              </Button>

              <Button 
                onClick={() => handleDownload('word')} 
                disabled={isDownloading} 
                className="flex items-center space-x-2"
                variant="outline"
              >
                {isDownloading && downloadType === 'word' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <span>Génération Word...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Télécharger Word</span>
                  </>
                )}
              </Button>
            </div>

            <Button variant="outline" onClick={onBack}>
              Créer un nouvel ebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <EbookPreview formData={{
        ...formData,
        fontFamily: formData.fontFamily,
        hasWatermark: formData.hasWatermark,
        coverDescription: "Image de garde générée automatiquement"
      }} />
    </div>
  )
}