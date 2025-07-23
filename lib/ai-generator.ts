// Temporairement, nous utiliserons un contenu de démo au lieu de l'API OpenAI
// Pour une vraie implémentation, utilisez l'API OpenAI directement

interface FormData {
  idea: string
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

export async function generateEbook(formData: FormData): Promise<GeneratedContent> {
  try {
    // Construire le prompt en fonction des paramètres
    const lengthMap = {
      court: "5-10 pages (environ 2000-3000 mots)",
      moyen: "15-25 pages (environ 5000-7000 mots)",
      long: "30-50 pages (environ 10000-15000 mots)",
    }

    const targetLength = lengthMap[formData.length as keyof typeof lengthMap] || lengthMap.court

    const prompt = `Tu es un écrivain professionnel français. Crée un ebook complet basé sur cette idée :

IDÉE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR SOUHAITÉE : ${targetLength}

Génère un ebook complet avec :

1. UN TITRE ACCROCHEUR (maximum 60 caractères)
2. UN NOM D'AUTEUR FICTIF APPROPRIÉ
3. LE CONTENU COMPLET DE L'EBOOK avec :
   - Une introduction engageante
   - Plusieurs chapitres bien structurés
   - Des transitions fluides entre les chapitres
   - Une conclusion satisfaisante
   - Un style d'écriture adapté au public cible
4. UNE DESCRIPTION DE COUVERTURE (pour génération d'image)

IMPORTANT :
- Écris en français
- Adapte le vocabulaire et le style au public cible
- Crée un contenu original et engageant
- Structure le texte avec des chapitres clairs
- Assure-toi que l'histoire/le contenu soit cohérent du début à la fin

Format de réponse EXACT (respecte ce format) :
TITRE: [titre ici]
AUTEUR: [nom auteur ici]
DESCRIPTION_COUVERTURE: [description pour image de couverture]
CONTENU:
[contenu complet de l'ebook ici]`

    // Générateur d'histoires avancé basé sur l'idée de l'utilisateur
    // Système intelligent qui crée des histoires captivantes et personnalisées

    // Générateur de titres intelligents
    const generateTitle = (idea: string, genre: string): string => {
      const ideaKeywords = extractKeywords(idea)
      const titleTemplates = getTitleTemplates(genre)
      
      const randomTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)]
      return randomTemplate.replace('[KEYWORD]', ideaKeywords[0] || 'Mystère')
        .replace('[ELEMENT]', ideaKeywords[1] || 'Aventure')
    }

