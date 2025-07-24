import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

interface FormData {
  idea: string
  author: string
  genre: string
  targetAudience: string
  length: string
  exactPages: number
  fontFamily: string
  hasWatermark: boolean
}

interface GeneratedContent {
  title: string
  author: string
  content: string
  coverDescription: string
}

// Initialiser les APIs IA avec système de fallback
const openaiApiKey = process.env.OPENAI_API_KEY
const googleApiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyADxgpjRiMRWwdWrXnoORIt_ibPX7N1FQs'

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null
const genAI = new GoogleGenerativeAI(googleApiKey)

// Fonction pour détecter quelle API utiliser
const getPreferredAI = () => {
  if (openaiApiKey && openai) {
    return 'openai'
  }
  return 'google'
}

// Générateur d'éléments uniques pour chaque histoire
const generateUniqueElements = () => {
  const timestamp = Date.now()
  const randomSeed = Math.floor(Math.random() * 1000000)
  
  // Éléments créatifs uniques
  const uniqueElements = {
    styleVariations: [
      'style narratif classique avec de riches descriptions',
      'approche moderne avec dialogues dynamiques', 
      'narration immersive à la première personne',
      'perspective omnisciente avec multiple points de vue',
      'style cinématographique avec scènes détaillées',
      'approche littéraire avec métaphores poétiques',
      'narration rythmée avec suspense crescendo',
      'style documentaire romancé très détaillé'
    ],
    
    atmospheres: [
      'mystérieuse et intrigante',
      'lumineuse et optimiste',
      'intense et dramatique', 
      'mélancolique et contemplative',
      'aventureuse et dynamique',
      'romantique et passionnée',
      'sombre et captivante',
      'épique et grandiose'
    ],
    
    narrativeTechniques: [
      'flashbacks entrelacés avec le présent',
      'récit chronologique linéaire détaillé',
      'narration en spirale avec révélations progressives',
      'histoire racontée à travers multiple témoignages',
      'récit avec analepses et prolepses subtiles',
      'narration polyphonique avec voix multiples',
      'structure en parallèle avec convergence finale',
      'récit enchâssé avec histoires dans l\'histoire'
    ],
    
    creativeTwists: [
      'révélation surprenante à mi-parcours',
      'personnage mystérieux aux motivations cachées',
      'élément inattendu qui change tout',
      'secret de famille qui bouleverse l\'intrigue',
      'coïncidence extraordinaire qui fait sens',
      'retournement de situation spectaculaire',
      'connexion inattendue entre événements',
      'découverte qui remet tout en question'
    ],
    
    uniqueDetails: [
      'objets symboliques récurrents',
      'traditions familiales spécifiques',
      'lieux chargés d\'histoire personnelle',
      'rituels quotidiens significatifs',
      'souvenirs sensoriels marquants',
      'habitudes particulières des personnages',
      'expressions linguistiques uniques',
      'références culturelles spécifiques'
    ]
  }
  
  // Sélection aléatoire d'éléments uniques basée sur timestamp et random
  const selectedElements = {
    style: uniqueElements.styleVariations[timestamp % uniqueElements.styleVariations.length],
    atmosphere: uniqueElements.atmospheres[randomSeed % uniqueElements.atmospheres.length],
    technique: uniqueElements.narrativeTechniques[(timestamp + randomSeed) % uniqueElements.narrativeTechniques.length],
    twist: uniqueElements.creativeTwists[(timestamp * 3) % uniqueElements.creativeTwists.length],
    details: uniqueElements.uniqueDetails[(randomSeed * 7) % uniqueElements.uniqueDetails.length],
    uniqueId: `${timestamp}-${randomSeed}`,
    timeSignature: new Date().toISOString()
  }
  
  return selectedElements
}

