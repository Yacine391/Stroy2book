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

// 🚀 OPENAI UNIQUEMENT - PLUS DE GOOGLE GEMINI
// IMPORTANT: Initialisation différée - pas au moment de l'import !

// 🚀 OPENAI UNIQUEMENT - Configuration vérifiée au démarrage

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
🎨 INSTRUCTIONS ULTRA-STRICTES POUR GENRE "AUTRES" :

🔍 ANALYSE OBLIGATOIRE DE L'IDÉE UTILISATEUR : "${idea}"

⚠️ RÈGLES STRICTES D'ADAPTATION AUTOMATIQUE :

1️⃣ ANALYSE AUTOMATIQUE DU SUJET :
- Examiner chaque mot de l'idée : "${idea}"
- Identifier le TYPE DE CONTENU demandé
- Choisir le FORMAT le plus approprié

2️⃣ FORMATS AUTORISÉS SELON LE SUJET :

📚 FORMAT ÉDUCATIF/INFORMATIF (PRIORITÉ) :
- Mots-clés détectés : "apprendre", "guide", "conseils", "comment", "technique", "méthode", "tutoriel", "formation", "découvrir", "comprendre", "expliquer"
- Contenu : Guide pratique, Manuel, Tutoriel, Documentation
- INTERDICTION ABSOLUE de personnages fictifs

🍳 FORMAT PRATIQUE/MANUEL :
- Mots-clés : "cuisine", "recette", "bricolage", "jardinage", "artisanat", "construction", "réparation", "DIY"
- Contenu : Instructions étape par étape, conseils pratiques
- INTERDICTION ABSOLUE de personnages fictifs

🌍 FORMAT DOCUMENTAIRE/FACTUEL :
- Mots-clés : "histoire de", "origine", "évolution", "découverte", "science", "géographie", "culture", "tradition"
- Contenu : Faits historiques, analyses, documentaire
- INTERDICTION ABSOLUE de personnages fictifs

🎭 FORMAT FICTION (SEULEMENT SI EXPLICITE) :
- Mots-clés : "histoire", "conte", "aventure", "personnage", "héros", "récit", "narration"
- Contenu : Histoire avec personnages SEULEMENT si clairement demandé

3️⃣ DÉCISION AUTOMATIQUE BASÉE SUR "${idea}" :

