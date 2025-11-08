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
  const [selectedStyle, setSelectedStyle] = useState("general")
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [lastAppliedAction, setLastAppliedAction] = useState<string>("")
  const [recommendation, setRecommendation] = useState<{msg: string; suggest?: string} | null>(null)

  // Styles d'écriture disponibles
  const writingStyles = [
    { value: "general", label: "🌐 Général", description: "Style équilibré et polyvalent" },
    { value: "academic", label: "🎓 Académique", description: "Style formel et scientifique" },
    { value: "creative", label: "🎨 Créatif", description: "Style littéraire et imaginatif" },
    { value: "professional", label: "💼 Professionnel", description: "Style d'entreprise et formel" },
    { value: "casual", label: "😊 Décontracté", description: "Style informel et amical" },
    { value: "storytelling", label: "📖 Narratif", description: "Style conteur d'histoires" },
    { value: "poetic", label: "✨ Poétique", description: "Style littéraire et élégant" },
    { value: "journalistic", label: "📰 Journalistique", description: "Style factuel et objectif" },
    { value: "technical", label: "🔧 Technique", description: "Style précis et spécialisé" },
    { value: "persuasive", label: "🎯 Persuasif", description: "Style convaincant et argumentatif" },
    { value: "educational", label: "🏫 Pédagogique", description: "Style didactique et clair" },
    { value: "historical", label: "🏛️ Historique", description: "Style documenté et chronologique" },
    { value: "fantasy", label: "🧙 Fantaisie", description: "Style merveilleux et épique" },
    { value: "scifi", label: "🚀 Science-Fiction", description: "Style futuriste et technologique" },
    { value: "romantic", label: "❤️ Romantique", description: "Style émotionnel et sensible" },
    { value: "humor", label: "😂 Humoristique", description: "Style léger et amusant" },
    { value: "mystery", label: "🕵️ Mystère", description: "Style suspense et intrigue" },
    { value: "philosophical", label: "🧐 Philosophique", description: "Style réflexif et profond" }
  ]

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
  const processWithAI = async (action: string, text: string, style: string): Promise<string> => {
    console.log('🚀 Calling AI API:', { action, style, textLength: text.length, desiredPages: textData.desiredPages });
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, style, desiredPages: textData.desiredPages })
      });

      console.log('📡 API Response status:', response.status);

      const data = await response.json();
      console.log('📦 API Response data:', { 
        success: data.success, 
        hasProcessedText: !!data.processedText,
        processedTextLength: data.processedText?.length || 0,
        error: data.error
      });
      
      if (!response.ok) {
        console.error('❌ API returned error:', data.error);
        
        // ✅ Message d'erreur explicite pour la clé API
        if (data.error?.includes('not found') || data.error?.includes('404')) {
          throw new Error('❌ CLÉ API INVALIDE : Obtenez votre clé gratuite sur https://makersuite.google.com/app/apikey et configurez-la dans .env.local');
        }
        
        throw new Error(data.error || 'Erreur API');
      }

      if (!data.processedText || data.processedText.trim().length < 10) {
        console.error('❌ API returned empty or too short text');
        throw new Error('L\'IA n\'a pas retourné de contenu valide');
      }

      console.log('✅ AI processing successful');
      console.log('📄 Preview:', data.processedText.substring(0, 200) + '...');

      return data.processedText;
    } catch (error: any) {
      console.error('❌ Erreur AI processing:', error);
      console.error('Stack:', error.stack);
      
      // ✅ CORRECTION: Ne plus utiliser de fallback silencieux
      // Propager l'erreur pour que l'utilisateur sache qu'il y a un problème
      throw new Error(`Erreur IA: ${error.message}. Vérifiez votre connexion et votre clé API Google Gemini.`);
    }
  }

  // Fonction pour traiter le texte avec l'IA
  const handleAIAction = async () => {
    if (!selectedAction) {
      setError("Veuillez sélectionner une action")
      return
    }

    if (currentText.trim().length < 10) {
      setError("Le texte est trop court (minimum 10 caractères)")
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")

    try {
      console.log('🎯 Starting AI action:', selectedAction, 'with style:', selectedStyle);
      const processedText = await processWithAI(selectedAction, currentText, selectedStyle)
      
      console.log('✅ AI action completed, text length:', processedText.length);
      
      // ✅ VALIDATION: Vérifier que le texte transformé est différent et valide
      if (processedText === currentText) {
        console.warn('⚠️ Processed text is identical to original');
        setError("L'IA n'a pas transformé le texte. Veuillez réessayer avec une autre action.")
        return
      }

      if (processedText.includes('[Texte amélioré par l\'IA') || 
          processedText.includes('[Texte raccourci par l\'IA') ||
          processedText.includes('[Développements supplémentaires')) {
        console.error('❌ Detected fallback placeholder in response');
        setError("L'IA n'a pas réussi à traiter le texte. Vérifiez votre clé API Google Gemini.")
        return
      }
      
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
      setSuccess(`✅ Action "${newEntry.action}" appliquée avec succès ! Le texte a été transformé.`)
      setLastAppliedAction(selectedAction)
      
      console.log('🎉 AI action successful, history updated');
      
    } catch (err: any) {
      console.error('❌ Error in handleAIAction:', err);
      setError(err.message || "Erreur lors du traitement IA. Vérifiez votre clé API Google Gemini.")
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

  // Heuristiques simples pour conseiller une meilleure action si besoin
  useEffect(() => {
    const words = currentText.trim().split(/\s+/).filter(Boolean).length
    const sentences = currentText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentence = sentences.length ? Math.round(sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / sentences.length) : 0
    let rec: {msg: string; suggest?: string} | null = null
    if (selectedAction === 'shorten' && words < 800) {
      rec = { msg: 'Texte déjà court : privilégiez "Améliorer", "Simplifier" ou "Corriger" pour un meilleur résultat.', suggest: 'improve' }
    } else if (selectedAction === 'expand' && words > 3000) {
      rec = { msg: 'Texte très long : pensez à "Raccourcir" ou "Simplifier" selon votre objectif.', suggest: 'shorten' }
    } else if (selectedAction === 'simplify' && avgSentence <= 10) {
      rec = { msg: 'Le texte est déjà simple : "Améliorer" ou "Corriger" pourraient mieux convenir.', suggest: 'improve' }
    } else if (selectedAction === 'correct' && words < 150 && avgSentence < 10) {
      rec = { msg: 'Texte court et simple : si vous souhaitez changer le style, utilisez "Reformuler".', suggest: 'reformulate' }
    } else {
      rec = null
    }
    setRecommendation(rec)
  }, [selectedAction, currentText])

  // Fonction pour passer à l'étape suivante (applique l'action sélectionnée si non appliquée)
  const handleNext = async () => {
    setError("")
    
    // ✅ CORRECTION BUG: S'assurer qu'on a toujours du contenu
    let finalText = currentText
    
    // Si une action est sélectionnée mais pas encore appliquée, l'appliquer automatiquement
    if (selectedAction && selectedAction !== lastAppliedAction) {
      try {
        setIsProcessing(true)
        const processedText = await processWithAI(selectedAction, currentText, selectedStyle)
        finalText = processedText
        setCurrentText(processedText)
        setHistory(prev => [...prev, {
          id: Date.now().toString(),
          timestamp: new Date(),
          action: aiActions.find(a => a.value === selectedAction)?.label || selectedAction,
          content: processedText,
          preview: processedText.substring(0, 150) + '...'
        }])
        setLastAppliedAction(selectedAction)
      } catch (e) {
        setError('Erreur lors de l\'application automatique de l\'action IA')
        // En cas d'erreur, utiliser le texte actuel
        finalText = currentText
      } finally {
        setIsProcessing(false)
      }
    }

    // ✅ VALIDATION FINALE: Vérifier qu'on a du contenu
    if (!finalText || finalText.trim().length < 10) {
      setError("❌ Le texte est vide ou trop court. Impossible de continuer.")
      return
    }

    console.log('✅ Texte final pour export:', {
      length: finalText.length,
      wordCount: finalText.split(/\s+/).length,
      preview: finalText.substring(0, 200) + '...'
    })

    onNext({ processedText: finalText, history })
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
                <Label>Style d'écriture</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un style" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {writingStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center space-x-2">
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

              {recommendation && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                  💡 {recommendation.msg}
                  {recommendation.suggest && (
                    <button
                      className="ml-2 underline hover:no-underline"
                      onClick={() => setSelectedAction(recommendation.suggest!)}
                    >
                      Utiliser "{aiActions.find(a=>a.value===recommendation.suggest)?.label}"
                    </button>
                  )}
                </div>
              )}

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