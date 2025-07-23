// Temporairement, nous utiliserons un contenu de démo au lieu de l'API OpenAI
// Pour une vraie implémentation, utilisez l'API OpenAI directement

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

    // Générateur de contenu narratif immersif
    const generateAdvancedContent = (idea: string, genre: string, audience: string, length: string): string => {
      const keywords = extractKeywords(idea)
      const storyElements = generateStoryElements(idea, genre, audience)
      
      // Beaucoup plus de chapitres selon la longueur
      const numChapters = length === 'long' ? 15 : length === 'moyen' ? 10 : 6
      
      // Générer des personnages avec noms et personnalités
      const characters = generateCharacters(genre, audience, keywords)
      
      // Introduction narrative
      const intro = generateNarrativeIntroduction(idea, genre, audience, storyElements, characters)
      
      // Chapitres avec vraie narration et dialogues
      const chapters = generateNarrativeChapters(storyElements, characters, numChapters, genre, audience, keywords)
      
      // Conclusion narrative
      const conclusion = generateNarrativeConclusion(storyElements, characters, genre)
      
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

    // Génération de personnages vivants
    const generateCharacters = (genre: string, audience: string, keywords: string[]) => {
      const firstNames = {
        'enfants': ['Lucas', 'Emma', 'Noah', 'Léa', 'Gabriel', 'Chloé', 'Arthur', 'Manon'],
        'adolescents': ['Alexandre', 'Sarah', 'Maxime', 'Julie', 'Thomas', 'Camille', 'Julien', 'Marine'],
        'adultes': ['David', 'Sophie', 'Pierre', 'Catherine', 'Marc', 'Isabelle', 'Philippe', 'Nathalie'],
        'default': ['Alex', 'Sam', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Avery']
      }
      
      const lastNames = ['Dubois', 'Martin', 'Bernard', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux']
      
      const names = firstNames[audience as keyof typeof firstNames] || firstNames.default
      const protagonist = names[Math.floor(Math.random() * names.length)]
      const ally = names[Math.floor(Math.random() * names.length)]
      const antagonist = names[Math.floor(Math.random() * names.length)]
      
      return {
        protagonist: {
          name: protagonist,
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          personality: generatePersonality(genre, 'protagonist'),
          description: generateCharacterDescription(genre, 'protagonist', audience)
        },
        ally: {
          name: ally,
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          personality: generatePersonality(genre, 'ally'),
          description: generateCharacterDescription(genre, 'ally', audience)
        },
        antagonist: {
          name: antagonist,
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          personality: generatePersonality(genre, 'antagonist'),
          description: generateCharacterDescription(genre, 'antagonist', audience)
        }
      }
    }

    // Génération de personnalités
    const generatePersonality = (genre: string, role: string) => {
      const personalities = {
        protagonist: {
          'science-fiction': ['curieux et inventif', 'brave et logique', 'déterminé et visionnaire'],
          'fantasy': ['courageux et loyal', 'sage et mystique', 'noble et protecteur'],
          'thriller': ['observateur et méfiant', 'intelligent et persévérant', 'intuitif et courageux'],
          'romance': ['sensible et passionné', 'attentionné et romantique', 'loyal et dévoué'],
          'aventure': ['audacieux et spontané', 'débrouillard et optimiste', 'leader naturel'],
          'default': ['déterminé et courageux', 'intelligent et loyal', 'optimiste et persévérant']
        },
        ally: {
          'science-fiction': ['genius de la technologie', 'expert en navigation spatiale', 'spécialiste en communication'],
          'fantasy': ['magicien expérimenté', 'guerrier loyal', 'guérisseuse sage'],
          'thriller': ['informateur discret', 'expert en sécurité', 'enquêteur chevronné'],
          'romance': ['confident fidèle', 'entremetteur bienveillant', 'ami de toujours'],
          'aventure': ['guide expérimenté', 'compagnon fidèle', 'expert local'],
          'default': ['ami loyal', 'conseiller sage', 'compagnon fidèle']
        },
        antagonist: {
          'science-fiction': ['scientifique fou', 'dictateur technologique', 'intelligence artificielle malveillante'],
          'fantasy': ['sorcier maléfique', 'roi tyrannique', 'créature des ténèbres'],
          'thriller': ['criminel rusé', 'conspirateur dangereux', 'manipulateur expert'],
          'romance': ['rival en amour', 'famille opposée', 'malentendu du passé'],
          'aventure': ['chasseur de trésors', 'tyran local', 'gardien mystérieux'],
          'default': ['adversaire redoutable', 'obstacle mystérieux', 'rival déterminé']
        }
      }
      
      const rolePersonalities = personalities[role as keyof typeof personalities]
      const genrePersonalities = rolePersonalities[genre as keyof typeof rolePersonalities] || rolePersonalities.default
      return genrePersonalities[Math.floor(Math.random() * genrePersonalities.length)]
    }

    // Description physique des personnages
    const generateCharacterDescription = (genre: string, role: string, audience: string) => {
      const descriptions = {
        protagonist: [
          'aux yeux brillants de détermination',
          'au sourire confiant et rassurant',
          'aux cheveux qui dansent dans le vent',
          'au regard perçant et intelligent',
          'à la démarche assurée'
        ],
        ally: [
          'au visage bienveillant',
          'aux mains expertes',
          'au regard chaleureux',
          'à la voix apaisante',
          'au sourire encourageant'
        ],
        antagonist: [
          'au regard froid et calculateur',
          'au sourire inquiétant',
          'à la présence intimidante',
          'aux yeux perçants',
          'à l\'aura mystérieuse'
        ]
      }
      
      const roleDescriptions = descriptions[role as keyof typeof descriptions]
      return roleDescriptions[Math.floor(Math.random() * roleDescriptions.length)]
    }

    // Introduction narrative immersive
    const generateNarrativeIntroduction = (idea: string, genre: string, audience: string, elements: any, characters: any) => {
      const weather = ['Un matin brumeux', 'Par une belle journée ensoleillée', 'Alors que la nuit tombait', 'Dans la douce lumière du crépuscule', 'Sous un ciel étoilé'][Math.floor(Math.random() * 5)]
      
      return `# Chapitre 1 : Le Commencement

${weather} ${elements.setting}, ${characters.protagonist.name} ${characters.protagonist.lastName} ne se doutait pas que sa vie allait basculer.

${characters.protagonist.description}, ${characters.protagonist.name} était connu pour être ${characters.protagonist.personality}. Ce jour-là, comme tous les autres, ${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} vaquait à ses occupations quotidiennes, loin de se douter qu'une aventure extraordinaire l'attendait.

L'air semblait chargé d'une énergie particulière, comme si l'univers lui-même retenait son souffle. Les habitants du lieu ne le savaient pas encore, mais ${elements.conflict.toLowerCase()}, et tout était sur le point de changer.

"Encore une journée ordinaire," murmura ${characters.protagonist.name} en observant les alentours.

${characters.protagonist.name.endsWith('e') ? 'Elle' : 'Il'} était loin d'imaginer qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} venait de prononcer ces mots pour la dernière fois de sa vie.`
    }

    // Génération des chapitres narratifs avec dialogues
    const generateNarrativeChapters = (elements: any, characters: any, numChapters: number, genre: string, audience: string, keywords: string[]) => {
      const chapterTitles = generateDynamicChapterTitles(numChapters, genre, keywords, characters)
      
      return Array.from({ length: numChapters - 1 }, (_, i) => { // -1 car le chapitre 1 est l'intro
        const chapterNumber = i + 2
        const title = chapterTitles[i]
        const content = generateNarrativeChapterContent(chapterNumber, numChapters + 1, elements, characters, genre, audience, keywords)
        
        return `# Chapitre ${chapterNumber} : ${title}

${content}

---`
      }).join('\n\n')
    }

    // Génération de titres de chapitres dynamiques
    const generateDynamicChapterTitles = (numChapters: number, genre: string, keywords: string[], characters: any) => {
      const baseTitles = [
        'La Découverte Inattendue',
        `La Rencontre avec ${characters.ally.name}`,
        'Les Premiers Indices',
        'Dans l\'Ombre du Mystère',
        'La Révélation Troublante',
        `L'Alliance avec ${characters.ally.name}`,
        'Les Épreuves Commencent',
        'Face à l\'Adversité',
        `La Menace de ${characters.antagonist.name}`,
        'Le Plan Secret',
        'La Confrontation',
        'Le Point de Non-Retour',
        'La Bataille Décisive',
        'La Résolution',
        'Un Nouveau Commencement'
      ]
      
      // Mélanger avec des éléments spécifiques au genre
      const genreSpecificTitles = {
        'science-fiction': [
          'Les Signaux de l\'Espace',
          'La Technologie Interdite',
          'Voyage vers l\'Inconnu',
          'La Station Abandonnée',
          'Les Secrets du Futur'
        ],
        'fantasy': [
          'La Forêt Enchantée',
          'Le Grimoire Ancien',
          'La Prophétie Révélée',
          'Le Royaume Perdu',
          'La Magie Interdite'
        ],
        'thriller': [
          'La Filature',
          'L\'Indice Caché',
          'La Poursuite',
          'Le Témoin Silencieux',
          'La Vérité Dévoilée'
        ],
        'romance': [
          'La Première Rencontre',
          'Les Regards Échangés',
          'La Déclaration',
          'L\'Obstacle Imprévu',
          'L\'Amour Triomphant'
        ],
        'aventure': [
          'La Carte au Trésor',
          'Le Passage Secret',
          'L\'Île Mystérieuse',
          'La Chasse Commence',
          'Le Trésor Découvert'
        ]
      }
      
      const specificTitles = genreSpecificTitles[genre as keyof typeof genreSpecificTitles] || []
      const allTitles = [...baseTitles, ...specificTitles]
      
      // Sélectionner et adapter les titres
      const selectedTitles = []
      for (let i = 0; i < numChapters - 1; i++) {
        if (i < allTitles.length) {
          selectedTitles.push(allTitles[i])
        } else {
          selectedTitles.push(`L'Aventure de ${characters.protagonist.name} - ${i + 1}`)
        }
      }
      
      return selectedTitles
    }

    // Génération de contenu narratif avec dialogues et actions
    const generateNarrativeChapterContent = (chapterNumber: number, totalChapters: number, elements: any, characters: any, genre: string, audience: string, keywords: string[]) => {
      const progressPercentage = chapterNumber / totalChapters
      
      // Différents types de scènes narratives
      const sceneTypes = [
        'découverte', 'dialogue', 'action', 'mystère', 'émotion', 'confrontation', 'révélation', 'alliance'
      ]
      
      const sceneType = sceneTypes[Math.floor(Math.random() * sceneTypes.length)]
      
      // Éléments narratifs dynamiques
      const atmospheres = [
        'L\'air était lourd de mystère',
        'Une tension palpable régnait',
        'Le silence était troublant',
        'L\'atmosphère crépitait d\'énergie',
        'Un calme inquiétant s\'installait'
      ]
      
      const timeTransitions = [
        'Quelques heures plus tard',
        'Le lendemain matin',
        'À la tombée de la nuit',
        'Sans perdre un instant',
        'Après une longue réflexion'
      ]
      
      const atmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)]
      const transition = timeTransitions[Math.floor(Math.random() * timeTransitions.length)]
      
      // Contenu selon le numéro de chapitre et progression
      if (chapterNumber === 2) {
        return generateChapter2Content(characters, elements, atmosphere, genre)
      } else if (chapterNumber === 3) {
        return generateChapter3Content(characters, elements, transition, genre)
      } else if (chapterNumber > totalChapters - 3) {
        return generateFinalChaptersContent(chapterNumber, totalChapters, characters, elements, genre)
      } else {
        return generateMidChapterContent(chapterNumber, characters, elements, sceneType, atmosphere, transition, genre, keywords)
      }
    }

    // Chapitre 2 : La découverte
    const generateChapter2Content = (characters: any, elements: any, atmosphere: string, genre: string) => {
      return `${atmosphere} quand ${characters.protagonist.name} découvrit le premier indice de ce qui l'attendait.

"Qu'est-ce que c'est que ça ?" murmura ${characters.protagonist.name} en observant attentivement ce qui venait d'attirer son attention.

L'objet, la situation, ou le phénomène devant ${characters.protagonist.name.endsWith('e') ? 'elle' : 'lui'} défiant toute logique. ${characters.protagonist.name.endsWith('e') ? 'Elle' : 'Il'} se pencha pour mieux voir, son cœur battant plus vite à chaque seconde.

Soudain, une voix retentit derrière ${characters.protagonist.name.endsWith('e') ? 'elle' : 'lui'} :

"Je ne ferais pas ça si j'étais vous."

${characters.protagonist.name} se retourna vivement pour découvrir ${characters.ally.name} ${characters.ally.lastName}, ${characters.ally.description}. L'inconnu semblait ${characters.ally.personality}, mais quelque chose dans son regard suggérait qu'${characters.ally.name.endsWith('e') ? 'elle' : 'il'} en savait bien plus qu'${characters.ally.name.endsWith('e') ? 'elle' : 'il'} ne le laissait paraître.

"Qui êtes-vous ?" demanda ${characters.protagonist.name}, sur ses gardes.

"Quelqu'un qui peut vous aider," répondit ${characters.ally.name} avec un sourire énigmatique. "Mais d'abord, nous devons parler. Ce que vous venez de découvrir... c'est plus dangereux que vous ne l'imaginez."

${characters.protagonist.name} hésita un instant. Pouvait-${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} faire confiance à cet inconnu ? Mais ${characters.ally.name} avait raison sur un point : ${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} avait besoin de réponses.

"D'accord," dit finalement ${characters.protagonist.name}. "Mais j'exige des explications complètes."

${characters.ally.name} hocha la tête gravement. "Vous les aurez. Mais pas ici. Suivez-moi."

Et c'est ainsi que ${characters.protagonist.name} fit le premier pas vers une aventure qui allait changer sa vie à jamais.`
    }

    // Chapitre 3 : L'alliance
    const generateChapter3Content = (characters: any, elements: any, transition: string, genre: string) => {
      const location = generateSceneLocation(genre)
      
      return `${transition}, ${characters.protagonist.name} et ${characters.ally.name} se retrouvèrent ${location}.

"Il est temps que vous sachiez la vérité," commença ${characters.ally.name}, ${characters.ally.name.endsWith('e') ? 'ses' : 'ses'} yeux fixés sur ${characters.protagonist.name}. "Ce que vous avez découvert hier n'était que le début."

${characters.protagonist.name} s'installa confortablement, prêt${characters.protagonist.name.endsWith('e') ? 'e' : ''} à écouter ce qui promettait d'être une révélation majeure.

"${elements.conflict.charAt(0).toUpperCase() + elements.conflict.slice(1)}," expliqua ${characters.ally.name} d'une voix grave. "Et vous, ${characters.protagonist.name}, vous êtes peut-être notre seul espoir de l'arrêter."

"Moi ?" s'exclama ${characters.protagonist.name}, incrédule. "Mais je ne suis qu'${characters.protagonist.personality}..."

"Détrompez-vous," interrompit ${characters.ally.name}. "Vos qualités, votre ${characters.protagonist.personality}, c'est exactement ce dont nous avons besoin. Personne d'autre ne peut faire ce que vous pouvez faire."

${characters.ally.name} marqua une pause, laissant ${characters.protagonist.name} digérer ces informations.

"Je sais que c'est beaucoup à accepter," continua ${characters.ally.name}. "Mais le temps presse. ${characters.antagonist.name} ${characters.antagonist.lastName} ne va pas attendre que nous soyons prêts."

À la mention de ce nom, ${characters.protagonist.name} frissonna. Même sans connaître cette personne, quelque chose dans ce nom évoquait le danger.

"Qui est ${characters.antagonist.name} ?" demanda ${characters.protagonist.name} d'une voix à peine audible.

Les traits de ${characters.ally.name} se durcirent. "${characters.antagonist.lastName} est ${characters.antagonist.personality}, et ${characters.antagonist.description}. ${characters.antagonist.name.endsWith('e') ? 'Elle' : 'Il'} ne s'arrêtera devant rien pour atteindre ${characters.antagonist.name.endsWith('e') ? 'ses' : 'ses'} objectifs."

${characters.protagonist.name} prit une profonde inspiration. La situation était bien plus grave qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} ne l'avait imaginé.

"Alors, qu'est-ce qu'on fait maintenant ?" demanda ${characters.protagonist.name} avec une détermination nouvelle.

${characters.ally.name} sourit pour la première fois depuis le début de leur conversation. "Maintenant, nous nous préparons. L'aventure ne fait que commencer."`
    }

    // Chapitres finaux
    const generateFinalChaptersContent = (chapterNumber: number, totalChapters: number, characters: any, elements: any, genre: string) => {
      if (chapterNumber === totalChapters) {
        return `Le moment tant attendu était enfin arrivé. ${characters.protagonist.name} se trouvait face à ${characters.antagonist.name}, dans une confrontation qui déterminerait l'issue de toute cette aventure.

"Ainsi, nous nous retrouvons enfin," dit ${characters.antagonist.name} ${characters.antagonist.description}. "J'espérais ne jamais avoir à en arriver là."

"Il n'est pas trop tard pour arrêter," répondit ${characters.protagonist.name} avec courage. "Vous pouvez encore choisir une autre voie."

${characters.antagonist.name} éclata de rire, un son froid qui résonna dans l'espace qui les séparait. "Vous ne comprenez toujours pas, n'est-ce pas ? Il n'y a pas d'autre voie."

La tension était à son comble. ${characters.ally.name} se tenait prêt${characters.ally.name.endsWith('e') ? 'e' : ''} à intervenir, mais ${characters.ally.name.endsWith('e') ? 'elle' : 'il'} savait que cette bataille, ${characters.protagonist.name} devait la mener seul${characters.protagonist.name.endsWith('e') ? 'e' : ''}.

Ce qui suivit fut un affrontement épique où ${characters.protagonist.name} puisa dans toutes les leçons apprises au cours de cette aventure. ${characters.protagonist.name.endsWith('e') ? 'Sa' : 'Son'} ${characters.protagonist.personality} fut mis${characters.protagonist.name.endsWith('e') ? 'e' : ''} à l'épreuve, mais ${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} ne vacilla jamais.

Au final, ce fut ${elements.theme} qui triompha. ${characters.antagonist.name}, vaincu${characters.antagonist.name.endsWith('e') ? 'e' : ''} non par la force, mais par la vérité et la détermination de ${characters.protagonist.name}, finit par comprendre l'erreur de ${characters.antagonist.name.endsWith('e') ? 'ses' : 'ses'} voies.

"C'est fini," murmura ${characters.protagonist.name}, épuisé${characters.protagonist.name.endsWith('e') ? 'e' : ''} mais victorieu${characters.protagonist.name.endsWith('e') ? 'se' : 'x'}.

${characters.ally.name} s'approcha et posa une main rassurante sur l'épaule de ${characters.protagonist.name}. "Non, ${characters.protagonist.name}. Ce n'est que le début."

Et en effet, cette aventure avait transformé ${characters.protagonist.name} en quelqu'un de nouveau, quelqu'un de plus fort, quelqu'un de prêt pour tous les défis à venir.`
      } else {
        return `L'étau se resserrait autour de ${characters.protagonist.name} et ${characters.ally.name}. Les événements s'accéléraient, et chaque décision pouvait être la dernière.

"Nous devons agir maintenant," dit ${characters.ally.name} d'un ton urgent. "Plus nous attendons, plus ${characters.antagonist.name} renforce ${characters.antagonist.name.endsWith('e') ? 'ses' : 'ses'} positions."

${characters.protagonist.name} hocha la tête, sentant le poids de la responsabilité sur ${characters.protagonist.name.endsWith('e') ? 'ses' : 'ses'} épaules. Tout ce qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} avait appris jusqu'à présent allait être mis à l'épreuve.

La bataille finale approchait, et ${characters.protagonist.name} savait qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} devait être prêt${characters.protagonist.name.endsWith('e') ? 'e' : ''} à tout sacrifier pour ${elements.theme}.

L'avenir de tous dépendait maintenant des choix qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} allait faire.`
      }
    }

    // Contenu des chapitres intermédiaires
    const generateMidChapterContent = (chapterNumber: number, characters: any, elements: any, sceneType: string, atmosphere: string, transition: string, genre: string, keywords: string[]) => {
      const content = []
      
      content.push(`${transition}, l'aventure de ${characters.protagonist.name} prenait une nouvelle tournure.`)
      content.push('')
      content.push(`${atmosphere} tandis que ${characters.protagonist.name} et ${characters.ally.name} avançaient dans leur quête.`)
      content.push('')
      
      // Ajouter du contenu spécifique selon le type de scène
      switch (sceneType) {
        case 'dialogue':
          content.push(generateDialogueScene(characters, elements))
          break
        case 'action':
          content.push(generateActionScene(characters, genre))
          break
        case 'mystère':
          content.push(generateMysteryScene(characters, keywords))
          break
        case 'découverte':
          content.push(generateDiscoveryScene(characters, elements, genre))
          break
        default:
          content.push(generateGeneralScene(characters, elements, chapterNumber))
      }
      
      content.push('')
      content.push(`Le destin de ${characters.protagonist.name} se dessinait peu à peu, et chaque pas ${characters.protagonist.name.endsWith('e') ? 'la' : 'le'} rapprochait de sa destinée.`)
      
      return content.join('\n')
    }

    // Différents types de scènes
    const generateDialogueScene = (characters: any, elements: any) => {
      return `"Je ne suis pas sûr${characters.protagonist.name.endsWith('e') ? 'e' : ''} de comprendre," dit ${characters.protagonist.name} en fronçant les sourcils.

${characters.ally.name} s'arrêta et se tourna vers ${characters.protagonist.name.endsWith('e') ? 'elle' : 'lui'}. "Ce que je vais vous dire va changer votre vision des choses."

"Je vous écoute."

"${elements.theme.charAt(0).toUpperCase() + elements.theme.slice(1)} n'est pas qu'un concept. C'est une force réelle, tangible, qui peut changer le cours des événements."

${characters.protagonist.name} resta silencieu${characters.protagonist.name.endsWith('e') ? 'se' : 'x'} un moment, absorbant ces paroles.

"Vous voulez dire que tout ce temps..."

"Oui," confirma ${characters.ally.name}. "Tout ce temps, vous aviez en vous le pouvoir de faire la différence. Il fallait juste que vous l'acceptiez."`
    }

    const generateActionScene = (characters: any, genre: string) => {
      const actions = {
        'science-fiction': ['la station spatiale tremblait', 'les alarmes retentissaient', 'les systèmes s\'affolaient'],
        'fantasy': ['les créatures surgissaient', 'la magie crépitait', 'les sortilèges fusaient'],
        'thriller': ['les poursuivants se rapprochaient', 'les ombres bougeaient', 'le danger rôdait'],
        'aventure': ['le sol s\'effondrait', 'la tempête se levait', 'le chemin se compliquait'],
        'default': ['l\'action s\'intensifiait', 'la tension montait', 'tout s\'accélérait']
      }
      
      const actionList = actions[genre as keyof typeof actions] || actions.default
      const selectedAction = actionList[Math.floor(Math.random() * actionList.length)]
      
      return `Soudain, ${selectedAction} !

"Vite !" cria ${characters.ally.name}. "Il faut partir, maintenant !"

${characters.protagonist.name} n'hésita pas une seconde. ${characters.protagonist.name.endsWith('e') ? 'Elle' : 'Il'} courut aux côtés de ${characters.ally.name}, son cœur battant à tout rompre.

Derrière eux, le chaos régnait, mais ${characters.protagonist.name} savait qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} ne pouvait pas se retourner. Pas maintenant.

"Par ici !" indiqua ${characters.ally.name} en montrant une direction.

Ensemble, ils s'élancèrent vers l'inconnu, laissant derrière eux un monde qui ne serait plus jamais le même.`
    }

    const generateMysteryScene = (characters: any, keywords: string[]) => {
      const mysteryElement = keywords[Math.floor(Math.random() * keywords.length)] || 'objet mystérieux'
      
      return `${characters.protagonist.name} examina attentivement le ${mysteryElement.toLowerCase()} qui venait d'apparaître devant ${characters.protagonist.name.endsWith('e') ? 'elle' : 'lui'}.

"Qu'est-ce que vous en pensez ?" demanda ${characters.protagonist.name} à ${characters.ally.name}.

${characters.ally.name} s'approcha prudemment. "${characters.ally.name.endsWith('e') ? 'Elle' : 'Il'} semblait ${characters.ally.personality}, mais quelque chose l'inquiétait."

"Je n'ai jamais rien vu de tel," avoua ${characters.ally.name}. "Mais regardez ces marques... elles ressemblent à..."

${characters.ally.name} s'interrompit, le visage soudain pâle.

"À quoi ?" insista ${characters.protagonist.name}.

"Aux légendes que racontait ma grand-mère. Des légendes que je pensais inventées..."

Un frisson parcourut ${characters.protagonist.name}. Si ${characters.ally.name} avait raison, alors cette découverte changeait tout.`
    }

    const generateDiscoveryScene = (characters: any, elements: any, genre: string) => {
      return `Ce que ${characters.protagonist.name} découvrit ce jour-là dépassait tout ce qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} avait pu imaginer.

${elements.setting}, caché depuis des années, se trouvait un secret qui allait bouleverser leur compréhension des événements.

"Incroyable," murmura ${characters.ally.name} en contemplant la découverte.

${characters.protagonist.name} était sans voix. Tout prenait enfin un sens : les événements étranges, les coïncidences troublantes, les signes qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} avait refusé de voir.

"Maintenant, nous savons où nous devons aller," dit ${characters.protagonist.name} avec une détermination nouvelle.

${characters.ally.name} acquiesça. "Oui, mais le chemin ne sera pas facile. ${characters.antagonist.name || 'Nos adversaires'} ne nous laisseront pas faire."

"Alors nous devrons être plus malins qu'eux," répondit ${characters.protagonist.name}. "Nous n'avons plus le choix."`
    }

    const generateGeneralScene = (characters: any, elements: any, chapterNumber: number) => {
      return `L'aventure de ${characters.protagonist.name} continuait, riche en rebondissements et en découvertes.

Chaque jour apportait de nouveaux défis, de nouvelles alliances, et de nouvelles révélations sur la véritable nature de ce qui se tramait.

${characters.ally.name} s'avérait être un${characters.ally.name.endsWith('e') ? 'e' : ''} allié${characters.ally.name.endsWith('e') ? 'e' : ''} précieu${characters.ally.name.endsWith('e') ? 'se' : 'x'}, et ${characters.protagonist.name} apprenait chaque jour à mieux ${characters.ally.name.endsWith('e') ? 'la' : 'le'} connaître.

Ensemble, ils formaient une équipe redoutable, unie par ${elements.theme} et par leur détermination à réussir leur mission.

Mais ils savaient tous les deux que le plus difficile restait à venir.`
    }

    // Génération de lieux pour les scènes
    const generateSceneLocation = (genre: string) => {
      const locations = {
        'science-fiction': ['dans un laboratoire secret', 'à bord d\'un vaisseau spatial', 'dans une station orbitale', 'dans une base souterraine'],
        'fantasy': ['dans une taverne mystérieuse', 'au cœur de la forêt enchantée', 'dans un ancien temple', 'près d\'un lac magique'],
        'thriller': ['dans un café discret', 'dans un parking souterrain', 'dans un appartement sécurisé', 'dans une ruelle sombre'],
        'romance': ['dans un jardin fleuri', 'sur une terrasse avec vue', 'dans un petit restaurant', 'au bord de la mer'],
        'aventure': ['dans une grotte cachée', 'au sommet d\'une montagne', 'dans une clairière', 'près d\'une cascade'],
        'default': ['dans un lieu tranquille', 'à l\'abri des regards', 'dans un endroit sûr', 'dans un cadre paisible']
      }
      
      const genreLocations = locations[genre as keyof typeof locations] || locations.default
      return genreLocations[Math.floor(Math.random() * genreLocations.length)]
    }

    // Conclusion narrative
    const generateNarrativeConclusion = (elements: any, characters: any, genre: string) => {
      return `# Épilogue : Un Nouveau Départ

Quelques semaines après ces événements extraordinaires, ${characters.protagonist.name} se tenait à l'endroit même où tout avait commencé.

Tant de choses avaient changé depuis ce premier jour. ${characters.protagonist.name.endsWith('e') ? 'Elle' : 'Il'} n'était plus ${characters.protagonist.name.endsWith('e') ? 'la même personne' : 'le même homme'}. L'aventure ${characters.protagonist.name.endsWith('e') ? 'l\'avait' : 'l\'avait'} transformé${characters.protagonist.name.endsWith('e') ? 'e' : ''}, ${characters.protagonist.name.endsWith('e') ? 'la' : 'le'} rendant plus fort${characters.protagonist.name.endsWith('e') ? 'e' : ''}, plus sage.

${characters.ally.name} ${characters.ally.lastName} était devenu${characters.ally.name.endsWith('e') ? 'e' : ''} bien plus qu'un${characters.ally.name.endsWith('e') ? 'e' : ''} simple allié${characters.ally.name.endsWith('e') ? 'e' : ''}. Leur amitié, forgée dans l'adversité, était maintenant indestructible.

"Vous pensez que c'est vraiment fini ?" demanda ${characters.ally.name} en rejoignant ${characters.protagonist.name}.

${characters.protagonist.name} sourit, un sourire que ${characters.ally.name} ne ${characters.ally.name.endsWith('e') ? 'lui' : 'lui'} avait jamais vu auparavant - un sourire plein de confiance et de sérénité.

"Non," répondit ${characters.protagonist.name}. "Je pense que c'est juste le commencement."

Au loin, l'horizon s'étendait, plein de promesses et de nouvelles aventures. ${characters.protagonist.name} savait maintenant qu'${characters.protagonist.name.endsWith('e') ? 'elle' : 'il'} était prêt${characters.protagonist.name.endsWith('e') ? 'e' : ''} pour tout ce que l'avenir pourrait ${characters.protagonist.name.endsWith('e') ? 'lui' : 'lui'} réserver.

Même ${characters.antagonist.name}, leur ancien adversaire, avait trouvé un nouveau chemin. La rédemption était possible, et ${elements.theme} avait finalement triomphé de tout.

${characters.protagonist.name} prit une profonde inspiration, sentant la brise qui portait avec elle les parfums d'aventures à venir.

"Prêt${characters.protagonist.name.endsWith('e') ? 'e' : ''} pour la prochaine aventure ?" demanda ${characters.ally.name} avec un clin d'œil.

"Toujours," répondit ${characters.protagonist.name} sans hésitation.

Et ensemble, ils se dirigèrent vers l'horizon, sachant que leur histoire était loin d'être terminée.

**FIN**

*Car toute fin n'est qu'un nouveau commencement...*

*Fin de l'histoire*

---

*Généré avec passion par Story2book AI* ✨`
    }

    const title = generateTitle(formData.idea, formData.genre)
    const author = formData.author.trim() || generateAuthor(formData.genre) // Utiliser l'auteur fourni ou générer si vide
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