${(() => {
  const ideaLower = idea.toLowerCase()
  
  // Mots-clés pour contenu religieux/islamique
  const religiousKeywords = ['islam', 'musulman', 'coran', 'prophete', 'religion', 'hadith', 'allah', 'frise', 'chronologie', 'humanite', 'creation', 'adam', 'jugement', 'islamique', 'calir', 'mecque', 'medine', 'hégire', 'sunna']
  
  // Mots-clés pour contenu historique/chronologique
  const historicalKeywords = ['frise', 'chronologie', 'histoire', 'timeline', 'epoque', 'periode', 'evenement', 'historique', 'dates', 'debut', 'fin', 'depuis', 'jusqu', 'origine', 'évolution']
  
  // Mots-clés pour contenu éducatif/informatif
  const educationalKeywords = ['apprendre', 'guide', 'conseil', 'comment', 'technique', 'méthode', 'tutoriel', 'formation', 'découvrir', 'comprendre', 'expliquer', 'enseigner']
  
  // Mots-clés pour contenu pratique
  const practicalKeywords = ['cuisine', 'recette', 'bricolage', 'jardinage', 'jardiner', 'planter', 'cultiver', 'artisanat', 'construction', 'réparation', 'diy', 'faire', 'créer', 'fabriquer', 'débutant', 'apprendre', 'guide', 'tutoriel']
  
  // Mots-clés pour contenu documentaire
  const documentaryKeywords = ['science', 'géographie', 'culture', 'tradition', 'civilisation', 'analyse', 'etude']
  
  // Mots-clés pour fiction (seulement si explicite)
  const fictionKeywords = ['conte', 'aventure', 'personnage', 'héros', 'récit', 'narration', 'histoire de pirates', 'légende']
  
  // Vérifier le type de contenu avec priorité sur religieux et historique
  const isReligious = religiousKeywords.some(keyword => ideaLower.includes(keyword))
  const isHistorical = historicalKeywords.some(keyword => ideaLower.includes(keyword))
  const isEducational = educationalKeywords.some(keyword => ideaLower.includes(keyword))
  const isPractical = practicalKeywords.some(keyword => ideaLower.includes(keyword))
  const isDocumentary = documentaryKeywords.some(keyword => ideaLower.includes(keyword))
  const isFiction = fictionKeywords.some(keyword => ideaLower.includes(keyword))
  
     if (isReligious) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU RELIGIEUX/ISLAMIQUE
📖 FORMAT CHOISI : Documentation religieuse chronologique STRICTEMENT RESPECTUEUSE
🕌 SUJET DÉTECTÉ : "${idea}"
❌ INTERDICTION ABSOLUE : Fiction, personnages inventés, histoires fantaisistes, interprétations personnelles
❌ INTERDICTION TOTALE : Débats théologiques, controverses, opinions personnelles
✅ CONTENU OBLIGATOIRE : Chronologie islamique authentique basée sur Coran et Sunna
✅ STRUCTURE RELIGIEUSE : Introduction respectueuse + Périodes chronologiques (Création → Prophètes → Islam → Fin des temps) + Références sources + Conclusion édifiante
✅ TON REQUIS : Respectueux, informatif, traditionnel, factuel selon la tradition islamique`
   } else if (isHistorical) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU HISTORIQUE/CHRONOLOGIQUE
📅 FORMAT CHOISI : Documentation chronologique STRICTEMENT FACTUELLE
🔍 SUJET DÉTECTÉ : "${idea}"
❌ INTERDICTION ABSOLUE : Fiction, personnages inventés, histoires fantaisistes
❌ INTERDICTION TOTALE : Anecdotes personnelles, opinions subjectives
✅ CONTENU OBLIGATOIRE : Chronologie factuelle avec dates et événements vérifiables
✅ STRUCTURE CHRONOLOGIQUE : Introduction + Périodes temporelles + Événements majeurs + Contexte historique + Conclusion documentée
✅ TON REQUIS : Objectif, informatif, documentaire, précis`
   } else if (isEducational) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU ÉDUCATIF
📚 FORMAT CHOISI : Guide éducatif/informatif STRICTEMENT PRATIQUE
❌ INTERDICTION ABSOLUE : Personnages fictifs, histoires inventées, anecdotes personnelles, grand-mères, exemples personnels
❌ INTERDICTION TOTALE : "ma grand-mère", "en 1978", "mon premier", "je me souviens", toute référence personnelle
✅ CONTENU AUTORISÉ UNIQUEMENT : Explications techniques, conseils pratiques, méthodes concrètes, informations factuelles
✅ STRUCTURE OBLIGATOIRE : Introduction technique + Chapitres pratiques + Conseils actionables + Conclusion pratique`
   } else if (isPractical) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU PRATIQUE
🛠️ FORMAT CHOISI : Manuel pratique/tutoriel STRICTEMENT TECHNIQUE
❌ INTERDICTION ABSOLUE : Personnages fictifs, histoires inventées, anecdotes personnelles, exemples personnels
❌ INTERDICTION TOTALE : "ma grand-mère", "mon expérience", "je me rappelle", toute référence personnelle
✅ CONTENU AUTORISÉ UNIQUEMENT : Instructions étape par étape, conseils pratiques, techniques concrètes
✅ STRUCTURE OBLIGATOIRE : Introduction technique + Étapes pratiques + Conseils techniques + Conclusion actionnable`
   } else if (isDocumentary) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU DOCUMENTAIRE
📖 FORMAT CHOISI : Documentation factuelle/historique STRICTEMENT OBJECTIVE
❌ INTERDICTION ABSOLUE : Personnages fictifs, histoires inventées, anecdotes personnelles
❌ INTERDICTION TOTALE : Toute référence personnelle ou subjective
✅ CONTENU AUTORISÉ UNIQUEMENT : Faits historiques vérifiables, analyses objectives, données documentées
✅ STRUCTURE OBLIGATOIRE : Introduction factuelle + Développement chronologique + Analyses + Conclusion documentée`
   } else if (isFiction) {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU FICTION
🎭 FORMAT CHOISI : Histoire/récit avec personnages
✅ CONTENU AUTORISÉ : Personnages, dialogues, intrigue, anecdotes créatives
⚠️ ATTENTION : Fiction créative autorisée SEULEMENT pour ce cas`
   } else {
     return `🎯 DÉTECTION AUTOMATIQUE : CONTENU SPÉCIALISÉ - EXPERT UNIVERSEL
🧠 ANALYSE INTELLIGENTE DE LA DEMANDE : "${idea}"
🎯 MISSION : Devenir expert du sujet demandé et créer un contenu de haute qualité

📋 INSTRUCTIONS UNIVERSELLES :
1. ANALYSER le sujet demandé pour comprendre le domaine d'expertise requis
2. GÉNÉRER un titre accrocheur et professionnel qui reflète le contenu
3. CRÉER un contenu expert, informatif et de haute qualité sur le sujet
4. ADAPTER le ton et le style au domaine (scientifique, historique, pratique, culturel, etc.)
5. STRUCTURER avec Introduction + Chapitres thématiques + Conclusion

✅ CONTENU EXPERT REQUIS :
- Informations précises et documentées sur le sujet
- Expertise adaptée au domaine demandé
- Titre accrocheur et professionnel
- Structure claire et logique
- Contenu approfondi et utile

❌ INTERDICTIONS :
- Contenu générique ou vague
- Titre non-accrocheur comme "L'Histoire de..."
- Références personnelles inappropriées
- Contenu superficiel`
   }
})()}

4️⃣ OBLIGATIONS STRICTES ET INTERDICTIONS ABSOLUES :
- Respecter EXACTEMENT le format détecté ci-dessus
- NE JAMAIS créer de fiction si le format est éducatif/pratique/documentaire
- INTERDICTION ABSOLUE de phrases narratives : "cette histoire", "ce récit", "cette aventure", "notre héros", "personnages", "intrigue"
- INTERDICTION TOTALE de conclusions narratives : "Cette histoire captivante nous mène", "l'univers de l'histoire", "récit original"
- UTILISER UNIQUEMENT vocabulaire technique et pratique : "ce guide", "ce manuel", "cette méthode", "ces techniques"
- Adapter le ton et le style au sujet proposé
- Créer le contenu le plus utile pour l'utilisateur

${getAudienceInstructions(audience)}

