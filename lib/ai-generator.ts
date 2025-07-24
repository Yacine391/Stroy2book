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
    // Construire le prompt en fonction des paramètres avec des longueurs beaucoup plus importantes
    const lengthMap = {
      court: "15-25 pages (environ 5000-8000 mots) - Chaque chapitre doit faire au minimum 800-1200 mots",
      moyen: "35-50 pages (environ 12000-18000 mots) - Chaque chapitre doit faire au minimum 1500-2000 mots", 
      long: "60-100 pages (environ 25000-35000 mots) - Chaque chapitre doit faire au minimum 2500-3500 mots",
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

DÉVELOPPEMENT APPROFONDI REQUIS :
- Chaque chapitre doit être extrêmement détaillé avec des descriptions complètes
- Développe en profondeur les contextes sociaux, économiques et culturels
- Inclus de nombreux exemples concrets et témoignages d'époque
- Explique les nuances et complexités de chaque période
- Ajoute des anecdotes historiques vérifiées pour enrichir le récit

Exemple de structure pour l'histoire :
# Chapitre 1 : Les Origines (dates précises)
# Chapitre 2 : Les Événements Majeurs (dates précises) 
# Chapitre 3 : Les Conséquences (dates précises)

IMPORTANT : Si c'est l'histoire d'un pays, d'une personne ou d'un événement spécifique, respecte scrupuleusement les faits historiques établis.`
      }
      
      return `
INSTRUCTIONS SPÉCIFIQUES POUR LE GENRE ${genre.toUpperCase()} :
- Crée un contenu original, créatif et extrêmement développé
- Développe une vraie histoire avec un début, un milieu et une fin très détaillés
- Assure-toi que l'histoire soit cohérente et captivante du début à la fin
- Inclus des descriptions détaillées et immersives pour chaque scène
- Crée des personnages avec des noms, des personnalités et des motivations complexes et bien développées
- Utilise de nombreux dialogues naturels et expressifs pour rendre l'histoire vivante
- Développe en profondeur les émotions des personnages et leurs relations
- Ajoute des sous-intrigues et des rebondissements pour enrichir l'histoire
- Inclus des descriptions d'environnements riches et détaillées
- Développe l'univers et le contexte de l'histoire avec de nombreux détails`
    }

    const genreInstructions = getGenreSpecificInstructions(formData.genre, formData.idea)

    const prompt = `Tu es un écrivain professionnel français expert en création d'ebooks. Crée un ebook complet et captivant basé sur cette idée :

IDÉE PRINCIPALE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR SOUHAITÉE : ${targetLength}
AUTEUR : ${formData.author || "Auteur IA"}

${genreInstructions}

EXIGENCES DE LONGUEUR STRICTES :
- Génère un contenu TRÈS LONG et EXTRÊMEMENT DÉTAILLÉ
- Chaque chapitre doit être substantiel et bien développé
- N'hésite pas à ajouter de nombreux détails, descriptions et développements
- Écris comme si tu rédigeais un vrai livre professionnel destiné à la publication
- Développe chaque scène avec de nombreux paragraphes explicatifs
- Ajoute des transitions détaillées entre chaque section

Génère un ebook complet et professionnel avec :

1. UN TITRE ACCROCHEUR (maximum 60 caractères)
2. LE CONTENU COMPLET DE L'EBOOK avec :
   - Une introduction très engageante et immersive (au moins 3-4 paragraphes détaillés)
   - Au moins 8-12 chapitres très bien structurés et extrêmement développés
   ${formData.genre === 'historique' ? '- Des faits historiques précis avec dates et contextes très détaillés' : '- Des dialogues naturels et des descriptions vivantes très développées'}
   ${formData.genre === 'historique' ? '- Des références et sources historiques avec explications complètes' : '- Des personnages attachants et très bien développés avec des backstories'}
   - Des transitions fluides et détaillées entre les chapitres
   ${formData.genre === 'historique' ? '- Une chronologie historique respectée avec de nombreux détails contextuels' : '- Une intrigue captivante avec de nombreux rebondissements et sous-intrigues'}
   - Une conclusion très satisfaisante et émotionnelle (au moins 3-4 paragraphes)
   - Un style d'écriture riche et adapté au public cible
   - De nombreuses descriptions d'environnements, d'émotions et d'actions
3. UNE DESCRIPTION DE COUVERTURE (pour génération d'image)

INSTRUCTIONS IMPORTANTES POUR LA LONGUEUR :
- Écris entièrement en français
- Adapte le vocabulaire et le style au public cible spécifié
- Structure le texte avec des chapitres numérotés et titrés (format: # Chapitre X : Titre)
- DÉVELOPPE CHAQUE CHAPITRE AVEC UN MAXIMUM DE DÉTAILS
- Ajoute de nombreux paragraphes explicatifs pour chaque événement
- Inclus des descriptions complètes des lieux, personnages et situations
- N'hésite pas à être très verbeux et descriptif
${formData.genre === 'historique' ? '- RESPECTE SCRUPULEUSEMENT LES FAITS HISTORIQUES - Pas de fiction mais développe énormément les contextes !' : '- Développe une vraie histoire très riche avec un début, un milieu et une fin très détaillés'}
- Assure-toi que le contenu soit cohérent, captivant et TRÈS LONG du début à la fin

RAPPEL CRITIQUE : Cet ebook doit être SUBSTANTIEL et TRÈS LONG. Ne te contente pas de résumés, développe chaque aspect en profondeur !

Format de réponse EXACT (respecte absolument ce format) :
TITRE: [titre ici]
AUTEUR: ${formData.author || "Auteur IA"}
DESCRIPTION_COUVERTURE: [description détaillée pour image de couverture]
CONTENU:
[contenu complet de l'ebook ici avec chapitres formatés - TRÈS LONG ET DÉTAILLÉ]

IMPORTANT : Génère un contenu très substantiel et de qualité professionnelle qui respecte et dépasse largement la longueur demandée.`

    // Utiliser le modèle Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Générer le contenu avec Gemini avec plus de tokens pour du contenu plus long
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: formData.genre === 'historique' ? 0.3 : 0.9, // Moins de créativité pour l'histoire factuelle
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 32768, // Augmenté significativement pour du contenu plus long
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