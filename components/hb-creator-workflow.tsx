"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ArrowRight, BookOpen, Sparkles } from "lucide-react"

// Import des composants d'étapes
import TextInputStep from "./text-input-step"
import AIContentGeneration from "./ai-content-generation"
import IllustrationGeneration from "./illustration-generation"
import CoverCreation from "./cover-creation"
import LayoutTemplate from "./layout-template"
import ExportFormats from "./export-formats"
import ProjectManagement from "./project-management"
import SecurityAuth from "./security-auth"

type WorkflowStep = 
  | 'welcome'
  | 'text-input'
  | 'ai-generation'
  | 'illustrations'
  | 'cover'
  | 'layout'
  | 'export'
  | 'project-management'
  | 'security'
  | 'completed'

interface WorkflowData {
  textData?: {
    text: string
    language: string
    chapters: string[]
    style: string
  }
  processedText?: {
    processedText: string
    history: any[]
  }
  illustrations?: {
    illustrations: any[]
  }
  coverData?: {
    coverData: any
  }
  layoutSettings?: {
    layoutSettings: any
  }
  exportedFiles?: {
    exportedFiles: any[]
  }
  savedProject?: {
    savedProject: any
  }
  userAuth?: {
    user: any
    subscription: any
  }
}

export default function HBCreatorWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('welcome')
  const [workflowData, setWorkflowData] = useState<WorkflowData>({})

  // Configuration des étapes
  const steps = [
    { id: 'welcome', title: 'Bienvenue', description: 'Introduction à HB Creator' },
    { id: 'text-input', title: 'Saisie du texte', description: 'Import et analyse du contenu' },
    { id: 'ai-generation', title: 'Génération IA', description: 'Amélioration du contenu' },
    { id: 'illustrations', title: 'Illustrations', description: 'Génération d\'images IA' },
    { id: 'cover', title: 'Couverture', description: 'Création de la couverture' },
    { id: 'layout', title: 'Mise en page', description: 'Templates et typographie' },
    { id: 'export', title: 'Export', description: 'Génération des fichiers' },
    { id: 'project-management', title: 'Projets', description: 'Sauvegarde et gestion' },
    { id: 'security', title: 'Sécurité', description: 'Authentification et limites' },
    { id: 'completed', title: 'Terminé', description: 'Workflow complété' }
  ]

  // Fonction pour obtenir l'index de l'étape actuelle
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  // Fonction pour calculer le pourcentage de progression
  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex()
    return ((currentIndex + 1) / steps.length) * 100
  }

  // Fonctions de navigation entre les étapes
  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step)
  }

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as WorkflowStep)
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as WorkflowStep)
    }
  }

  // Handlers pour chaque étape
  const handleTextInputComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, textData: data }))
    goToNextStep()
  }

  const handleAIGenerationComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, processedText: data }))
    goToNextStep()
  }

  const handleIllustrationsComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, illustrations: data }))
    goToNextStep()
  }

  const handleCoverComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, coverData: data }))
    goToNextStep()
  }

  const handleLayoutComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, layoutSettings: data }))
    goToNextStep()
  }

  const handleExportComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, exportedFiles: data }))
    goToNextStep()
  }

  const handleProjectManagementComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, savedProject: data }))
    goToNextStep()
  }

  const handleSecurityComplete = (data: any) => {
    setWorkflowData(prev => ({ ...prev, userAuth: data }))
    goToNextStep()
  }

  // Composant de navigation des étapes
  const StepNavigation = () => (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">HB Creator</h1>
          </div>
          <div className="text-sm text-gray-600">
            Étape {getCurrentStepIndex() + 1} sur {steps.length}
          </div>
        </div>

        <div className="mb-4">
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const isCompleted = index < getCurrentStepIndex()
            const isCurrent = step.id === currentStep
            const isAccessible = index <= getCurrentStepIndex()

            return (
              <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => isAccessible && goToStep(step.id as WorkflowStep)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isCurrent
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : isCompleted
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : isAccessible
                      ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // Page d'accueil
  const WelcomePage = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse" />
          <div className="relative bg-white rounded-full p-6">
            <BookOpen className="h-16 w-16 text-purple-600" />
          </div>
        </div>
      </div>

      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Bienvenue dans HB Creator
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Créez des ebooks professionnels en 8 étapes simples. Notre IA vous accompagne 
        de la rédaction à la publication, en passant par les illustrations et la mise en page.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: "📝", title: "Saisie du texte", desc: "Importez ou rédigez votre contenu" },
          { icon: "🤖", title: "IA avancée", desc: "Améliorez avec l'intelligence artificielle" },
          { icon: "🎨", title: "Illustrations", desc: "Générez des images uniques" },
          { icon: "📚", title: "Export pro", desc: "PDF, EPUB, DOCX de qualité" }
        ].map((feature, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          onClick={goToNextStep}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Commencer la création
        </Button>
        
        <p className="text-sm text-gray-500">
          Processus guidé étape par étape • Sauvegarde automatique • Support complet
        </p>
      </div>
    </div>
  )

  // Page de fin
  const CompletedPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse" />
          <div className="relative bg-white rounded-full p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        🎉 Félicitations !
      </h1>
      
      <p className="text-xl text-gray-600 mb-8">
        Votre ebook a été créé avec succès. Vous pouvez maintenant le télécharger, 
        le partager ou créer un nouveau projet.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📖</div>
            <h3 className="font-semibold mb-2">Ebook créé</h3>
            <p className="text-sm text-gray-600">
              {workflowData.exportedFiles?.exportedFiles?.length || 0} format(s) exporté(s)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">💾</div>
            <h3 className="font-semibold mb-2">Projet sauvegardé</h3>
            <p className="text-sm text-gray-600">
              Accessible dans votre bibliothèque
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold mb-2">Compte configuré</h3>
            <p className="text-sm text-gray-600">
              Plan {workflowData.userAuth?.subscription?.plan || 'gratuit'} activé
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-x-4">
        <Button
          onClick={() => goToStep('welcome')}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Créer un nouvel ebook
        </Button>
        
        <Button
          onClick={() => goToStep('project-management')}
          variant="outline"
          size="lg"
        >
          Voir mes projets
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <StepNavigation />
      
      <main>
        {currentStep === 'welcome' && <WelcomePage />}
        
        {currentStep === 'text-input' && (
          <TextInputStep
            onNext={handleTextInputComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'ai-generation' && workflowData.textData && (
          <AIContentGeneration
            textData={workflowData.textData}
            onNext={handleAIGenerationComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'illustrations' && workflowData.processedText && (
          <IllustrationGeneration
            textData={workflowData.processedText}
            onNext={handleIllustrationsComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'cover' && workflowData.illustrations && (
          <CoverCreation
            illustrations={workflowData.illustrations.illustrations}
            onNext={handleCoverComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'layout' && workflowData.coverData && workflowData.processedText && (
          <LayoutTemplate
            coverData={workflowData.coverData.coverData}
            processedText={workflowData.processedText.processedText}
            onNext={handleLayoutComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'export' && workflowData.layoutSettings && workflowData.coverData && workflowData.processedText && workflowData.illustrations && (
          <ExportFormats
            layoutSettings={workflowData.layoutSettings.layoutSettings}
            coverData={workflowData.coverData.coverData}
            processedText={workflowData.processedText.processedText}
            illustrations={workflowData.illustrations.illustrations}
            onNext={handleExportComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'project-management' && workflowData.exportedFiles && workflowData.processedText && workflowData.illustrations && workflowData.coverData && workflowData.layoutSettings && (
          <ProjectManagement
            exportedFiles={workflowData.exportedFiles.exportedFiles}
            projectData={{
              title: workflowData.coverData.coverData.title,
              author: workflowData.coverData.coverData.author,
              processedText: workflowData.processedText.processedText,
              illustrations: workflowData.illustrations.illustrations,
              coverData: workflowData.coverData.coverData,
              layoutSettings: workflowData.layoutSettings.layoutSettings
            }}
            onNext={handleProjectManagementComplete}
            onBack={goToPreviousStep}
          />
        )}
        
        {currentStep === 'security' && (
          <SecurityAuth
            onComplete={handleSecurityComplete}
          />
        )}
        
        {currentStep === 'completed' && <CompletedPage />}
      </main>
    </div>
  )
}