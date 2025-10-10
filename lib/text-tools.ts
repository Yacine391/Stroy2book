// Client-safe text processing utilities for Step 1 (Saisie du texte)

export interface LanguageDetection {
  iso6393: string
  name: string
  confidence: number
}

const iso6393ToName: Record<string, string> = {
  fra: 'Français',
  eng: 'English',
  spa: 'Español',
  deu: 'Deutsch',
  ita: 'Italiano',
  por: 'Português',
  nld: 'Nederlands',
  rus: 'Русский',
  ara: 'العربية',
  tur: 'Türkçe',
  pol: 'Polski',
  ron: 'Română',
  hun: 'Magyar',
  ces: 'Čeština',
  ukr: 'Українська',
  jpn: '日本語',
  zho: '中文',
  kor: '한국어',
}

export async function detectLanguage(text: string): Promise<LanguageDetection | null> {
  try {
    if (!text || text.trim().length < 20) return null
    const { francAll } = await import('franc')
    const top = francAll(text, { minLength: 20 })?.[0]
    if (!top) return null
    const [code, confidence] = top as [string, number]
    return {
      iso6393: code,
      name: iso6393ToName[code] || code,
      confidence: confidence ?? 0,
    }
  } catch (e) {
    return null
  }
}

export function cleanText(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export interface Chapter {
  index: number
  title: string
  content: string
}

export function autoSplitChapters(text: string): Chapter[] {
  const cleaned = cleanText(text)
  if (!cleaned) return []

  const chapterRegex = /(^(?:chapitre|chapter)\s*\d+\s*[:\-]?\s*.*$)/gim
  const headingRegex = /^(?:#\s+|##\s+|###\s+)(.*)$/gm

  const delimiterMatches = [...cleaned.matchAll(chapterRegex)]
  const headingMatches = [...cleaned.matchAll(headingRegex)]

  const cuts: number[] = [0]

  if (delimiterMatches.length > 1) {
    delimiterMatches.forEach((m) => {
      if (typeof m.index === 'number') cuts.push(m.index)
    })
  } else if (headingMatches.length > 1) {
    headingMatches.forEach((m) => {
      if (typeof m.index === 'number') cuts.push(m.index)
    })
  } else {
    const words = cleaned.split(/\s+/)
    const chunk = 1200
    for (let i = chunk; i < words.length; i += chunk) {
      const slice = words.slice(0, i).join(' ')
      cuts.push(slice.length)
    }
  }

  cuts.sort((a, b) => a - b)
  const uniqueCuts = Array.from(new Set(cuts))
  const chapters: Chapter[] = []
  for (let i = 0; i < uniqueCuts.length; i++) {
    const start = uniqueCuts[i]
    const end = i + 1 < uniqueCuts.length ? uniqueCuts[i + 1] : cleaned.length
    const slice = cleaned.slice(start, end).trim()
    if (!slice) continue
    const firstLine = slice.split('\n').find((l) => l.trim().length > 0) || `Chapitre ${i + 1}`
    const title = firstLine.replace(/^(?:chapitre|chapter)\s*\d+\s*[:\-]?\s*/i, '').slice(0, 120).trim() || `Chapitre ${i + 1}`
    chapters.push({ index: chapters.length + 1, title, content: slice })
  }
  return chapters
}

export interface StyleAnalysis {
  wordCount: number
  sentenceCount: number
  avgSentenceLength: number
  uniqueWordRatio: number
  estimatedReadingTimeMin: number
  topKeywords: Array<{ word: string; count: number }>
}

const stopwordsFr = new Set([
  'le','la','les','de','des','du','un','une','et','en','dans','que','qui','au','aux','pour','par','sur','avec','sans','ne','pas','plus','ou','se','ce','cet','cette','ces','a','à','il','elle','ils','elles','on','nous','vous','je','tu','te','moi','toi','son','sa','ses','leur','leurs','est','sont','été','etre','être','d\'','l\'','qu\'','n\'','aujourd\'hui','y','vers','chez','comme','mais','donc','or','ni','car'
])
const stopwordsEn = new Set([
  'the','and','a','an','of','to','in','for','on','with','as','by','from','at','that','this','these','those','is','are','was','were','be','been','being','it','its','he','she','they','we','you','i','my','your','their','our','or','not','but'
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿA-ZÀ-ß0-9\s\-']/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function analyzeWritingStyle(text: string, langHint: string | null = null): StyleAnalysis {
  const cleaned = cleanText(text)
  const words = tokenize(cleaned)
  const wordCount = words.length
  const sentences = cleaned.split(/[\.!?]+\s+/).filter((s) => s.trim().length > 0)
  const sentenceCount = sentences.length || 1
  const avgSentenceLength = wordCount / sentenceCount
  const unique = new Set(words)
  const uniqueWordRatio = unique.size / Math.max(1, wordCount)

  const minutes = Math.max(1, Math.round(wordCount / 200))

  const lang = (langHint || '').toLowerCase()
  const sw = lang.startsWith('fr') || lang === 'fra' ? stopwordsFr : stopwordsEn
  const freq: Record<string, number> = {}
  for (const w of words) {
    if (sw.has(w) || w.length < 3) continue
    freq[w] = (freq[w] || 0) + 1
  }
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength: Number(avgSentenceLength.toFixed(2)),
    uniqueWordRatio: Number(uniqueWordRatio.toFixed(3)),
    estimatedReadingTimeMin: minutes,
    topKeywords,
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'txt') {
    const content = await file.text()
    return content
  }
  const arrayBuffer = await file.arrayBuffer()
  if (ext === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser')
    const result = await (mammoth as any).extractRawText({ arrayBuffer })
    return String(result?.value || '')
  }
  if (ext === 'pdf') {
    const pdfjsLib: any = await import('pdfjs-dist')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.js').then((m: any) => m.default || m)
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map((it: any) => ('str' in it ? it.str : it?.toString?.() || ''))
      fullText += strings.join(' ') + '\n\n'
    }
    return fullText
  }
  throw new Error('Format non supporté. Utilisez .txt, .docx ou .pdf')
}
