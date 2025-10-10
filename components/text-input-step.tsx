"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Languages, Scissors, Wand2, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface TextInputStepProps {
  onNext: (data: {
    text: string
    language: string
    chapters: string[]
    style: string
  }) => void
  onBack: () => void
}

export default function TextInputStep({ onNext, onBack }: TextInputStepProps) {
  const [text, setText] = useState("")
  const [detectedLanguage, setDetectedLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [chapters, setChapters] = useState<string[]>([])
  const [detectedStyle, setDetectedStyle] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fonction pour détecter la langue automatiquement
  const detectLanguage = (text: string): string => {
    const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'une', 'un', 'dans', 'pour', 'avec', 'sur', 'par', 'que', 'qui', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'nous', 'vous', 'ils', 'elles', 'avoir', 'être', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'falloir', 'vouloir', 'venir', 'devoir']
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their']
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'me', 'ya', 'muy', 'mi', 'si', 'sin', 'sobre', 'este', 'ser', 'todo', 'esta', 'también']

    const words = text.toLowerCase().split(/\s+/)
    const frenchCount = words.filter(word => frenchWords.includes(word)).length
    const englishCount = words.filter(word => englishWords.includes(word)).length
    const spanishCount = words.filter(word => spanishWords.includes(word)).length

    if (frenchCount > englishCount && frenchCount > spanishCount) return 'fr'
    if (englishCount > frenchCount && englishCount > spanishCount) return 'en'
    if (spanishCount > frenchCount && spanishCount > englishCount) return 'es'
    return 'fr' // Par défaut français
  }

  // Fonction pour analyser le style d'écriture
  const analyzeWritingStyle = (text: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((acc, s) => acc + s.split(' ').length, 0) / sentences.length
    
    const hasDialogues = text.includes('"') || text.includes('«') || text.includes('—')
    const hasDescriptions = /\b(couleur|lumière|ombre|bruit|silence|parfum|odeur)\b/i.test(text)
    const hasTechnicalTerms = /\b(système|processus|méthode|technique|analyse|données)\b/i.test(text)
    
    if (hasTechnicalTerms) return "Technique/Informatif"
    if (hasDialogues && hasDescriptions) return "Narratif avec dialogues"
    if (hasDescriptions) return "Descriptif/Littéraire"
    if (avgSentenceLength > 20) return "Académique/Formel"
    if (avgSentenceLength < 10) return "Simple/Direct"
    return "Standard"
  }

  // Fonction pour découper automatiquement en chapitres
  const autoSplitChapters = (text: string): string[] => {
    // Rechercher des marqueurs de chapitres existants
    const chapterMarkers = [
      /^(Chapitre|Chapter|Capítulo)\s+\d+/gmi,
      /^(CHAPITRE|CHAPTER|CAPÍTULO)\s+\d+/gmi,
      /^\d+\.\s+[A-ZÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ]/gm,
      /^[A-ZÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ][A-ZÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ\s]{10,50}$/gm
    ]

    let chapters: string[] = []
    
    // Essayer de trouver des chapitres existants
    for (const marker of chapterMarkers) {
      const matches = Array.from(text.matchAll(marker))
      if (matches.length > 1) {
        const splits = text.split(marker)
        chapters = splits.filter(chunk => chunk.trim().length > 100)
        if (chapters.length > 1) break
      }
    }

    // Si pas de chapitres détectés, découper par paragraphes longs
    if (chapters.length <= 1) {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      const wordsPerChapter = Math.max(200, Math.floor(text.split(' ').length / 5))
      
      let currentChapter = ""
      let currentWordCount = 0
      chapters = []

      for (const paragraph of paragraphs) {
        const wordCount = paragraph.split(' ').length
        
        if (currentWordCount + wordCount > wordsPerChapter && currentChapter.length > 0) {
          chapters.push(currentChapter.trim())
          currentChapter = paragraph
          currentWordCount = wordCount
        } else {
          currentChapter += (currentChapter ? '\n\n' : '') + paragraph
          currentWordCount += wordCount
        }
      }
      
      if (currentChapter.trim()) {
        chapters.push(currentChapter.trim())
      }
    }

    return chapters.length > 0 ? chapters : [text]
  }

  // Fonction pour nettoyer le texte
  const cleanText = (text: string): string => {
    return text
      // Supprimer les espaces multiples
      .replace(/\s+/g, ' ')
      // Supprimer les espaces en début/fin de ligne
      .replace(/^\s+|\s+$/gm, '')
      // Corriger la ponctuation
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([,.!?;:])\s*/g, '$1 ')
      // Supprimer les lignes vides multiples
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Corriger les guillemets
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .trim()
  }

  // Fonction pour traiter le fichier uploadé
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError("")

    try {
      let content = ""

      if (file.type === 'text/plain') {
        content = await file.text()
      } else if (file.type === 'application/pdf') {
        // Pour PDF, on utiliserait une librairie comme pdf-parse
        // Pour l'instant, on affiche un message d'erreur
        throw new Error("L'import PDF nécessite une librairie supplémentaire. Utilisez un fichier .txt pour l'instant.")
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        // Pour DOCX, on utiliserait une librairie comme mammoth
        throw new Error("L'import DOCX nécessite une librairie supplémentaire. Utilisez un fichier .txt pour l'instant.")
      } else {
        throw new Error("Format de fichier non supporté. Utilisez .txt, .docx ou .pdf")
      }

      setText(content)
      
      // Analyser automatiquement le contenu
      const language = detectLanguage(content)
      setDetectedLanguage(language)
      
      const style = analyzeWritingStyle(content)
      setDetectedStyle(style)
      
      const autoChapters = autoSplitChapters(content)
      setChapters(autoChapters)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier")
    } finally {
      setIsProcessing(false)
    }
  }

  // Fonction pour analyser le texte saisi manuellement
  const analyzeText = () => {
    if (!text.trim()) return

    setIsProcessing(true)
    
    // Simuler un délai de traitement
    setTimeout(() => {
      const language = detectLanguage(text)
      setDetectedLanguage(language)
      
      const style = analyzeWritingStyle(text)
      setDetectedStyle(style)
      
      const autoChapters = autoSplitChapters(text)
      setChapters(autoChapters)
      
      setIsProcessing(false)
    }, 1000)
  }

  // Fonction pour nettoyer le texte
  const handleCleanText = () => {
    if (!text.trim()) return
    const cleaned = cleanText(text)
    setText(cleaned)
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (!text.trim()) {
      setError("Veuillez saisir ou importer du texte")
      return
    }

    onNext({
      text: text.trim(),
      language: detectedLanguage || 'fr',
      chapters: chapters.length > 0 ? chapters : [text.trim()],
      style: detectedStyle || 'Standard'
    })
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'Anglais',
      'es': 'Espagnol'
    }
    return languages[code] || 'Détection automatique'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 1 : Saisie du texte</h2>
        <p className="text-gray-600">Importez votre texte ou rédigez-le directement. Notre IA analysera automatiquement la langue et le style.</p>
      </div>

      <div className="space-y-6">
        {/* Zone d'import de fichier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Importer un fichier</span>
            </CardTitle>
            <CardDescription>
              Formats supportés : .txt, .docx, .pdf (bientôt disponible)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Choisir un fichier</span>
              </Button>
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de saisie de texte */}
        <Card>
          <CardHeader>
            <CardTitle>Saisie manuelle</CardTitle>
            <CardDescription>
              Rédigez ou collez votre texte directement dans cette zone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Commencez à écrire votre texte ici... Vous pouvez coller un texte existant ou le rédiger directement."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] text-base"
            />
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={analyzeText}
                disabled={!text.trim() || isProcessing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Languages className="h-4 w-4" />
                <span>Analyser le texte</span>
              </Button>
              
              <Button
                onClick={handleCleanText}
                disabled={!text.trim()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Wand2 className="h-4 w-4" />
                <span>Nettoyer le texte</span>
              </Button>
              
              <Button
                onClick={() => {
                  const autoChapters = autoSplitChapters(text)
                  setChapters(autoChapters)
                }}
                disabled={!text.trim()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Scissors className="h-4 w-4" />
                <span>Découper en chapitres</span>
              </Button>
            </div>

            {/* Statistiques du texte */}
            {text.trim() && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Caractères :</span>
                    <span className="ml-2 font-medium">{text.length.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mots :</span>
                    <span className="ml-2 font-medium">{text.trim().split(/\s+/).length.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paragraphes :</span>
                    <span className="ml-2 font-medium">{text.split(/\n\s*\n/).filter(p => p.trim()).length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pages estimées :</span>
                    <span className="ml-2 font-medium">{Math.ceil(text.trim().split(/\s+/).length / 250)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résultats de l'analyse */}
        {(detectedLanguage || detectedStyle || chapters.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Analyse automatique</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detectedLanguage && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Langue détectée</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{getLanguageName(detectedLanguage)}</span>
                  </div>
                </div>
              )}

              {detectedStyle && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Style d'écriture</Label>
                  <div className="mt-1">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{detectedStyle}</span>
                  </div>
                </div>
              )}

              {chapters.length > 1 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Chapitres détectés ({chapters.length})</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {chapters.map((chapter, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                        <div className="font-medium text-gray-700">Chapitre {index + 1}</div>
                        <div className="text-gray-600 truncate">
                          {chapter.substring(0, 100)}...
                        </div>
                        <div className="text-gray-500 mt-1">
                          {chapter.split(' ').length} mots
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Erreur</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-6">
          <Button onClick={onBack} variant="outline">
            Retour
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!text.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Continuer vers l'IA
          </Button>
        </div>
      </div>
    </div>
  )
}