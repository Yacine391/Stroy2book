"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Eye } from "lucide-react"
import EbookPreview from "@/components/ebook-preview"
import { generatePDF, downloadPDF } from "@/lib/pdf-generator"

interface EbookGeneratorProps {
  formData: {
    title: string
    author: string
    content: string
    backgroundColor: string
    coverImage: File | null
  }
  onBack: () => void
}

export default function EbookGenerator({ formData, onBack }: EbookGeneratorProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Générer le PDF avec le contenu réel
      const pdfBlob = await generatePDF({
        title: formData.title,
        author: formData.author,
        content: formData.content,
        backgroundColor: formData.backgroundColor
      })

      // Créer un nom de fichier propre
      const filename = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      
      // Télécharger le PDF
      downloadPDF(pdfBlob, filename)
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setIsDownloading(false)
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
            <Button onClick={handleDownload} disabled={isDownloading} className="flex items-center space-x-2">
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Téléchargement...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Télécharger le PDF</span>
                </>
              )}
            </Button>

            <Button variant="outline" onClick={onBack}>
              Créer un nouvel ebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <EbookPreview formData={formData} />
    </div>
  )
}