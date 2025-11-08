# 🚀 GUIDE DE DÉPLOIEMENT VERCEL

## ⚠️ AVANT DE DÉPLOYER - SÉCURITÉ CRITIQUE !

### 🚨 VOUS DEVEZ D'ABORD RÉGÉNÉRER VOTRE CLÉ API !

Votre clé API actuelle est **COMPROMISE** car vous l'avez partagée publiquement.

**📋 ÉTAPES OBLIGATOIRES AVANT DÉPLOIEMENT :**

1. **Allez sur :** https://makersuite.google.com/app/apikey
2. **SUPPRIMEZ** la clé : `AIzaSyC1qilwIQEDwfF6B4LLKq7kB9h4oJKzlCo`
3. **CRÉEZ** une nouvelle clé
4. **NOTEZ** la nouvelle clé (vous en aurez besoin pour Vercel)

---

## 🚀 DÉPLOIEMENT SUR VERCEL

### Méthode 1 : Via Dashboard Vercel (RECOMMANDÉ)

#### 1️⃣ Connectez-vous à Vercel

Allez sur : https://vercel.com

#### 2️⃣ Importez votre projet

1. Cliquez sur **"Add New..."** → **"Project"**
2. Connectez votre compte GitHub si ce n'est pas déjà fait
3. Trouvez le repository **"Stroy2book"**
4. Cliquez sur **"Import"**

#### 3️⃣ Configurez le projet

**Build Settings :**
- Framework Preset: **Next.js**
- Build Command: `npm run build` (détecté automatiquement)
- Output Directory: `.next` (détecté automatiquement)
- Install Command: `npm install` (détecté automatiquement)

#### 4️⃣ Ajoutez les variables d'environnement

⚠️ **TRÈS IMPORTANT** : Ajoutez ces variables d'environnement :

1. Cliquez sur **"Environment Variables"**
2. Ajoutez les variables suivantes :

```
Nom: GOOGLE_API_KEY
Valeur: [VOTRE_NOUVELLE_CLE_API_REGENEREE]
Environnement: Production, Preview, Development (cochez les 3)
```

**Optionnel** (si vous voulez utiliser OpenAI GPT-4) :
```
Nom: OPENAI_API_KEY
Valeur: [VOTRE_CLE_OPENAI]
Environnement: Production, Preview, Development

Nom: AI_PROVIDER
Valeur: openai
Environnement: Production, Preview, Development
```

**Optionnel** (si vous voulez utiliser Claude) :
```
Nom: ANTHROPIC_API_KEY
Valeur: [VOTRE_CLE_CLAUDE]
Environnement: Production, Preview, Development

Nom: AI_PROVIDER
Valeur: claude
Environnement: Production, Preview, Development
```

#### 5️⃣ Déployez !

1. Cliquez sur **"Deploy"**
2. Attendez 2-5 minutes (première fois)
3. Vercel va :
   - Cloner votre repository
   - Installer les dépendances
   - Build Next.js
   - Déployer

#### 6️⃣ Vérifiez le déploiement

Une fois terminé :
- Vous verrez **"Congratulations!"** avec un lien
- Cliquez sur le lien ou sur **"Visit"**
- Testez votre application !

---

### Méthode 2 : Via CLI Vercel (AVANCÉ)

#### 1️⃣ Installez Vercel CLI

```bash
npm install -g vercel
```

#### 2️⃣ Connectez-vous

```bash
vercel login
```

#### 3️⃣ Configurez les variables d'environnement

```bash
# Ajoutez votre NOUVELLE clé API
vercel env add GOOGLE_API_KEY
# Entrez votre nouvelle clé quand demandé
# Choisissez: Production, Preview, Development (tous)
```

#### 4️⃣ Déployez

**Pour un déploiement de test (Preview) :**
```bash
cd /workspace
vercel
```

**Pour un déploiement en production :**
```bash
cd /workspace
vercel --prod
```

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

### 1️⃣ Testez les actions IA

1. Allez sur votre site déployé
2. Créez un nouveau projet
3. Entrez du texte : "Fais moi un ebook sur l'indépendance de l'Algérie"
4. Cliquez sur **"Améliorer"**
5. **Vérifiez** que le texte est VRAIMENT transformé (pas de placeholder)

