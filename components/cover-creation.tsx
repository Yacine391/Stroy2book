"use client"

import { useState, useRef } from "react"
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
  style: string
  layout: string
  colors: {
    primary: string
    secondary: string
    text: string
  }
  hasWatermark: boolean
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false) // Nouveau
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Fonction pour générer le titre avec l'IA basé sur le texte utilisateur
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    setError("");
    setSuccess("");

    try {
      // PRIORITÉ 1: Utiliser le texte ORIGINAL de l'utilisateur (saisie initiale)
      let contentToSend = '';
      let chaptersToSend: string[] = [];
      
      if (textData && textData.text) {
        // Utiliser le texte original saisi par l'utilisateur
        contentToSend = textData.text.substring(0, 2000); // Prendre les 2000 premiers caractères
        chaptersToSend = textData.chapters || [];
        console.log('✅ Utilisation du texte ORIGINAL de l\'utilisateur:', contentToSend.substring(0, 100));
      } 
      // PRIORITÉ 2: Utiliser le texte traité par l'IA si pas de texte original
      else if (processedText && processedText.processedText) {
        contentToSend = processedText.processedText.substring(0, 2000);
        console.log('✅ Utilisation du texte TRAITÉ:', contentToSend.substring(0, 100));
      }
      // PRIORITÉ 3: Utiliser les illustrations en dernier recours
      else if (illustrations && illustrations.length > 0) {
        chaptersToSend = illustrations.map(ill => ill.chapterTitle).filter(t => t && t.trim());
        contentToSend = chaptersToSend.join('. ');
        console.log('✅ Utilisation des illustrations');
      }
      // PRIORITÉ 4: Fallback générique
      else {
        contentToSend = `Créer un titre créatif et accrocheur pour un ebook de style ${selectedStyle} avec un layout ${selectedLayout}`;
        console.warn('⚠️ Pas de contenu détecté, utilisation prompt générique');
      }
      
      console.log('🪄 Génération titre IA avec', contentToSend.length, 'caractères de contenu');
      
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: chaptersToSend.length > 0 ? chaptersToSend : undefined,
          content: contentToSend,
          genre: textData?.style || selectedStyle,
          style: selectedLayout,
          previousTitle: title || undefined // Pour éviter les doublons lors de la régénération
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
        setSuccess("✨ Titre généré avec l'IA basé sur votre texte !");
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

  // Fonction pour générer automatiquement la couverture avec l'IA
  const generateCover = async (useCustomDescription = false) => {
    if (!title.trim()) {
      setError("Veuillez saisir un titre")
      return
    }

    if (!author.trim()) {
      setError("Veuillez saisir le nom de l'auteur")
      return
    }

    setIsGenerating(true)
    setError("")
    setSuccess("")

    try {
      // Créer un prompt SANS TEXTE (les IA d'images ne peuvent pas écrire du texte lisible)
      const styleDescriptions: Record<string, string> = {
        professional: 'professional corporate style, clean modern aesthetic',
        creative: 'creative artistic style, vibrant imaginative colors',
        academic: 'scholarly formal style, serious academic look',
        popular: 'popular commercial style, eye-catching attractive design',
        luxury: 'luxury premium style, sophisticated elegant appearance'
      };

      const layoutDescriptions: Record<string, string> = {
        classic: 'classic traditional composition',
        modern: 'modern minimalist composition with geometric shapes',
        artistic: 'artistic creative composition with abstract elements',
        minimalist: 'minimalist simple composition with negative space',
        bold: 'bold striking composition with strong visual impact',
        elegant: 'elegant refined composition with ornamental decorative elements'
      };

      let coverPrompt = '';
      
      if (useCustomDescription && coverDescription.trim()) {
        // Utiliser la description personnalisée - SIMPLE ET DIRECT
        coverPrompt = `book cover art: ${coverDescription}, artistic, colorful, professional, high quality, no text, no letters, no words`;
      } else {
        // Génération automatique SIMPLIFIÉE basée sur le titre
        const titleLower = title.toLowerCase();
        let visualDescription = '';
        
        // Détection SIMPLE et PRÉCISE
        if (titleLower.includes('space') || titleLower.includes('étoile') || titleLower.includes('galaxy') || titleLower.includes('cosmos')) {
          visualDescription = 'space galaxy nebula stars planets cosmic';
        } else if (titleLower.includes('dragon') || titleLower.includes('fantasy') || titleLower.includes('magic') || titleLower.includes('magie')) {
          visualDescription = 'fantasy dragon castle magical mythical';
        } else if (titleLower.includes('love') || titleLower.includes('amour') || titleLower.includes('romance')) {
          visualDescription = 'romantic sunset couple love hearts warm';
        } else if (titleLower.includes('mystery') || titleLower.includes('mystère') || titleLower.includes('detective')) {
          visualDescription = 'mysterious dark noir detective shadows';
        } else if (titleLower.includes('adventure') || titleLower.includes('aventure') || titleLower.includes('treasure')) {
          visualDescription = 'adventure epic landscape mountain journey';
        } else if (titleLower.includes('tech') || titleLower.includes('cyber') || titleLower.includes('robot') || titleLower.includes('future')) {
          visualDescription = 'futuristic technology cyber neon digital';
        } else if (titleLower.includes('ocean') || titleLower.includes('océan') || titleLower.includes('sea') || titleLower.includes('mer')) {
          visualDescription = 'ocean sea waves water blue';
        } else if (titleLower.includes('forest') || titleLower.includes('forêt') || titleLower.includes('tree') || titleLower.includes('nature')) {
          visualDescription = 'forest trees nature green woodland';
        } else if (titleLower.includes('city') || titleLower.includes('ville') || titleLower.includes('urban')) {
          visualDescription = 'city urban skyline buildings modern';
        } else {
          // Fallback : utiliser les premiers mots du titre comme description
          const words = title.split(' ').slice(0, 5).join(' ');
          visualDescription = words;
        }
        
        // Prompt SIMPLE et DIRECT
        coverPrompt = `book cover art: ${visualDescription}, artistic, colorful, professional, high quality, no text, no letters, no words`;
      }
      
      console.log('🎨 Génération couverture (sans texte):', coverPrompt);

      // Appeler l'API de génération d'image
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: coverPrompt,
          style: 'realistic' // Pour les couvertures
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      setGeneratedCoverUrl(data.imageUrl);
      setSuccess("✨ Couverture générée avec succès ! (Le titre et l'auteur seront ajoutés lors de l'export)");
      setTimeout(() => setSuccess(""), 4000);
      
    } catch (err: any) {
      console.error('❌ Erreur génération couverture:', err);
      setError(err.message || "Erreur lors de la génération de la couverture");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsGenerating(false)
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
      style: selectedStyle,
      layout: selectedLayout,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        text: textColor
      },
      hasWatermark
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 4 : Création de la couverture</h2>
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
                    className="flex-1"
                  />
                  <Button
                    onClick={generateTitleWithAI}
                    disabled={isGeneratingTitle || isGenerating}
                    variant="outline"
                    size="sm"
                    title="Générer un titre avec l'IA"
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
                  <div className="mt-2">
                    <AITimer 
                      isGenerating={isGeneratingTitle} 
                      estimatedSeconds={5}
                      onComplete={() => console.log('⏰ Titre généré')}
                    />
                  </div>
                )}
                
                {!isGeneratingTitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Cliquez sur la baguette magique 🪄 pour générer un titre avec l'IA
                  </p>
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

              <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden relative max-w-sm mx-auto">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="text-center p-6">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-sm text-gray-700 font-medium mb-4">Génération de la couverture...</p>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <AITimer 
                          isGenerating={isGenerating} 
                          estimatedSeconds={10}
                          onComplete={() => console.log('⏰ Couverture générée')}
                        />
                      </div>
                    </div>
                  </div>
                ) : generatedCoverUrl ? (
                  <img
                    src={generatedCoverUrl}
                    alt="Couverture générée"
                    className="w-full h-full object-cover"
                  />
                ) : customImage ? (
                  <img
                    src={URL.createObjectURL(customImage)}
                    alt="Couverture personnalisée"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500 p-4">
                      <BookOpen className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-sm mb-2">Aperçu de la couverture</p>
                      {title && (
                        <div className="space-y-1">
                          <p className="font-bold text-lg" style={{ color: textColor }}>
                            {title}
                          </p>
                          {subtitle && (
                            <p className="text-sm" style={{ color: textColor }}>
                              {subtitle}
                            </p>
                          )}
                          {author && (
                            <p className="text-sm mt-4" style={{ color: textColor }}>
                              par {author}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Filigrane si activé */}
                {hasWatermark && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white bg-opacity-75 px-2 py-1 rounded">
                    HB Creator
                  </div>
                )}
              </div>

              {/* Actions sur la couverture */}
              <div className="space-y-2 mt-4">
                <Button
                  onClick={() => generateCover(false)}
                  disabled={isGenerating || isGeneratingTitle || !title.trim() || !author.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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