    // Extraction des mots-clés importants de l'idée
    const extractKeywords = (idea: string): string[] => {
      // Mots-clés potentiels à ignorer
      const stopWords = ['un', 'une', 'le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'est', 'sont', 'dans', 'sur', 'avec', 'pour', 'par', 'qui', 'que', 'dont', 'où']
      
      const words = idea.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      
      return words.slice(0, 5)
    }

    // Templates de titres par genre
    const getTitleTemplates = (genre: string): string[] => {
      const templates = {
        'science-fiction': [
          'Les [KEYWORD] de l\'Espace',
          '[ELEMENT] : L\'Avenir Dévoilé',
          'Mission [KEYWORD]',
          'Les Secrets de [ELEMENT]',
          '[KEYWORD] - Nouvelle Ère'
        ],
        'fantasy': [
          'La Légende des [KEYWORD]',
          '[ELEMENT] et les Terres Mystiques',
          'Le Royaume des [KEYWORD]',
          'Les Chroniques de [ELEMENT]',
          'La Prophétie des [KEYWORD]'
        ],
        'romance': [
          'Un [ELEMENT] pour [KEYWORD]',
          'Les [KEYWORD] du Cœur',
          'Passion [ELEMENT]',
          'L\'Amour des [KEYWORD]',
          'Romance à [ELEMENT]'
        ],
        'thriller': [
          'Le Mystère des [KEYWORD]',
          '[ELEMENT] : Le Piège',
          'Traque [KEYWORD]',
          'Les [KEYWORD] de la Nuit',
          'Danger [ELEMENT]'
        ],
        'aventure': [
          'L\'Expédition [KEYWORD]',
          'À la Découverte de [ELEMENT]',
          'Les [KEYWORD] Perdus',
          'Voyage vers [ELEMENT]',
          'L\'Odyssée des [KEYWORD]'
        ],
        'default': [
          'L\'Histoire de [KEYWORD]',
          'Les [KEYWORD] Extraordinaires',
          '[ELEMENT] : Une Nouvelle Aventure',
          'Le Secret de [KEYWORD]',
          'Les Mystères de [ELEMENT]'
        ]
      }
      
      return templates[genre as keyof typeof templates] || templates.default
    }

    // Génération d'auteur contextuel
    const generateAuthor = (genre: string): string => {
      const authorsByGenre = {
        'science-fiction': ['Dr. Céline Verne', 'Alexandre Cosmos', 'Sarah Nebula', 'Marc Stellar'],
        'fantasy': ['Élise Enchantée', 'Gaël Mystral', 'Luna Féerique', 'Théo Merveille'],
        'romance': ['Camille Tender', 'Rose Amoureux', 'Julien Cœur', 'Emma Douce'],
        'thriller': ['Victor Noir', 'Léa Suspense', 'Paul Ombre', 'Nina Danger'],
        'aventure': ['Jean Explorateur', 'Sofia Aventure', 'Luc Voyage', 'Marie Découverte'],
        'default': ['Sophie Laurent', 'Pierre Moreau', 'Claire Dubois', 'Antoine Martin']
      }
      
      const authors = authorsByGenre[genre as keyof typeof authorsByGenre] || authorsByGenre.default
      return authors[Math.floor(Math.random() * authors.length)]
    }

    // Générateur de contenu avancé
    const generateAdvancedContent = (idea: string, genre: string, audience: string, length: string): string => {
      const keywords = extractKeywords(idea)
      const storyElements = generateStoryElements(idea, genre, audience)
      const numChapters = length === 'long' ? 8 : length === 'moyen' ? 5 : 3
      
      // Introduction captivante
      const intro = generateIntroduction(idea, genre, audience, storyElements)
      
      // Chapitres avec vrais développements narratifs
      const chapters = generateChapters(storyElements, numChapters, genre, audience)
      
      // Conclusion satisfaisante
      const conclusion = generateConclusion(storyElements, genre)
      
      return `${intro}\n\n${chapters}\n\n${conclusion}`
    }

    // Génération d'éléments narratifs
    const generateStoryElements = (idea: string, genre: string, audience: string) => {
      const keywords = extractKeywords(idea)
      
      return {
        protagonist: generateProtagonist(genre, audience),
        setting: generateSetting(idea, genre),
        conflict: generateConflict(idea, genre),
        theme: generateTheme(idea, genre),
        keywords: keywords,
        tone: getTone(genre, audience)
      }
    }

    // Génération du protagoniste
    const generateProtagonist = (genre: string, audience: string) => {
      const protagonistTemplates = {
        'enfants': ['un jeune héros courageux', 'une petite fille intelligente', 'un animal parlant sage'],
        'adolescents': ['un lycéen déterminé', 'une jeune femme rebelle', 'un groupe d\'amis unis'],
        'adultes': ['un professionnel expérimenté', 'une femme indépendante', 'un homme en quête de sens'],
        'default': ['un personnage attachant', 'une héroïne courageuse', 'un protagoniste déterminé']
      }
      
      const templates = protagonistTemplates[audience as keyof typeof protagonistTemplates] || protagonistTemplates.default
      return templates[Math.floor(Math.random() * templates.length)]
    }

    // Génération du cadre
    const generateSetting = (idea: string, genre: string) => {
      if (idea.toLowerCase().includes('espace') || idea.toLowerCase().includes('futur')) {
        return 'dans un futur lointain, au cœur de l\'espace intersidéral'
      }
      if (idea.toLowerCase().includes('forêt') || idea.toLowerCase().includes('nature')) {
        return 'au cœur d\'une forêt mystérieuse et enchantée'
      }
      if (idea.toLowerCase().includes('ville') || idea.toLowerCase().includes('urbain')) {
        return 'dans une métropole moderne aux mille secrets'
      }
      
      const settingsByGenre = {
        'science-fiction': 'dans un monde futuriste aux technologies avancées',
        'fantasy': 'dans un royaume magique aux créatures extraordinaires',
        'thriller': 'dans une ville sombre pleine de dangers cachés',
        'romance': 'dans un cadre romantique et enchanteur',
        'aventure': 'dans des terres lointaines pleines de mystères',
        'default': 'dans un monde fascinant et unique'
      }
      
      return settingsByGenre[genre as keyof typeof settingsByGenre] || settingsByGenre.default
    }

    // Génération du conflit principal
    const generateConflict = (idea: string, genre: string) => {
      const conflictTemplates = {
        'science-fiction': 'une menace technologique met en péril l\'humanité',
        'fantasy': 'une force maléfique menace l\'équilibre du monde',
        'thriller': 'un mystère dangereux doit être résolu avant qu\'il soit trop tard',
        'romance': 'deux âmes sœurs doivent surmonter les obstacles pour être ensemble',
        'aventure': 'une quête périlleuse attend nos héros',
        'default': 'un défi extraordinaire doit être relevé'
      }
      
      return conflictTemplates[genre as keyof typeof conflictTemplates] || conflictTemplates.default
    }

    // Génération du thème
    const generateTheme = (idea: string, genre: string) => {
      if (idea.toLowerCase().includes('amitié')) return 'l\'importance de l\'amitié vraie'
      if (idea.toLowerCase().includes('famille')) return 'les liens familiaux indéfectibles'
      if (idea.toLowerCase().includes('courage')) return 'le courage face à l\'adversité'
      
      const themesByGenre = {
        'science-fiction': 'l\'évolution de l\'humanité et la technologie',
        'fantasy': 'la magie qui sommeille en chacun de nous',
        'thriller': 'la vérité qui finit toujours par triompher',
        'romance': 'l\'amour qui transcende tous les obstacles',
        'aventure': 'la découverte de soi à travers l\'aventure',
        'default': 'la transformation personnelle et la croissance'
      }
      
      return themesByGenre[genre as keyof typeof themesByGenre] || themesByGenre.default
    }

    // Détermination du ton
    const getTone = (genre: string, audience: string) => {
      if (audience === 'enfants') return 'joyeux et éducatif'
      if (audience === 'adolescents') return 'dynamique et inspirant'
      
      const tonesByGenre = {
        'science-fiction': 'captivant et visionnaire',
        'fantasy': 'merveilleux et épique',
        'thriller': 'intense et suspensif',
        'romance': 'émouvant et passionné',
        'aventure': 'palpitant et héroïque',
        'default': 'engageant et profond'
      }
      
      return tonesByGenre[genre as keyof typeof tonesByGenre] || tonesByGenre.default
    }

    // Génération de l'introduction
    const generateIntroduction = (idea: string, genre: string, audience: string, elements: any) => {
      return `# Prologue

${elements.setting}, une histoire extraordinaire est sur le point de commencer.

${elements.protagonist} va vivre une aventure qui changera sa vie à jamais. Car ${elements.conflict}, et seuls le courage et la détermination pourront triompher.

Cette histoire, inspirée de l'idée "${idea}", vous emmènera dans un voyage ${elements.tone} où ${elements.theme} sera au cœur de chaque page.

Préparez-vous à découvrir un monde où l'impossible devient possible, où chaque chapitre réserve ses surprises, et où l'aventure n'attend que vous.

**L'histoire commence maintenant...**`
    }

    // Génération des chapitres avec vraie progression narrative
    const generateChapters = (elements: any, numChapters: number, genre: string, audience: string) => {
      const chapterTitles = generateChapterTitles(numChapters, genre, elements.keywords)
      
      return Array.from({ length: numChapters }, (_, i) => {
        const chapterNumber = i + 1
        const title = chapterTitles[i]
        const content = generateChapterContent(chapterNumber, numChapters, elements, genre, audience)
        
        return `## Chapitre ${chapterNumber} : ${title}

${content}

---`
      }).join('\n\n')
    }

    // Génération des titres de chapitres
    const generateChapterTitles = (numChapters: number, genre: string, keywords: string[]) => {
      const titlePatterns = [
        'Le Commencement',
        'Premiers Mystères',
        'La Découverte',
        'Face au Danger',
        'L\'Alliance Inattendue',
        'Le Tournant',
        'La Bataille Finale',
        'Nouveau Départ'
      ]
      
      const titles = []
      for (let i = 0; i < numChapters; i++) {
        if (i < titlePatterns.length) {
          titles.push(titlePatterns[i])
        } else {
          titles.push(`L'Aventure Continue - ${i + 1}`)
        }
      }
      
      return titles
    }

    // Génération du contenu de chapitre avec progression narrative
    const generateChapterContent = (chapterNumber: number, totalChapters: number, elements: any, genre: string, audience: string) => {
      const progressPercentage = chapterNumber / totalChapters
      
      if (chapterNumber === 1) {
        return `Dans ce premier chapitre, nous faisons la connaissance de ${elements.protagonist}. ${elements.setting}, la vie suit son cours ordinaire jusqu'à ce qu'un événement extraordinaire vienne tout bouleverser.

Les premiers signes de l'aventure qui s'annonce commencent à se manifester. Notre héros ne le sait pas encore, mais ${elements.conflict} et sa vie va prendre un tournant décisif.

L'atmosphère se fait ${elements.tone}, plantant le décor pour une histoire où ${elements.theme} guidera chaque décision importante.

*"Parfois, les plus grandes aventures commencent par les plus petits pas..."*`
      }
      
      if (chapterNumber === totalChapters) {
        return `Dans ce chapitre final, tous les fils de l'histoire se rejoignent. Notre héros, transformé par son voyage, fait face à l'ultime défi.

${elements.conflict} trouve enfin sa résolution grâce aux leçons apprises et aux alliances forgées tout au long de cette aventure extraordinaire.

L'histoire révèle toute sa profondeur, montrant comment ${elements.theme} peut triompher même dans les situations les plus difficiles.

*"Les fins ne sont que de nouveaux commencements déguisés..."*

Notre protagoniste, désormais changé par cette expérience, regarde vers l'avenir avec une nouvelle sagesse et une confiance renouvelée.`
      }
      
      // Chapitres intermédiaires avec progression
      const midStoryEvents = [
        'Les mystères s\'approfondissent et de nouveaux alliés apparaissent.',
        'Un obstacle majeur force nos héros à repenser leur stratégie.',
        'Des révélations surprenantes changent tout ce que nous pensions savoir.',
        'L\'action s\'intensifie alors que le danger se rapproche.',
        'Une découverte cruciale ouvre de nouvelles possibilités.',
        'Les enjeux atteignent leur paroxysme.'
      ]
      
      const eventIndex = Math.min(chapterNumber - 2, midStoryEvents.length - 1)
      const event = midStoryEvents[eventIndex]
      
      return `L'aventure se poursuit avec ${elements.protagonist} qui découvre de nouveaux aspects de ce monde fascinant. ${event}

${elements.setting}, chaque pas révèle de nouveaux défis et de nouvelles opportunités. L'histoire progresse avec un rythme ${elements.tone}, maintenant le lecteur en haleine.

Les personnages évoluent, les relations se développent, et ${elements.theme} devient de plus en plus central dans les choix qui s'offrent à nos héros.

*"Dans l'adversité, nous découvrons qui nous sommes vraiment..."*

Le chapitre se termine sur une note qui nous donne hâte de découvrir la suite, car l'aventure est loin d'être terminée.`
    }

    // Génération de la conclusion
    const generateConclusion = (elements: any, genre: string) => {
      return `## Épilogue

Ainsi se termine cette extraordinaire aventure. ${elements.protagonist} a traversé des épreuves qui l'ont transformé à jamais, découvrant en chemin que ${elements.theme} peut surmonter tous les obstacles.

L'histoire nous rappelle que chaque fin marque un nouveau commencement, et que les leçons apprises au cours de cette aventure continueront d'éclairer le chemin vers de nouvelles découvertes.

### Réflexions finales

Cette histoire nous enseigne que l'aventure ne réside pas seulement dans les grands gestes héroïques, mais aussi dans notre capacité à grandir, à apprendre et à nous dépasser.

${elements.setting}, nous avons découvert un monde riche en possibilités, où l'imagination n'a pas de limites et où chaque lecteur peut trouver sa propre inspiration.

---

**"L'aventure ne se termine jamais vraiment... elle ne fait que changer de forme."**

*Fin de l'histoire*

---

*Généré avec passion par Story2book AI* ✨`
    }

    const title = generateTitle(formData.idea, formData.genre)
    const author = generateAuthor(formData.genre)
    const content = generateAdvancedContent(formData.idea, formData.genre, formData.targetAudience, formData.length)
    
    return {
      title: title.substring(0, 100),
      author: author,
      content: content,
      coverDescription: `Couverture élégante pour "${title}" - Design moderne avec des éléments visuels en rapport avec ${formData.genre || 'le thème principal'}, style ${formData.targetAudience || 'universel'}, atmosphère captivante et immersive.`,
    }
  } catch (error) {
    console.error("Erreur lors de la génération:", error)

    // Contenu de fallback en cas d'erreur
    return {
      title: "Mon Ebook Généré",
      author: "Auteur IA",
      content: `# Introduction

Bienvenue dans votre ebook généré automatiquement !

Basé sur votre idée : "${formData.idea}"

## Chapitre 1 : Le Commencement

Votre histoire commence ici. L'Intelligence Artificielle a analysé votre idée et créé ce contenu personnalisé pour vous.

## Chapitre 2 : Le Développement

Le contenu continue de se développer selon vos paramètres choisis.

## Conclusion

Votre ebook est maintenant prêt à être lu et partagé !

---

*Cet ebook a été généré automatiquement par Story2book AI.*`,
      coverDescription: "Couverture moderne et élégante pour un ebook généré par IA",
    }
  }
}