export async function generateEbook(formData: FormData): Promise<GeneratedContent> {
  try {
    // Générer des éléments uniques pour cette histoire spécifique
    const uniqueElements = generateUniqueElements()
    
    // Calcul précis du nombre de mots basé sur des pages réelles
    // Environ 250 mots par page est le standard des livres publiés
    const wordsPerPage = 250
    
    const getExactLength = (length: string, exactPages: number) => {
      const lengthConfig = {
        court: { pages: 10, minPages: 5, maxPages: 15 },      // 5-15 pages (cible 10)
        moyen: { pages: 27, minPages: 20, maxPages: 35 },     // 20-35 pages (cible 27)  
        long: { pages: 47, minPages: 35, maxPages: 60 },      // 35-60 pages (cible 47)
        exact: { pages: exactPages, minPages: exactPages, maxPages: exactPages }, // Pages exactes
      }
      
      const config = lengthConfig[length as keyof typeof lengthConfig] || lengthConfig.court
      const exactWords = config.pages * wordsPerPage
      const minWords = config.minPages * wordsPerPage
      const maxWords = config.maxPages * wordsPerPage
      
      return {
        pages: config.pages,
        minPages: config.minPages,
        maxPages: config.maxPages,
        exactWords,
        minWords,
        maxWords,
        chaptersCount: Math.ceil(config.pages / 5), // Environ 5 pages par chapitre
        wordsPerChapter: Math.ceil(exactWords / Math.ceil(config.pages / 5))
      }
    }

    const lengthConfig = getExactLength(formData.length, formData.exactPages)
    
    const targetLength = `ENTRE ${lengthConfig.minPages} ET ${lengthConfig.maxPages} PAGES (${lengthConfig.minWords}-${lengthConfig.maxWords} mots)
- Cible optimale : ${lengthConfig.pages} pages (${lengthConfig.exactWords} mots)
- Nombre de chapitres requis : ${lengthConfig.chaptersCount}
- Mots par chapitre : environ ${lengthConfig.wordsPerChapter} mots chacun

IMPORTANT : Respecte la fourchette ${lengthConfig.minWords}-${lengthConfig.maxWords} mots. L'objectif est ${lengthConfig.exactWords} mots.`

    // Classification des genres pour éviter la confusion fiction/non-fiction
    const getGenreCategory = (genre: string): 'fiction' | 'non-fiction' => {
      const fictionGenres = ['roman', 'science-fiction', 'fantasy', 'thriller', 'romance', 'aventure', 'mystere']
      const nonFictionGenres = ['historique', 'biographie', 'developpement-personnel', 'sport-sante', 'autres']
      
      if (fictionGenres.includes(genre)) return 'fiction'
      if (nonFictionGenres.includes(genre)) return 'non-fiction'
      return 'fiction' // Par défaut
    }

    // Instructions spécifiques selon le genre avec éléments d'unicité
    const getGenreSpecificInstructions = (genre: string, idea: string, audience: string, unique: any): string => {
      const category = getGenreCategory(genre)

      // Instructions globales selon la catégorie
      const getCategoryInstructions = (): string => {
        if (category === 'non-fiction') {
          return `
🚫 INTERDICTION ABSOLUE DE FICTION - CONTENU FACTUEL UNIQUEMENT 🚫

⚠️ RÈGLES STRICTES POUR CONTENU NON-FICTIONNEL :
- AUCUN personnage inventé ou prénom fictif
- AUCUNE histoire imaginaire ou scénario inventé
- AUCUN dialogue fictif entre personnes
- SEULEMENT des FAITS, ANALYSES, CONSEILS et INFORMATIONS RÉELLES
- Format : Guide, Manuel, Analyse, Documentation, Étude
- Ton : Informatif, Éducatif, Professionnel, Objectif

✅ AUTORISÉ : Exemples anonymes, études de cas réels, témoignages sans noms
❌ INTERDIT : "Marie découvrit que...", "Jean se demandait si...", etc.

STRUCTURE OBLIGATOIRE NON-FICTION :
- Introduction factuelle
- Développement par thèmes/époques/méthodes
- Exemples concrets et vérifiables
- Conclusion informative`
        } else {
          return `
📚 CRÉATION FICTIONNELLE AUTORISÉE 📚

✅ Pour ce genre de FICTION, tu peux créer :
- Personnages avec des prénoms et développement
- Dialogues et interactions
- Intrigues et scénarios imaginaires
- Descriptions narratives immersives
- Développement d'univers fictif

STRUCTURE NARRATIVE CLASSIQUE :
- Mise en place des personnages et contexte
- Développement de l'intrigue
- Points culminants et rebondissements
- Résolution satisfaisante`
        }
      }
      
      // Instructions spécifiques selon l'audience
      const getAudienceInstructions = (audience: string): string => {
        switch (audience) {
          case 'enfants':
            return `
📚 ADAPTATION POUR ENFANTS (6-12 ans) :
- Utilise un VOCABULAIRE SIMPLE et ACCESSIBLE
- Phrases COURTES et structures CLAIRES
- ÉVITE les concepts complexes ou abstraits
- Inclus des ÉLÉMENTS LUDIQUES et éducatifs
- Tons OPTIMISTE et ENCOURAGEANT
- ILLUSTRATIONS verbales colorées et imaginatives
- Évite les sujets sombres ou effrayants
- Privilégie l'APPRENTISSAGE par le jeu et l'aventure`
          
          case 'adolescents':
            return `
🎯 ADAPTATION POUR ADOLESCENTS (13-17 ans) :
- Utilise un LANGAGE MODERNE et DYNAMIQUE
- Aborde des DÉFIS et QUESTIONNEMENTS propres à l'âge
- Inclus des RÉFÉRENCES ACTUELLES et tendances
- Ton ÉNERGIQUE et MOTIVANT
- Traite de DÉCOUVERTE DE SOI et d'identité
- Évite le ton moralisateur, privilégie l'INSPIRATION
- Inclus des EXEMPLES CONCRETS et situations réelles
- Encourage l'AUTONOMIE et la prise de décision`
          
          case 'jeunes-adultes':
            return `
🚀 ADAPTATION POUR JEUNES ADULTES (18-25 ans) :
- Aborde les TRANSITIONS et nouveaux défis de l'âge adulte
- Traite de CARRIÈRE, relations, et indépendance
- Ton INSPIRANT et PRATIQUE
- Inclus des STRATÉGIES CONCRÈTES et actionables
- Évoque les DÉFIS MODERNES (technologie, réseaux sociaux, etc.)
- Encourage l'AMBITION et la réalisation de soi
- Style ACCESSIBLE mais SOPHISTIQUÉ`
          
          case 'adultes':
            return `
💼 ADAPTATION POUR ADULTES (25+ ans) :
- Approche PROFESSIONNELLE et EXPERTE
- Traite de sujets COMPLEXES avec nuance
- Inclus des ÉTUDES DE CAS et exemples concrets
- Ton AUTORITAIRE mais accessible
- Aborde les défis de la VIE PROFESSIONNELLE et personnelle
- Références à l'EXPÉRIENCE et la maturité
- Stratégies AVANCÉES et concepts approfondis`
          
          default:
            return `
🌍 ADAPTATION TOUT PUBLIC :
- Langage UNIVERSEL et INCLUSIF
- Évite les références trop spécifiques à un âge
- Ton BIENVEILLANT et ACCESSIBLE
- Exemples VARIÉS couvrant différentes situations de vie
- Approche ÉQUILIBRÉE entre simplicité et profondeur`
        }
      }

      if (genre === 'historique') {
        return `
${getCategoryInstructions()}

📜 INSTRUCTIONS RENFORCÉES POUR LE GENRE HISTORIQUE :
- Tu es maintenant un HISTORIEN EXPERT qui présente des FAITS HISTORIQUES RÉELS
- ABSOLUMENT AUCUN personnage fictif ou prénom inventé
- Base-toi UNIQUEMENT sur des événements, dates et personnages historiques AUTHENTIQUES
- Cite des DATES PRÉCISES, LIEUX RÉELS, PERSONNAGES HISTORIQUES AVÉRÉS
- JAMAIS de dialogues inventés ou de scènes fictives
- Format : Chronologie, Analyse historique, Documentation factuelle
- Ton : Académique, Informatif, Objectif

⚠️ EXEMPLES INTERDITS :
❌ "Jean, un paysan du Moyen Âge, se leva un matin..."
❌ "Marie, une noble de l'époque, pensait que..."
❌ Dialogues inventés entre personnages

✅ EXEMPLES AUTORISÉS :
✅ "Les paysans du Moyen Âge vivaient dans des conditions..."
✅ "La noblesse de l'époque était caractérisée par..."
✅ Citations historiques documentées avec sources

STRUCTURE HISTORIQUE OBLIGATOIRE :
- Contexte et période historique
- Événements chronologiques avec dates
- Analyses des causes et conséquences
- Impact sur la société et l'époque
- Sources et références documentaires

🎨 ÉLÉMENTS D'UNICITÉ POUR CETTE HISTOIRE HISTORIQUE (ID: ${unique.uniqueId}) :
- STYLE NARRATIF UNIQUE : Adopte un ${unique.style} pour cette histoire spécifique
- ATMOSPHÈRE DISTINCTIVE : Crée une ambiance ${unique.atmosphere} tout au long du récit
- TECHNIQUE NARRATIVE : Utilise une ${unique.technique} pour rendre cette histoire différente
- ANGLE CRÉATIF : Intègre ${unique.twist} dans la présentation des faits historiques
- DÉTAILS DISTINCTIFS : Mets l'accent sur ${unique.details} pour personnaliser ce récit

DÉVELOPPEMENT APPROFONDI REQUIS POUR ATTEINDRE ${lengthConfig.minWords}-${lengthConfig.maxWords} MOTS :
- Chaque chapitre doit faire EXACTEMENT environ ${lengthConfig.wordsPerChapter} mots
- Développe en profondeur les contextes sociaux, économiques et culturels
- Inclus de nombreux exemples concrets et témoignages d'époque
- Explique les nuances et complexités de chaque période
- Ajoute des anecdotes historiques vérifiées pour enrichir le récit
- Détaille les conséquences à court, moyen et long terme
- Analyse les différents points de vue historiques sur les événements
- PERSPECTIVE UNIQUE : Adopte un angle narratif que personne d'autre n'aurait choisi

STRUCTURE OBLIGATOIRE UNIQUE :
${Array.from({length: lengthConfig.chaptersCount}, (_, i) => 
  `# Chapitre ${i + 1} : [Titre unique avec dates] (${lengthConfig.wordsPerChapter} mots requis)`
).join('\n')}

IMPORTANT : Si c'est l'histoire d'un pays, d'une personne ou d'un événement spécifique, respecte scrupuleusement les faits historiques établis MAIS avec une approche narrative unique.

${getAudienceInstructions(audience)}`
      }
      
      if (genre === 'developpement-personnel') {
        return `
📈 INSTRUCTIONS SPÉCIFIQUES POUR LE DÉVELOPPEMENT PERSONNEL :
- Tu es maintenant un EXPERT EN DÉVELOPPEMENT PERSONNEL et coach de vie
- INTERDICTION ABSOLUE : NE CRÉE JAMAIS DE FICTION, D'HISTOIRES OU DE PERSONNAGES INVENTÉS
- Crée un GUIDE PRATIQUE et ACTIONNABLE - SEULEMENT DES CONSEILS RÉELS
- Structure ton contenu en CHAPITRES THÉMATIQUES avec des exercices concrets
- Utilise un ton MOTIVANT, BIENVEILLANT et EXPERT
- Inclus des TECHNIQUES CONCRÈTES, des EXERCICES PRATIQUES et des ÉTAPES À SUIVRE
- Ajoute des EXEMPLES RÉELS (sans noms) et des ÉTUDES DE CAS inspirantes
- JAMAIS d'histoires fictives, de dialogues inventés ou de scénarios imaginaires
- Concentre-toi EXCLUSIVEMENT sur des CONSEILS PRATIQUES et des STRATÉGIES ÉPROUVÉES
- Inclus des EXERCICES D'AUTO-RÉFLEXION et des questions pour le lecteur
- Structure claire avec INTRODUCTION, DÉVELOPPEMENT PRATIQUE, et PLAN D'ACTION

⚠️ RAPPEL CRITIQUE : C'EST UN GUIDE PRATIQUE, PAS UNE FICTION !

🎯 FORMAT OBLIGATOIRE POUR DÉVELOPPEMENT PERSONNEL :
- Introduction : Présentation claire du sujet et des bénéfices
- Chapitres thématiques avec conseils pratiques et méthodes
- Exercices concrets et actionables à la fin de chaque chapitre  
- Exemples d'application réels et témoignages anonymes
- Plan d'action final avec étapes détaillées à suivre
- Conclusion motivante avec encouragements et résumé des points clés

STRUCTURE OBLIGATOIRE PRATIQUE :
${Array.from({length: lengthConfig.chaptersCount}, (_, i) => 
  `# Chapitre ${i + 1} : [Titre pratique et actionnable] (${lengthConfig.wordsPerChapter} mots de conseils pratiques)`
).join('\n')}

${getAudienceInstructions(audience)}

🌟 APPROCHE UNIQUE POUR CE GUIDE (ID: ${unique.uniqueId}) :
- MÉTHODE DISTINCTIVE : ${unique.technique} pour structurer les conseils pratiques
- ANGLE SPÉCIFIQUE : ${unique.atmosphere} dans le ton des conseils
- APPROCHE PÉDAGOGIQUE : ${unique.style} pour présenter les stratégies
- ÉLÉMENT SIGNATURE : ${unique.twist} comme approche méthodologique innovante
- FOCUS PARTICULIER : ${unique.details} pour personnaliser les techniques

⚠️ RAPPEL FINAL : ZÉRO FICTION - SEULEMENT DU CONTENU PRATIQUE ET ACTIONNABLE !`
      }
      
      if (genre === 'biographie') {
        return `
${getCategoryInstructions()}

👤 INSTRUCTIONS RENFORCÉES POUR LA BIOGRAPHIE :
- Tu es maintenant un BIOGRAPHE EXPERT qui présente des FAITS RÉELS VÉRIFIABLES
- ABSOLUMENT AUCUNE invention de scènes ou dialogues fictifs
- Base-toi UNIQUEMENT sur événements documentés et dates authentiques
- JAMAIS d'imagination ou de reconstruction fictive de conversations
- Format : Chronologie factuelle, Analyse objective, Documentation historique
- Ton : Informatif, Respectueux, Professionnel, Basé sur les sources

⚠️ EXEMPLES INTERDITS EN BIOGRAPHIE :
❌ "Marie Curie se leva ce matin-là en pensant..."
❌ "Einstein dit à sa femme : 'Je pense que...'"
❌ Scènes intimistes inventées ou dialogues reconstitués

✅ EXEMPLES AUTORISÉS EN BIOGRAPHIE :
✅ "Marie Curie a obtenu son premier Prix Nobel en 1903"
✅ "Selon les témoignages de l'époque, Einstein était connu pour..."
✅ "Les correspondances révèlent que..."

STRUCTURE BIOGRAPHIQUE OBLIGATOIRE :
- Naissance et contexte familial
- Formation et jeunesse documentées
- Carrière et réalisations principales
- Impact et héritage vérifiable
- Sources et témoignages authentiques

${getAudienceInstructions(audience)}

🌟 ÉLÉMENTS D'UNICITÉ POUR CETTE BIOGRAPHIE (ID: ${unique.uniqueId}) :
- STYLE NARRATIF : ${unique.style} pour raconter la vie
- PERSPECTIVE : ${unique.atmosphere} dans l'approche biographique
- STRUCTURE : ${unique.technique} pour organiser les événements
- ANGLE UNIQUE : ${unique.twist} comme fil conducteur
- FOCUS : ${unique.details} pour enrichir le récit`
      }

      if (genre === 'sport-sante') {
        return `
${getCategoryInstructions()}

🏃‍♂️ INSTRUCTIONS RENFORCÉES POUR SPORT ET SANTÉ :
- Tu es maintenant un EXPERT EN SPORT ET SANTÉ qui présente des informations médicales et sportives FIABLES
- ABSOLUMENT AUCUN personnage fictif ou histoire inventée
- Base-toi UNIQUEMENT sur des faits scientifiques, études médicales et recommandations d'experts
- JAMAIS de témoignages fictifs ou scénarios imaginaires
- Format : Guide pratique, Manuel d'exercices, Conseils nutritionnels, Information médicale
- Ton : Professionnel, Informatif, Sécuritaire, Basé sur la science

⚠️ EXEMPLES INTERDITS EN SPORT ET SANTÉ :
❌ "Marc, un sportif de 25 ans, découvrit que..."
❌ "Sarah dit à son coach : 'Je me sens fatiguée...'"
❌ Histoires personnelles inventées ou dialogues fictifs

✅ EXEMPLES AUTORISÉS EN SPORT ET SANTÉ :
✅ "Les exercices cardiovasculaires permettent d'améliorer..."
✅ "Selon les études scientifiques, une alimentation équilibrée..."
✅ "Les professionnels de santé recommandent..."
✅ "Les recherches démontrent que l'activité physique..."

STRUCTURE SPORT ET SANTÉ OBLIGATOIRE :
- Introduction scientifique au sujet
- Bénéfices prouvés et recommandations d'experts
- Méthodes et techniques concrètes
- Conseils pratiques et programmes d'action
- Précautions et contre-indications
- Sources scientifiques et références médicales

DOMAINES D'EXPERTISE AUTORISÉS :
- Exercices physiques et programmes d'entraînement
- Nutrition et conseils alimentaires
- Prévention santé et bien-être
- Techniques de récupération et relaxation
- Informations médicales générales (non diagnostiques)

⚠️ AVERTISSEMENT OBLIGATOIRE : Inclure systématiquement "Consultez un professionnel de santé avant tout changement majeur"

${getAudienceInstructions(audience)}

🌟 APPROCHE UNIQUE POUR CE GUIDE SPORT-SANTÉ (ID: ${unique.uniqueId}) :
- MÉTHODE DISTINCTIVE : ${unique.technique} pour structurer les conseils sportifs
- ANGLE SPÉCIFIQUE : ${unique.atmosphere} dans l'approche santé
- APPROCHE PÉDAGOGIQUE : ${unique.style} pour présenter l'information médicale
- ÉLÉMENT SIGNATURE : ${unique.twist} comme approche innovante
- FOCUS PARTICULIER : ${unique.details} pour personnaliser les recommandations`
      }

      if (genre === 'autres') {
        return `
${getCategoryInstructions()}

🎨 INSTRUCTIONS POUR GENRE "AUTRES" :
- Tu vas créer un contenu ADAPTATIF selon l'idée proposée par l'utilisateur
- Analyse l'idée pour déterminer automatiquement le format le plus approprié
- INTERDICTION de personnages fictifs SAUF si l'idée demande explicitement de la fiction
- Privilégie toujours le format INFORMATIF et ÉDUCATIF quand c'est possible
- Format adaptatif : Guide, Manuel, Analyse, Tutoriel, ou Fiction selon l'idée

🔍 ANALYSE AUTOMATIQUE DE L'IDÉE :
- Si l'idée concerne des FAITS, CONSEILS, APPRENTISSAGE → Format NON-FICTION
- Si l'idée demande une HISTOIRE, AVENTURE, PERSONNAGES → Format FICTION
- Si l'idée est ambiguë → Privilégier le format ÉDUCATIF

⚠️ RÈGLES POUR CONTENU "AUTRES" :
❌ Ne jamais inventer de personnages si l'idée ne le demande pas explicitement
❌ Pas de fiction gratuite pour des sujets sérieux
✅ Adapter le ton et le style au sujet proposé
✅ Créer le format le plus utile pour l'utilisateur

EXEMPLES D'ADAPTATION :
- "Guide de cuisine" → Format manuel pratique sans personnages
- "Histoire de pirates" → Format fiction avec personnages et aventures
- "Apprendre le jardinage" → Format guide éducatif factuel
- "Conte pour enfants" → Format fiction créative avec personnages

STRUCTURE ADAPTATIVE :
- Analyse de l'idée utilisateur
- Choix du format le plus approprié
- Développement selon les règles du format choisi
- Contenu optimisé pour l'objectif de l'utilisateur

${getAudienceInstructions(audience)}

🌟 APPROCHE UNIQUE POUR CE CONTENU "AUTRES" (ID: ${unique.uniqueId}) :
- ANALYSE INTELLIGENTE : ${unique.technique} pour déterminer le meilleur format
- ADAPTATION : ${unique.atmosphere} selon le sujet proposé
- STYLE FLEXIBLE : ${unique.style} adapté au contenu
- APPROCHE CRÉATIVE : ${unique.twist} comme élément distinctif
- PERSONNALISATION : ${unique.details} pour enrichir selon le thème`
      }
      
      // Instructions spécifiques par genre fictionnel
      if (category === 'fiction') {
        const fictionInstructions = {
          'science-fiction': `
🚀 INSTRUCTIONS POUR SCIENCE-FICTION :
- Crée un univers futuriste cohérent avec technologies avancées
- Développe des concepts scientifiques crédibles (voyages spatiaux, IA, etc.)
- Personnages : Scientifiques, explorateurs, robots, aliens avec prénoms futuristes
- Intrigue : Exploration spatiale, découvertes technologiques, conflits galactiques
- Ton : Aventureux, visionnaire, technologique`,

          'fantasy': `
🧙 INSTRUCTIONS POUR FANTASY :
- Crée un monde magique avec créatures fantastiques et systèmes de magie
- Personnages : Magiciens, guerriers, elfes, nains avec prénoms épiques
- Intrigue : Quêtes héroïques, batailles entre bien et mal, découvertes magiques
- Univers : Royaumes enchantés, forêts mystiques, châteaux, créatures légendaires
- Ton : Épique, merveilleux, aventureux`,

          'thriller': `
🔍 INSTRUCTIONS POUR THRILLER :
- Crée une intrigue haletante avec suspense constant et rebondissements
- Personnages : Détectives, criminels, victimes avec prénoms réalistes
- Intrigue : Enquêtes, poursuites, mystères à résoudre, danger permanent
- Atmosphère : Tension, mystère, urgence, révélations choc
- Ton : Intense, palpitant, sombre`,

          'romance': `
💕 INSTRUCTIONS POUR ROMANCE :
- Développe une histoire d'amour émouvante avec obstacles et passion
- Personnages : Héros et héroïne avec prénoms attractifs et personnalités fortes
- Intrigue : Rencontre, séduction, obstacles, réconciliation, amour triomphant
- Émotions : Passion, jalousie, tendresse, conflits amoureux
- Ton : Romantique, émotionnel, passionné`,

          'aventure': `
⚔️ INSTRUCTIONS POUR AVENTURE :
- Crée une quête épique avec défis, voyages et découvertes
- Personnages : Héros courageux, compagnons fidèles avec prénoms mémorables
- Intrigue : Voyages périlleux, trésors cachés, ennemis redoutables
- Action : Combats, évasions, explorations, défis physiques
- Ton : Dynamique, courageux, exaltant`,

          'mystere': `
🕵️ INSTRUCTIONS POUR MYSTÈRE :
- Développe une énigme complexe avec indices et fausses pistes
- Personnages : Enquêteurs, suspects, témoins avec prénoms intrigants
- Intrigue : Crime à élucider, indices à découvrir, coupable à démasquer
- Atmosphère : Suspense, secrets, révélations progressives
- Ton : Mystérieux, captivant, intellectuel`,

          'roman': `
📚 INSTRUCTIONS POUR ROMAN :
- Crée une histoire humaine profonde avec développement psychologique
- Personnages : Protagonistes complexes avec prénoms authentiques
- Intrigue : Relations humaines, conflits intérieurs, évolution des personnages
- Thèmes : Amour, famille, société, destin, croissance personnelle
- Ton : Littéraire, nuancé, émouvant`
        }

        return `
${getCategoryInstructions()}

${fictionInstructions[genre as keyof typeof fictionInstructions] || fictionInstructions['roman']}

✅ CRÉATION NARRATIVE OBLIGATOIRE :
- Développe des personnages avec PRÉNOMS et personnalités uniques
- Crée des DIALOGUES naturels et expressifs
- Construis une INTRIGUE captivante avec début/milieu/fin
- Ajoute des DESCRIPTIONS immersives d'environnements
- Développe les ÉMOTIONS et relations entre personnages`

      }

      return `
${getCategoryInstructions()}

INSTRUCTIONS GÉNÉRIQUES POUR LE GENRE ${genre.toUpperCase()} :
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

🌟 GARANTIE D'UNICITÉ ABSOLUE (ID: ${unique.uniqueId}) - JAMAIS RÉPÉTÉE :
- STYLE NARRATIF UNIQUE : Adopte un ${unique.style} spécialement pour cette histoire
- ATMOSPHÈRE DISTINCTIVE : Crée une ambiance ${unique.atmosphere} qui n'existera nulle part ailleurs
- TECHNIQUE NARRATIVE UNIQUE : Utilise une ${unique.technique} pour cette histoire seulement
- ÉLÉMENT CRÉATIF SIGNATURE : Intègre ${unique.twist} comme élément distinctif central
- DÉTAILS PERSONNALISÉS : Développe ${unique.details} de manière unique et mémorable

${getAudienceInstructions(audience)}

TECHNIQUES D'UNICITÉ OBLIGATOIRES :
- Crée des NOMS DE PERSONNAGES absolument uniques et mémorables
- Invente des LIEUX SPÉCIFIQUES avec géographie et histoire détaillées
- Développe des TRADITIONS et COUTUMES originales pour ton univers
- Ajoute des OBJETS SYMBOLIQUES qui n'existent que dans cette histoire
- Crée des EXPRESSIONS et LANGAGES spécifiques aux personnages
- Développe des CONFLITS INTERNES uniques pour chaque personnage
- Invente des HABITUDES et RITUELS particuliers aux personnages
- Ajoute des RÉFÉRENCES CULTURELLES originales et créatives

DÉVELOPPEMENT REQUIS POUR ATTEINDRE ${lengthConfig.minWords}-${lengthConfig.maxWords} MOTS :
- Chaque chapitre doit faire EXACTEMENT environ ${lengthConfig.wordsPerChapter} mots
- Développe chaque scène avec un maximum de détails descriptifs UNIQUES
- Ajoute des flashbacks et des backstories ORIGINALES pour enrichir les personnages
- Inclus des dialogues étendus avec des VOIX DISTINCTIVES pour chaque personnage
- Détaille chaque action, émotion et pensée avec une PERSPECTIVE UNIQUE
- Développe l'environnement et l'atmosphère avec des DÉTAILS JAMAIS VUS AILLEURS
- Crée des INTERACTIONS SOCIALES originales et authentiques
- Invente des PROBLÈMES et SOLUTIONS que personne d'autre n'aurait imaginés

STRUCTURE OBLIGATOIRE CRÉATIVE :
${Array.from({length: lengthConfig.chaptersCount}, (_, i) => 
  `# Chapitre ${i + 1} : [Titre créatif et unique] (${lengthConfig.wordsPerChapter} mots requis)`
).join('\n')}

⚠️ INTERDICTION ABSOLUE DE RÉPÉTITION :
- Ne JAMAIS utiliser des trames narratives classiques ou clichés
- Évite TOUS les stéréotypes de personnages ou de situations
- Crée des RETOURNEMENTS imprévisibles et originaux
- Invente des RÉSOLUTIONS créatives aux conflits
- Développe des RELATIONS INTER-PERSONNELLES uniques et complexes`
    }

    const genreInstructions = getGenreSpecificInstructions(formData.genre, formData.idea, formData.targetAudience, uniqueElements)

    const prompt = `Tu es un écrivain professionnel français expert en création d'ebooks. Crée un ebook complet et captivant basé sur cette idée :

IDÉE PRINCIPALE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR EXACTE REQUISE : ${targetLength}
AUTEUR : ${formData.author || "Auteur IA"}

${formData.genre === 'developpement-personnel' ? `
⚠️ ATTENTION SPÉCIALE DÉVELOPPEMENT PERSONNEL ⚠️
Tu vas créer un GUIDE PRATIQUE, PAS UNE FICTION !
- INTERDICTION ABSOLUE de créer des personnages, dialogues ou histoires inventées
- SEULEMENT des conseils pratiques, exercices et méthodes concrètes
- Format : Introduction + Chapitres thématiques + Exercices + Plan d'action
` : `🔥 SIGNATURE D'UNICITÉ DE CETTE HISTOIRE : ${uniqueElements.uniqueId}`}
Créée le : ${uniqueElements.timeSignature}

${genreInstructions}

⚠️ EXIGENCES D'UNICITÉ ABSOLUE - JAMAIS RÉPÉTÉE ⚠️ :
Cette histoire DOIT être absolument UNIQUE et ne JAMAIS ressembler à une autre histoire générée.

TECHNIQUES D'ORIGINALITÉ OBLIGATOIRES :
- Commence par un élément complètement INATTENDU lié à l'idée
- Développe des PERSONNAGES avec des particularités physiques/mentales uniques
- Crée un CONFLIT CENTRAL que personne d'autre n'aurait imaginé
- Invente des LIEUX avec des caractéristiques géographiques/architecturales originales
- Développe des SOUS-INTRIGUES surprenantes et interconnectées
- Ajoute des ÉLÉMENTS SENSORIELS spécifiques (sons, odeurs, textures)
- Crée des OBJETS ou SYMBOLES récurrents uniques à cette histoire
- Développe un LANGAGE ou des EXPRESSIONS propres aux personnages
- Invente des TRADITIONS ou RITUELS spécifiques à l'univers
- Ajoute des DÉTAILS HISTORIQUES ou CULTURELLES originaux

⚠️ EXIGENCES DE LONGUEUR ⚠️ :
- Tu DOIS générer ENTRE ${lengthConfig.minWords} et ${lengthConfig.maxWords} mots
- Cible optimale : ${lengthConfig.exactWords} mots
- Chaque chapitre DOIT faire environ ${lengthConfig.wordsPerChapter} mots
- Tu DOIS créer exactement ${lengthConfig.chaptersCount} chapitres
- Vise la cible optimale mais reste dans la fourchette autorisée
- Développe suffisamment pour créer un contenu riche et substantiel

TECHNIQUES POUR ATTEINDRE LA LONGUEUR EXACTE AVEC UNICITÉ :
- Développe CHAQUE scène avec des détails sensoriels UNIQUES
- Ajoute des descriptions exhaustives des lieux avec PARTICULARITÉS ORIGINALES
- Inclus de nombreux dialogues avec VOIX DISTINCTIVES pour chaque personnage
- Développe les pensées intérieures avec PERSPECTIVES UNIQUES
- Ajoute des transitions détaillées avec ÉLÉMENTS CRÉATIFS
- Explique les motivations avec PROFONDEUR PSYCHOLOGIQUE originale
- Décris les sensations physiques et émotionnelles de MANIÈRE INÉDITE

Génère un ebook complet et professionnel avec :

1. UN TITRE ACCROCHEUR ET UNIQUE (maximum 60 caractères)
2. LE CONTENU COMPLET DE L'EBOOK AVEC ${lengthConfig.minWords}-${lengthConfig.maxWords} MOTS :
   - Une introduction très engageante et UNIQUE (au moins 500 mots)
   - Exactement ${lengthConfig.chaptersCount} chapitres de ${lengthConfig.wordsPerChapter} mots chacun
   ${formData.genre === 'historique' ? '- Des faits historiques précis avec dates et contextes très détaillés MAIS présentés de manière unique' : '- Des dialogues naturels et des descriptions vivantes ABSOLUMENT ORIGINALES'}
   ${formData.genre === 'historique' ? '- Des références et sources historiques avec explications complètes et perspective unique' : '- Des personnages attachants et très bien développés avec des traits JAMAIS VUS AILLEURS'}
   - Des transitions fluides et détaillées entre les chapitres avec CRÉATIVITÉ
   ${formData.genre === 'historique' ? '- Une chronologie historique respectée avec de nombreux détails contextuels UNIQUES' : '- Une intrigue captivante avec de nombreux rebondissements IMPRÉVISIBLES'}
   - Une conclusion très satisfaisante et émotionnelle ORIGINALE (au moins 500 mots)
   - Un style d'écriture riche et adapté au public cible avec SIGNATURE UNIQUE
3. UNE DESCRIPTION DE COUVERTURE UNIQUE (pour génération d'image)

🎯 RAPPEL CRITIQUE : Cet ebook doit faire ENTRE ${lengthConfig.minPages}-${lengthConfig.maxPages} PAGES (${lengthConfig.minWords}-${lengthConfig.maxWords} mots) ET être absolument UNIQUE - jamais identique à une autre histoire !

Format de réponse EXACT (respecte absolument ce format) :
TITRE: [titre unique et accrocheur ici]
AUTEUR: ${formData.author || "Auteur IA"}
DESCRIPTION_COUVERTURE: [description détaillée et unique pour image de couverture]
CONTENU:
[contenu complet UNIQUE de l'ebook ici avec ${lengthConfig.minWords}-${lengthConfig.maxWords} mots - TRÈS LONG, DÉTAILLÉ ET ABSOLUMENT ORIGINAL]

CONTRÔLE FINAL OBLIGATOIRE : Vérifie que ton contenu fait bien entre ${lengthConfig.minWords}-${lengthConfig.maxWords} mots ET qu'il est absolument unique !`

    // Système de génération avec fallback intelligent
    let generatedText: string
    const preferredAI = getPreferredAI()

    if (preferredAI === 'openai' && openai) {
      console.log('🚀 Utilisation d\'OpenAI GPT-4o (API Premium)')
      
      try {
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Tu es un écrivain professionnel français expert en création d\'ebooks. Tu génères du contenu de haute qualité, précis et engageant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: formData.genre === 'historique' ? 0.7 : 1.0,
          max_tokens: 16384, // OpenAI limite plus stricte
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        })

        generatedText = completion.choices[0]?.message?.content || ''
        
        if (!generatedText) {
          throw new Error('Réponse vide d\'OpenAI')
        }
        
      } catch (openaiError) {
        console.warn('⚠️ Erreur OpenAI, fallback vers Google:', openaiError)
        
        // Fallback vers Google Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: formData.genre === 'historique' ? 0.7 : 1.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 32768,
          },
        })
        generatedText = result.response.text()
      }
      
    } else {
      console.log('🔄 Utilisation de Google Gemini (API de base)')
      
      // Utiliser Google Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: formData.genre === 'historique' ? 0.7 : 1.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 32768,
        },
      })
      generatedText = result.response.text()
    }

    // Parser la réponse selon le format attendu
    const parsed = parseGeneratedContent(generatedText, formData.author)
    
    // Ajouter la signature d'unicité dans les métadonnées (optionnel)
    parsed.content = `${parsed.content}\n\n<!-- Signature d'unicité: ${uniqueElements.uniqueId} | Créé: ${uniqueElements.timeSignature} -->`
    
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