"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image, Palette, RefreshCw, Download, Eye, Settings, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import AITimer from "./ai-timer"

interface ProcessedTextData {
  processedText: string
  history: any[]
}

interface TextData {
  text: string
  language: string
  chapters: string[]
  style: string
  desiredPages: number
}

interface CoverData {
  coverData: any
}

interface IllustrationGenerationProps {
  textData: TextData  // Données texte initial
  processedText: ProcessedTextData  // Texte traité par IA
  coverData: CoverData  // Données couverture
  currentUser?: any  // Pour limites abonnement
  onNext: (data: { illustrations: GeneratedIllustration[] }) => void
  onBack: () => void
}

interface GeneratedIllustration {
  id: string
  chapterIndex: number
  chapterTitle: string
  prompt: string
  style: string
  imageUrl: string
  isGenerating: boolean
}

export default function IllustrationGeneration({ textData, processedText, coverData, currentUser, onNext, onBack }: IllustrationGenerationProps) {
  const [numberOfIllustrations, setNumberOfIllustrations] = useState(5)
  const maxIllustrations = currentUser?.subscription?.max_illustrations || 10
  const [chapters, setChapters] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [illustrations, setIllustrations] = useState<GeneratedIllustration[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [enableIllustrations, setEnableIllustrations] = useState(true)

  // Styles d'illustration disponibles
  const illustrationStyles = [
    {
      value: "realistic",
      label: "Réaliste",
      description: "Style photographique réaliste",
      example: "🖼️"
    },
    {
      value: "cartoon",
      label: "Cartoon",
      description: "Style cartoon coloré et amusant",
      example: "🎨"
    },
    {
      value: "watercolor",
      label: "Aquarelle",
      description: "Style aquarelle artistique",
      example: "🎭"
    },
    {
      value: "fantasy",
      label: "Fantasy",
      description: "Style fantastique et magique",
      example: "🧙"
    },
    {
      value: "minimalist",
      label: "Minimaliste",
      description: "Style épuré et moderne",
      example: "⚪"
    },
    {
      value: "vintage",
      label: "Vintage",
      description: "Style rétro et nostalgique",
      example: "📜"
    },
    {
      value: "digital_art",
      label: "Art numérique",
      description: "Style art numérique moderne",
      example: "💻"
    },
    {
      value: "sketch",
      label: "Esquisse",
      description: "Style dessin au crayon",
      example: "✏️"
    }
  ]

  // Extraire les chapitres du texte traité
  useEffect(() => {
    const extractChapters = (text: string): string[] => {
      // Rechercher les marqueurs de chapitres
      const chapterRegex = /(?:^|\n)((?:Chapitre|Chapter|#)\s*\d+[^:\n]*:?[^\n]*)/gmi
      const matches = Array.from(text.matchAll(chapterRegex))
      
      if (matches.length > 0) {
        const chapterTitles = matches.map(match => match[1].trim())
        return chapterTitles
      }
      
      // Si pas de chapitres détectés, créer des chapitres par défaut
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)
      const chaptersPerSection = Math.max(1, Math.floor(paragraphs.length / 5))
      
      const defaultChapters: string[] = []
      for (let i = 0; i < Math.min(5, Math.ceil(paragraphs.length / chaptersPerSection)); i++) {
        defaultChapters.push(`Chapitre ${i + 1}`)
      }
      
      return defaultChapters
    }

    const extractedChapters = extractChapters(processedText.processedText)
    setChapters(extractedChapters)

    // Initialiser les illustrations
    const initialIllustrations: GeneratedIllustration[] = extractedChapters.map((chapter, index) => ({
      id: `ill_${index}`,
      chapterIndex: index,
      chapterTitle: chapter,
      prompt: `Illustration pour ${chapter}`,
      style: selectedStyle,
      imageUrl: "", // Sera généré
      isGenerating: false
    }))

    setIllustrations(initialIllustrations)
  }, [processedText.processedText, selectedStyle])

  // ✅ NOUVELLE FONCTION: Génération contextuelle comme les couvertures
  const generatePromptForChapter = (chapterTitle: string, chapterContent: string): string => {
    // Extraire le contexte COMPLET (titre + texte utilisateur)
    const TITLE = coverData?.coverData?.title || textData?.chapters?.[0] || 'Mon Ebook'
    const TEXT = textData?.text || processedText.processedText.substring(0, 1500)
    
    // Analyser le contenu pour extraire les éléments visuels clés
    const contentToAnalyze = (TITLE + ' ' + TEXT + ' ' + chapterContent).toLowerCase()
    
    // Extraction intelligente des éléments visuels (comme pour les couvertures)
    const extractVisualElements = (text: string): string[] => {
      const elements: string[] = []
      
      // Lieux
      const locations = ['algérie', 'france', 'paris', 'désert', 'montagne', 'mer', 'ville', 'campagne', 'forêt']
      locations.forEach(loc => {
        if (text.includes(loc)) elements.push(loc)
      })
      
      // Objets symboliques
      const objects = ['drapeau', 'livre', 'arme', 'outil', 'monument', 'véhicule', 'bâtiment']
      objects.forEach(obj => {
        if (text.includes(obj)) elements.push(obj)
      })
      
      // Personnages/Actions
      const actions = ['combat', 'célébration', 'réunion', 'voyage', 'découverte', 'rencontre']
      actions.forEach(act => {
        if (text.includes(act)) elements.push(act)
      })
      
      return elements.slice(0, 3)
    }
    
    const visualElements = extractVisualElements(contentToAnalyze)
    
    // Construire le prompt PRÉCIS comme pour les couvertures
    const basePrompt = `Illustration réaliste en rapport avec le texte fourni`
    const elementPrompt = visualElements.length > 0 
      ? `. Scène montrant: ${visualElements.join(', ')}`
      : `. Contexte: ${chapterTitle}`
    const keywordPrompt = `. Tous les symboles et drapeaux doivent correspondre à la réalité. Composition équilibrée, style professionnel`
    
    return `${basePrompt}${elementPrompt}${keywordPrompt}, style ${selectedStyle}`
  }

  // Génération d'image avec IA (VRAIE API !)
  const generateImage = async (prompt: string, style: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      return data.imageUrl;
    } catch (error: any) {
      console.error('Erreur génération image:', error);
      // Fallback sur placeholder en cas d'erreur
      const styleColors: { [key: string]: string } = {
        realistic: "4a5568",
        cartoon: "f56565",
        watercolor: "48bb78",
        fantasy: "9f7aea",
        minimalist: "718096",
        vintage: "d69e2e",
        digital_art: "3182ce",
        sketch: "2d3748"
      }
      
      const color = styleColors[style] || "4a5568"
      return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(style.replace('_', ' '))}`;
    }
  }

  // Fonction pour générer une illustration individuelle
  const generateSingleIllustration = async (illustrationId: string) => {
    setIllustrations(prev => 
      prev.map(ill => 
        ill.id === illustrationId 
          ? { ...ill, isGenerating: true }
          : ill
      )
    )

    try {
      const illustration = illustrations.find(ill => ill.id === illustrationId)
      if (!illustration) return

      const imageUrl = await generateImage(illustration.prompt, selectedStyle)
      
      setIllustrations(prev => 
        prev.map(ill => 
          ill.id === illustrationId 
            ? { ...ill, imageUrl, isGenerating: false, style: selectedStyle }
            : ill
        )
      )
      
      setSuccess(`Illustration générée pour ${illustration.chapterTitle}`)
    } catch (err) {
      setError(`Erreur lors de la génération de l'illustration`)
      setIllustrations(prev => 
        prev.map(ill => 
          ill.id === illustrationId 
            ? { ...ill, isGenerating: false }
            : ill
        )
      )
    }
  }

  // Fonction pour générer toutes les illustrations
  const generateAllIllustrations = async () => {
    setIsGeneratingAll(true)
    setError("")
    setSuccess("")

    try {
      // Générer les illustrations une par une pour éviter la surcharge
      for (const illustration of illustrations) {
        await generateSingleIllustration(illustration.id)
        // Petit délai entre chaque génération
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setSuccess("Toutes les illustrations ont été générées avec succès")
    } catch (err) {
      setError("Erreur lors de la génération des illustrations")
    } finally {
      setIsGeneratingAll(false)
    }
  }

  // Fonction pour régénérer une illustration avec un nouveau style
  const regenerateIllustration = async (illustrationId: string) => {
    await generateSingleIllustration(illustrationId)
  }

  // Fonction pour mettre à jour le style global
  const updateGlobalStyle = (newStyle: string) => {
    setSelectedStyle(newStyle)
    setIllustrations(prev => 
      prev.map(ill => ({
        ...ill,
        style: newStyle,
        prompt: generatePromptForChapter(ill.chapterTitle, ""),
        imageUrl: "" // Reset l'image pour forcer la régénération
      }))
    )
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (!enableIllustrations) {
      // Si les illustrations sont désactivées, passer un tableau vide
      onNext({
        illustrations: []
      })
      return
    }
    
    const completedIllustrations = illustrations.filter(ill => ill.imageUrl)
    onNext({
      illustrations: completedIllustrations
    })
  }

  const getStyleInfo = (styleValue: string) => {
    return illustrationStyles.find(style => style.value === styleValue) || illustrationStyles[0]
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 5 : Génération d'illustrations</h2>
        <p className="text-gray-600">Créez des illustrations uniques pour chaque chapitre avec l'IA. Personnalisez le style selon vos préférences.</p>
      </div>

      <div className="space-y-6">
        {/* Option pour activer/désactiver les illustrations */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableIllustrations"
                checked={enableIllustrations}
                onChange={(e) => setEnableIllustrations(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="enableIllustrations" className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900">Générer des illustrations pour cet ebook</div>
                <div className="text-sm text-gray-600 mt-1">
                  Décochez cette option si vous ne souhaitez pas d'illustrations dans votre livre
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {enableIllustrations && (
          <>
            {/* Configuration du style */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Style d'illustration</span>
                </CardTitle>
                <CardDescription>
                  Choisissez le style artistique pour toutes les illustrations
                </CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Style artistique</Label>
              <Select value={selectedStyle} onValueChange={updateGlobalStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {illustrationStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div className="flex items-center space-x-2">
                        <span>{style.example}</span>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={generateAllIllustrations}
                  disabled={isGeneratingAll || illustrations.some(ill => ill.isGenerating)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGeneratingAll ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Génération en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>Générer toutes les illustrations</span>
                    </div>
                  )}
                </Button>

                <div className="text-sm text-gray-600 flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  Style actuel : {getStyleInfo(selectedStyle).label}
                </div>
              </div>

              {/* Timer IA pour génération multiple */}
              {isGeneratingAll && (
                <AITimer 
                  isGenerating={isGeneratingAll} 
                  estimatedSeconds={illustrations.length * 8}
                  onComplete={() => console.log('⏰ Toutes les illustrations générées')}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grille des illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {illustrations.map((illustration) => (
            <Card key={illustration.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{illustration.chapterTitle}</CardTitle>
                <CardDescription className="text-sm">
                  Chapitre {illustration.chapterIndex + 1}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zone d'image avec aperçu */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative border-2 border-gray-200">
                  {illustration.isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="text-center p-4">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700 mb-3">Génération en cours...</p>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <AITimer 
                            isGenerating={illustration.isGenerating} 
                            estimatedSeconds={8}
                            onComplete={() => console.log(`⏰ Illustration ${illustration.chapterIndex + 1} générée`)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : illustration.imageUrl ? (
                    <>
                      <img
                        src={illustration.imageUrl}
                        alt={illustration.chapterTitle}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Image chargée:', illustration.chapterTitle)}
                        onError={(e) => {
                          console.error('❌ Erreur chargement image:', illustration.chapterTitle);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Généré
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Image className="h-16 w-16 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">Pas encore générée</p>
                        <p className="text-xs mt-1">Cliquez sur "Générer"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations sur l'illustration */}
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div><strong>Style :</strong> {getStyleInfo(illustration.style).label}</div>
                  <div><strong>Prompt :</strong> {illustration.prompt}</div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => generateSingleIllustration(illustration.id)}
                    disabled={illustration.isGenerating || isGeneratingAll}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {illustration.imageUrl ? (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    ) : (
                      <Image className="h-3 w-3 mr-1" />
                    )}
                    {illustration.imageUrl ? 'Régénérer' : 'Générer'}
                  </Button>

                  {illustration.imageUrl && (
                    <Button
                      onClick={() => window.open(illustration.imageUrl, '_blank')}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Messages de statut */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Erreur</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Succès</span>
            </div>
            <p className="text-green-700 mt-1">{success}</p>
          </div>
        )}

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Chapitres détectés :</span>
                <span className="ml-2 font-medium">{chapters.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Illustrations générées :</span>
                <span className="ml-2 font-medium">{illustrations.filter(ill => ill.imageUrl).length}</span>
              </div>
              <div>
                <span className="text-gray-600">En cours :</span>
                <span className="ml-2 font-medium">{illustrations.filter(ill => ill.isGenerating).length}</span>
              </div>
              <div>
                <span className="text-gray-600">Style actuel :</span>
                <span className="ml-2 font-medium">{getStyleInfo(selectedStyle).label}</span>
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-8">
        <Button onClick={onBack} variant="outline">
          Retour
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Continuer vers l'export
        </Button>
      </div>
    </div>
  )
}