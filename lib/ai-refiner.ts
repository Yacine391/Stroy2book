import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type RefineMode = 'ameliorer' | 'raccourcir' | 'allonger' | 'simplifier'

const openaiApiKey = process.env.OPENAI_API_KEY
const googleApiKey = process.env.GOOGLE_API_KEY || ''

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null
const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null

function buildInstruction(mode: RefineMode, languageHint?: string): string {
  const lang = (languageHint || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr'
  const labels: Record<RefineMode, { fr: string; en: string }> = {
    ameliorer: { fr: "Améliore ce texte (style, clarté, fluidité) sans changer le sens.", en: "Improve this text (style, clarity, flow) without changing the meaning." },
    raccourcir: { fr: "Raccourcis ce texte de 20-30% en gardant l'essentiel.", en: "Shorten this text by 20-30% while keeping the key points." },
    allonger: { fr: "Développe ce texte en ajoutant des détails utiles et exemples.", en: "Expand this text by adding useful details and examples." },
    simplifier: { fr: "Simplifie ce texte avec un vocabulaire accessible.", en: "Simplify this text using accessible vocabulary." },
  }
  const quality = lang === 'fr'
    ? "Reste cohérent, conserve le ton, corrige grammaire et orthographe. N'ajoute pas d'encadrés, pas de markdown, retourne uniquement le texte réécrit."
    : "Stay coherent, preserve tone, fix grammar and spelling. Do not add headers or markdown, return only the rewritten text."
  return `${labels[mode][lang]}\n${quality}`
}

export async function refineContent({ mode, text, languageHint }: { mode: RefineMode; text: string; languageHint?: string }): Promise<string> {
  if (!text || text.trim().length === 0) return text
  const instruction = buildInstruction(mode, languageHint)

  // Prefer OpenAI if available
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un éditeur professionnel francophone.' },
          { role: 'user', content: `${instruction}\n\nTEXTE:\n${text}` },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      })
      const out = completion.choices?.[0]?.message?.content?.trim() || ''
      if (out) return out
    } catch (e) {
      // fallback
    }
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${instruction}\n\nTEXTE:\n${text}` }] }],
        generationConfig: { temperature: 0.4, topK: 40, topP: 0.95, maxOutputTokens: 8192 },
      })
      const out = result.response.text().trim()
      if (out) return out
    } catch (e) {
      // swallow
    }
  }

  // If all else fails, return original text
  return text
}