🌟 APPROCHE UNIQUE POUR CE CONTENU "AUTRES" (ID: ${unique.uniqueId}) :
- ANALYSE INTELLIGENTE : ${unique.technique} pour le format détecté
- ADAPTATION : ${unique.atmosphere} selon le sujet spécifique
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

    // 🧠 SYSTÈME DE PROMPT INTELLIGENT ADAPTATIF
    const isNonFictionRequest = (idea: string, genre: string): boolean => {
      const ideaLower = idea.toLowerCase()
      const nonFictionKeywords = [
        'histoire', 'guide', 'apprendre', 'comment', 'tutoriel', 'méthode',
        'technique', 'conseil', 'formation', 'éducation', 'enseignement',
        'jardinage', 'cuisine', 'business', 'développement', 'science',
        'médecine', 'technologie', 'informatique', 'finance', 'marketing',
        'chronologie', 'frise', 'documentation', 'manuel', 'cours',
        'islam', 'religion', 'coran', 'islamique', 'musulman', 'prière',
        'enfants', 'bases', 'fondements', 'spirituel', 'foi', 'croyance'
      ]
      
      return genre === 'autres' || genre === 'developpement-personnel' || 
             nonFictionKeywords.some(keyword => ideaLower.includes(keyword))
    }

    const generateSmartTitle = (idea: string): string => {
      const ideaLower = idea.toLowerCase()
      
      if (ideaLower.includes('histoire') && ideaLower.includes('algerie')) {
        return "L'Algérie à Travers les Siècles : Une Histoire Fascinante"
      } else if (ideaLower.includes('jardinage')) {
        return "Jardiner Comme un Pro : Guide Complet du Jardinier Moderne"
      } else if (ideaLower.includes('cuisine')) {
        return "Secrets de Chef : Maîtrisez l'Art Culinaire"
      } else if (ideaLower.includes('business') || ideaLower.includes('entreprise')) {
        return "Réussir en Affaires : Stratégies Gagnantes d'Entrepreneurs"
      } else if (ideaLower.includes('programmation') || ideaLower.includes('code')) {
        return "Maîtriser la Programmation : De Débutant à Expert"
      } else if (ideaLower.includes('islam') && (ideaLower.includes('enfant') || ideaLower.includes('enfants'))) {
        return "Les Trésors de l'Islam : Guide Éducatif pour Enfants"
      } else if (ideaLower.includes('islam') || ideaLower.includes('religion')) {
        return "Découverte de l'Islam : Guide Complet et Accessible"
      } else if (ideaLower.includes('histoire')) {
        const subject = idea.match(/histoire de (la |le |les |l')?(.+)/i)?.[2] || idea.replace(/.*histoire de? /i, '')
        return `${subject.charAt(0).toUpperCase() + subject.slice(1)} : Un Voyage à Travers l'Histoire`
      } else {
        // Générer un titre accrocheur basé sur les mots-clés principaux
        const words = idea.split(' ').filter(w => w.length > 3)
        const mainTopic = words.slice(-2).join(' ')
        return `Maîtriser ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} : Guide Expert Complet`
      }
    }

    const isNonFiction = isNonFictionRequest(formData.idea, formData.genre)
    const smartTitle = generateSmartTitle(formData.idea)

    const prompt = isNonFiction ? 
    `🧠 Tu es un EXPERT UNIVERSEL et écrivain professionnel spécialisé dans la création de guides et contenus éducatifs de haute qualité.

🎯 MISSION : Créer un guide expert complet sur le sujet demandé

📋 ANALYSE DE LA DEMANDE :
IDÉE PRINCIPALE : "${formData.idea}"
TITRE SUGGÉRÉ : "${smartTitle}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR REQUISE : ${targetLength}
AUTEUR : ${formData.author || "Expert IA"}

🔥 INSTRUCTIONS EXPERTES UNIVERSELLES :
1. ANALYSE le sujet demandé pour devenir instantanément expert dans ce domaine
2. GÉNÈRE un titre accrocheur et professionnel (suggestion: "${smartTitle}")
3. CRÉE un contenu de qualité expert avec informations précises et utiles
4. STRUCTURE avec Introduction + Chapitres thématiques + Conclusion pratique
5. ADAPTE le ton au domaine (scientifique, historique, pratique, technique, etc.)

✅ FORMAT EXPERT REQUIS :
- Introduction engageante qui pose le contexte et les enjeux
- Chapitres avec contenus techniques/informatifs approfondis
- Conseils pratiques et actionables
- Exemples concrets et cas d'usage
- Informations factuelles et vérifiables
- Conclusion avec résumé et perspectives

❌ INTERDICTIONS ABSOLUES :
- Personnages fictifs ou dialogues inventés
- Histoires narratives avec intrigue
- Références personnelles ("ma grand-mère", "mon expérience")
- Contenu générique ou superficiel
- Titres fades comme "L'Histoire de..." ou "Introduction à..."

🎯 SPÉCIALISATION AUTOMATIQUE :
Si Histoire → Chronologie détaillée avec dates, événements, personnages historiques réels
Si Jardinage → Techniques, outils, plants, saisons, conseils pratiques
Si Cuisine → Techniques, ingrédients, recettes, astuces de chef
Si Business → Stratégies, méthodes, outils, études de cas
Si Science → Explications techniques, théories, applications
Si Technologie → Fonctionnement, usages, évolutions
Si Islam/Religion → Enseignements fondamentaux, pratiques, valeurs, adaptés à l'âge
Si Enfants → Langage simple, exemples concrets, approche pédagogique
→ Pour TOUT autre sujet : Expertise adaptée automatiquement

🕌 SPÉCIALISATION ISLAM POUR ENFANTS :
Si le sujet concerne l'Islam pour enfants :
- Utilise un langage simple et accessible
- Explique les concepts avec des exemples du quotidien
- Structure : Bases de la foi, Pratiques quotidiennes, Valeurs morales
- Inclus des histoires éducatives (prophètes, exemples positifs)
- Évite les sujets complexes ou controversés
- Focus sur l'amour, la bonté, le respect, la famille
- Chapitres : Les 5 piliers, La prière, Le Coran, Les bonnes actions, Les prophètes`

    :

    `Tu es un écrivain professionnel français expert en création d'ebooks. Crée un ebook complet et captivant basé sur cette idée :

IDÉE PRINCIPALE : "${formData.idea}"
${formData.genre ? `GENRE : ${formData.genre}` : ""}
${formData.targetAudience ? `PUBLIC CIBLE : ${formData.targetAudience}` : ""}
LONGUEUR EXACTE REQUISE : ${targetLength}
AUTEUR : ${formData.author || "Auteur IA"}

🔥 SIGNATURE D'UNICITÉ DE CETTE HISTOIRE : ${uniqueElements.uniqueId}
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

🚨 OBLIGATION ABSOLUE DE CONTENU COMPLET 🚨 :
Tu DOIS générer un contenu COMPLET et ENTIER de ${lengthConfig.minWords}-${lengthConfig.maxWords} mots.
❌ INTERDICTION FORMELLE de générer un contenu tronqué, incomplet ou qui s'arrête brutalement
❌ INTERDICTION de terminer par "l'aventure se termine ici" ou des conclusions prématurées
❌ INTERDICTION de s'arrêter au chapitre 2 ou 3 - Tu DOIS faire ${lengthConfig.chaptersCount} chapitres COMPLETS

✅ TU DOIS ABSOLUMENT :
- Écrire ${lengthConfig.chaptersCount} chapitres COMPLETS de ${lengthConfig.wordsPerChapter} mots chacun
- Développer ENTIÈREMENT chaque chapitre avec détails, dialogues et descriptions
- Créer une conclusion SATISFAISANTE et COMPLÈTE qui résout tous les fils narratifs
- Atteindre la cible de ${lengthConfig.exactWords} mots (tolérance: ${lengthConfig.minWords}-${lengthConfig.maxWords})
- Générer un contenu riche, détaillé et absolument complet

🎯 RAPPEL FINAL CRITIQUE : Génère ${lengthConfig.minWords}-${lengthConfig.maxWords} mots ET assure-toi que l'histoire est COMPLÈTEMENT TERMINÉE avec une vraie conclusion !

⚠️ CONTRÔLE QUALITÉ : Ton contenu doit faire ENTRE ${lengthConfig.minWords}-${lengthConfig.maxWords} mots ET être absolument unique et COMPLET !

🚫 INTERDICTION ABSOLUE DE VOCABULAIRE NARRATIF POUR GUIDES PRATIQUES :
❌ JAMAIS utiliser : "cette histoire", "ce récit", "cette aventure", "notre héros", "les personnages", "l'intrigue", "l'univers de l'histoire"
❌ JAMAIS de conclusion : "Cette histoire captivante nous mène à travers un parcours riche en émotions"
✅ UTILISER UNIQUEMENT : "ce guide", "ce manuel", "cette méthode", "ces techniques", "cet apprentissage", "ces conseils"

🚫 INTERDICTION ABSOLUE DE DUPLICATIONS ET PARASITES :
❌ JAMAIS écrire : "Introduction Introduction", "Chapitre 1 Chapitre 1", "Conclusion Conclusion"
❌ JAMAIS mentionner : "(environ X mots)", "(1200 mots)", "environ 500 mots"
❌ JAMAIS répéter les titres : Écrire UNE SEULE FOIS chaque titre
✅ FORMAT STRICT : "Introduction :" puis contenu, "Chapitre 1 :" puis contenu
✅ AUCUNE mention de comptage de mots dans le contenu final`

    // 🚀 GÉNÉRATION OPENAI UNIQUEMENT
    let generatedText: string = ""
    
    // 🔧 FORCE REFRESH: Lire la clé directement depuis process.env à chaque fois
    const freshApiKey = process.env.OPENAI_API_KEY
    
    console.log('🔑 FRESH API KEY READ:', {
      configured: !!freshApiKey,
      prefix: freshApiKey ? freshApiKey.substring(0, 15) + '...' : 'NOT_SET',
      suffix: freshApiKey ? '...' + freshApiKey.slice(-8) : 'NOT_SET',
      length: freshApiKey?.length || 0,
      timestamp: new Date().toISOString()
    })
    
    if (!freshApiKey) {
      throw new Error('OPENAI_API_KEY is required! Please configure it in Vercel environment variables.')
    }
    
    // Créer une nouvelle instance OpenAI à chaque fois
    const openai = new OpenAI({ 
      apiKey: freshApiKey,
      timeout: 60000
    })
    
    console.log('🎯 STARTING EBOOK GENERATION - OPENAI ONLY:')
    console.log('- Using: OpenAI GPT-4o')
    console.log('- API Key configured:', !!freshApiKey)
    console.log('- API Key prefix:', freshApiKey.substring(0, 15) + '...')
    console.log('- API Key suffix:', '...' + freshApiKey.slice(-8))
    console.log('- Target length:', lengthConfig.minWords, '-', lengthConfig.maxWords, 'words')
    console.log('- Target chapters:', lengthConfig.chaptersCount)
    console.log('- Genre:', formData.genre)
    console.log('- Idea:', formData.idea?.substring(0, 100) + '...')
    console.log('- Prompt length:', prompt.length, 'characters')

    // 🚀 OPENAI GPT-4O UNIQUEMENT
    console.log('🚀 Generating with OpenAI GPT-4o...')
    
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
      max_tokens: 16384,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    generatedText = completion.choices[0]?.message?.content || ''
    
    console.log('✅ OpenAI Response received - Length:', generatedText.length, 'characters')
    console.log('🔍 First 200 chars:', generatedText.substring(0, 200) + '...')
    console.log('🔍 Last 200 chars:', '...' + generatedText.substring(generatedText.length - 200))
    
    if (!generatedText || generatedText.length < 500) {
      throw new Error(`OpenAI returned insufficient content: ${generatedText?.length || 0} characters`)
    }

    // DIAGNOSTIC COMPLET: Analyser la réponse IA avant parsing
    console.log('🔍 DIAGNOSTIC COMPLET DE LA RÉPONSE IA:')
    console.log('- Response length:', generatedText.length, 'characters')
    console.log('- Response type:', typeof generatedText)
    console.log('- Contains TITRE:', generatedText.includes('TITRE:'))
    console.log('- Contains CONTENU:', generatedText.includes('CONTENU:'))
    console.log('- Contains # Chapitre:', generatedText.includes('# Chapitre'))
    console.log('- First 500 chars:', generatedText.substring(0, 500))
    console.log('- Last 500 chars:', generatedText.substring(generatedText.length - 500))
    
    // Parser la réponse selon le format attendu
    const parsed = parseGeneratedContent(generatedText, formData.author)
    
    // VALIDATION FINALE DU CONTENU PARSÉ
    console.log('🎯 VALIDATION FINALE DU CONTENU PARSÉ:')
    console.log('- Parsed content length:', parsed.content.length, 'characters')
    console.log('- Parsed word count:', parsed.content.split(/\s+/).length, 'words')
    console.log('- Parsed title:', parsed.title)
    console.log('- Content preview (first 200):', parsed.content.substring(0, 200))
    console.log('- Content preview (last 200):', parsed.content.substring(parsed.content.length - 200))
    
    // VÉRIFICATIONS CRITIQUES MULTIPLES
    
    // Vérification 1: Ancien fallback
    if (parsed.content.includes('La Suite de l\'Aventure') || 
        parsed.content.includes('se termine cette aventure extraordinaire')) {
      console.error('🚨 DÉTECTION ANCIEN FALLBACK ! Forçage du contenu IA brut')
      return {
        title: parsed.title,
        author: parsed.author,
        content: generatedText,
        coverDescription: parsed.coverDescription,
      }
    }
    
    // Vérification 2: Duplications de titres persistantes + mentions mots
    if (parsed.content.includes('Introduction Introduction') || 
        /Chapitre\s*\d+.*Chapitre\s*\d+/i.test(parsed.content) ||
        parsed.content.includes('(environ') ||
        parsed.content.includes('Ce guide pratique vous aide à développer')) {
      console.error('🚨 DÉTECTION DUPLICATIONS + PARASITES ! Nettoyage d\'urgence ULTRA-AGRESSIF')
      
      // NETTOYAGE D'URGENCE ULTRA-AGRESSIF - ANNIHILATION TOTALE
      let cleanContent = parsed.content
        // SUPPRESSION PARASITES MOTS
        .replace(/\(environ\s+\d+\s+mots?\)/gi, '')
        .replace(/\(\d+\s+mots?\)/gi, '')
        .replace(/environ\s+\d+\s+mots?/gi, '')
        
        // SUPPRESSION PHRASES FALLBACK PARASITES
        .replace(/Ce guide pratique vous aide à développer vos compétences\s*\.?/gi, '')
        .replace(/Ce guide vous fournit toutes les informations essentielles[^.]*\s*\.?/gi, '')
        
        // INTRODUCTION - ANNIHILATION
        .replace(/Introduction\s+Introduction[^:\n]*\s*:?/gi, 'Introduction :')
        .replace(/Introduction[^:\n]*Introduction\s*:?/gi, 'Introduction :')
        .replace(/Introduction\s*:\s*[^#\n]*Introduction[^:\n]*:?/gi, 'Introduction :')
        
                 // CHAPITRE - ANNIHILATION TOTALE + NUMÉROTATION
         .replace(/Chapitre\s*(\d+)\s+Chapitre\s*\1[^:\n]*:?/gi, 'Chapitre $1 :')
         .replace(/Chapitre\s*(\d+)[^:\n]*Chapitre\s*\1[^:\n]*:?/gi, 'Chapitre $1 :')
         .replace(/Chapitre\s*(\d+)\s*:\s*[^#\n]*?\s*Chapitre\s*\1[^:\n]*:?/gi, 'Chapitre $1 :')
         .replace(/Chapitre\s*(\d+)\s+(\d+)\./gi, 'Chapitre $2 :')   // NOUVEAU: "Chapitre 2 3." → "Chapitre 3 :"
         .replace(/Chapitre\s*(\d+)\s+(\d+)\s*:/gi, 'Chapitre $2 :') // NOUVEAU: "Chapitre 2 3 :" → "Chapitre 3 :"
        
                 // FORMATAGE SAUTS DE LIGNE + NETTOYAGE FINAL
         .replace(/\s{3,}/g, ' ')
         .replace(/\n{3,}/g, '\n\n')
         
         // FORMATAGE SAUTS DE LIGNE AVANT TITRES (demandé par utilisateur)
         .replace(/(Introduction\s*:)/gi, '\n\n$1\n')           
         .replace(/(Chapitre\s*\d+\s*:)/gi, '\n\n$1\n')        
         .replace(/(Conclusion\s*:)/gi, '\n\n$1\n')            
         .replace(/(Épilogue\s*:)/gi, '\n\n$1\n')              
         
         .replace(/^\n+/, '')          // Supprimer retours ligne début
         .trim()
      
      return {
        title: parsed.title,
        author: parsed.author,
        content: cleanContent,
        coverDescription: parsed.coverDescription,
      }
    }
    
    return parsed

  } catch (error) {
    console.error("❌ ERREUR CRITIQUE LORS DE LA GÉNÉRATION:", error)
    console.error("❌ STACK TRACE:", error instanceof Error ? error.stack : 'No stack trace')
    console.error("❌ FORMDATA:", { 
      idea: formData.idea?.substring(0, 100),
      genre: formData.genre,
      length: formData.length 
    })

    // 🚨 FALLBACK SUPPRIMÉ - FORCER L'AFFICHAGE DE L'ERREUR RÉELLE
    throw new Error(`IA GENERATION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}. Check API keys and configuration.`)
  }
}

// Fonction ROBUSTE pour parser le contenu généré
function parseGeneratedContent(text: string, authorName: string): GeneratedContent {
  console.log('📝 PARSING CONTENT - Length:', text.length, 'characters')
  
  try {
    // NOUVEAU: Extraire le titre avec plusieurs patterns
    let title = "Mon Ebook Généré"
    const titlePatterns = [
      /TITRE:\s*(.+)/i,
      /Title:\s*(.+)/i,
      /^(.+)\n/,  // Première ligne si pas de pattern
    ]
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern)
      if (match && match[1]?.trim()) {
        title = match[1].trim()
        console.log('✅ TITLE FOUND:', title)
        break
      }
    }

    // NOUVEAU: Extraire l'auteur avec fallback
    let author = authorName || "Auteur IA"
    const authorMatch = text.match(/AUTEUR:\s*(.+)/i)
    if (authorMatch && authorMatch[1]?.trim()) {
      author = authorMatch[1].trim()
      console.log('✅ AUTHOR FOUND:', author)
    }

    // NOUVEAU: Extraire description couverture avec fallback robuste
    let coverDescription = "Couverture élégante et moderne pour cet ebook captivant"
    const coverPatterns = [
      /DESCRIPTION_COUVERTURE:\s*(.+)/i,
      /COVER_DESCRIPTION:\s*(.+)/i,
      /Description:\s*(.+)/i
    ]
    
    for (const pattern of coverPatterns) {
      const match = text.match(pattern)
      if (match && match[1]?.trim()) {
        coverDescription = match[1].trim()
        console.log('✅ COVER DESCRIPTION FOUND:', coverDescription.substring(0, 50) + '...')
        break
      }
    }

    // CRITIQUE: Extraire le contenu COMPLET - AUCUNE PERTE
    let content = ""
    
    // Pattern principal pour CONTENU:
    const contentMatch = text.match(/CONTENU:\s*([\s\S]+)/i)
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1].trim()
      console.log('✅ CONTENT FOUND with CONTENU pattern - Length:', content.length)
    } else {
      // FALLBACK: Prendre tout le texte après nettoyage
      content = text
        .replace(/TITRE:.*?\n/gi, '')
        .replace(/AUTEUR:.*?\n/gi, '')
        .replace(/DESCRIPTION_COUVERTURE:.*?\n/gi, '')
        .replace(/COVER_DESCRIPTION:.*?\n/gi, '')
        .trim()
      
      console.log('⚠️ USING FALLBACK CONTENT EXTRACTION - Length:', content.length)
    }

    // NOUVEAU: Nettoyage intelligent SANS perte de contenu
    content = content
      .replace(/^TITRE:.*?\n/gmi, '')
      .replace(/^AUTEUR:.*?\n/gmi, '')
      .replace(/^DESCRIPTION_COUVERTURE:.*?\n/gmi, '')
      .replace(/^COVER_DESCRIPTION:.*?\n/gmi, '')
      .replace(/^CONTENU:\s*/gmi, '')
      .trim()

    // CRITICAL: Vérification de longueur minimale
    const minContentLength = 1000  // Au moins 1000 caractères
    if (content.length < minContentLength) {
      console.error('❌ CONTENT TOO SHORT:', content.length, 'chars - Using full text')
      // Si le contenu parsé est trop court, utiliser TOUT le texte original
      content = text.trim()
    }

          // VALIDATION du contenu structuré - AMÉLIORATION
      if (!content.includes('# ') && !content.includes('## ')) {
        console.warn('⚠️ NO CHAPTER STRUCTURE DETECTED - Adding structure while preserving ALL content')
        
        // Si pas de structure, garder le contenu ENTIER et ajouter une structure minimale
        const originalContent = content
        const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 50)
        
        if (paragraphs.length >= 3) {
          // Diviser intelligemment en gardant TOUT le contenu
          const introduction = paragraphs.slice(0, Math.ceil(paragraphs.length * 0.2))
          const middle = paragraphs.slice(Math.ceil(paragraphs.length * 0.2), Math.ceil(paragraphs.length * 0.8))
          const conclusion = paragraphs.slice(Math.ceil(paragraphs.length * 0.8))
          
          content = `# Introduction

${introduction.join('\n\n')}

# Développement

${middle.join('\n\n')}

# Conclusion

${conclusion.join('\n\n')}`
        } else {
          // Si contenu très court, juste ajouter un titre
          content = `# Contenu Principal

${originalContent}`
        }
      }

      // NETTOYAGE ULTRA-AGRESSIF: ANNIHILATION TOTALE DES DUPLICATIONS
      content = content
        // SUPPRESSION MENTIONS DE MOTS (environ X mots) - PARASITE ABSOLU !
        .replace(/\(environ\s+\d+\s+mots?\)/gi, '')
        .replace(/\(\d+\s+mots?\)/gi, '')
        .replace(/environ\s+\d+\s+mots?/gi, '')
        
        // INTRODUCTION - TOUTES VARIANTES POSSIBLES
        .replace(/Introduction\s+Introduction\s*[^:\n]*:/gi, 'Introduction :')
        .replace(/Introduction[^:\n]*Introduction\s*:/gi, 'Introduction :')
        .replace(/Introduction\s*:\s*[^#\n]*Introduction\s*[^:\n]*:/gi, 'Introduction :')
        .replace(/Introduction\s*[^:\n]*?\s*Introduction\s*:/gi, 'Introduction :')
        .replace(/Introduction:\s*[^#\n]*?\s*Introduction\s*:/gi, 'Introduction :')
        .replace(/Introduction\s*:\s*[^#\n]*?\s*Introduction\s*[^:\n]*:/gi, 'Introduction :')
        .replace(/Introduction\s+Introduction/gi, 'Introduction')
        
        // CHAPITRE - ANNIHILATION TOTALE TOUTES VARIANTES + NUMÉROTATION COHÉRENTE
        .replace(/Chapitre\s*(\d+)\s+Chapitre\s*\1[^:\n]*/gi, 'Chapitre $1')
        .replace(/Chapitre\s*(\d+)[^:\n]*Chapitre\s*\1[^:\n]*/gi, 'Chapitre $1')
        .replace(/Chapitre\s*(\d+)\s*:\s*[^#\n]*?\s*Chapitre\s*\1/gi, 'Chapitre $1 :')
        .replace(/Chapitre\s*(\d+):\s*[^#\n]*?\s*Chapitre\s*\1[^:\n]*:/gi, 'Chapitre $1 :')
        .replace(/Chapitre\s*(\d+)\s*[^:\n]*?\s*Chapitre\s*\1/gi, 'Chapitre $1')
        .replace(/Chapitre\s*(\d+)\s+Chapitre\s*\1/gi, 'Chapitre $1')
        
        // NOUVEAUX: Fixer numérotation incohérente de chapitres (Chapitre 2 apparaît 2 fois)
        .replace(/Chapitre\s*(\d+)\s+(\d+)\./gi, 'Chapitre $2 :')  // "Chapitre 2 3." → "Chapitre 3 :"
        .replace(/Chapitre\s*(\d+)\s+(\d+)\s*:/gi, 'Chapitre $2 :') // "Chapitre 2 3 :" → "Chapitre 3 :"
        
        // CONCLUSION/ÉPILOGUE
        .replace(/Conclusion\s+Conclusion[^:\n]*:/gi, 'Conclusion :')
        .replace(/Conclusion[^:\n]*Conclusion\s*:/gi, 'Conclusion :')
        .replace(/Conclusion\s*[^:\n]*?\s*Conclusion\s*:/gi, 'Conclusion :')
        .replace(/Épilogue\s+Épilogue[^:\n]*:/gi, 'Épilogue :')
        .replace(/Épilogue[^:\n]*Épilogue\s*:/gi, 'Épilogue :')
        .replace(/Épilogue\s*[^:\n]*?\s*Épilogue\s*:/gi, 'Épilogue :')
        
      // SUPPRESSION PHRASES NARRATIVES INAPPROPRIÉES pour guides pratiques
      content = content
        .replace(/Cette histoire captivante nous mène à travers un parcours riche en émotions et en découvertes[^.]*\./gi, 'Ce guide complet vous accompagne dans votre apprentissage avec des conseils pratiques et éprouvés.')
        .replace(/Cette histoire[^.]*narrative[^.]*\./gi, 'Ce guide vous fournit les informations essentielles pour maîtriser le sujet.')
        .replace(/([Ll]'|[Cc]ette)\s*histoire[^.]*\./gi, 'Ce guide pratique vous aide à développer vos compétences.')
        .replace(/([Ll]e|[Cc]ette)\s*récit[^.]*\./gi, 'Ce manuel vous donne tous les outils nécessaires.')
        .replace(/([Ll]'|[Cc]ette)\s*aventure[^.]*\./gi, 'Cet apprentissage vous permettra de progresser efficacement.')
        .replace(/([Nn]otre|[Ll]e)\s*héros[^.]*\./gi, 'L\'utilisateur de ce guide bénéficiera de techniques éprouvées.')
        .replace(/([Ll]es|[Dd]es)\s*personnages[^.]*\./gi, 'Les différentes méthodes présentées dans ce guide.')
        .replace(/([Ll]'|[Cc]ette)\s*intrigue[^.]*\./gi, 'La progression logique de ce guide.')
        .replace(/[Ll]'univers[^.]*histoire[^.]*\./gi, 'Le domaine traité dans ce guide pratique.')
        .replace(/([Dd]ialogue|[Cc]onversation)[^.]*\./gi, 'Les explications détaillées fournies.')
        
      // SUPPRESSION PHRASES DE FALLBACK POLLUANTES
      content = content
        .replace(/Ce guide pratique vous aide à développer vos compétences\./gi, '')
        .replace(/Ce guide vous fournit toutes les informations essentielles et les méthodes pratiques nécessaires pour développer vos compétences dans ce domaine\./gi, '')
        .replace(/Ce manuel vous donne tous les outils nécessaires\./gi, '')
        .replace(/Cet apprentissage vous permettra de progresser efficacement\./gi, '')
        .replace(/L'utilisateur de ce guide bénéficiera de techniques éprouvées\./gi, '')
        .replace(/Les différentes méthodes présentées dans ce guide\./gi, '')
        .replace(/La progression logique de ce guide\./gi, '')
        .replace(/Le domaine traité dans ce guide pratique\./gi, '')
        .replace(/Les explications détaillées fournies\./gi, '')
        
      // FORMATAGE FINAL: Sauts de ligne + nettoyage
      content = content
        .replace(/\.\s*\.\s*/g, '. ')  // Double points
        .replace(/\s{3,}/g, ' ')       // Espaces multiples  
        .replace(/\n{3,}/g, '\n\n')   // Retours ligne multiples
        
        // FORMATAGE SAUTS DE LIGNE AVANT TITRES (demandé par utilisateur)
        .replace(/(Introduction\s*:)/gi, '\n\n$1\n')           // "\n\nIntroduction :\n"
        .replace(/(Chapitre\s*\d+\s*:)/gi, '\n\n$1\n')        // "\n\nChapitre X :\n"  
        .replace(/(Conclusion\s*:)/gi, '\n\n$1\n')            // "\n\nConclusion :\n"
        .replace(/(Épilogue\s*:)/gi, '\n\n$1\n')              // "\n\nÉpilogue :\n"
        
        .replace(/^\n+/, '')          // Supprimer retours ligne début
        .trim()

    // FINAL LOG: Statistiques du contenu parsé
    const wordCount = content.split(/\s+/).length
    const chapterCount = (content.match(/# [^#]/g) || []).length
    
    console.log('📊 FINAL PARSED CONTENT STATS:')
    console.log('- Title:', title.substring(0, 50) + '...')
    console.log('- Author:', author)
    console.log('- Content length:', content.length, 'characters')
    console.log('- Word count:', wordCount, 'words')
    console.log('- Chapter count:', chapterCount)
    console.log('- Cover desc length:', coverDescription.length)

    return {
      title: title.substring(0, 100),
      author,
      content,
      coverDescription,
    }

  } catch (error) {
    console.error("❌ CRITICAL PARSING ERROR:", error)
    console.log("📄 EMERGENCY FAILSAFE: Using raw AI text as content")
    console.log("📊 Raw text length:", text.length, "characters")
    console.log("📊 Raw text preview:", text.substring(0, 300) + "...")
    
    // FAILSAFE ABSOLU: En cas d'erreur, retourner TOUT le texte brut IA
    // C'est mieux d'avoir le contenu IA brut que le fallback générique
    return {
      title: "Ebook Généré par IA - Contenu Complet",
      author: authorName || "Auteur IA",
      content: text || "Erreur critique lors de la génération du contenu.",
      coverDescription: "Couverture moderne et élégante pour cet ebook unique généré par IA",
    }
  }
}

// 🎯 FONCTION FALLBACK UNIVERSELLE POUR LES TITRES
function generateFallbackTitle(idea: string): string {
  console.log('🚨 FALLBACK TITLE UNIVERSEL - L\'IA devrait gérer le titre!')
  
  // Simple extraction de mots-clés pour un titre générique
  const words = idea.split(' ').filter(w => w.length > 3)
  const mainTopic = words.slice(-2).join(' ')
  return `Guide Expert : ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`
}

function generateFallbackContent(formData: FormData): string {
  console.log('🚨 FALLBACK UNIVERSEL SIMPLE - L\'IA devrait gérer tous les sujets!')
  
  // 🎯 FALLBACK UNIVERSEL SIMPLE - Pas de cas spéciaux, juste un guide générique
  const generateSmartTitle = (idea: string): string => {
    // Extraire les mots clés principaux
    const words = idea.split(' ').filter(w => w.length > 3)
    const mainTopic = words.slice(-2).join(' ')
    return `Maîtriser ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} : Guide Expert`
  }

  const smartTitle = generateSmartTitle(formData.idea)
  
  console.log(`📊 FALLBACK UNIVERSEL: "${smartTitle}" pour "${formData.idea}"`)
  
  // ✅ CONTENU UNIVERSEL qui s'adapte à N'IMPORTE QUEL SUJET
  return `# ${smartTitle}

Basé sur votre demande : "${formData.idea}"

Ce guide expert vous accompagne dans la découverte approfondie du sujet demandé. L'IA est conçue pour traiter n'importe quel sujet avec expertise.

# Chapitre 1 : Les Fondamentaux

Ce chapitre pose les bases essentielles du sujet. Nous explorons les concepts clés, la terminologie importante et les principes fondamentaux nécessaires à votre compréhension.

# Chapitre 2 : Développement Approfondi

Nous entrons dans le cœur du sujet avec les aspects techniques et les méthodes spécialisées. Ce chapitre développe les éléments centraux du domaine étudié.

# Chapitre 3 : Applications et Exemples

Ce chapitre présente les applications pratiques et les cas concrets. Vous découvrirez comment utiliser les connaissances acquises dans des situations réelles.

# Conclusion

Ce guide vous a fourni une base solide dans le domaine étudié. L'IA principale devrait normalement gérer tous les sujets - ce fallback ne devrait apparaître qu'en cas d'erreur technique.`
}

function generateFallbackCoverDescription(formData: FormData): string {
  return `Couverture élégante pour un ebook ${formData.genre ? `de ${formData.genre}` : 'original'}, style moderne avec des éléments visuels captivants, adapté au public ${formData.targetAudience || 'général'}, atmosphère immersive et professionnelle.`
}
