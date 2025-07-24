"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Edit3, Save, X, Palette, RefreshCw } from "lucide-react"
import AnimatedBookPreview from "./animated-book-preview"

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

      {/* Aperçu de l'ebook avec animation */}
      <AnimatedBookPreview 
        formData={{
          title: editedContent.title,
          author: editedContent.author,
          content: editedContent.content,
          backgroundColor: editedContent.backgroundColor,
          fontFamily: formData.fontFamily,
          hasWatermark: formData.hasWatermark,
          coverImage: formData.coverImage,
          coverDescription: "Image de garde générée automatiquement",
        }}
      />
    </div>
  )
}