### 2️⃣ Testez les exports

1. Générez un ebook complet
2. Exportez en **PDF**
3. Exportez en **DOCX**
4. Exportez en **EPUB**
5. **Vérifiez** que tous les fichiers contiennent le contenu transformé

### 3️⃣ Vérifiez les logs

Dans le dashboard Vercel :
1. Allez dans **"Functions"** → **"Logs"**
2. Testez une action IA
3. Vous devriez voir :
   ```
   🚀 Calling AI API: { action: 'improve', textLength: 58 }
   🤖 AI Provider: Google Gemini
   ✅ AI processing successful
   ```

---

## 🔧 CONFIGURATION AVANCÉE

### Domaine personnalisé

1. Dans Vercel, allez dans **Settings** → **Domains**
2. Ajoutez votre domaine
3. Suivez les instructions pour configurer les DNS

### Limites et quotas

**Vercel Free Plan :**
- ✅ 100 GB bandwidth/mois
- ✅ Déploiements illimités
- ✅ Fonctions serverless
- ✅ Suffisant pour ~10,000 générations/mois

**Google Gemini Free :**
- ✅ 1500 requêtes/jour
- ✅ Largement suffisant

### Monitoring

Vercel fournit automatiquement :
- Analytics (visiteurs, pages vues)
- Performance metrics
- Error logs
- Function logs

---

## ⚠️ DÉPANNAGE

### Erreur "API key not configured"

**Cause :** Variable d'environnement manquante

**Solution :**
1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que `GOOGLE_API_KEY` existe
3. Si non, ajoutez-la
4. Redéployez : **Deployments** → **...** → **Redeploy**

### Erreur "404 not found" pour l'API

**Cause :** Clé API invalide

**Solution :**
1. Régénérez votre clé sur https://makersuite.google.com/app/apikey
2. Mettez à jour la variable dans Vercel
3. Redéployez

### Build Failed

**Cause :** Erreur de compilation

**Solution :**
1. Vérifiez les logs de build dans Vercel
2. Corrigez l'erreur localement
3. Committez et poussez
4. Vercel redéployera automatiquement

---

## 🎯 DÉPLOIEMENTS AUTOMATIQUES

Vercel déploie automatiquement :

- **Production** : Chaque push sur la branche `main`
- **Preview** : Chaque push sur les autres branches
- **Pull Requests** : Chaque PR crée un preview

### Désactiver les déploiements automatiques

Si vous voulez déployer manuellement :
1. **Settings** → **Git**
2. Décochez **"Production Branch"**
3. Ou configurez `vercel.json`

---

## 📊 RÉSUMÉ DES CHANGEMENTS DÉPLOYÉS

### ✅ Corrections appliquées

1. **Actions IA fonctionnelles** :
   - API backend réparée
   - Prompts optimisés
   - Validation stricte
   - Logs détaillés

2. **Système multi-IA** :
   - Support Google Gemini (gratuit)
   - Support OpenAI GPT-4 (payant)
   - Support Anthropic Claude (payant)
   - Basculement facile via variables d'environnement

3. **Exports fonctionnels** :
   - PDF avec contenu transformé
   - DOCX avec contenu transformé
   - EPUB avec contenu transformé

4. **Documentation complète** :
   - 10+ guides utilisateur
   - Script de test automatique
   - Messages d'erreur clairs

---

## 🚀 RÉCAPITULATIF

```bash
# 1. Régénérez votre clé API
# → https://makersuite.google.com/app/apikey

# 2. Allez sur Vercel
# → https://vercel.com

# 3. Importez "Stroy2book"

# 4. Ajoutez GOOGLE_API_KEY (nouvelle clé)

# 5. Cliquez Deploy

# 6. Testez ! 🎉
```

---

## ❓ BESOIN D'AIDE ?

- 📖 Documentation Vercel : https://vercel.com/docs
- 🔧 Dashboard Vercel : https://vercel.com/dashboard
- 💬 Support Vercel : https://vercel.com/support

---

**🎉 Une fois déployé, votre application sera accessible au monde entier !**

**⚠️ N'OUBLIEZ PAS : Régénérez d'abord votre clé API compromise !**
