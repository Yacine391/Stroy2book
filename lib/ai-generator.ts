import { GoogleGenerativeAI } from '@google/generative-ai'

interface FormData {
  idea: string
  author: string
  genre: string
  targetAudience: string
  length: string
}

interface GeneratedContent {
  title: string
  author: string
  content: string
  coverDescription: string
}

// Initialiser Google Gemini avec la clé API
const apiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateEbook(formData: FormData): Promise<GeneratedContent> {
  try {
    // Construire le prompt en fonction des paramètres
    const lengthMap = {
      court: "5-10 pages (environ 2000-3000 mots)",
      moyen: "15-25 pages (environ 5000-7000 mots)",
      long: "30-50 pages (environ 10000-15000 mots)",
    }

    const targetLength = lengthMap[formData.length as keyof typeof lengthMap] || lengthMap.court

    // Instructions spécifiques selon le genre
    const getGenreSpecificInstructions = (genre: string, idea: string): string => {
      if (genre === 'historique') {
        return `
INSTRUCTIONS SPÉCIFIQUES POUR LE GENRE HISTORIQUE :
- Tu es maintenant un HISTORIEN EXPERT qui doit présenter des FAITS HISTORIQUES RÉELS
- Base-toi UNIQUEMENT sur des événements, personnages et dates historiques AUTHENTIQUES
- Cite des DATES PRÉCISES, des LIEUX RÉELS, des PERSONNAGES HISTORIQUES AVÉRÉS
- Inclus des SOURCES et des RÉFÉRENCES historiques quand c'est pertinent
- Respecte la CHRONOLOGIE HISTORIQUE exacte
- Mentionne les CAUSES et CONSÉQUENCES réelles des événements
- Évite toute FICTION ou INVENTION - tout doit être historiquement vérifié
- Structure chronologique avec des périodes historiques clairement définies
- Inclus des DATES importantes dans les titres de chapitres
- Ajoute des CONTEXTES géopolitiques, sociaux et culturels de l'époque
- Mentionne les SOURCES PRIMAIRES et SECONDAIRES quand possible

Exemple de structure pour l'histoire :
# Chapitre 1 : Les Origines (dates précises)
# Chapitre 2 : Les Événements Majeurs (dates précises) 
# Chapitre 3 : Les Conséquences (dates précises)

IMPORTANT : Si c'est l'histoire d'un pays, d'une personne ou d'un événement spécifique, respecte scrupuleusement les faits historiques établis.`
      }
      
      return `
INSTRUCTIONS SPÉCIFIQUES POUR LE GENRE ${genre.toUpperCase()} :
- Crée un contenu original, créatif et engageant
- Développe une vraie histoire avec un début, un milieu et une fin
- Assure-toi que l'histoire soit cohérente et captivante du début à la fin
- Inclus des descriptions détaillées pour immerger le lecteur
- Crée des personnages avec des noms, des personnalités et des motivations claires
- Utilise des dialogues pour rendre l'histoire vivante`
    }

    const genreInstructions = getGenreSpecificInstructions(formData.genre, formData.idea)

    const prompt = `Tu es un écrivain professionnel français expert en création d'ebooks. Crée un ebook complet et captivant basé sur cette idée :

IDÉE PRINCIPALE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR SOUHAITÉE : ${targetLength}
AUTEUR : ${formData.author || "Auteur IA"}

${genreInstructions}

Génère un ebook complet et professionnel avec :

1. UN TITRE ACCROCHEUR (maximum 60 caractères)
2. LE CONTENU COMPLET DE L'EBOOK avec :
   - Une introduction engageante et immersive
   - Au moins 5-8 chapitres bien structurés et développés
   ${formData.genre === 'historique' ? '- Des faits historiques précis avec dates et contextes' : '- Des dialogues naturels et des descriptions vivantes'}
   ${formData.genre === 'historique' ? '- Des références et sources historiques' : '- Des personnages attachants et bien développés'}
   - Des transitions fluides entre les chapitres
   ${formData.genre === 'historique' ? '- Une chronologie historique respectée' : '- Une intrigue captivante avec des rebondissements'}
   - Une conclusion satisfaisante et émotionnelle
   - Un style d'écriture adapté au public cible
3. UNE DESCRIPTION DE COUVERTURE (pour génération d'image)

INSTRUCTIONS IMPORTANTES :
- Écris entièrement en français
- Adapte le vocabulaire et le style au public cible spécifié
- Structure le texte avec des chapitres numérotés et titrés (format: # Chapitre X : Titre)
${formData.genre === 'historique' ? '- RESPECTE SCRUPULEUSEMENT LES FAITS HISTORIQUES - Pas de fiction !' : '- Développe une vraie histoire avec un début, un milieu et une fin'}
- Assure-toi que le contenu soit cohérent et captivant du début à la fin

Format de réponse EXACT (respecte absolument ce format) :
TITRE: [titre ici]
AUTEUR: ${formData.author || "Auteur IA"}
DESCRIPTION_COUVERTURE: [description détaillée pour image de couverture]
CONTENU:
[contenu complet de l'ebook ici avec chapitres formatés]

IMPORTANT : Génère un contenu substantiel et de qualité professionnelle qui correspond à la longueur demandée.`

    // Utiliser le modèle Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Générer le contenu avec Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: formData.genre === 'historique' ? 0.3 : 0.9, // Moins de créativité pour l'histoire factuelle
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const response = result.response
    const generatedText = response.text()

    // Parser la réponse selon le format attendu
    const parsed = parseGeneratedContent(generatedText, formData.author)
    
    return parsed

  } catch (error) {
    console.error("Erreur lors de la génération avec Gemini:", error)

    // Contenu de fallback en cas d'erreur
    return {
      title: generateFallbackTitle(formData.idea),
      author: formData.author || "Auteur IA",
      content: generateFallbackContent(formData),
      coverDescription: generateFallbackCoverDescription(formData),
    }
  }
}

