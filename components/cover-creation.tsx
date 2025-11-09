"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Upload, Wand2, RefreshCw, Download, Eye, Palette, Type, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import AITimer from "./ai-timer"

interface GeneratedIllustration {
  id: string
  chapterIndex: number
  chapterTitle: string
  prompt: string
  style: string
  imageUrl: string
  isGenerating: boolean
}

interface CoverCreationProps {
  illustrations: GeneratedIllustration[]
  textData?: {
    text: string
    language: string
    chapters: string[]
    style: string
    desiredPages: number
  }
  processedText?: {
    processedText: string
    history: any[]
  }
  onNext: (data: { coverData: CoverData }) => void
  onBack: () => void
}

interface CoverData {
  title: string
  subtitle: string
  author: string
  imageUrl: string
  imageBase64?: string
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

export default function CoverCreation({ illustrations, textData, processedText, onNext, onBack }: CoverCreationProps) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [author, setAuthor] = useState("")
  const [coverDescription, setCoverDescription] = useState("") // Nouveau : description de couverture
  const [selectedLayout, setSelectedLayout] = useState("classic")
  const [selectedStyle, setSelectedStyle] = useState("professional")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [secondaryColor, setSecondaryColor] = useState("#1e40af")
  const [textColor, setTextColor] = useState("#ffffff")
  const [hasWatermark, setHasWatermark] = useState(true)
  const [customImage, setCustomImage] = useState<File | null>(null)
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState("")
  const [generatedCoverBase64, setGeneratedCoverBase64] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false) // Nouveau
  const [retryCount, setRetryCount] = useState(0) // Compteur de tentatives
  const [generationAbortController, setGenerationAbortController] = useState<AbortController | null>(null) // Pour annuler
  const [includeIllustrationInPDF, setIncludeIllustrationInPDF] = useState(true) // Toggle pour PDF
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 }) // Position/scale de l'image
  const [generationQuota, setGenerationQuota] = useState({ used: 0, max: 3 }) // Quota génération
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Layouts de couverture disponibles
  const coverLayouts = [
    {
      value: "classic",
      label: "Classique",
      description: "Titre en haut, image au centre, auteur en bas",
      preview: "📚"
    },
    {
      value: "modern",
      label: "Moderne",
      description: "Design épuré avec typographie moderne",
      preview: "🎨"
    },
    {
      value: "artistic",
      label: "Artistique",
      description: "Mise en page créative avec éléments visuels",
      preview: "🖼️"
    },
    {
      value: "minimalist",
      label: "Minimaliste",
      description: "Design simple et élégant",
      preview: "⚪"
    },
    {
      value: "bold",
      label: "Audacieux",
      description: "Typographie forte et couleurs vives",
      preview: "🔥"
    },
    {
      value: "elegant",
      label: "Élégant",
      description: "Style raffiné avec bordures décoratives",
      preview: "✨"
    }
  ]

  // Styles de couverture
  const coverStyles = [
    {
      value: "professional",
      label: "Professionnel",
      description: "Style corporate et sérieux"
    },
    {
      value: "creative",
      label: "Créatif",
      description: "Style artistique et original"
    },
    {
      value: "academic",
      label: "Académique",
      description: "Style universitaire et formel"
    },
    {
      value: "popular",
      label: "Grand public",
      description: "Style accessible et attractif"
    },
    {
      value: "luxury",
      label: "Luxe",
      description: "Style haut de gamme et sophistiqué"
    }
  ]

  // Palettes de couleurs prédéfinies
  const colorPalettes = [
    {
      name: "Bleu professionnel",
      primary: "#2563eb",
      secondary: "#1e40af",
      text: "#ffffff"
    },
    {
      name: "Violet créatif",
      primary: "#7c3aed",
      secondary: "#5b21b6",
      text: "#ffffff"
    },
    {
      name: "Vert nature",
      primary: "#059669",
      secondary: "#047857",
      text: "#ffffff"
    },
    {
      name: "Rouge passion",
      primary: "#dc2626",
      secondary: "#b91c1c",
      text: "#ffffff"
    },
    {
      name: "Orange énergique",
      primary: "#ea580c",
      secondary: "#c2410c",
      text: "#ffffff"
    },
    {
      name: "Noir élégant",
      primary: "#1f2937",
      secondary: "#111827",
      text: "#ffffff"
    }
  ]

  // Fonction pour uploader une image personnalisée
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError("L'image ne doit pas dépasser 5MB")
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError("Veuillez sélectionner un fichier image")
        return
      }
      
      setCustomImage(file)
      setError("")
      setSuccess("Image personnalisée ajoutée")
    }
  }

  // Fonction pour générer le titre avec l'IA
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    setError("");
    setSuccess("");

    try {
      // Utiliser le contenu réel - PRIORITÉ AU TEXTE ORIGINAL
      let contentToSend = '';
      let chaptersToSend: string[] = [];
      
      // Priorité 1: Texte ORIGINAL de l'utilisateur
      if (textData && textData.text) {
        contentToSend = textData.text.substring(0, 2000);
        chaptersToSend = textData.chapters || [];
        console.log('✅ Utilisation du texte ORIGINAL');
      }
      // Priorité 2: Texte traité par l'IA
      else if (processedText && processedText.processedText) {
        contentToSend = processedText.processedText.substring(0, 2000);
        console.log('✅ Utilisation du texte traité');
      }
      // Priorité 3: Illustrations
      else if (illustrations && illustrations.length > 0) {
        chaptersToSend = illustrations.map(ill => ill.chapterTitle).filter(t => t && t.trim());
        contentToSend = chaptersToSend.join('. ');
      }
      
      // Si vraiment aucun contenu, utiliser un fallback
      if (!contentToSend || contentToSend.length < 10) {
        contentToSend = `Créer un titre créatif et accrocheur pour un ebook de style ${selectedStyle} avec un layout ${selectedLayout}`;
      }
      
      console.log('🪄 Génération titre IA - Contenu:', contentToSend.substring(0, 100));
      
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: chaptersToSend.length > 0 ? chaptersToSend : undefined,
          content: contentToSend,
          genre: textData?.style || selectedStyle,
          style: selectedLayout
        })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      if (data.title && data.title.trim()) {
        setTitle(data.title);
        setSuccess("✨ Titre généré avec l'IA !");
        console.log('✅ Titre appliqué:', data.title);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error('Pas de titre reçu de l\'API');
      }
      
    } catch (err: any) {
      console.error('❌ Erreur génération titre:', err);
      setError(`Erreur : ${err.message}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Fonction pour extraire des mots-clés pertinents du contenu
  const extractKeywords = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const keywords: string[] = [];
    
    // Mots-clés géographiques et historiques
    const locations: Record<string, string[]> = {
      'algérie': ['algerian landscape', 'north africa', 'sahara desert', 'mediterranean coast', 'algiers casbah'],
      'algeria': ['algerian landscape', 'north africa', 'sahara desert', 'mediterranean coast'],
      'france': ['french countryside', 'eiffel tower', 'paris', 'provence lavender'],
      'maroc': ['moroccan architecture', 'marrakech', 'atlas mountains', 'sahara'],
      'egypt': ['pyramids', 'sphinx', 'nile river', 'ancient egypt'],
      'égypte': ['pyramides', 'sphinks', 'nil', 'égypte antique']
    };
    
    // Événements historiques
    const historical: Record<string, string[]> = {
      'indépendance': ['independence celebration', 'freedom', 'national flags waving', 'liberation'],
      'guerre': ['war memorial', 'historical battle', 'soldiers monument', 'conflict history'],
      'révolution': ['revolution symbols', 'uprising', 'historical change', 'freedom fighters'],
      'colonisation': ['historical colonial era', 'historical period', 'vintage historical scene']
    };
    
    // Thèmes généraux
    const themes: Record<string, string[]> = {
      'amour': ['romantic scene', 'love hearts', 'couples', 'romance'],
      'aventure': ['epic adventure', 'journey landscape', 'exploration', 'discovery'],
      'mystère': ['mysterious atmosphere', 'shadows', 'enigma', 'detective noir'],
      'science': ['scientific laboratory', 'research', 'innovation', 'technology'],
      'nature': ['natural landscape', 'wilderness', 'flora fauna', 'ecosystem']
    };
    
    // Chercher correspondances
    for (const [key, values] of Object.entries(locations)) {
      if (lowerText.includes(key)) {
        keywords.push(...values);
        break;
      }
    }
    
    for (const [key, values] of Object.entries(historical)) {
      if (lowerText.includes(key)) {
        keywords.push(...values);
      }
    }
    
    for (const [key, values] of Object.entries(themes)) {
      if (lowerText.includes(key)) {
        keywords.push(...values);
      }
    }
    
    return keywords;
  };

  // Fonction pour annuler la génération
  const cancelGeneration = () => {
    if (generationAbortController) {
      generationAbortController.abort()
      setGenerationAbortController(null)
      setIsGenerating(false)
      setRetryCount(0)
      setError("Génération annulée par l'utilisateur")
      setTimeout(() => setError(""), 3000)
    }
  }

  // Fonction pour vérifier le quota de génération
  const checkGenerationQuota = (): boolean => {
    // Simulation - À remplacer par une vraie API call
    // const userSubscription = userAuth?.subscription?.plan || 'free'
    const userSubscription = 'free' // Pour demo
    
    const quotas = {
      free: 3,
      basic: 30,
      pro: 999999 // illimité
    }
    
    const maxGenerations = quotas[userSubscription as keyof typeof quotas] || 3
    
    setGenerationQuota(prev => ({ ...prev, max: maxGenerations }))
    
    if (generationQuota.used >= maxGenerations) {
      return false
    }
    
    return true
  }

  // Fonction pour générer automatiquement la couverture avec l'IA
  const generateCover = async (useCustomDescription = false, attemptNumber = 1) => {
    if (!title.trim()) {
      setError("Veuillez saisir un titre")
      return
    }

    if (!author.trim()) {
      setError("Veuillez saisir le nom de l'auteur")
      return
    }

    // Vérifier le quota (sauf pour les retry)
    if (attemptNumber === 1 && !checkGenerationQuota()) {
      setError("🔒 Quota de génération atteint. Passez à un abonnement supérieur pour continuer.")
      setTimeout(() => setError(""), 8000)
      return
    }

    // Créer un AbortController pour cette génération
    const abortController = new AbortController()
    setGenerationAbortController(abortController)

    setIsGenerating(true)
    setRetryCount(attemptNumber)
    setError("")
    setSuccess("")

    try {
      let coverPrompt = '';
      
      if (useCustomDescription && coverDescription.trim()) {
        // Utiliser la description personnalisée
        coverPrompt = `professional book cover illustration: ${coverDescription}, artistic, high quality, detailed, vibrant colors, no text, no letters, no words`;
      } else {
        // NOUVEAU TEMPLATE PRÉCIS avec TITLE et TEXT
        const TITLE = title.trim();
        let TEXT = '';
        
        // Extraire le texte de l'utilisateur
        if (textData && textData.text) {
          TEXT = textData.text.substring(0, 1500);
        } else if (processedText && processedText.processedText) {
          TEXT = processedText.processedText.substring(0, 1500);
        }
        
        // Analyser le contenu pour extraire les éléments clés
        const contentToAnalyze = (TITLE + ' ' + TEXT).toLowerCase();
        
        // Extraire LIEU, PERSONNAGES, OBJETS, SYMBOLES
        const keywords = extractKeywords(contentToAnalyze);
        
        // Déterminer la palette (chaude/froide) selon le ton
        const warmKeywords = ['amour', 'passion', 'feu', 'désert', 'soleil', 'été', 'chaleur', 'rouge', 'orange'];
        const coolKeywords = ['mystère', 'nuit', 'hiver', 'glace', 'mer', 'bleu', 'vert', 'technologie', 'futur'];
        
        const isWarm = warmKeywords.some(k => contentToAnalyze.includes(k));
        const isCool = coolKeywords.some(k => contentToAnalyze.includes(k));
        const palette = isWarm ? 'warm colors (reds, oranges, golds)' : 
                       isCool ? 'cool colors (blues, purples, teals)' : 
                       'balanced harmonious colors';
        
        // Construire les éléments clés
        let keyElements = keywords.length > 0 ? keywords.slice(0, 4).join(', ') : '';
        if (!keyElements) {
          keyElements = TITLE.split(' ').filter(w => w.length > 3).slice(0, 3).join(', ');
        }
        
        // ✅ PROMPT ULTRA-COURT POUR GÉNÉRATION RAPIDE (toujours identique)
        coverPrompt = `Book cover: ${TITLE}. ${palette}. Professional, no text`;
      }
      
      console.log(`🎨 Génération couverture (tentative ${attemptNumber}/2):`, coverPrompt);

      // Appeler l'API de génération d'image avec signal d'abort
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: coverPrompt,
          style: 'realistic' // Pour les couvertures
        }),
        signal: abortController.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Vérifier que l'image est valide
      if ((!data.imageUrl || data.imageUrl.length < 10) && (!data.imageBase64 || data.imageBase64.length < 100)) {
        throw new Error("URL d'image invalide reçue de l'API")
      }

      // ✅ CORRECTION: Priorité base64, mais aussi URL
      if (data.imageBase64) {
        const dataUrl = `data:image/png;base64,${data.imageBase64}`;
        setGeneratedCoverUrl(dataUrl);
        setGeneratedCoverBase64(data.imageBase64);
        console.log('✅ Cover set with base64, length:', data.imageBase64.length);
      } else if (data.imageUrl) {
        setGeneratedCoverUrl(data.imageUrl);
        setGeneratedCoverBase64("");
        console.log('✅ Cover set with URL:', data.imageUrl.substring(0, 50));
      } else {
        throw new Error('Aucune image retournée');
      }
      
      // ✅ IMPORTANT: Réinitialiser l'état AVANT success pour permettre régénération
      setRetryCount(0)
      setGenerationAbortController(null)
      setIsGenerating(false)
      
      // Incrémenter le quota utilisé (seulement sur première tentative réussie)
      if (attemptNumber === 1) {
        setGenerationQuota(prev => ({ ...prev, used: prev.used + 1 }))
      }
      
      const remaining = generationQuota.max - generationQuota.used - 1
      setSuccess(`✨ Couverture générée avec succès ! ${remaining}/${generationQuota.max} générations restantes.`);
      setTimeout(() => setSuccess(""), 5000);
      
    } catch (err: any) {
      // Si c'est une annulation, ne pas réessayer
      if (err.name === 'AbortError') {
        console.log('⚠️ Génération annulée')
        return
      }

      console.error(`❌ Erreur génération couverture (tentative ${attemptNumber}):`, err);
      
      // ✅ PAS DE RETRY AUTOMATIQUE - L'utilisateur peut réessayer manuellement
      // Cela évite d'attendre trop longtemps
      
      // Après 2 échecs, afficher erreur complète
      const errorMessage = `❌ Erreur génération (2 tentatives) : ${err.message || "Service d'image indisponible"}`
      setError(errorMessage)
      console.error('🚨 ÉCHEC COMPLET:', errorMessage)
      
      // Ne pas effacer l'erreur automatiquement pour que l'utilisateur puisse la lire
      setTimeout(() => setError(""), 8000)
      
    } finally {
      // ✅ Toujours réinitialiser l'état en cas d'erreur pour permettre retry
      setIsGenerating(false)
      setGenerationAbortController(null)
      setRetryCount(0)
    }
  }

  // Fonction pour appliquer une palette de couleurs
  const applyColorPalette = (palette: typeof colorPalettes[0]) => {
    setPrimaryColor(palette.primary)
    setSecondaryColor(palette.secondary)
    setTextColor(palette.text)
    setSuccess(`Palette "${palette.name}" appliquée`)
  }

  // Fonction pour régénérer la couverture
  const regenerateCover = async () => {
    const useCustom = coverDescription.trim().length > 0;
    await generateCover(useCustom);
  }

  // Interactions: drag to move, wheel to scale
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    let dragging = false
    let startX = 0
    let startY = 0
    let originX = 0
    let originY = 0
    const onDown = (e: MouseEvent) => {
      dragging = true
      startX = e.clientX
      startY = e.clientY
      originX = imagePosition.x
      originY = imagePosition.y
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      setImagePosition(prev => ({ ...prev, x: originX + dx, y: originY + dy }))
    }
    const onUp = () => { dragging = false }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.05 : 0.05
        setImagePosition(prev => ({ ...prev, scale: Math.min(2, Math.max(0.5, prev.scale + delta)) }))
      }
    }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('wheel', onWheel as any)
    }
  }, [imagePosition.x, imagePosition.y])

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (!title.trim() || !author.trim()) {
      setError("Veuillez remplir au minimum le titre et l'auteur")
      return
    }

    const coverData: CoverData = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      author: author.trim(),
      imageUrl: generatedCoverUrl || (customImage ? URL.createObjectURL(customImage) : ""),
      imageBase64: generatedCoverBase64 || undefined,
      style: selectedStyle,
      layout: selectedLayout,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        text: textColor
      },
      hasWatermark,
      includeIllustrationInPDF,
      imagePosition
    }

    onNext({ coverData })
  }

  // Fonction pour télécharger la couverture
  const downloadCover = () => {
    if (generatedCoverUrl) {
      const link = document.createElement('a')
      link.href = generatedCoverUrl
      link.download = `couverture-${title.replace(/\s+/g, '-').toLowerCase()}.png`
      link.click()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 3 : Création de la couverture</h2>
        <p className="text-gray-600">Créez une couverture professionnelle automatiquement ou uploadez votre propre image. Taille recommandée : 2048×3072 px.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panneau de configuration */}
        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Informations du livre</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Le titre de votre ebook"
                    className={`flex-1 transition-all ${success.includes('Titre généré') ? 'border-green-500 bg-green-50' : ''}`}
                  />
                  <Button
                    onClick={generateTitleWithAI}
                    disabled={isGeneratingTitle || isGenerating}
                    variant="outline"
                    size="sm"
                    title="Générer un titre avec l'IA basé sur votre texte"
                    className="shrink-0"
                  >
                    {isGeneratingTitle ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Mini timer pour génération titre */}
                {isGeneratingTitle && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-2">
                      🔍 Analyse de votre texte en cours...
                    </p>
                    <AITimer 
                      isGenerating={isGeneratingTitle} 
                      estimatedSeconds={5}
                      onComplete={() => console.log('⏰ Titre généré')}
                    />
                  </div>
                )}
                
                {!isGeneratingTitle && !success.includes('Titre généré') && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Cliquez sur la baguette magique 🪄 pour générer un titre avec l'IA
                  </p>
                )}
                
                {success.includes('Titre généré') && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">
                      Titre généré et appliqué avec succès !
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="subtitle">Sous-titre (optionnel)</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Sous-titre ou description courte"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="author">Auteur *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nom de l'auteur"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description personnalisée de couverture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5" />
                <span>Description de la couverture (optionnel)</span>
              </CardTitle>
              <CardDescription>
                Décrivez l'image que vous voulez pour votre couverture, ou laissez vide pour une génération automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cover-description">Description visuelle de la couverture</Label>
                <Textarea
                  id="cover-description"
                  value={coverDescription}
                  onChange={(e) => setCoverDescription(e.target.value)}
                  placeholder="Ex: Un vaisseau spatial dans l'espace avec des étoiles, couleurs bleues et violettes, ambiance mystérieuse..."
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Décrivez uniquement l'IMAGE (pas le texte). Plus c'est détaillé, mieux c'est !
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ N'incluez PAS le titre ou l'auteur dans la description - ils seront ajoutés automatiquement lors de l'export
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Style et mise en page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Style et mise en page</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Label>Layout de couverture</Label>
                  <div className="group relative">
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-help hover:bg-gray-300 transition">
                      i
                    </div>
                    <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg left-5 top-0">
                      Le layout définit la disposition des éléments sur votre couverture (titre, image, auteur). Choisissez celui qui correspond le mieux à votre style de livre.
                    </div>
                  </div>
                </div>
                <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coverLayouts.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        <div className="flex items-center space-x-2">
                          <span>{layout.preview}</span>
                          <div>
                            <div className="font-medium">{layout.label}</div>
                            <div className="text-xs text-gray-500">{layout.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Style de couverture</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coverStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Couleurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-5 w-5" />
                <span>Couleurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Palettes prédéfinies */}
              <div>
                <Label className="text-sm font-medium">Palettes prédéfinies</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {colorPalettes.map((palette) => (
                    <Button
                      key={palette.name}
                      onClick={() => applyColorPalette(palette)}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.secondary }}
                          />
                        </div>
                        <span className="text-xs">{palette.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Couleurs personnalisées - Color Pickers */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color" className="text-sm">Couleur principale</Label>
                  <div className="mt-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-12 rounded border cursor-pointer"
                      title="Choisir la couleur principale"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color" className="text-sm">Couleur secondaire</Label>
                  <div className="mt-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-12 rounded border cursor-pointer"
                      title="Choisir la couleur secondaire"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color" className="text-sm">Couleur du texte</Label>
                  <div className="mt-2">
                    <input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-12 rounded border cursor-pointer"
                      title="Choisir la couleur du texte"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image personnalisée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Image personnalisée (optionnel)</span>
              </CardTitle>
              <CardDescription>
                Uploadez votre propre image de couverture (max 5MB, 2048×3072 px recommandé)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une image
                </Button>
                {customImage && (
                  <div className="text-sm text-green-600">
                    ✓ {customImage.name}
                  </div>
                )}
              </div>

              {/* Option filigrane */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="watermark"
                  checked={hasWatermark}
                  onChange={(e) => setHasWatermark(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="watermark" className="text-sm">
                  Ajouter le filigrane "HB Creator" (version gratuite)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de prévisualisation */}
        <div className="space-y-6">
          {/* Prévisualisation de la couverture */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation</CardTitle>
              <CardDescription>
                Aperçu de votre couverture (ratio 2:3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Message important pour les utilisateurs */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium flex items-center">
                  <span className="mr-2">💡</span>
                  Information importante
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  L'image générée ne contient pas de texte. Le titre et l'auteur seront ajoutés automatiquement lors de l'export PDF/EPUB !
                </p>
              </div>

              {/* Card attractif avec nouveau design */}
              <div 
                className="relative mx-auto transition-all duration-300 hover:shadow-2xl"
                style={{
                  width: '300px',
                  minHeight: '420px',
                  height: '420px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  background: 'linear-gradient(135deg, #f7f8fb 0%, #e9eef7 100%)',
                  backgroundImage: `
                    linear-gradient(135deg, #f7f8fb 0%, #e9eef7 100%),
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)
                  `,
                  overflow: 'hidden'
                }}
                ref={previewRef}
              >
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="text-center p-6 w-full">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-sm text-gray-700 font-medium mb-2">
                        {retryCount > 1 ? `Tentative ${retryCount}/2 en cours...` : 'Génération de la couverture...'}
                      </p>
                      <p className="text-xs text-orange-600 font-semibold mb-4">
                        ⚠️ Ne pas fermer cette page
                      </p>
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                        <AITimer 
                          isGenerating={isGenerating} 
                          estimatedSeconds={10}
                          onComplete={() => console.log('⏰ Couverture générée')}
                        />
                      </div>
                      <Button
                        onClick={cancelGeneration}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-red-50 border-red-300 text-red-600"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : generatedCoverUrl || generatedCoverBase64 ? (
                  <div className="relative w-full h-full">
                    {generatedCoverBase64 ? (
                      <img
                        src={`data:image/png;base64,${generatedCoverBase64}`}
                        alt="Couverture générée"
                        className="w-full h-full object-cover"
                        style={{ transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`, transition: 'transform 0.2s ease-out' }}
                      />
                    ) : (
                      <img
                        src={generatedCoverUrl}
                        alt="Couverture générée"
                        className="w-full h-full object-cover"
                        style={{ transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`, transition: 'transform 0.2s ease-out' }}
                      />
                    )}
                    {/* Overlay semi-transparent pour contraste */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.1) 100%)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                ) : customImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={URL.createObjectURL(customImage)}
                      alt="Couverture personnalisée"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                        transition: 'transform 0.2s ease-out'
                      }}
                    />
                    {/* Overlay semi-transparent pour contraste */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.1) 100%)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                ) : error && !generatedCoverUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                    <div className="text-center text-red-700 p-6">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                      <p className="text-sm font-medium mb-2">❌ Échec de génération</p>
                      <p className="text-xs text-gray-600 mb-4 px-4">{error}</p>
                      {title && (
                        <div className="space-y-2 mb-4 p-3 bg-white rounded-lg">
                          <p className="font-bold text-base text-gray-800">{title}</p>
                          {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
                          {author && <p className="text-xs text-gray-700 mt-2">par {author}</p>}
                        </div>
                      )}
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => generateCover(false, 1)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Réessayer
                        </Button>
                        <Button
                          onClick={() => {
                            setError("")
                            const input = fileInputRef.current
                            if (input) input.click()
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Charger une image
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    {/* Icône stylisée avec gradient */}
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                      <BookOpen className="h-20 w-20 relative z-10 text-gradient-to-br from-purple-600 to-blue-600" 
                        style={{ 
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                          color: '#6366f1'
                        }} 
                      />
                    </div>
                    
                    {/* Texte "Aperçu de la couverture" */}
                    <p className="text-sm text-gray-500 font-medium mb-6">Aperçu de la couverture</p>
                    
                    {/* Mock de typographie avec titre */}
                    {title ? (
                      <div className="space-y-4 text-center">
                        <div 
                          className="font-bold text-2xl leading-tight px-4"
                          style={{ 
                            color: primaryColor,
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontFamily: 'Georgia, serif',
                            lineHeight: '1.3'
                          }}
                        >
                          {title}
                        </div>
                        {subtitle && (
                          <div 
                            className="text-sm font-light px-6"
                            style={{ color: secondaryColor }}
                          >
                            {subtitle}
                          </div>
                        )}
                        {author && (
                          <div 
                            className="text-sm mt-6 pt-4 border-t border-gray-300"
                            style={{ color: textColor === '#ffffff' ? '#1f2937' : textColor }}
                          >
                            {author}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm px-8">
                        <p className="mb-2">Saisissez un titre et un auteur</p>
                        <p className="text-xs">puis générez une couverture</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Filigrane si activé */}
                {hasWatermark && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white bg-opacity-75 px-2 py-1 rounded">
                    HB Creator
                  </div>
                )}
              </div>

              {/* Toggle et contrôles de manipulation */}
              {(generatedCoverUrl || customImage) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  {/* Toggle "Inclure dans PDF" */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-pdf"
                        checked={includeIllustrationInPDF}
                        onChange={(e) => setIncludeIllustrationInPDF(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <Label htmlFor="include-pdf" className="cursor-pointer font-medium">
                        Inclure l'illustration dans le PDF
                      </Label>
                    </div>
                    <span className={`text-xs font-semibold ${includeIllustrationInPDF ? 'text-green-600' : 'text-gray-400'}`}>
                      {includeIllustrationInPDF ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  
                  {/* Contrôles de manipulation */}
                  <div className="border-t border-gray-300 pt-3">
                    <p className="text-xs text-gray-600 font-medium mb-2">Ajuster la position et la taille</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 2) }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        🔍 Zoom +
                      </button>
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        🔍 Zoom -
                      </button>
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, y: prev.y - 10 }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        ⬆️ Haut
                      </button>
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, y: prev.y + 10 }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        ⬇️ Bas
                      </button>
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, x: prev.x - 10 }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        ⬅️ Gauche
                      </button>
                      <button
                        onClick={() => setImagePosition(prev => ({ ...prev, x: prev.x + 10 }))}
                        className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                      >
                        ➡️ Droite
                      </button>
                    </div>
                    <button
                      onClick={() => setImagePosition({ x: 0, y: 0, scale: 1 })}
                      className="w-full mt-2 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      🔄 Réinitialiser
                    </button>
                  </div>
                </div>
              )}

              {/* Actions sur la couverture */}
              <div className="space-y-2 mt-4">
                {/* Affichage quota */}
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-blue-700 font-medium">
                      Générations disponibles :
                    </span>
                    <span className={`text-sm font-bold ${generationQuota.used >= generationQuota.max ? 'text-red-600' : 'text-blue-600'}`}>
                      {generationQuota.max - generationQuota.used}/{generationQuota.max}
                    </span>
                  </div>
                  {generationQuota.used >= generationQuota.max && (
                    <a 
                      href="/upgrade" 
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Upgrade →
                    </a>
                  )}
                </div>

                <Button
                  onClick={() => generateCover(false)}
                  disabled={isGenerating || isGeneratingTitle || !title.trim() || !author.trim() || generationQuota.used >= generationQuota.max}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Générer automatiquement
                </Button>

                {coverDescription.trim() && (
                  <Button
                    onClick={() => generateCover(true)}
                    disabled={isGenerating || isGeneratingTitle || !title.trim() || !author.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer selon ma description
                  </Button>
                )}

                {generatedCoverUrl && !isGenerating && (
                  <div className="flex justify-center space-x-2 pt-2">
                    <Button onClick={regenerateCover} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Régénérer
                    </Button>
                    <Button onClick={() => window.open(generatedCoverUrl, '_blank')} variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button onClick={downloadCover} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spécifications techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taille recommandée :</span>
                <span className="font-medium">2048×3072 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ratio :</span>
                <span className="font-medium">2:3 (portrait)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format :</span>
                <span className="font-medium">PNG/JPG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Résolution :</span>
                <span className="font-medium">300 DPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filigrane :</span>
                <span className="font-medium">{hasWatermark ? 'Activé' : 'Désactivé'}</span>
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
          disabled={!title.trim() || !author.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Continuer vers la mise en page
        </Button>
      </div>
    </div>
  )
}