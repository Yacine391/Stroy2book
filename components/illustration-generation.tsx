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
  // ✅ NOUVEAU : Positionnement personnalisé
  targetChapterIndex?: number  // Chapitre cible (par défaut = chapterIndex)
  position?: 'top' | 'middle' | 'bottom'  // Position dans le chapitre (par défaut = 'top')
}

export default function IllustrationGeneration({ textData, processedText, coverData, currentUser, onNext, onBack }: IllustrationGenerationProps) {
  // ⚠️ FONCTIONNALITÉ TEMPORAIREMENT DÉSACTIVÉE
  const [numberOfIllustrations, setNumberOfIllustrations] = useState(5)
  const maxIllustrations = currentUser?.subscription?.max_illustrations || 10
  const [chapters, setChapters] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [illustrations, setIllustrations] = useState<GeneratedIllustration[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [enableIllustrations, setEnableIllustrations] = useState(false) // ⚠️ DÉSACTIVÉ PAR DÉFAUT

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

  // Extraire les chapitres avec leur contenu
  useEffect(() => {
    const extractChaptersWithContent = (text: string): { title: string; content: string }[] => {
      // Rechercher les marqueurs de chapitres
      const chapterRegex = /(?:^|\n)((?:Chapitre|Chapter|#|Introduction|Conclusion|Épilogue)\s*\d*[^:\n]*:?[^\n]*)/gmi
      const matches = Array.from(text.matchAll(chapterRegex))
      
      if (matches.length > 0) {
        const chaptersWithContent: { title: string; content: string }[] = []
        
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i]
          const chapterTitle = match[1].trim()
          const startPos = match.index! + match[0].length
          const endPos = i < matches.length - 1 ? matches[i + 1].index! : text.length
          const chapterContent = text.substring(startPos, endPos).trim().substring(0, 1500) // Limiter à 1500 caractères
          
          chaptersWithContent.push({
            title: chapterTitle,
            content: chapterContent
          })
        }
        
        return chaptersWithContent
      }
      
      // Si pas de chapitres détectés, créer des chapitres par défaut
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)
      const chaptersPerSection = Math.max(1, Math.floor(paragraphs.length / 5))
      
      const defaultChapters: { title: string; content: string }[] = []
      for (let i = 0; i < Math.min(5, Math.ceil(paragraphs.length / chaptersPerSection)); i++) {
        const startIdx = i * chaptersPerSection
        const endIdx = Math.min(startIdx + chaptersPerSection, paragraphs.length)
        const content = paragraphs.slice(startIdx, endIdx).join('\n\n')
        
        defaultChapters.push({
          title: `Chapitre ${i + 1}`,
          content: content.substring(0, 1500)
        })
      }
      
      return defaultChapters
    }

    const extractedChapters = extractChaptersWithContent(processedText.processedText)
    setChapters(extractedChapters.map(ch => ch.title))
    
    // ✅ PROPOSITION AUTOMATIQUE : Nombre d'illustrations = nombre de chapitres
    setNumberOfIllustrations(Math.min(extractedChapters.length, maxIllustrations))

    // Initialiser les illustrations avec prompts contextuels
    const initialIllustrations: GeneratedIllustration[] = extractedChapters.map((chapter, index) => {
      const contextualPrompt = generatePromptForChapter(chapter.title, chapter.content)
      
      return {
        id: `ill_${index}`,
        chapterIndex: index,
        chapterTitle: chapter.title,
        prompt: contextualPrompt,
        style: selectedStyle,
        imageUrl: "", // Sera généré
        isGenerating: false,
        // ✅ NOUVEAU : Positionnement par défaut
        targetChapterIndex: index,  // Par défaut dans son propre chapitre
        position: 'top'  // Par défaut au début
      }
    })

    setIllustrations(initialIllustrations)
  }, [processedText.processedText, selectedStyle])

  // ✅ FONCTION AMÉLIORÉE: Génération contextuelle intelligente basée sur le contenu du chapitre
  const generatePromptForChapter = (chapterTitle: string, chapterContent: string): string => {
    // Analyser le contenu du chapitre pour extraire les éléments visuels clés
    const contentToAnalyze = (chapterTitle + ' ' + chapterContent).toLowerCase()
    
    // Extraction intelligente et approfondie des éléments visuels
    const extractVisualElements = (text: string): string[] => {
      const elements: string[] = []
      
      // 1. Lieux géographiques et décors
      const locations: Record<string, string> = {
        'algérie': 'algerian landscape',
        'algeria': 'algerian landscape',
        'france': 'french countryside',
        'paris': 'paris cityscape',
        'désert': 'desert landscape',
        'sahara': 'sahara desert',
        'montagne': 'mountain scenery',
        'mer': 'ocean view',
        'plage': 'beach scene',
        'ville': 'urban cityscape',
        'campagne': 'countryside landscape',
        'forêt': 'forest scene',
        'jardin': 'garden setting',
        'maison': 'house interior',
        'école': 'school building',
        'marché': 'market scene'
        // ❌ RETIRÉ 'port' : causait des faux positifs avec "comportement", "important"
      }
      
      // 2. Événements historiques et thèmes
      const themes: Record<string, string> = {
        'indépendance': 'independence celebration with flags',
        'guerre': 'historical battle scene',
        'paix': 'peaceful gathering',
        'révolution': 'revolution uprising',
        'colonisation': 'colonial era scene',
        'liberté': 'freedom symbols',
        'résistance': 'resistance fighters',
        'victoire': 'victory celebration',
        'défaite': 'solemn defeat scene'
      }
      
      // 3. Objets et symboles
      const objects: Record<string, string> = {
        'drapeau': 'flag waving',
        'livre': 'book',
        'arme': 'weapon',
        'monument': 'historical monument',
        'véhicule': 'vehicle',
        'train': 'train',
        'bateau': 'boat',
        'avion': 'airplane',
        'lettre': 'letter',
        'photo': 'photograph',
        'carte': 'map'
      }
      
      // 4. Personnages et actions
      const actions: Record<string, string> = {
        'combat': 'battle action',
        'combattre': 'fighting scene',
        'célébration': 'celebration gathering',
        'fête': 'festive celebration',
        'réunion': 'meeting scene',
        'voyage': 'journey travel',
        'découverte': 'discovery moment',
        'rencontre': 'meeting encounter',
        'départ': 'departure scene',
        'arrivée': 'arrival scene',
        'famille': 'family gathering',
        'enfant': 'children',
        'soldat': 'soldiers',
        'peuple': 'crowd of people'
      }
      
      // 5. Émotions et atmosphères
      const moods: Record<string, string> = {
        'tristesse': 'sad melancholic atmosphere',
        'joie': 'joyful happy scene',
        'peur': 'fearful tense atmosphere',
        'espoir': 'hopeful optimistic scene',
        'colère': 'angry intense mood',
        'amour': 'romantic loving scene',
        'nostalgie': 'nostalgic vintage mood'
      }
      
      // ✅ CORRECTION : Recherche par mots entiers pour éviter faux positifs
      const containsWord = (text: string, word: string): boolean => {
        // Créer regex avec limites de mots pour éviter "port" dans "comportement"
        const regex = new RegExp(`\\b${word}\\b`, 'i')
        return regex.test(text)
      }
      
      // Chercher correspondances dans chaque catégorie
      for (const [key, value] of Object.entries(locations)) {
        if (containsWord(text, key)) {
          elements.push(value)
          break // Une seule localisation principale
        }
      }
      
      for (const [key, value] of Object.entries(themes)) {
        if (containsWord(text, key)) {
          elements.push(value)
        }
      }
      
      for (const [key, value] of Object.entries(objects)) {
        if (containsWord(text, key)) {
          elements.push(value)
        }
      }
      
      for (const [key, value] of Object.entries(actions)) {
        if (containsWord(text, key)) {
          elements.push(value)
        }
      }
      
      for (const [key, value] of Object.entries(moods)) {
        if (containsWord(text, key)) {
          elements.push(value)
          break // Une seule ambiance principale
        }
      }
      
      return elements.slice(0, 4) // Garder les 4 éléments les plus pertinents
    }
    
    const visualElements = extractVisualElements(contentToAnalyze)
    
    // Si aucun élément n'a été détecté, utiliser le titre du chapitre
    if (visualElements.length === 0) {
      return `${chapterTitle}, book illustration, ${selectedStyle} art style`
    }
    
    // ✅ PROMPT CONTEXTUEL ET DÉTAILLÉ
    const styleDescriptor = {
      realistic: 'photorealistic detailed',
      cartoon: 'colorful cartoon style',
      watercolor: 'watercolor painting',
      fantasy: 'fantasy art magical',
      minimalist: 'minimalist clean design',
      vintage: 'vintage retro style',
      digital_art: 'digital art modern',
      sketch: 'pencil sketch drawing'
    }[selectedStyle] || selectedStyle
    
    return `${visualElements.join(', ')}, ${styleDescriptor}, professional book illustration`
  }

  // Génération d'image avec IA (VRAIE API !)
  const generateImage = async (prompt: string, style: string): Promise<string> => {
    try {
      console.log('🎨 Generating illustration:', { prompt: prompt.substring(0, 100), style });
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });

      // ✅ Vérifier Content-Type avant JSON.parse (évite erreur si timeout/HTML)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ API n\'a pas retourné JSON:', text.substring(0, 200));
        throw new Error('L\'API de génération d\'image a timeout ou retourné une erreur. Réessayez.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // ✅ Gérer à la fois imageUrl ET imageBase64
      let imageUrl = data.imageBase64 
        ? `data:image/png;base64,${data.imageBase64}`
        : data.imageUrl;
      
      console.log('✅ Image generated:', {
        hasBase64: !!data.imageBase64,
        hasUrl: !!data.imageUrl,
        finalUrl: imageUrl ? imageUrl.substring(0, 100) : 'NO URL',
        success: !!imageUrl
      });
      
      if (!imageUrl || imageUrl.length < 20) {
        throw new Error('URL d\'image invalide ou vide');
      }

      // ✅ Si c'est une URL Pollinations externe, précharger l'image puis convertir
      if (imageUrl.startsWith('http') && imageUrl.includes('pollinations.ai')) {
        try {
          console.log('🔄 Converting Pollinations URL to base64 for CORS...');
          
          // Méthode alternative: créer une Image, la charger, puis canvas
          const base64 = await new Promise<string>((resolve, reject) => {
            const img = document.createElement('img') as HTMLImageElement;
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Canvas context not available'));
                  return;
                }
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                if (dataUrl.length < 100) {
                  reject(new Error('Invalid canvas dataURL'));
                } else {
                  resolve(dataUrl);
                }
              } catch (err) {
                reject(err);
              }
            };
            
            img.onerror = () => reject(new Error('Image failed to load'));
            img.src = imageUrl;
            
            // Timeout après 30 secondes
            setTimeout(() => reject(new Error('Image load timeout')), 30000);
          });
          
          imageUrl = base64;
          console.log('✅ Pollinations URL converted to base64 via canvas, length:', base64.length);
        } catch (e) {
          console.error('❌ Failed to convert to base64:', e);
          console.warn('⚠️ Using URL directly as fallback');
          // Garder l'URL originale en fallback
        }
      }

      return imageUrl;
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
        <h2 className="text-3xl font-bold text-gray-400 mb-2">Étape 5 : Génération d'illustrations</h2>
        <p className="text-gray-500">Créez des illustrations uniques pour chaque chapitre avec l'IA. Personnalisez le style selon vos préférences.</p>
      </div>

      {/* ⚠️ MESSAGE TEMPORAIRE : FONCTIONNALITÉ DÉSACTIVÉE */}
      <Card className="bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-300 mb-6">
              <Image className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              🚧 Fonctionnalité en cours de maintenance
            </h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              La génération d'illustrations est temporairement désactivée pour améliorer la qualité et la performance.
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-6">
              📅 Disponible prochainement
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Vous pouvez continuer la création de votre ebook sans illustrations. 
                Vous pourrez toujours ajouter des images manuellement après l'export.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        {/* Option pour activer/désactiver les illustrations */}
        <Card className="bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableIllustrations"
                checked={false}
                disabled={true}
                className="w-5 h-5 text-gray-400 border-gray-300 rounded"
              />
              <label htmlFor="enableIllustrations" className="flex-1">
                <div className="font-medium text-gray-500">Générer des illustrations pour cet ebook</div>
                <div className="text-sm text-gray-400 mt-1">
                  Fonctionnalité temporairement désactivée
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

                {/* ✅ NOUVEAU : Sélecteur de positionnement */}
                {illustration.imageUrl && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-semibold text-blue-900 mb-2">📍 Positionnement dans l'ebook</div>
                    
                    {/* Sélecteur de chapitre cible */}
                    <div>
                      <Label htmlFor={`target-chapter-${illustration.id}`} className="text-xs">Placer dans le chapitre :</Label>
                      <Select 
                        value={(illustration.targetChapterIndex ?? illustration.chapterIndex).toString()}
                        onValueChange={(value) => {
                          const newTargetIndex = parseInt(value)
                          setIllustrations(prev => 
                            prev.map(ill => 
                              ill.id === illustration.id 
                                ? { ...ill, targetChapterIndex: newTargetIndex }
                                : ill
                            )
                          )
                        }}
                      >
                        <SelectTrigger id={`target-chapter-${illustration.id}`} className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((chapter, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              <div className="text-xs">
                                {index === illustration.chapterIndex ? '📌 ' : ''}{chapter}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sélecteur de position */}
                    <div>
                      <Label htmlFor={`position-${illustration.id}`} className="text-xs">Position :</Label>
                      <Select 
                        value={illustration.position || 'top'}
                        onValueChange={(value: 'top' | 'middle' | 'bottom') => {
                          setIllustrations(prev => 
                            prev.map(ill => 
                              ill.id === illustration.id 
                                ? { ...ill, position: value }
                                : ill
                            )
                          )
                        }}
                      >
                        <SelectTrigger id={`position-${illustration.id}`} className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">
                            <div className="flex items-center space-x-2">
                              <span>⬆️</span>
                              <span className="text-xs">Début du chapitre</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="middle">
                            <div className="flex items-center space-x-2">
                              <span>➡️</span>
                              <span className="text-xs">Milieu du chapitre</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="bottom">
                            <div className="flex items-center space-x-2">
                              <span>⬇️</span>
                              <span className="text-xs">Fin du chapitre</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Indicateur si déplacé */}
                    {illustration.targetChapterIndex !== undefined && 
                     illustration.targetChapterIndex !== illustration.chapterIndex && (
                      <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded mt-1">
                        🔀 Cette illustration sera déplacée vers "{chapters[illustration.targetChapterIndex]}"
                      </div>
                    )}
                  </div>
                )}

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
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Continuer sans illustrations
        </Button>
      </div>
    </div>
  )
}