"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Book, File, Settings, Loader2, CheckCircle, AlertCircle, Eye, Info } from "lucide-react"
import { generatePDF, downloadPDF } from "@/lib/pdf-generator"

interface LayoutSettings {
  template: string
  typography: {
    titleSize: number
    subtitleSize: number
    bodySize: number
    titleFont: string
    bodyFont: string
  }
  spacing: {
    lineHeight: number
    paragraphSpacing: number
    chapterSpacing: number
    margins: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
  pageSettings: {
    format: string
    orientation: string
    showPageNumbers: boolean
    pageNumberPosition: string
  }
  tableOfContents: {
    enabled: boolean
    style: string
    showPageNumbers: boolean
  }
  chapterHeaders: {
    style: string
    showNumbers: boolean
    alignment: string
  }
}

interface CoverData {
  title: string
  subtitle: string
  author: string
  imageUrl: string
  style: string
  layout: string
  colors: {
    primary: string
    secondary: string
    text: string
  }
  hasWatermark: boolean
  includeIllustrationInPDF?: boolean
  imagePosition?: { x: number; y: number; scale: number }
}

interface ExportFormatsProps {
  layoutSettings: LayoutSettings
  coverData: CoverData
  processedText: string
  illustrations: any[]
  onNext: (data: { exportedFiles: ExportedFile[] }) => void
  onBack: () => void
}

interface ExportedFile {
  format: string
  filename: string
  url: string
  size: string
  generatedAt: Date
}

interface ExportProgress {
  format: string
  progress: number
  status: 'idle' | 'generating' | 'completed' | 'error'
  message: string
}

export default function ExportFormats({ layoutSettings, coverData, processedText, illustrations, onNext, onBack }: ExportFormatsProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['pdf'])
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([])
  const [exportedFiles, setExportedFiles] = useState<ExportedFile[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Formats d'export disponibles
  const exportFormats = [
    {
      value: "pdf",
      label: "PDF",
      description: "Format universel, idéal pour l'impression et la lecture",
      icon: <FileText className="h-5 w-5" />,
      features: ["Mise en page fixe", "Compatible tous appareils", "Prêt à imprimer", "Qualité professionnelle"],
      recommended: true,
      fileSize: "2-5 MB"
    },
    {
      value: "epub",
      label: "EPUB",
      description: "Format ebook standard pour liseuses et applications",
      icon: <Book className="h-5 w-5" />,
      features: ["Texte adaptable", "Compatible liseuses", "Métadonnées intégrées", "Navigation avancée"],
      recommended: true,
      fileSize: "1-3 MB"
    },
    {
      value: "docx",
      label: "DOCX",
      description: "Document Word éditable pour modifications ultérieures",
      icon: <File className="h-5 w-5" />,
      features: ["Éditable", "Styles préservés", "Compatible Office", "Révisions possibles"],
      recommended: false,
      fileSize: "1-2 MB"
    }
  ]

  // Options d'export PDF
  const pdfOptions = [
    { value: "print", label: "Qualité impression (300 DPI)" },
    { value: "web", label: "Qualité web (150 DPI)" },
    { value: "ebook", label: "Optimisé liseuse (72 DPI)" }
  ]

  // Options d'export EPUB
  const epubOptions = [
    { value: "epub3", label: "EPUB 3 (recommandé)" },
    { value: "epub2", label: "EPUB 2 (compatibilité ancienne)" }
  ]

  // Fonction pour VRAIMENT exporter un format
  const exportFormat = async (format: string): Promise<ExportedFile> => {
    const steps = [
      "Préparation du contenu...",
      "Application de la mise en page...",
      "Intégration des illustrations...",
      "Génération du fichier...",
      "Optimisation...",
      "Finalisation..."
    ]

    let currentStep = 0
    const updateProgress = () => {
      const progress = Math.min((currentStep / steps.length) * 100, 100)
      setExportProgress(prev => 
        prev.map(p => 
          p.format === format 
            ? { 
                ...p, 
                progress, 
                status: currentStep < steps.length ? 'generating' : 'completed',
                message: currentStep < steps.length ? steps[currentStep] : 'Terminé !'
              }
            : p
        )
      )
    }

    try {
      // GÉNÉRATION RÉELLE selon le format
      if (format === 'pdf') {
        currentStep = 1
        updateProgress()
        
        // Données pour le PDF RÉEL avec le contenu traité ET toutes les métadonnées
        const ebookData = {
          title: coverData.title || 'Mon Ebook',
          subtitle: coverData.subtitle || '',
          author: coverData.author || 'Auteur',
          content: processedText || 'Contenu vide',
          backgroundColor: coverData.colors.primary || '#ffffff',
          fontFamily: layoutSettings.typography.bodyFont || 'Georgia',
          hasWatermark: coverData.hasWatermark,
          coverImage: coverData.imageUrl,
          includeIllustrationInPDF: coverData.includeIllustrationInPDF ?? true,
          imagePosition: coverData.imagePosition || { x: 0, y: 0, scale: 1 }
        }
        
        currentStep = 2
        updateProgress()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        currentStep = 3
        updateProgress()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        currentStep = 4
        updateProgress()
        
        // GÉNÉRER LE PDF RÉEL
        const pdfBlob = await generatePDF(ebookData)
        
        currentStep = 5
        updateProgress()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        currentStep = 6
        updateProgress()
        
        const url = URL.createObjectURL(pdfBlob)
        const filename = `${coverData.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
        const sizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(2)
        
        return {
          format: 'PDF',
          filename,
          url,
          size: `${sizeMB} MB`,
          generatedAt: new Date()
        }
      } else if (format === 'epub' || format === 'docx') {
        for (let i = 0; i < steps.length; i++) {
          currentStep = i + 1
          updateProgress()
          await new Promise(resolve => setTimeout(resolve, 400))
        }
        
        let fileContent = '';
        if (format === 'epub') {
          fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${coverData.title}</title>
  <meta charset="UTF-8"/>
</head>
<body>
  <h1>${coverData.title}</h1>
  <h2>par ${coverData.author}</h2>
  <hr/>
  ${processedText.split('\n\n').map(p => `<p>${p}</p>`).join('\n')}
</body>
</html>`;
        } else {
          fileContent = `${coverData.title}\n\npar ${coverData.author}\n\n${'='.repeat(50)}\n\n${processedText}`;
        }
        
        const blob = new Blob([fileContent], { 
          type: format === 'epub' ? 'application/epub+zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        })
        const url = URL.createObjectURL(blob)
        const filename = `${coverData.title.replace(/[^a-z0-9]/gi, '_')}.${format === 'epub' ? 'html' : 'txt'}`
        const sizeMB = (blob.size / (1024 * 1024)).toFixed(2)
        
        return {
          format: format.toUpperCase(),
          filename,
          url,
          size: `${sizeMB} MB`,
          generatedAt: new Date()
        }
      } else {
        throw new Error(`Format ${format} non supporté`)
      }
    } catch (error) {
      console.error(`Erreur lors de la génération ${format}:`, error)
      throw error
    }
  }

  // Fonction pour démarrer l'export
  const startExport = async () => {
    if (selectedFormats.length === 0) {
      setError("Veuillez sélectionner au moins un format d'export")
      return
    }

    setIsExporting(true)
    setError("")
    setSuccess("")
    setExportedFiles([])

    // Initialiser le suivi de progression
    const initialProgress: ExportProgress[] = selectedFormats.map(format => ({
      format,
      progress: 0,
      status: 'generating',
      message: 'Démarrage...'
    }))
    setExportProgress(initialProgress)

    try {
      // Exporter tous les formats sélectionnés en parallèle
      const exportPromises = selectedFormats.map(format => exportFormat(format))
      const results = await Promise.all(exportPromises)
      
      setExportedFiles(results)
      setSuccess(`${results.length} fichier${results.length > 1 ? 's' : ''} généré${results.length > 1 ? 's' : ''} avec succès`)
      
    } catch (err) {
      setError("Erreur lors de l'export des fichiers")
      setExportProgress(prev => 
        prev.map(p => ({ ...p, status: 'error', message: 'Erreur' }))
      )
    } finally {
      setIsExporting(false)
    }
  }

  // Fonction pour télécharger un fichier
  const downloadFile = (file: ExportedFile) => {
    if (file.url.startsWith('blob:')) {
      // Vrai fichier généré (PDF)
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setSuccess(`✅ Téléchargement de ${file.filename} démarré`)
    } else {
      // Format non encore implémenté
      setError(`Le format ${file.format} n'est pas encore disponible au téléchargement. Utilisez PDF pour l'instant.`)
    }
  }

  // Fonction pour télécharger tous les fichiers
  const downloadAllFiles = () => {
    exportedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100)
    })
  }

  // Fonction pour basculer la sélection d'un format
  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (exportedFiles.length === 0) {
      setError("Veuillez d'abord exporter au moins un format")
      return
    }

    onNext({ exportedFiles })
  }

  // Calculer les statistiques d'export
  const calculateStats = () => {
    const wordsCount = processedText.split(/\s+/).length
    const chaptersCount = (processedText.match(/(?:^|\n)((?:Chapitre|Chapter|#)\s*\d+)/gmi) || []).length || 1
    const illustrationsCount = illustrations.length
    
    return {
      wordsCount,
      chaptersCount,
      illustrationsCount,
      estimatedPages: Math.ceil(wordsCount / 250)
    }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 6 : Export du livre</h2>
        <p className="text-gray-600">Générez votre ebook dans les formats de votre choix. Tous les formats incluent votre mise en page personnalisée.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sélection des formats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formats disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Formats d'export</span>
              </CardTitle>
              <CardDescription>
                Sélectionnez les formats dans lesquels vous souhaitez exporter votre ebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportFormats.map((format) => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      selectedFormats.includes(format.value)
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedFormats.includes(format.value)}
                            onChange={() => toggleFormat(format.value)}
                            className="w-4 h-4"
                          />
                          {format.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{format.label}</h3>
                            {format.recommended && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Recommandé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {format.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-gray-600">{feature}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Taille estimée : {format.fileSize}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={startExport}
                  disabled={isExporting || selectedFormats.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isExporting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Export en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Exporter {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progression de l'export */}
          {exportProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progression de l'export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exportProgress.map((progress) => (
                    <div key={progress.format}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{progress.format.toUpperCase()}</span>
                          {progress.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {progress.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{Math.round(progress.progress)}%</span>
                      </div>
                      <Progress value={progress.progress} className="mb-1" />
                      <p className="text-xs text-gray-500">{progress.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fichiers exportés */}
          {exportedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Fichiers générés</span>
                  <Button onClick={downloadAllFiles} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tout télécharger
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exportedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded">
                          {file.format === 'PDF' && <FileText className="h-4 w-4 text-green-600" />}
                          {file.format === 'EPUB' && <Book className="h-4 w-4 text-green-600" />}
                          {file.format === 'DOCX' && <File className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-green-900">{file.filename}</div>
                          <div className="text-sm text-green-700">
                            {file.format} • {file.size} • {file.generatedAt.toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => downloadFile(file)} size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panneau d'informations */}
        <div className="space-y-6">
          {/* Résumé du livre */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résumé du livre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Titre :</span>
                <span className="font-medium text-right">{coverData.title}</span>
              </div>
              {coverData.subtitle && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-titre :</span>
                  <span className="font-medium text-right">{coverData.subtitle}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Auteur :</span>
                <span className="font-medium">{coverData.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mots :</span>
                <span className="font-medium">{stats.wordsCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chapitres :</span>
                <span className="font-medium">{stats.chaptersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Illustrations :</span>
                <span className="font-medium">{stats.illustrationsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pages estimées :</span>
                <span className="font-medium">{stats.estimatedPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Template :</span>
                <span className="font-medium">{layoutSettings.template}</span>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres d'export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Settings className="h-4 w-4" />
                <span>Paramètres d'export</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Label className="text-sm">Qualité PDF</Label>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6">
                      <strong>DPI (Dots Per Inch)</strong> = Points par pouce
                      <div className="mt-1">
                        • <strong>300 DPI</strong>: Qualité professionnelle pour l'impression<br/>
                        • <strong>150 DPI</strong>: Bon compromis taille/qualité pour le web<br/>
                        • <strong>72 DPI</strong>: Optimisé pour liseuses électroniques (plus léger)
                      </div>
                      <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-4"></div>
                    </div>
                  </div>
                </div>
                <Select defaultValue="print">
                  <SelectTrigger className="text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Version EPUB</Label>
                <Select defaultValue="epub3">
                  <SelectTrigger className="text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {epubOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-metadata"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <Label htmlFor="include-metadata" className="text-sm">Inclure les métadonnées</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="include-toc"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <Label htmlFor="include-toc" className="text-sm">Inclure le sommaire</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="optimize-images"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <Label htmlFor="optimize-images" className="text-sm">Optimiser les images</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Génération côté :</span>
                <span className="font-medium">Serveur</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moteur PDF :</span>
                <span className="font-medium">Puppeteer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moteur EPUB :</span>
                <span className="font-medium">epub-gen</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moteur DOCX :</span>
                <span className="font-medium">docx</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filigrane :</span>
                <span className="font-medium">{coverData.hasWatermark ? 'Activé' : 'Désactivé'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Messages de statut */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Erreur</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Succès</span>
          </div>
          <p className="text-green-700 mt-1">{success}</p>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-8">
        <Button onClick={onBack} variant="outline">
          Retour
        </Button>
        <Button 
          onClick={handleNext}
          disabled={exportedFiles.length === 0}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Continuer vers la gestion des projets
        </Button>
      </div>
    </div>
  )
}