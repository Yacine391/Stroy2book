# Story2book AI - Générateur d'ebooks par IA

Story2book AI est une application web qui utilise l'Intelligence Artificielle pour générer automatiquement des ebooks professionnels à partir d'une simple idée.

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
git clone https://github.com/votre-username/story2book-ai.git
cd story2book-ai
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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Lancer en développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

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

- **Issues** : [GitHub Issues](https://github.com/votre-username/story2book-ai/issues)
- **Documentation** : Ce README et commentaires dans le code

---

**Propulsé par l'Intelligence Artificielle** 🤖✨