// Fonction pour parser le contenu généré par Gemini
function parseGeneratedContent(text: string, authorName: string): GeneratedContent {
  try {
    // Extraire le titre
    const titleMatch = text.match(/TITRE:\s*(.+)/i)
    const title = titleMatch ? titleMatch[1].trim() : "Mon Ebook Généré"

    // Extraire l'auteur
    const authorMatch = text.match(/AUTEUR:\s*(.+)/i)
    const author = authorMatch ? authorMatch[1].trim() : (authorName || "Auteur IA")

    // Extraire la description de couverture
    const coverMatch = text.match(/DESCRIPTION_COUVERTURE:\s*(.+)/i)
    const coverDescription = coverMatch ? coverMatch[1].trim() : "Couverture élégante et moderne"

    // Extraire le contenu
    const contentMatch = text.match(/CONTENU:\s*([\s\S]+)/i)
    let content = contentMatch ? contentMatch[1].trim() : text

    // Nettoyer le contenu
    content = content
      .replace(/TITRE:.*?\n/gi, '')
      .replace(/AUTEUR:.*?\n/gi, '')
      .replace(/DESCRIPTION_COUVERTURE:.*?\n/gi, '')
      .replace(/CONTENU:\s*/gi, '')
      .trim()

    // S'assurer que le contenu a une structure minimale
    if (!content.includes('# Chapitre') && !content.includes('#Chapitre')) {
      content = `# Chapitre 1 : Le Commencement

${content}

# Chapitre 2 : La Suite de l'Aventure

L'histoire continue avec de nouveaux développements passionnants...

# Conclusion

Et c'est ainsi que se termine cette aventure extraordinaire.`
    }

    return {
      title: title.substring(0, 100), // Limiter la longueur du titre
      author,
      content,
      coverDescription,
    }
  } catch (error) {
    console.error("Erreur lors du parsing:", error)
    
    // Retourner le texte brut si le parsing échoue
    return {
      title: "Mon Ebook Généré",
      author: authorName || "Auteur IA",
      content: text || "Contenu généré par l'IA...",
      coverDescription: "Couverture moderne et élégante",
    }
  }
}

// Fonctions de fallback en cas d'erreur
function generateFallbackTitle(idea: string): string {
  const keywords = idea.split(' ').slice(0, 3).join(' ')
  return `L'Histoire de ${keywords}`.substring(0, 60)
}

function generateFallbackContent(formData: FormData): string {
  return `# Chapitre 1 : Le Commencement

Basé sur votre idée : "${formData.idea}"

Cette histoire commence dans un monde où tout est possible. Notre protagoniste, guidé par ${formData.genre ? `l'esprit du ${formData.genre}` : 'sa curiosité'}, s'apprête à vivre une aventure extraordinaire.

## L'Aventure Commence

L'intrigue se développe autour de votre concept initial, créant une narration captivante et immersive.

# Chapitre 2 : Le Développement

L'histoire prend forme et les personnages évoluent dans cet univers que vous avez imaginé.

Les événements s'enchaînent de manière fluide, créant une progression narrative naturelle et engageante.

# Chapitre 3 : L'Apogée

Le point culminant de l'histoire arrive, où tous les éléments se rejoignent pour créer un moment intense et mémorable.

# Conclusion

Cette aventure touche à sa fin, laissant le lecteur avec une sensation de satisfaction et d'accomplissement.

L'histoire que vous aviez en tête a pris vie grâce à la magie de l'écriture automatisée.

---

*Ebook généré avec Story2book AI*`
}

function generateFallbackCoverDescription(formData: FormData): string {
  return `Couverture élégante pour un ebook ${formData.genre ? `de ${formData.genre}` : 'original'}, style moderne avec des éléments visuels captivants, adapté au public ${formData.targetAudience || 'général'}, atmosphère immersive et professionnelle.`
}