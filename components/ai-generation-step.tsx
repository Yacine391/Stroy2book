"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, BookOpen, Sparkles, CheckCircle } from "lucide-react"
import { generateEbook } from "@/lib/ai-generator"

interface AIGenerationStepProps {
  formData: {
    idea: string
    author: string
    genre: string
    targetAudience: string
    length: string
    exactPages: number
    backgroundColor: string
    fontFamily: string
    hasWatermark: boolean
    coverImage: File | null
  }
  onComplete: (content: {
    title: string
    author: string
    content: string
    coverDescription: string
  }) => void
  onBack: () => void
}

export default function AIGenerationStep({ formData, onComplete, onBack }: AIGenerationStepProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    author: "",
    content: "",
    coverDescription: "",
  })

  const steps = [
    { name: "Analyse de votre idée", icon: Brain, description: "L'IA comprend votre concept" },
    { name: "Création du titre", icon: Sparkles, description: "Génération d'un titre accrocheur" },
    { name: "Structure des chapitres", icon: BookOpen, description: "Organisation du contenu" },
    { name: "Rédaction du contenu", icon: CheckCircle, description: "Écriture de votre ebook" },
  ]

  useEffect(() => {
    const generateContent = async () => {
      try {
        // Simulation des étapes avec des délais réalistes
        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i)
          await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))
        }

        // Génération du contenu avec l'IA
        const content = await generateEbook(formData)
        setGeneratedContent(content)
        setIsGenerating(false)

        // Attendre un peu avant de passer à l'étape suivante
        setTimeout(() => {
          onComplete(content)
        }, 1500)
      } catch (error) {
        console.error("Erreur lors de la génération:", error)
        setIsGenerating(false)
      }
    }

    generateContent()
  }, [formData, onComplete])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">L'IA crée votre ebook</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous générons votre contenu...</p>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Progress Card */}
      <Card className="border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-6 w-6 text-purple-600" />
              {isGenerating && (
                <div className="absolute inset-0 animate-ping">
                  <Brain className="h-6 w-6 text-purple-400 opacity-75" />
                </div>
              )}
            </div>
            <span>Génération en cours...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Idea Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Votre idée :</h3>
            <p className="text-gray-700 italic">"{formData.idea}"</p>
            {formData.genre && <p className="text-sm text-gray-600 mt-2">Genre: {formData.genre}</p>}
            {formData.targetAudience && <p className="text-sm text-gray-600">Public: {formData.targetAudience}</p>}
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep && isGenerating
              const isCompleted = index < currentStep || !isGenerating
              const isCurrent = index === currentStep

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                    isActive
                      ? "bg-purple-50 border-2 border-purple-200"
                      : isCompleted
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      className={`h-6 w-6 ${
                        isActive ? "text-purple-600" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    {isActive && (
                      <div className="absolute inset-0 animate-spin">
                        <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
                      </div>
                    )}
                    {isCompleted && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        isActive ? "text-purple-900" : isCompleted ? "text-green-900" : "text-gray-600"
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        isActive ? "text-purple-700" : isCompleted ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {!isGenerating && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Ebook généré avec succès !</span>
              </div>
              <p className="text-green-700 mt-1">
                Votre ebook "{generatedContent.title}" est prêt. Redirection vers l'aperçu...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fun Facts */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Le saviez-vous ?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>• L'IA analyse plus de 1000 paramètres pour créer votre histoire</div>
            <div>• Chaque ebook généré est unique et original</div>
            <div>• L'IA s'adapte automatiquement à votre public cible</div>
            <div>• Le contenu est optimisé pour une lecture fluide</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}