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
    // Calcul précis du nombre de mots basé sur des pages réelles
    // Environ 250 mots par page est le standard des livres publiés
    const wordsPerPage = 250
    
    const getExactLength = (length: string) => {
      const lengthConfig = {
        court: { pages: 20, minPages: 18, maxPages: 22 },     // 20 pages exactement
        moyen: { pages: 40, minPages: 38, maxPages: 42 },     // 40 pages exactement  
        long: { pages: 80, minPages: 78, maxPages: 82 },      // 80 pages exactement
      }
      
      const config = lengthConfig[length as keyof typeof lengthConfig] || lengthConfig.court
      const exactWords = config.pages * wordsPerPage
      const minWords = config.minPages * wordsPerPage
      const maxWords = config.maxPages * wordsPerPage
      
      return {
        pages: config.pages,
        exactWords,
        minWords,
        maxWords,
        chaptersCount: Math.ceil(config.pages / 5), // Environ 5 pages par chapitre
        wordsPerChapter: Math.ceil(exactWords / Math.ceil(config.pages / 5))
      }
    }

    const lengthConfig = getExactLength(formData.length)
    
    const targetLength = `EXACTEMENT ${lengthConfig.pages} PAGES (${lengthConfig.exactWords} mots précisément)
- Minimum absolu : ${lengthConfig.minWords} mots
- Maximum autorisé : ${lengthConfig.maxWords} mots  
- Nombre de chapitres requis : ${lengthConfig.chaptersCount}
- Mots par chapitre : environ ${lengthConfig.wordsPerChapter} mots chacun

IMPORTANT CRITIQUE : Vous DEVEZ atteindre exactement ${lengthConfig.exactWords} mots (±500 mots maximum). 
C'est une exigence STRICTE et NON-NÉGOCIABLE.`

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

DÉVELOPPEMENT APPROFONDI REQUIS POUR ATTEINDRE ${lengthConfig.exactWords} MOTS :
- Chaque chapitre doit faire EXACTEMENT environ ${lengthConfig.wordsPerChapter} mots
- Développe en profondeur les contextes sociaux, économiques et culturels
- Inclus de nombreux exemples concrets et témoignages d'époque
- Explique les nuances et complexités de chaque période
- Ajoute des anecdotes historiques vérifiées pour enrichir le récit
- Détaille les conséquences à court, moyen et long terme
- Analyse les différents points de vue historiques sur les événements

STRUCTURE OBLIGATOIRE :
${Array.from({length: lengthConfig.chaptersCount}, (_, i) => 
  `# Chapitre ${i + 1} : [Titre avec dates] (${lengthConfig.wordsPerChapter} mots requis)`
).join('\n')}

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
- Développe l'univers et le contexte de l'histoire avec de nombreux détails

DÉVELOPPEMENT REQUIS POUR ATTEINDRE ${lengthConfig.exactWords} MOTS :
- Chaque chapitre doit faire EXACTEMENT environ ${lengthConfig.wordsPerChapter} mots
- Développe chaque scène avec un maximum de détails descriptifs
- Ajoute des flashbacks et des backstories pour enrichir les personnages
- Inclus des dialogues étendus et des monologues intérieurs
- Détaille chaque action, émotion et pensée des personnages
- Développe l'environnement et l'atmosphère de chaque scène

STRUCTURE OBLIGATOIRE :
${Array.from({length: lengthConfig.chaptersCount}, (_, i) => 
  `# Chapitre ${i + 1} : [Titre captivant] (${lengthConfig.wordsPerChapter} mots requis)`
).join('\n')}`
    }

    const genreInstructions = getGenreSpecificInstructions(formData.genre, formData.idea)

    const prompt = `Tu es un écrivain professionnel français expert en création d'ebooks. Crée un ebook complet et captivant basé sur cette idée :

IDÉE PRINCIPALE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR EXACTE REQUISE : ${targetLength}
AUTEUR : ${formData.author || "Auteur IA"}

${genreInstructions}

⚠️ EXIGENCES DE LONGUEUR STRICTES ET NON-NÉGOCIABLES ⚠️ :
- Tu DOIS générer EXACTEMENT ${lengthConfig.exactWords} mots (±500 mots maximum)
- Chaque chapitre DOIT faire environ ${lengthConfig.wordsPerChapter} mots
- Tu DOIS créer exactement ${lengthConfig.chaptersCount} chapitres
- Si tu n'atteins pas le nombre de mots requis, CONTINUE à développer jusqu'à l'atteindre
- N'arrête JAMAIS l'écriture tant que tu n'as pas atteint le nombre de mots cible
- Compte tes mots régulièrement pour t'assurer de respecter l'objectif

TECHNIQUES POUR ATTEINDRE LA LONGUEUR EXACTE :
- Développe CHAQUE scène avec un maximum de détails
- Ajoute des descriptions exhaustives des lieux, personnages, émotions
- Inclus de nombreux dialogues étendus
- Développe les pensées intérieures des personnages
- Ajoute des transitions détaillées entre chaque scène
- Explique les motivations profondes de chaque action
- Décris les sensations physiques et émotionnelles en détail

Génère un ebook complet et professionnel avec :

1. UN TITRE ACCROCHEUR (maximum 60 caractères)
2. LE CONTENU COMPLET DE L'EBOOK AVEC EXACTEMENT ${lengthConfig.exactWords} MOTS :
   - Une introduction très engageante et immersive (au moins 500 mots)
   - Exactement ${lengthConfig.chaptersCount} chapitres de ${lengthConfig.wordsPerChapter} mots chacun
   ${formData.genre === 'historique' ? '- Des faits historiques précis avec dates et contextes très détaillés' : '- Des dialogues naturels et des descriptions vivantes très développées'}
   ${formData.genre === 'historique' ? '- Des références et sources historiques avec explications complètes' : '- Des personnages attachants et très bien développés avec des backstories'}
   - Des transitions fluides et détaillées entre les chapitres
   ${formData.genre === 'historique' ? '- Une chronologie historique respectée avec de nombreux détails contextuels' : '- Une intrigue captivante avec de nombreux rebondissements et sous-intrigues'}
   - Une conclusion très satisfaisante et émotionnelle (au moins 500 mots)
   - Un style d'écriture riche et adapté au public cible
3. UNE DESCRIPTION DE COUVERTURE (pour génération d'image)

🎯 RAPPEL CRITIQUE : Cet ebook doit faire EXACTEMENT ${lengthConfig.pages} PAGES (${lengthConfig.exactWords} mots). 
Ne te contente JAMAIS de moins ! Continue à développer jusqu'à atteindre cette longueur exacte !

Format de réponse EXACT (respecte absolument ce format) :
TITRE: [titre ici]
AUTEUR: ${formData.author || "Auteur IA"}
DESCRIPTION_COUVERTURE: [description détaillée pour image de couverture]
CONTENU:
[contenu complet de l'ebook ici avec exactement ${lengthConfig.exactWords} mots - TRÈS LONG ET DÉTAILLÉ]

CONTRÔLE FINAL OBLIGATOIRE : Vérifie que ton contenu fait bien ${lengthConfig.exactWords} mots (±500). Si ce n'est pas le cas, continue à écrire !`

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