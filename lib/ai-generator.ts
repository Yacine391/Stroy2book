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

    // Simulation d'un contenu généré basé sur l'idée de l'utilisateur
    // Dans une vraie implémentation, ici vous appelleriez l'API OpenAI

    // Génération du titre basé sur l'idée
    const generateTitle = (idea: string): string => {
      const words = idea.split(' ').slice(0, 5)
      return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    // Génération d'un auteur fictif
    const authors = [
      "Marie Dubois", "Jean Moreau", "Sophie Laurent", "Pierre Bernard", 
      "Claire Martin", "Antoine Rousseau", "Élise Durand", "Michel Blanc",
      "Camille Petit", "Nicolas Garcia"
    ]
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)]

    // Génération du contenu basé sur les paramètres
    const generateContent = (idea: string, genre: string, audience: string, length: string): string => {
      const intro = `# Introduction

Bienvenue dans "${generateTitle(idea)}", un ${genre || 'livre'} captivant qui explore l'univers fascinant de votre idée : "${idea}".

${audience ? `Spécialement conçu pour ${audience}, ` : ''}ce récit vous emmènera dans un voyage extraordinaire à travers des concepts uniques et des aventures passionnantes.`

      const chapters = Array.from({ length: length === 'long' ? 8 : length === 'moyen' ? 5 : 3 }, (_, i) => {
        return `## Chapitre ${i + 1} : ${i === 0 ? 'Le Commencement' : i === 1 ? 'Les Découvertes' : i === 2 ? 'Les Défis' : `L'Aventure Continue (${i + 1})`}

Dans ce chapitre, nous explorons davantage les éléments clés de votre concept "${idea}". L'histoire se développe avec des personnages attachants et des situations captivantes qui maintiennent le lecteur en haleine.

Les détails s'enrichissent, les mystères se dévoilent progressivement, et chaque page apporte de nouvelles révélations qui font avancer l'intrigue de manière magistrale.

${i % 2 === 0 ? 'Les personnages font face à de nouveaux défis qui testent leur détermination et leur courage.' : 'Des alliances se forment et des secrets du passé refont surface, changeant tout ce que nous pensions savoir.'}

${genre === 'science-fiction' ? 'Les technologies futuristes et les concepts scientifiques s\'entremêlent pour créer un monde fascinant.' : genre === 'fantasy' ? 'La magie opère et les créatures mystiques entrent en scène pour enrichir cet univers extraordinaire.' : 'L\'histoire prend une tournure inattendue qui surprendra même les lecteurs les plus perspicaces.'}

---`
      }).join('\n\n')

      const conclusion = `## Conclusion

Notre voyage à travers "${generateTitle(idea)}" touche à sa fin, mais les enseignements et les émotions ressentis continueront de résonner longtemps après avoir refermé ce livre.

Cette exploration de "${idea}" nous a menés à travers des territoires inexplorés de l'imagination, révélant des vérités profondes sur la nature humaine et notre rapport au monde qui nous entoure.

Que cette histoire vous inspire et vous accompagne dans vos propres aventures, en vous rappelant que les meilleures histoires sont celles que nous créons nous-mêmes.

---

*Fin de "${generateTitle(idea)}"*

### Remerciements

Un grand merci à tous les lecteurs qui ont suivi cette aventure jusqu'au bout. Votre imagination et votre engagement donnent vie à ces mots et à ces idées.

L'écriture est un art collaboratif entre l'auteur et le lecteur, et ensemble, nous avons créé quelque chose d'unique et de mémorable.

---

*Généré automatiquement par Story2book AI* ✨`

      return `${intro}\n\n${chapters}\n\n${conclusion}`
    }

    const title = generateTitle(formData.idea)
    const content = generateContent(formData.idea, formData.genre, formData.targetAudience, formData.length)
    
    return {
      title: title.substring(0, 100),
      author: randomAuthor,
      content: content,
      coverDescription: `Couverture élégante pour "${title}" - Design moderne avec des éléments visuels en rapport avec ${formData.genre || 'le thème principal'}, style ${formData.targetAudience || 'universel'}.`,
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