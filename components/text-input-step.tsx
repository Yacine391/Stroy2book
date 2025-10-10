"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, FileType, Languages, Scissors, Wand2, BarChart2 } from "lucide-react"
import { analyzeWritingStyle, autoSplitChapters, cleanText, detectLanguage, extractTextFromFile } from "@/lib/text-tools"

interface TextInputStepProps {
  initialText?: string
  onChange: (text: string) => void
}

export default function TextInputStep({ initialText = "", onChange }: TextInputStepProps) {
  const [text, setText] = useState(initialText)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  const [detectConfidence, setDetectConfidence] = useState<number | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [chaptersPreview, setChaptersPreview] = useState<{ title: string; words: number }[]>([])
  const [style, setStyle] = useState<ReturnType<typeof analyzeWritingStyle> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onChange(text)
  }, [text, onChange])

  const handleImportClick = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    try {
      const content = await extractTextFromFile(file)
      setText((prev) => (prev ? prev + "\n\n" : "") + content)
    } catch (e: any) {
      alert(e?.message || "Impossible de lire ce fichier.")
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return
    const file = files[0]
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !["txt", "docx", "pdf"].includes(ext)) {
      alert("Formats supportés: .txt, .docx, .pdf")
      return
    }
    void handleFile(file)
  }

  const handleDetect = async () => {
    setIsDetecting(true)
    const res = await detectLanguage(text)
    setIsDetecting(false)
    if (res) {
      setDetectedLang(`${res.name} (${res.iso6393})`)
      setDetectConfidence(Number((res.confidence * 100).toFixed(1)))
    } else {
      setDetectedLang("Indéterminé")
      setDetectConfidence(null)
    }
  }

  const handleClean = () => {
    setText((t) => cleanText(t))
  }

  const handleSplitChapters = () => {
    const ch = autoSplitChapters(text)
    setChaptersPreview(ch.map((c) => ({ title: c.title || `Chapitre ${c.index}`, words: c.content.split(/\s+/).length })))
  }

  const handleAnalyzeStyle = () => {
    const lang = detectedLang?.toLowerCase().startsWith("fr") ? "fr" : detectedLang?.toLowerCase().startsWith("en") ? "en" : null
    const analysis = analyzeWritingStyle(text, lang)
    setStyle(analysis)
  }

  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text])

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <span>Étape 1 — Saisie du texte</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Votre texte</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Saisissez ou importez votre texte..."
              rows={12}
              className="text-sm"
            />
            <div className="text-xs text-gray-500">{words} mots</div>
          </div>
          <div className="space-y-3">
            <Label>Importer un fichier</Label>
            <input ref={inputRef} type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <Button variant="outline" className="w-full flex items-center space-x-2" onClick={handleImportClick}>
              <Upload className="h-4 w-4" />
              <span>Importer (.txt, .docx, .pdf)</span>
            </Button>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full flex items-center space-x-2" onClick={handleDetect} disabled={isDetecting || !text.trim()}>
                <Languages className="h-4 w-4" />
                <span>{isDetecting ? "Détection en cours..." : "Détecter la langue"}</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center space-x-2" onClick={handleClean} disabled={!text.trim()}>
                <Wand2 className="h-4 w-4" />
                <span>Nettoyer le texte</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center space-x-2" onClick={handleSplitChapters} disabled={!text.trim()}>
                <Scissors className="h-4 w-4" />
                <span>Découper en chapitres</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center space-x-2" onClick={handleAnalyzeStyle} disabled={!text.trim()}>
                <BarChart2 className="h-4 w-4" />
                <span>Analyser le style</span>
              </Button>
            </div>
          </div>
        </div>

        {(detectedLang || style || chaptersPreview.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded border bg-white">
              <div className="text-sm font-semibold mb-1">Langue détectée</div>
              <div className="text-sm text-gray-700">{detectedLang || '—'}</div>
              {detectConfidence != null && (
                <div className="text-xs text-gray-500">Confiance: {detectConfidence}%</div>
              )}
            </div>
            <div className="p-3 rounded border bg-white md:col-span-2">
              <div className="text-sm font-semibold mb-2">Analyse de style</div>
              {!style ? (
                <div className="text-sm text-gray-500">Aucune analyse effectuée.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>• Mots: <strong>{style.wordCount}</strong></div>
                  <div>• Phrases: <strong>{style.sentenceCount}</strong></div>
                  <div>• Mots/phrase: <strong>{style.avgSentenceLength}</strong></div>
                  <div>• Ratio mots uniques: <strong>{style.uniqueWordRatio}</strong></div>
                  <div>• Temps de lecture: <strong>{style.estimatedReadingTimeMin} min</strong></div>
                  <div className="col-span-full">
                    <div className="text-xs text-gray-500 mb-1">Mots-clés</div>
                    <div className="flex flex-wrap gap-2">
                      {style.topKeywords.map((k) => (
                        <span key={k.word} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs border">
                          {k.word} ({k.count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {chaptersPreview.length > 0 && (
          <div className="p-3 rounded border bg-white">
            <div className="text-sm font-semibold mb-2">Chapitres détectés</div>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              {chaptersPreview.map((c, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span className="truncate pr-2">{c.title || `Chapitre ${idx + 1}`}</span>
                  <span className="text-gray-500">{c.words} mots</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
