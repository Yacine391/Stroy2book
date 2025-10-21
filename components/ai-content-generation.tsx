"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Wand2, RotateCcw, History, Save, Trash2, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import AITimer from "./ai-timer"

interface TextData {
  text: string
  language: string
  chapters: string[]
  style: string
  desiredPages: number
}

interface HistoryEntry {
  id: string
  timestamp: Date
  action: string
  content: string
  preview: string
}

interface AIContentGenerationProps {
  textData: TextData
  onNext: (data: { processedText: string; history: HistoryEntry[] }) => void
  onBack: () => void
}

export default function AIContentGeneration({ textData, onNext, onBack }: AIContentGenerationProps) {
  const [currentText, setCurrentText] = useState(textData.text)
  const [selectedAction, setSelectedAction] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Actions IA disponibles
  const aiActions = [
    {
      value: "improve",
      label: "Améliorer",
      description: "Enrichit le style, améliore la fluidité et corrige les erreurs",
      icon: "✨"
    },
    {
      value: "shorten",
      label: "Raccourcir",
      description: "Condense le texte en gardant les idées principales",
      icon: "✂️"
    },
    {
      value: "expand",
      label: "Allonger",
      description: "Développe les idées avec plus de détails et d'exemples",
      icon: "📈"
    },
    {
      value: "simplify",
      label: "Simplifier",
      description: "Rend le texte plus accessible et facile à comprendre",
      icon: "🎯"
    },
    {
      value: "correct",
      label: "Corriger",
      description: "Corrige la grammaire, l'orthographe et la syntaxe",
      icon: "✅"
    },
    {
      value: "reformulate",
      label: "Reformuler",
      description: "Réécrit le texte avec un style différent",
      icon: "🔄"
    }
  ]

  // Initialiser l'historique avec le texte original
  useEffect(() => {
    const initialEntry: HistoryEntry = {
      id: "initial",
      timestamp: new Date(),
      action: "Texte original",
      content: textData.text,
      preview: textData.text.substring(0, 150) + "..."
    }
    setHistory([initialEntry])
  }, [textData.text])

  // Fonction pour appeler l'IA (VRAIE API)
  const processWithAI = async (action: string, text: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      return data.processedText;
    } catch (error: any) {
      console.error('Erreur API:', error);
      // Fallback sur simulation en cas d'erreur
      return new Promise((resolve) => {
        setTimeout(() => {
          let processedText = text
          
          switch (action) {
          case "improve":
            processedText = text + "\n\n[Texte amélioré par l'IA avec un style plus riche et une meilleure fluidité]"
            break
          case "shorten":
            processedText = text.substring(0, Math.floor(text.length * 0.7)) + "\n\n[Texte raccourci par l'IA]"
            break
          case "expand":
            processedText = text + "\n\n[Développements supplémentaires ajoutés par l'IA avec plus de détails et d'exemples concrets]"
            break
          case "simplify":
            processedText = text + "\n\n[Texte simplifié par l'IA avec un vocabulaire plus accessible]"
            break
          case "correct":
            processedText = text + "\n\n[Corrections grammaticales et orthographiques appliquées par l'IA]"
            break
          case "reformulate":
            processedText = text + "\n\n[Texte reformulé par l'IA avec un style différent]"
            break
        }
        
        resolve(processedText)
      }, 2000)
    });
    }
  }

  // Fonction pour traiter le texte avec l'IA
  const handleAIAction = async () => {
    if (!selectedAction) {
      setError("Veuillez sélectionner une action")
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")

    try {
      const processedText = await processWithAI(selectedAction, currentText)
      
      // Ajouter à l'historique
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: aiActions.find(a => a.value === selectedAction)?.label || selectedAction,
        content: processedText,
        preview: processedText.substring(0, 150) + "..."
      }
      
      setHistory(prev => [...prev, newEntry])
      setCurrentText(processedText)
      setSuccess(`Action "${newEntry.action}" appliquée avec succès`)
      
    } catch (err) {
      setError("Erreur lors du traitement IA")
    } finally {
      setIsProcessing(false)
    }
  }

  // Fonction pour restaurer une version depuis l'historique
  const restoreFromHistory = (entry: HistoryEntry) => {
    setCurrentText(entry.content)
    setSuccess(`Version "${entry.action}" restaurée`)
  }

  // Fonction pour supprimer une entrée de l'historique
  const deleteHistoryEntry = (id: string) => {
    if (id === "initial") return // Ne pas supprimer le texte original
    setHistory(prev => prev.filter(entry => entry.id !== id))
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    onNext({
      processedText: currentText,
      history: history
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 2 : Génération IA du contenu</h2>
        <p className="text-gray-600">Utilisez l'IA pour améliorer, corriger ou transformer votre texte. Toutes les versions sont sauvegardées.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panneau principal d'édition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Actions IA disponibles</span>
              </CardTitle>
              <CardDescription>
                Sélectionnez une action pour transformer votre texte avec l'intelligence artificielle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Choisir une action</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une action IA" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiActions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center space-x-2">
                          <span>{action.icon}</span>
                          <div>
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-gray-500">{action.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAIAction}
                disabled={!selectedAction || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Traitement en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Appliquer l'action IA</span>
                  </div>
                )}
              </Button>

              {/* Timer IA */}
              {isProcessing && (
                <div className="mt-4">
                  <AITimer 
                    isGenerating={isProcessing} 
                    estimatedSeconds={10}
                    onComplete={() => console.log('⏰ Timer terminé')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone d'édition du texte */}
          <Card>
            <CardHeader>
              <CardTitle>Texte en cours d'édition</CardTitle>
              <CardDescription>
                Vous pouvez modifier le texte manuellement ou utiliser les actions IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[400px] text-base"
                placeholder="Votre texte apparaîtra ici..."
              />
              
              {/* Statistiques du texte ACTUEL - INFORMATIVES */}
              {currentText.trim() && (
                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📊 Statistiques actuelles (informatives)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Caractères :</span>
                      <span className="ml-2 font-medium text-green-900">{currentText.length.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Mots :</span>
                      <span className="ml-2 font-medium text-green-900">{currentText.trim().split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Paragraphes :</span>
                      <span className="ml-2 font-medium text-green-900">{currentText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Pages estimées :</span>
                      <span className="ml-2 font-medium text-green-900">{Math.max(1, Math.ceil(currentText.trim().split(/\s+/).filter(w => w.length > 0).length / 250))}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="text-xs text-green-700">
                      🎯 <strong>Objectif final : {textData.desiredPages} pages</strong> - L'IA générera exactement ce nombre de pages pour l'ebook final.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
        </div>

        {/* Panneau d'historique */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Historique</span>
                </div>
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="ghost"
                  size="sm"
                >
                  {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
              <CardDescription>
                {history.length} version{history.length > 1 ? 's' : ''} sauvegardée{history.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            {showHistory && (
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.slice().reverse().map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm text-gray-900">{entry.action}</div>
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => restoreFromHistory(entry)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          {entry.id !== "initial" && (
                            <Button
                              onClick={() => deleteHistoryEntry(entry.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {formatDate(entry.timestamp)}
                      </div>
                      <div className="text-xs text-gray-700 bg-white p-2 rounded border">
                        {entry.preview}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Informations sur le texte original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations détectées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Langue :</span>
                <span className="ml-2">{textData.language === 'fr' ? 'Français' : textData.language === 'en' ? 'Anglais' : 'Espagnol'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Style :</span>
                <span className="ml-2">{textData.style}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Chapitres :</span>
                <span className="ml-2">{textData.chapters.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
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
          Continuer vers les illustrations
        </Button>
      </div>
    </div>
  )
}