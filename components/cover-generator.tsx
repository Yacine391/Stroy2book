"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image as ImageIcon, Sparkles, Check } from "lucide-react"

function base64ToFile(base64Data: string, filename: string, contentType = "image/png"): File {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: contentType })
  return new File([blob], filename, { type: contentType })
}

interface CoverGeneratorProps {
  title: string
  author?: string
  hasWatermark?: boolean
  onUseAsCover: (file: File) => void
}

export default function CoverGenerator({ title, author, hasWatermark, onUseAsCover }: CoverGeneratorProps) {
  const [subtitle, setSubtitle] = useState("")
  const [style, setStyle] = useState("moderne")
  const [isLoading, setIsLoading] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

  const styles = [
    { label: "Moderne", value: "moderne minimaliste" },
    { label: "Réaliste", value: "réaliste" },
    { label: "Aquarelle", value: "aquarelle" },
    { label: "Cartoon", value: "cartoon" },
    { label: "Fantasy", value: "fantasy épique" },
    { label: "Vintage", value: "vintage" },
  ]

  const watermarkOverlay = useMemo(() => (
    hasWatermark ? (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/70 text-3xl font-semibold rotate-[-20deg]">HB Creator</div>
      </div>
    ) : null
  ), [hasWatermark])

  const generate = async () => {
    if (!title.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, author, size: "1024x1024", style }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Erreur génération image")
      const b64 = data.imageBase64 as string
      setImageDataUrl(`data:image/png;base64,${b64}`)
    } catch (e: any) {
      alert(e?.message || "Erreur lors de la génération de la couverture")
    } finally {
      setIsLoading(false)
    }
  }

  const useAsCover = () => {
    if (!imageDataUrl) return
    const file = base64ToFile(imageDataUrl.replace(/^data:image\/\w+;base64,/, ""), `${title.replace(/[^a-z0-9]/gi, "_")}_cover.png`)
    onUseAsCover(file)
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50">
        <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-5 w-5 text-purple-600" /> Création de la couverture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm">Sous-titre (optionnel)</label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sous-titre" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={isLoading || !title.trim()} className="w-full flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> {isLoading ? "Génération..." : "Générer la couverture"}
            </Button>
          </div>
        </div>

        {imageDataUrl && (
          <div className="relative w-full max-w-md">
            <img src={imageDataUrl} alt="Couverture générée" className="rounded-lg border w-full" />
            {watermarkOverlay}
            <div className="mt-3">
              <Button onClick={useAsCover} className="flex items-center gap-2"><Check className="h-4 w-4" /> Utiliser comme couverture</Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">Taille recommandée: 2048×3072. L'API retourne 1024×1024 pour prévisualisation rapide.</p>
      </CardContent>
    </Card>
  )
}
