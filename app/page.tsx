"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Palette, Upload, Sparkles, Wand2, Brain } from "lucide-react"
import EbookGenerator from "@/components/ebook-generator"
import ImageUpload from "@/components/image-upload"
import AIGenerationStep from "@/components/ai-generation-step"

export default function HomePage() {
  const [formData, setFormData] = useState({
    idea: "",
    genre: "",
    targetAudience: "",
    length: "court",
    backgroundColor: "#ffffff",
    coverImage: null as File | null,
  })
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    author: "",
    content: "",
    coverDescription: "",
  })
  const [currentStep, setCurrentStep] = useState<"form" | "generating" | "preview">("form")

  const genres = [
    { name: "Roman", value: "roman" },
    { name: "Science-fiction", value: "science-fiction" },
    { name: "Fantasy", value: "fantasy" },
    { name: "Thriller", value: "thriller" },
    { name: "Romance", value: "romance" },
    { name: "Aventure", value: "aventure" },
    { name: "Mystère", value: "mystere" },
    { name: "Historique", value: "historique" },
    { name: "Biographie", value: "biographie" },
    { name: "Développement personnel", value: "developpement-personnel" },
  ]

  const audiences = [
    { name: "Enfants (6-12 ans)", value: "enfants" },
    { name: "Adolescents (13-17 ans)", value: "adolescents" },
    { name: "Jeunes adultes (18-25 ans)", value: "jeunes-adultes" },
    { name: "Adultes (25+ ans)", value: "adultes" },
    { name: "Tout public", value: "tout-public" },
  ]

  const lengths = [
    { name: "Court (5-10 pages)", value: "court" },
    { name: "Moyen (15-25 pages)", value: "moyen" },
    { name: "Long (30-50 pages)", value: "long" },
  ]

  const backgroundColors = [
    { name: "Blanc", value: "#ffffff" },
    { name: "Crème", value: "#fefdf8" },
    { name: "Bleu clair", value: "#f0f9ff" },
    { name: "Vert clair", value: "#f0fdf4" },
    { name: "Rose clair", value: "#fdf2f8" },
    { name: "Violet clair", value: "#faf5ff" },
    { name: "Jaune clair", value: "#fffbeb" },
    { name: "Gris clair", value: "#f9fafb" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, coverImage: file }))
  }

  const handleGenerate = async () => {
    if (!formData.idea.trim()) {
      alert("Veuillez décrire votre idée d'ebook.")
      return
    }

    setCurrentStep("generating")
  }

  const handleGenerationComplete = (content: typeof generatedContent) => {
    setGeneratedContent(content)
    setCurrentStep("preview")
  }

  const resetForm = () => {
    setCurrentStep("form")
    setFormData({
      idea: "",
      genre: "",
      targetAudience: "",
      length: "court",
      backgroundColor: "#ffffff",
      coverImage: null,
    })
    setGeneratedContent({
      title: "",
      author: "",
      content: "",
      coverDescription: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Story2book AI
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 hidden sm:flex">
              <Brain className="h-4 w-4" />
              <span>Propulsé par l'Intelligence Artificielle</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "form" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse" />
                  <div className="relative bg-white rounded-full p-4">
                    <Wand2 className="h-12 w-12 text-purple-600" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">L'IA écrit votre ebook à votre place</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Donnez-nous simplement votre idée et notre IA créera automatiquement un ebook complet avec titre,
                chapitres, contenu et même une description pour la couverture !
              </p>
            </div>

            {/* Form */}
            <Card className="w-full border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Décrivez votre idée d'ebook</span>
                </CardTitle>
                <CardDescription>L'IA va transformer votre idée en un ebook complet et professionnel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Main Idea */}
                <div className="space-y-2">
                  <Label htmlFor="idea" className="text-lg font-medium">
                    Votre idée d'ebook *
                  </Label>
                  <Textarea
                    id="idea"
                    placeholder="Ex: Une histoire d'amour entre deux astronautes sur Mars, ou un guide pour apprendre la cuisine française, ou l'aventure d'un chat qui découvre qu'il a des pouvoirs magiques..."
                    value={formData.idea}
                    onChange={(e) => handleInputChange("idea", e.target.value)}
                    className="min-h-[120px] text-lg resize-y"
                  />
                  <p className="text-sm text-gray-500">
                    Plus vous donnez de détails, plus l'IA pourra créer un contenu personnalisé !
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Genre */}
                  <div className="space-y-2">
                    <Label>Genre (optionnel)</Label>
                    <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.value} value={genre.value}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label>Public cible (optionnel)</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value) => handleInputChange("targetAudience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le public" />
                      </SelectTrigger>
                      <SelectContent>
                        {audiences.map((audience) => (
                          <SelectItem key={audience.value} value={audience.value}>
                            {audience.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Length */}
                  <div className="space-y-2">
                    <Label>Longueur souhaitée</Label>
                    <Select value={formData.length} onValueChange={(value) => handleInputChange("length", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lengths.map((length) => (
                          <SelectItem key={length.value} value={length.value}>
                            {length.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Couleur de fond</span>
                    </Label>
                    <Select
                      value={formData.backgroundColor}
                      onValueChange={(value) => handleInputChange("backgroundColor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.value }} />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Image de couverture personnalisée (optionnel)</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Si vous ne téléchargez pas d'image, l'IA créera une description pour générer une couverture
                  </p>
                  <ImageUpload onImageUpload={handleImageUpload} />
                  {formData.coverImage && (
                    <p className="text-sm text-green-600">✓ Image sélectionnée: {formData.coverImage.name}</p>
                  )}
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={!formData.idea.trim()}
                    className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Wand2 className="h-6 w-6" />
                      <span>Créer mon ebook avec l'IA</span>
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-2">L'IA va créer votre ebook en 30-60 secondes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "generating" && (
          <AIGenerationStep formData={formData} onComplete={handleGenerationComplete} onBack={resetForm} />
        )}

        {currentStep === "preview" && (
          <EbookGenerator
            formData={{
              title: generatedContent.title,
              author: generatedContent.author,
              content: generatedContent.content,
              backgroundColor: formData.backgroundColor,
              coverImage: formData.coverImage,
            }}
            onBack={resetForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold">Story2book AI</span>
              </div>
              <p className="text-gray-600 text-sm">
                Le premier générateur d'ebooks français alimenté par l'Intelligence Artificielle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Génération automatique par IA</li>
                <li>• Création de titres et chapitres</li>
                <li>• Contenu personnalisé</li>
                <li>• Export PDF professionnel</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-purple-600">
                    Mentions légales
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600">
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Story2book AI. Tous droits réservés. Propulsé par l'Intelligence Artificielle.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}