"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Layout, FileText, Type, Ruler, Eye, Settings, CheckCircle, AlertCircle } from "lucide-react"

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

interface LayoutTemplateProps {
  coverData: CoverData
  processedText: string
  onNext: (data: { layoutSettings: LayoutSettings }) => void
  onBack: () => void
}

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

export default function LayoutTemplate({ coverData, processedText, onNext, onBack }: LayoutTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("roman")
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    template: "roman",
    typography: {
      titleSize: 18,
      subtitleSize: 14,
      bodySize: 11,
      titleFont: "Georgia",
      bodyFont: "Georgia"
    },
    spacing: {
      lineHeight: 1.5,
      paragraphSpacing: 12,
      chapterSpacing: 24,
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    pageSettings: {
      format: "A4",
      orientation: "portrait",
      showPageNumbers: true,
      pageNumberPosition: "bottom-center"
    },
    tableOfContents: {
      enabled: true,
      style: "classic",
      showPageNumbers: true
    },
    chapterHeaders: {
      style: "elegant",
      showNumbers: true,
      alignment: "left"
    }
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Presets de disposition rapide
  const layoutPresets = [
    {
      name: "📚 Roman classique",
      description: "Marges larges, police serif, espacement confortable",
      settings: {
        typography: { titleSize: 18, subtitleSize: 14, bodySize: 11, titleFont: "Georgia", bodyFont: "Georgia" },
        spacing: { lineHeight: 1.6, paragraphSpacing: 12, chapterSpacing: 24, margins: { top: 25, bottom: 25, left: 25, right: 25 } }
      }
    },
    {
      name: "📖 Livre technique",
      description: "Marges étroites, police sans-serif, espacement compact",
      settings: {
        typography: { titleSize: 16, subtitleSize: 13, bodySize: 10, titleFont: "Arial", bodyFont: "Arial" },
        spacing: { lineHeight: 1.4, paragraphSpacing: 10, chapterSpacing: 20, margins: { top: 20, bottom: 20, left: 20, right: 20 } }
      }
    },
    {
      name: "✨ Luxe élégant",
      description: "Grandes marges, grandes polices, espacement généreux",
      settings: {
        typography: { titleSize: 22, subtitleSize: 16, bodySize: 13, titleFont: "Palatino", bodyFont: "Palatino" },
        spacing: { lineHeight: 1.8, paragraphSpacing: 16, chapterSpacing: 32, margins: { top: 30, bottom: 30, left: 30, right: 30 } }
      }
    }
  ]

  // Fonction pour appliquer un preset
  const applyPreset = (preset: typeof layoutPresets[0]) => {
    setLayoutSettings(prev => ({
      ...prev,
      typography: { ...prev.typography, ...preset.settings.typography },
      spacing: { ...prev.spacing, ...preset.settings.spacing }
    }))
    setSuccess(`Preset "${preset.name}" appliqué !`)
    setTimeout(() => setSuccess(""), 3000)
  }

  // Templates disponibles
  const templates = [
    {
      value: "roman",
      label: "Roman",
      description: "Template classique pour romans et fiction",
      features: ["Chapitres numérotés", "Sommaire automatique", "Marges équilibrées", "Typographie lisible"],
      preview: "📖",
      typography: {
        titleSize: 18,
        subtitleSize: 14,
        bodySize: 11,
        titleFont: "Georgia",
        bodyFont: "Georgia"
      }
    },
    {
      value: "essai",
      label: "Essai",
      description: "Template pour essais et textes académiques",
      features: ["Sections numérotées", "Notes de bas de page", "Bibliographie", "Marges larges"],
      preview: "📝",
      typography: {
        titleSize: 16,
        subtitleSize: 13,
        bodySize: 10,
        titleFont: "Times New Roman",
        bodyFont: "Times New Roman"
      }
    },
    {
      value: "educatif",
      label: "Éducatif",
      description: "Template pour manuels et guides pédagogiques",
      features: ["Encadrés colorés", "Listes à puces", "Exercices", "Schémas"],
      preview: "🎓",
      typography: {
        titleSize: 17,
        subtitleSize: 14,
        bodySize: 11,
        titleFont: "Arial",
        bodyFont: "Arial"
      }
    },
    {
      value: "conte",
      label: "Conte",
      description: "Template pour contes et histoires pour enfants",
      features: ["Illustrations intégrées", "Typographie ludique", "Espaces aérés", "Couleurs douces"],
      preview: "🧚",
      typography: {
        titleSize: 20,
        subtitleSize: 16,
        bodySize: 12,
        titleFont: "Comic Sans MS",
        bodyFont: "Comic Sans MS"
      }
    },
    {
      value: "professionnel",
      label: "Professionnel",
      description: "Template pour rapports et documents d'entreprise",
      features: ["En-têtes corporate", "Tableaux", "Graphiques", "Logo d'entreprise"],
      preview: "💼",
      typography: {
        titleSize: 16,
        subtitleSize: 13,
        bodySize: 10,
        titleFont: "Arial",
        bodyFont: "Arial"
      }
    },
    {
      value: "magazine",
      label: "Magazine",
      description: "Template style magazine avec colonnes",
      features: ["Mise en page colonnes", "Encadrés", "Citations", "Images intégrées"],
      preview: "📰",
      typography: {
        titleSize: 19,
        subtitleSize: 15,
        bodySize: 10,
        titleFont: "Helvetica",
        bodyFont: "Helvetica"
      }
    }
  ]

  // Formats de page
  const pageFormats = [
    { value: "A4", label: "A4 (210×297 mm)", width: 210, height: 297 },
    { value: "A5", label: "A5 (148×210 mm)", width: 148, height: 210 },
    { value: "US-Letter", label: "US Letter (216×279 mm)", width: 216, height: 279 },
    { value: "6x9", label: "6×9 inches (152×229 mm)", width: 152, height: 229 },
    { value: "5x8", label: "5×8 inches (127×203 mm)", width: 127, height: 203 }
  ]

  // Polices disponibles
  const fonts = [
    { value: "Georgia", label: "Georgia (serif classique)" },
    { value: "Times New Roman", label: "Times New Roman (serif traditionnel)" },
    { value: "Arial", label: "Arial (sans-serif moderne)" },
    { value: "Helvetica", label: "Helvetica (sans-serif professionnel)" },
    { value: "Verdana", label: "Verdana (sans-serif lisible)" },
    { value: "Palatino", label: "Palatino (serif élégant)" },
    { value: "Garamond", label: "Garamond (serif littéraire)" },
    { value: "Comic Sans MS", label: "Comic Sans MS (ludique)" }
  ]

  // Positions des numéros de page
  const pageNumberPositions = [
    { value: "bottom-center", label: "Bas - Centre" },
    { value: "bottom-right", label: "Bas - Droite" },
    { value: "bottom-left", label: "Bas - Gauche" },
    { value: "top-center", label: "Haut - Centre" },
    { value: "top-right", label: "Haut - Droite" },
    { value: "top-left", label: "Haut - Gauche" }
  ]

  // Styles de sommaire
  const tocStyles = [
    { value: "classic", label: "Classique", description: "Style traditionnel avec points de suite" },
    { value: "modern", label: "Moderne", description: "Style épuré sans ornements" },
    { value: "elegant", label: "Élégant", description: "Style sophistiqué avec séparateurs" },
    { value: "minimal", label: "Minimal", description: "Style simple et direct" }
  ]

  // Styles d'en-têtes de chapitre
  const chapterHeaderStyles = [
    { value: "elegant", label: "Élégant", description: "Avec ornements et séparateurs" },
    { value: "simple", label: "Simple", description: "Texte simple sans ornements" },
    { value: "bold", label: "Audacieux", description: "Typographie forte et contrastée" },
    { value: "decorative", label: "Décoratif", description: "Avec éléments graphiques" }
  ]

  // Fonction pour appliquer un template
  const applyTemplate = (templateValue: string) => {
    const template = templates.find(t => t.value === templateValue)
    if (!template) return

    setLayoutSettings(prev => ({
      ...prev,
      template: templateValue,
      typography: {
        ...prev.typography,
        ...template.typography
      }
    }))

    setSelectedTemplate(templateValue)
    setSuccess(`Template "${template.label}" appliqué`)
  }

  // Fonction pour mettre à jour les paramètres
  const updateSetting = (category: keyof LayoutSettings, field: string, value: any) => {
    setLayoutSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [field]: value
      }
    }))
  }

  // Fonction pour mettre à jour les marges
  const updateMargin = (side: keyof LayoutSettings['spacing']['margins'], value: number) => {
    setLayoutSettings(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        margins: {
          ...prev.spacing.margins,
          [side]: value
        }
      }
    }))
  }

  // Fonction pour générer l'aperçu du texte
  const generatePreview = () => {
    const chapters = processedText.split(/(?:^|\n)((?:Chapitre|Chapter|#)\s*\d+[^:\n]*:?[^\n]*)/gmi)
    const firstChapter = chapters.slice(0, 3).join('').substring(0, 500)
    
    return firstChapter + "..."
  }

  // Fonction pour calculer les statistiques de mise en page
  const calculateLayoutStats = () => {
    const wordsCount = processedText.split(/\s+/).length
    const format = pageFormats.find(f => f.value === layoutSettings.pageSettings.format)
    const wordsPerPage = Math.floor((format?.width || 210) * (format?.height || 297) / 1000) // Estimation approximative
    const estimatedPages = Math.ceil(wordsCount / wordsPerPage)
    
    return {
      wordsCount,
      estimatedPages,
      format: format?.label || "A4"
    }
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (!selectedTemplate) {
      setError("Veuillez sélectionner un template")
      return
    }

    onNext({ layoutSettings })
  }

  const stats = calculateLayoutStats()
  const selectedTemplateInfo = templates.find(t => t.value === selectedTemplate)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 4 : Mise en page automatique</h2>
        <p className="text-gray-600">Choisissez un template et personnalisez la mise en page de votre ebook. Tous les styles sont optimisés pour une lecture agréable.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sélection du template */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layout className="h-5 w-5" />
                <span>Templates de mise en page</span>
              </CardTitle>
              <CardDescription>
                Choisissez le template qui correspond le mieux à votre type de contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.value}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => applyTemplate(template.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{template.preview}</div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{template.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">Fonctionnalités :</div>
                            <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                              {template.features.slice(0, 2).map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de typographie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-5 w-5" />
                <span>Typographie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Police des titres</Label>
                  <Select 
                    value={layoutSettings.typography.titleFont} 
                    onValueChange={(value) => updateSetting('typography', 'titleFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Police du corps</Label>
                  <Select 
                    value={layoutSettings.typography.bodyFont} 
                    onValueChange={(value) => updateSetting('typography', 'bodyFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Taille titre (pt)</Label>
                  <Input
                    type="number"
                    min="14"
                    max="24"
                    value={layoutSettings.typography.titleSize}
                    onChange={(e) => updateSetting('typography', 'titleSize', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Taille sous-titre (pt)</Label>
                  <Input
                    type="number"
                    min="12"
                    max="20"
                    value={layoutSettings.typography.subtitleSize}
                    onChange={(e) => updateSetting('typography', 'subtitleSize', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Taille corps (pt)</Label>
                  <Input
                    type="number"
                    min="9"
                    max="14"
                    value={layoutSettings.typography.bodySize}
                    onChange={(e) => updateSetting('typography', 'bodySize', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres d'espacement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="h-5 w-5" />
                <span>Espacement et marges</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interligne</Label>
                  <Select 
                    value={layoutSettings.spacing.lineHeight.toString()} 
                    onValueChange={(value) => updateSetting('spacing', 'lineHeight', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">1.2 (Serré)</SelectItem>
                      <SelectItem value="1.5">1.5 (Standard)</SelectItem>
                      <SelectItem value="1.8">1.8 (Aéré)</SelectItem>
                      <SelectItem value="2.0">2.0 (Double)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Espacement paragraphes (pt)</Label>
                  <Input
                    type="number"
                    min="6"
                    max="24"
                    value={layoutSettings.spacing.paragraphSpacing}
                    onChange={(e) => updateSetting('spacing', 'paragraphSpacing', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Marges (mm)</Label>
                <div className="flex gap-4">
                  <div className="grid grid-cols-4 gap-2 mt-2 flex-1">
                    <div>
                      <Label className="text-xs">Haut</Label>
                      <Input
                        type="number"
                        min="10"
                        max="40"
                        value={layoutSettings.spacing.margins.top}
                        onChange={(e) => updateMargin('top', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bas</Label>
                      <Input
                        type="number"
                        min="10"
                        max="40"
                        value={layoutSettings.spacing.margins.bottom}
                        onChange={(e) => updateMargin('bottom', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Gauche</Label>
                      <Input
                        type="number"
                        min="10"
                        max="40"
                        value={layoutSettings.spacing.margins.left}
                        onChange={(e) => updateMargin('left', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                    <Label className="text-xs">Droite</Label>
                    <Input
                      type="number"
                      min="10"
                      max="40"
                      value={layoutSettings.spacing.margins.right}
                      onChange={(e) => updateMargin('right', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                  
                  {/* Prévisualisation visuelle des marges */}
                  <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0" style={{width: '180px'}}>
                    <div className="text-xs text-gray-600 mb-2 text-center">Prévisualisation</div>
                    <div className="bg-white border-2 border-gray-300 relative" style={{
                      width: '120px',
                      height: '160px',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      {/* Zones de marges colorées */}
                      <div className="absolute bg-blue-100 opacity-40" style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${(layoutSettings.spacing.margins.top / 40) * 30}%`
                      }} title={`Haut: ${layoutSettings.spacing.margins.top}mm`}></div>
                      
                      <div className="absolute bg-blue-100 opacity-40" style={{
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${(layoutSettings.spacing.margins.bottom / 40) * 30}%`
                      }} title={`Bas: ${layoutSettings.spacing.margins.bottom}mm`}></div>
                      
                      <div className="absolute bg-blue-100 opacity-40" style={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${(layoutSettings.spacing.margins.left / 40) * 30}%`
                      }} title={`Gauche: ${layoutSettings.spacing.margins.left}mm`}></div>
                      
                      <div className="absolute bg-blue-100 opacity-40" style={{
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: `${(layoutSettings.spacing.margins.right / 40) * 30}%`
                      }} title={`Droite: ${layoutSettings.spacing.margins.right}mm`}></div>
                      
                      {/* Zone de contenu */}
                      <div className="absolute flex items-center justify-center" style={{
                        top: `${(layoutSettings.spacing.margins.top / 40) * 30}%`,
                        bottom: `${(layoutSettings.spacing.margins.bottom / 40) * 30}%`,
                        left: `${(layoutSettings.spacing.margins.left / 40) * 30}%`,
                        right: `${(layoutSettings.spacing.margins.right / 40) * 30}%`
                      }}>
                        <div className="text-[6px] text-gray-400 leading-tight">
                          Lorem ipsum dolor sit amet...
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 text-center mt-2">
                      Zones bleues = Marges
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Format et pagination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Format de page</Label>
                  <Select 
                    value={layoutSettings.pageSettings.format} 
                    onValueChange={(value) => updateSetting('pageSettings', 'format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Position numéros de page</Label>
                  <Select 
                    value={layoutSettings.pageSettings.pageNumberPosition} 
                    onValueChange={(value) => updateSetting('pageSettings', 'pageNumberPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageNumberPositions.map((position) => (
                        <SelectItem key={position.value} value={position.value}>
                          {position.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-page-numbers"
                  checked={layoutSettings.pageSettings.showPageNumbers}
                  onChange={(e) => updateSetting('pageSettings', 'showPageNumbers', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="show-page-numbers">Afficher les numéros de page</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de prévisualisation et paramètres */}
        <div className="space-y-6">
          {/* Aperçu interactif avec marges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Aperçu en temps réel</span>
              </CardTitle>
              <CardDescription>
                Visualisez les changements instantanément
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 shadow-inner">
                <div className="text-xs text-center text-gray-500 mb-2">
                  📄 Page A4 (210×297 mm)
                </div>
                
                <div 
                  className="bg-white border-4 border-gray-300 relative mx-auto shadow-lg"
                  style={{
                    width: '300px',
                    height: '424px',
                  }}
                >
                  {/* Marges colorées */}
                  <div 
                    className="absolute bg-blue-100 opacity-50 border-b border-blue-300 transition-all"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${(layoutSettings.spacing.margins.top / 40) * 30}%`
                    }}
                  />
                  
                  <div 
                    className="absolute bg-blue-100 opacity-50 border-t border-blue-300 transition-all"
                    style={{
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${(layoutSettings.spacing.margins.bottom / 40) * 30}%`
                    }}
                  />
                  
                  <div 
                    className="absolute bg-green-100 opacity-50 border-r border-green-300 transition-all"
                    style={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${(layoutSettings.spacing.margins.left / 40) * 30}%`
                    }}
                  />
                  
                  <div 
                    className="absolute bg-green-100 opacity-50 border-l border-green-300 transition-all"
                    style={{
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: `${(layoutSettings.spacing.margins.right / 40) * 30}%`
                    }}
                  />
                  
                  {/* Zone de contenu réactive */}
                  <div 
                    className="absolute overflow-hidden"
                    style={{
                      top: `${(layoutSettings.spacing.margins.top / 40) * 30}%`,
                      bottom: `${(layoutSettings.spacing.margins.bottom / 40) * 30}%`,
                      left: `${(layoutSettings.spacing.margins.left / 40) * 30}%`,
                      right: `${(layoutSettings.spacing.margins.right / 40) * 30}%`,
                      padding: '8px'
                    }}
                  >
                    <h1 
                      style={{
                        fontFamily: layoutSettings.typography.titleFont,
                        fontSize: `${Math.min(layoutSettings.typography.titleSize * 0.6, 16)}px`,
                        fontWeight: 'bold',
                        marginBottom: `${layoutSettings.spacing.chapterSpacing * 0.3}px`,
                        lineHeight: layoutSettings.spacing.lineHeight
                      }}
                    >
                      {coverData.title}
                    </h1>
                    
                    <p 
                      style={{
                        fontFamily: layoutSettings.typography.bodyFont,
                        fontSize: `${Math.min(layoutSettings.typography.bodySize * 0.7, 9)}px`,
                        lineHeight: layoutSettings.spacing.lineHeight,
                        marginBottom: `${layoutSettings.spacing.paragraphSpacing * 0.5}px`
                      }}
                    >
                      {generatePreview().substring(0, 200)}...
                    </p>
                    
                    {/* Numéro de page si activé */}
                    {layoutSettings.pageSettings.showPageNumbers && (
                      <div 
                        className="absolute text-gray-400"
                        style={{
                          fontSize: '8px',
                          bottom: layoutSettings.pageSettings.pageNumberPosition.includes('bottom') ? '4px' : 'auto',
                          top: layoutSettings.pageSettings.pageNumberPosition.includes('top') ? '4px' : 'auto',
                          left: layoutSettings.pageSettings.pageNumberPosition.includes('left') ? '4px' : 'auto',
                          right: layoutSettings.pageSettings.pageNumberPosition.includes('right') ? '4px' : 'auto',
                          textAlign: layoutSettings.pageSettings.pageNumberPosition.includes('center') ? 'center' : 'left',
                          width: layoutSettings.pageSettings.pageNumberPosition.includes('center') ? '100%' : 'auto'
                        }}
                      >
                        1
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Légende */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 opacity-50 border border-blue-300 rounded"></div>
                    <span>Marges H/B</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 opacity-50 border border-green-300 rounded"></div>
                    <span>Marges G/D</span>
                  </div>
                </div>
              </div>

              {selectedTemplateInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{selectedTemplateInfo.preview}</span>
                    <span className="font-medium text-blue-900">{selectedTemplateInfo.label}</span>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {selectedTemplateInfo.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiques de mise en page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Template :</span>
                <span className="font-medium">{selectedTemplateInfo?.label || 'Aucun'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format :</span>
                <span className="font-medium">{stats.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mots :</span>
                <span className="font-medium">{stats.wordsCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pages estimées :</span>
                <span className="font-medium">{stats.estimatedPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Police corps :</span>
                <span className="font-medium">{layoutSettings.typography.bodyFont} {layoutSettings.typography.bodySize}pt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interligne :</span>
                <span className="font-medium">{layoutSettings.spacing.lineHeight}</span>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres avancés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Settings className="h-4 w-4" />
                <span>Options avancées</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sommaire */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="enable-toc"
                    checked={layoutSettings.tableOfContents.enabled}
                    onChange={(e) => updateSetting('tableOfContents', 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="enable-toc" className="text-sm">Sommaire automatique</Label>
                </div>
                
                {layoutSettings.tableOfContents.enabled && (
                  <Select 
                    value={layoutSettings.tableOfContents.style} 
                    onValueChange={(value) => updateSetting('tableOfContents', 'style', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tocStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Style des chapitres */}
              <div>
                <Label className="text-sm">Style des en-têtes de chapitre</Label>
                <Select 
                  value={layoutSettings.chapterHeaders.style} 
                  onValueChange={(value) => updateSetting('chapterHeaders', 'style', value)}
                >
                  <SelectTrigger className="text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chapterHeaderStyles.map((style) => (
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-chapter-numbers"
                  checked={layoutSettings.chapterHeaders.showNumbers}
                  onChange={(e) => updateSetting('chapterHeaders', 'showNumbers', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="show-chapter-numbers" className="text-sm">Numéroter les chapitres</Label>
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

      {/* Presets de disposition rapide - EN BAS pour voir la preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Presets rapides</span>
          </CardTitle>
          <CardDescription>
            Appliquez instantanément une configuration prédéfinie et voyez le résultat dans la prévisualisation ci-dessus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layoutPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="text-left p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="font-medium text-gray-900 mb-1">{preset.name}</div>
                <div className="text-sm text-gray-600">{preset.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

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