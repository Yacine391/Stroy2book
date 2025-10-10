# HB Creator - Générateur d'ebooks par IA

HB Creator est une application web qui utilise l'Intelligence Artificielle pour générer automatiquement des ebooks professionnels à partir d'une simple idée.

## ✨ Fonctionnalités

- 🤖 **Génération automatique par IA** : Transformez votre idée en ebook complet
- 📚 **Personnalisation avancée** : Choisissez le genre, public cible, longueur
- 🎨 **Interface moderne** : Design élégant avec Tailwind CSS
- 📱 **Responsive** : Fonctionne sur tous les appareils
- ⚡ **Rapide** : Génération en 30-60 secondes
- 🔄 **Multi-utilisateurs** : Support simultané de plusieurs utilisateurs

## 🚀 Installation locale

### Prérequis

- Node.js 18+ et npm
- Clé API OpenAI

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/hb-creator.git
cd hb-creator
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.local.example .env.local
```

Éditez `.env.local` et ajoutez votre clé API OpenAI :
```
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Lancer en développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3001](http://localhost:3001)

## 🌐 Déploiement en production

### Déploiement sur Vercel (Recommandé)

1. **Connecter à Vercel**
   - Créez un compte sur [vercel.com](https://vercel.com)
   - Connectez votre repository GitHub
   - Importez le projet

2. **Configuration des variables d'environnement**
   Dans les paramètres Vercel, ajoutez :
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
   ```

3. **Déployer**
   Vercel déploiera automatiquement à chaque push sur la branche main.

### Déploiement sur Netlify

1. **Build et export**
```bash
npm run build
```

2. **Déployer le dossier `.next`** sur Netlify

### Déploiement sur votre serveur

1. **Build de production**
```bash
npm run build
npm start
```

2. **Configuration serveur**
   - Port : 3000 (configurable)
   - Variables d'environnement requises
   - Reverse proxy recommandé (Nginx/Apache)

## 🔧 Configuration avancée

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Clé API OpenAI pour l'IA | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | ✅ |

### Personnalisation

- **Styles** : Modifiez `tailwind.config.js`
- **Prompts IA** : Éditez `lib/ai-generator.ts`
- **Composants** : Dossier `components/`

## 📦 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification du code
```

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 14, React, TypeScript
- **Styling** : Tailwind CSS, Radix UI
- **IA** : OpenAI GPT-4
- **Déploiement** : Vercel, Netlify

## 🎯 Utilisation

1. **Décrire votre idée** : Expliquez votre concept d'ebook
2. **Personnaliser** : Choisissez genre, public, longueur, couleurs
3. **Générer** : L'IA crée votre ebook en quelques secondes
4. **Prévisualiser** : Consultez le résultat avec navigation
5. **Télécharger** : Récupérez votre ebook au format PDF

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/votre-username/hb-creator/issues)
- **Documentation** : Ce README et commentaires dans le code

---

**Propulsé par l'Intelligence Artificielle** 🤖✨

## Étapes de création d’un eBook dans HB Creator

1. Saisie du texte
   - L’utilisateur peut écrire ou importer son texte (.txt, .docx, .pdf).
   - Détection de la langue automatique (heuristique).
   - Outils intégrés : Nettoyer le texte, Découper automatiquement en chapitres, Analyser le style d’écriture.

2. Génération IA du contenu
   - API IA pour reformuler, corriger ou enrichir le texte.
   - Actions disponibles : Améliorer, Raccourcir, Allonger, Simplifier.
   - Historique des versions et restauration.

3. Génération d’illustrations
   - Une image générée par chapitre via IA (OpenAI Images), styles personnalisables (réaliste, cartoon, aquarelle, fantasy, etc.).
   - Option de régénération d’image par chapitre.

4. Création de la couverture
   - Génération automatique à partir du titre et auteur.
   - Taille recommandée : 2048×3072 px (prévisualisation 1024×1536).
   - Possibilité d’uploader une image manuellement.
   - Filigrane “HB Creator” pour la version gratuite.

5. Mise en page automatique
   - Templates (roman, essai, éducatif, conte).
   - Pagination, sommaire, insertion d’images automatiques.
   - Styles typographiques cohérents : Titre 18 pt, Sous-titre 14 pt, Corps 11 pt.

6. Export du livre
   - Formats : PDF, EPUB, DOCX.
   - Progression et notification “eBook prêt à télécharger”.

7. Sauvegarde et gestion des projets
   - Sauvegarde automatique toutes les 2 minutes (en mémoire pour la démo).
   - Tableau de bord listant les projets, duplication et suppression.

8. Sécurité et limites (ébauche)
   - Préparation pour JWT/OAuth, quotas par abonnement, filtrage anti‑abus IA et chiffrement des données sensibles.