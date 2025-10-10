"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Edit3, Save, X, Palette, RefreshCw, Upload, Scissors, Wand2 } from "lucide-react"
import AnimatedBookPreview from "./animated-book-preview"
import { generateChapterImage, generateCoverImage, type ImageStyle } from "@/lib/image-generator"
import { refineText } from "@/lib/ai-generator"

interface EbookPreviewEditorProps {
  formData: {
    title: string
    author: string
    content: string
    backgroundColor: string
    fontFamily: string
    hasWatermark: boolean
    coverImage: File | null
    idea: string
    genre: string
    targetAudience: string
    length: string
    exactPages: number
  }
  onBack: () => void
  onRegenerate: (newIdea: string) => void
  onDownload: () => void
}

export default function EbookPreviewEditor({ formData, onBack, onRegenerate, onDownload }: EbookPreviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState({
    title: formData.title,
    author: formData.author,
    content: formData.content,
    backgroundColor: formData.backgroundColor,
  })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [regenerationIdea, setRegenerationIdea] = useState(formData.idea)
  const [originalText, setOriginalText] = useState<string>("")
  const [detectedLanguage, setDetectedLanguage] = useState<string>("fr")
  const [history, setHistory] = useState<Array<{ label: string; content: string }>>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isRefining, setIsRefining] = useState<boolean>(false)
  const [chapterStyle, setChapterStyle] = useState<ImageStyle>('realiste')
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  const backgroundColors = [
    { name: "Blanc", value: "#ffffff" },
    { name: "Crème", value: "#fefdf8" },
    { name: "Bleu clair", value: "#dbeafe" },
    { name: "Bleu pastel", value: "#bfdbfe" },
    { name: "Vert clair", value: "#dcfce7" },
    { name: "Vert pastel", value: "#bbf7d0" },
    { name: "Rose clair", value: "#fce7f3" },
    { name: "Rose pastel", value: "#fbcfe8" },
    { name: "Violet clair", value: "#f3e8ff" },
    { name: "Violet pastel", value: "#e9d5ff" },
    { name: "Jaune clair", value: "#fef3c7" },
    { name: "Jaune pastel", value: "#fde68a" },
    { name: "Orange clair", value: "#fed7aa" },
    { name: "Orange pastel", value: "#fdba74" },
    { name: "Rouge clair", value: "#fecaca" },
    { name: "Indigo clair", value: "#c7d2fe" },
    { name: "Cyan clair", value: "#a5f3fc" },
    { name: "Emeraude clair", value: "#a7f3d0" },
    { name: "Lime clair", value: "#d9f99d" },
    { name: "Gris clair", value: "#f3f4f6" },
    { name: "Gris perle", value: "#e5e7eb" },
  ]

  const handleSaveEdits = () => {
    // Mettre à jour les données du formulaire avec les modifications
    Object.assign(formData, editedContent)
    setIsEditing(false)
  }

  const handleCancelEdits = () => {
    // Réinitialiser les modifications
    setEditedContent({
      title: formData.title,
      author: formData.author,
      content: formData.content,
      backgroundColor: formData.backgroundColor,
    })
    setIsEditing(false)
  }

  const handleRegenerate = () => {
    if (regenerationIdea.trim()) {
      onRegenerate(regenerationIdea)
    }
  }

  // Import de texte (.txt, .docx, .pdf)
  const handleImportText = async (file: File) => {
    setIsProcessing(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let text = ''
      if (ext === 'txt') {
        text = await file.text()
      } else if (ext === 'docx') {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value || ''
      } else if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist')
        // @ts-ignore - worker auto
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
        const numPages = pdf.numPages
        const parts: string[] = []
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map((it: any) => (it.str || '')).join(' ')
          parts.push(pageText)
        }
        text = parts.join('\n')
      } else {
        alert('Format non supporté. Utilisez .txt, .docx ou .pdf')
        return
      }

      // Détection simple de langue (heuristique)
      const isFrench = /\b(le|la|les|des|une|un|et|est|avec|pour)\b/i.test(text)
      const isEnglish = /\b(the|and|is|with|for|of|to|in)\b/i.test(text)
      const lang = isFrench ? 'fr' : isEnglish ? 'en' : 'auto'
      setDetectedLanguage(lang)

      setOriginalText(text)
      setEditedContent(prev => ({ ...prev, content: text }))
      setHistory(prev => [{ label: 'Import initial', content: text }, ...prev])
    } catch (e) {
      console.error(e)
      alert('Erreur lors de l\'import du fichier')
    } finally {
      setIsProcessing(false)
    }
  }

  // Outils: nettoyer, découper en chapitres, analyser style
  const tools = {
    clean: (text: string) => {
      return text
        .replace(/\s{3,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\t/g, ' ')
        .trim()
    },
    autoChapters: (text: string) => {
      const paragraphs = text.split(/\n\n+/)
      const chunkSize = Math.max(5, Math.ceil(paragraphs.length / 6))
      const chapters: string[] = []
      let chapterIndex = 1
      for (let i = 0; i < paragraphs.length; i += chunkSize) {
        const chunk = paragraphs.slice(i, i + chunkSize).join('\n\n')
        chapters.push(`# Chapitre ${chapterIndex} : Titre provisoire\n\n${chunk}`)
        chapterIndex++
      }
      return `# Introduction\n\n${paragraphs.slice(0, Math.min(3, paragraphs.length)).join('\n\n')}\n\n${chapters.join('\n\n')}\n\n# Conclusion\n\nRésumé et ouverture.`
    },
    analyzeStyle: (text: string) => {
      const sentences = text.split(/[.!?]+\s/).filter(Boolean)
      const words = text.split(/\s+/).filter(Boolean)
      const avgSentenceLen = words.length / Math.max(1, sentences.length)
      const longWords = words.filter(w => w.length >= 7).length
      const ratioLong = longWords / Math.max(1, words.length)
      return `Analyse du style:\n- Langue détectée: ${detectedLanguage}\n- Phrases: ${sentences.length}\n- Mots: ${words.length}\n- Longueur moyenne des phrases: ${avgSentenceLen.toFixed(1)} mots\n- Proportion de mots longs (>=7): ${(ratioLong*100).toFixed(1)}%`
    }
  }

  const applyTool = (action: 'clean' | 'autoChapters' | 'analyzeStyle') => {
    const current = editedContent.content
    if (!current.trim()) return
    if (action === 'analyzeStyle') {
      const report = tools.analyzeStyle(current)
      alert(report)
      return
    }
    const transformed = tools[action](current)
    setHistory(prev => [{ label: action === 'clean' ? 'Nettoyage' : 'Découpage chapitres', content: transformed }, ...prev])
    setEditedContent(prev => ({ ...prev, content: transformed }))
  }

  // Actions IA: améliorer, raccourcir, allonger, simplifier
  const handleRefine = async (action: 'ameliorer' | 'raccourcir' | 'allonger' | 'simplifier') => {
    const current = editedContent.content
    if (!current.trim()) return
    setIsRefining(true)
    try {
      const refined = await refineText(current, action, detectedLanguage)
      setHistory(prev => [{ label: `IA: ${action}`, content: refined }, ...prev])
      setEditedContent(prev => ({ ...prev, content: refined }))
    } catch (e) {
      console.error(e)
      alert("Échec de l'action IA")
    } finally {
      setIsRefining(false)
    }
  }

  // Restauration d'une version
  const restoreVersion = (index: number) => {
    const version = history[index]
    if (!version) return
    setEditedContent(prev => ({ ...prev, content: version.content }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold">Prévisualisation de votre ebook</h2>
          <p className="text-gray-600 mt-2">
            Vérifiez et modifiez votre ebook avant de le télécharger
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
          
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? "Arrêter l'édition" : "Modifier"}</span>
          </Button>
          
          <Button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <Palette className="h-4 w-4" />
            <span>Couleurs</span>
          </Button>
          
          <Button 
            onClick={onDownload} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF</span>
          </Button>
        </div>
      </div>

    {/* Barre d'outils d'import et d'analyse */}
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="bg-purple-100">
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Importer et préparer le texte</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center px-3 py-2 bg-white border rounded-md cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            <span>Importer (.txt/.docx/.pdf)</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.docx,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImportText(file)
              }}
            />
          </label>
          <Button variant="outline" onClick={() => applyTool('clean')} className="flex items-center space-x-2">
            <Wand2 className="h-4 w-4" />
            <span>Nettoyer le texte</span>
          </Button>
          <Button variant="outline" onClick={() => applyTool('autoChapters')} className="flex items-center space-x-2">
            <Scissors className="h-4 w-4" />
            <span>Découper en chapitres</span>
          </Button>
          <Button variant="outline" onClick={() => applyTool('analyzeStyle')} className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Analyser le style</span>
          </Button>
          {isProcessing && <span className="text-sm text-gray-600">Traitement du fichier...</span>}
          <span className="text-sm text-gray-500">Langue: {detectedLanguage}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="outline" disabled={isRefining} onClick={() => handleRefine('ameliorer')}>Améliorer</Button>
          <Button variant="outline" disabled={isRefining} onClick={() => handleRefine('raccourcir')}>Raccourcir</Button>
          <Button variant="outline" disabled={isRefining} onClick={() => handleRefine('allonger')}>Allonger</Button>
          <Button variant="outline" disabled={isRefining} onClick={() => handleRefine('simplifier')}>Simplifier</Button>
          {isRefining && <span className="text-sm text-gray-600">IA en cours...</span>}
        </div>
      </CardContent>
    </Card>

    {/* Génération d'illustrations par chapitre */}
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader className="bg-orange-100">
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Illustrations par chapitre</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label>Style</label>
          <select
            className="border rounded px-2 py-1"
            value={chapterStyle}
            onChange={(e) => setChapterStyle(e.target.value as ImageStyle)}
          >
            <option value="realiste">Réaliste</option>
            <option value="cartoon">Cartoon</option>
            <option value="aquarelle">Aquarelle</option>
            <option value="fantasy">Fantasy</option>
            <option value="minimaliste">Minimaliste</option>
            <option value="retro">Rétro</option>
            <option value="noir-et-blanc">Noir et blanc</option>
          </select>
          <Button
            variant="outline"
            onClick={async () => {
              const chapters = editedContent.content.split(/\n#+\s*Chapitre\s*\d+.*\n/i)
              // chapters[0] is preface, skip
              const titles = (editedContent.content.match(/#\s*Chapitre\s*\d+\s*:?\s*(.*)/gi) || [])
              const results: Record<number, string> = {}
              for (let i = 0; i < titles.length; i++) {
                const titleText = (titles[i].replace(/^#\s*Chapitre\s*\d+\s*:?[\s-]*/i, '')).trim().slice(0, 80)
                const url = await generateChapterImage(titleText || `Chapitre ${i + 1}`, editedContent.title, chapterStyle)
                results[i + 1] = url
              }
              setGeneratedImages(results)
              alert('Illustrations générées pour les chapitres')
            }}
          >
            Générer les images
          </Button>
        </div>
        {Object.keys(generatedImages).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(generatedImages).map(([idx, url]) => (
              <div key={idx} className="border rounded p-2 text-center">
                <div className="text-xs text-gray-600 mb-1">Chapitre {idx}</div>
                <img src={url} className="w-full h-40 object-cover rounded" />
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={async () => {
                    const titleText = `Chapitre ${idx}`
                    const newUrl = await generateChapterImage(titleText, editedContent.title, chapterStyle)
                    setGeneratedImages(prev => ({ ...prev, [Number(idx)]: newUrl }))
                  }}>Régénérer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Génération de couverture */}
    <Card className="border-2 border-pink-200 bg-pink-50">
      <CardHeader className="bg-pink-100">
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Couverture automatique</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              const url = await generateCoverImage(editedContent.title || 'Titre', undefined, editedContent.author || 'Auteur', chapterStyle)
              setCoverUrl(url)
            }}
          >
            Générer la couverture (1024×1536)
          </Button>
          <span className="text-sm text-gray-600">Recommandé: 2048×3072 px (haut de gamme)</span>
        </div>
        {coverUrl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Aperçu généré</div>
              <img src={coverUrl} className="w-full max-w-sm rounded border" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Uploader une image manuellement</div>
              <ImageUpload onImageUpload={(file) => {
                if (file) {
                  const u = URL.createObjectURL(file)
                  setCoverUrl(u)
                } else {
                  setCoverUrl(null)
                }
              }} />
            </div>
          </div>
        )}
        {!coverUrl && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Uploader une image manuellement</div>
            <ImageUpload onImageUpload={(file) => {
              if (file) {
                const u = URL.createObjectURL(file)
                setCoverUrl(u)
              } else {
                setCoverUrl(null)
              }
            }} />
          </div>
        )}
        <div className="text-xs text-gray-500">Un filigrane "HB Creator" est ajouté sur la version gratuite.</div>
      </CardContent>
    </Card>

      {/* Panneau d'édition */}
      {isEditing && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="bg-blue-100">
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Mode édition</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de votre ebook"
                />
              </div>
              <div>
                <Label htmlFor="edit-author">Auteur</Label>
                <Input
                  id="edit-author"
                  value={editedContent.author}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Nom de l'auteur"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-content">Contenu de l'ebook</Label>
              <Textarea
                id="edit-content"
                value={editedContent.content}
                onChange={(e) => setEditedContent(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                placeholder="Contenu de votre ebook..."
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleCancelEdits} variant="outline" className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Annuler</span>
              </Button>
              <Button onClick={handleSaveEdits} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panneau de sélection des couleurs */}
      {showColorPicker && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="bg-purple-100">
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Choisir la couleur de fond</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
              {backgroundColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setEditedContent(prev => ({ ...prev, backgroundColor: color.value }))}
                  className={`
                    relative h-16 w-full rounded-lg border-2 transition-all duration-200 hover:scale-105
                    ${editedContent.backgroundColor === color.value ? 'border-gray-800 shadow-lg' : 'border-gray-200'}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {editedContent.backgroundColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs text-gray-600 bg-white bg-opacity-80 rounded px-1 py-0.5 truncate">
                      {color.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panneau de régénération */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="bg-green-100">
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Pas satisfait ? Régénérez votre ebook</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Modifiez votre idée et l'IA générera un nouveau contenu complètement différent grâce au système d'unicité.
            </p>
            <div className="flex space-x-3">
              <Textarea
                value={regenerationIdea}
                onChange={(e) => setRegenerationIdea(e.target.value)}
                placeholder="Modifiez votre idée d'ebook ici..."
                rows={3}
                className="flex-1"
              />
              <Button 
                onClick={handleRegenerate}
                disabled={!regenerationIdea.trim()}
                className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Régénérer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des versions */}
      {history.length > 0 && (
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader className="bg-gray-50">
            <CardTitle>Historique des versions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="text-gray-700">{h.label}</div>
                <Button size="sm" variant="outline" onClick={() => restoreVersion(idx)}>Restaurer</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Aperçu de l'ebook avec animation */}
      <AnimatedBookPreview 
        formData={{
          title: editedContent.title,
          author: editedContent.author,
          content: editedContent.content,
          backgroundColor: editedContent.backgroundColor,
          fontFamily: formData.fontFamily,
          hasWatermark: formData.hasWatermark,
          coverImage: (coverUrl ? (undefined as any) : formData.coverImage),
          coverDescription: "Image de garde générée automatiquement",
        }}
      />
    </div>
  )
}