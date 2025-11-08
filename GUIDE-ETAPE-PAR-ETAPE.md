# 🚀 GUIDE ÉTAPE PAR ÉTAPE - DÉPLOIEMENT VERCEL

## ✅ CE QUE VOUS AVEZ DÉJÀ FAIT

- ✅ Créé une nouvelle clé API Google Gemini
- ✅ Compris pourquoi ne pas mettre la clé en dur dans le code

---

## 📋 CE QUE NOUS ALLONS FAIRE MAINTENANT

1. **Configurer la clé localement** (pour tester)
2. **Tester localement** (vérifier que ça marche)
3. **Créer un compte Vercel** (si pas déjà fait)
4. **Déployer sur Vercel**
5. **Ajouter la clé API sur Vercel**
6. **Tester en ligne**

**Temps total : 10-15 minutes**

---

# ÉTAPE 1 : CONFIGURER LA CLÉ LOCALEMENT (2 minutes)

## 1.1 - Ouvrez le fichier `.env.local`

**📍 Emplacement :** À la racine du projet `/workspace/.env.local`

**Dans votre éditeur de code** (VSCode, Cursor, etc.) :
- Cliquez sur le fichier `.env.local`

**OU en ligne de commande :**
```bash
code .env.local
# OU
nano .env.local
```

## 1.2 - Remplacez la clé compromise

**Trouvez cette ligne :**
```bash
GOOGLE_API_KEY=AIzaSyC1qilwIQEDwfF6B4LLKq7kB9h4oJKzlCo
```

**Remplacez par votre NOUVELLE clé :**
```bash
GOOGLE_API_KEY=VOTRE_NOUVELLE_CLE_ICI
```

**Exemple :**
```bash
GOOGLE_API_KEY=AIzaSyD_EXEMPLE_12345abcdef
```

## 1.3 - Sauvegardez le fichier

**Dans l'éditeur :**
- Windows/Linux : `Ctrl + S`
- Mac : `Cmd + S`

**OU en ligne de commande :**
```bash
# Si vous utilisez nano
Ctrl + X, puis Y, puis Enter
```

**✅ FAIT !** La clé est maintenant configurée localement.

---

# ÉTAPE 2 : TESTER LOCALEMENT (3 minutes)

## 2.1 - Ouvrez un terminal

**Dans votre éditeur :**
- Menu → Terminal → New Terminal

**OU ouvrez un terminal système** et allez dans le dossier du projet :
```bash
cd /workspace
```

## 2.2 - Installez les dépendances (si pas déjà fait)

```bash
npm install
```

**Attendez** : ~30 secondes

**Résultat attendu :**
```
✓ Installed 617 packages
```

## 2.3 - Lancez le serveur de développement

```bash
npm run dev
```

**Résultat attendu :**
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

## 2.4 - Testez dans le navigateur

**Ouvrez :** http://localhost:3000

**Vous devriez voir :** La page d'accueil de votre application

## 2.5 - Testez les actions IA

1. **Créez un nouveau projet**
2. **Entrez du texte :** 
   ```
   Fais moi un ebook sur l'indépendance de l'Algérie
   ```
3. **Cliquez sur "Améliorer"**
4. **Attendez** 3-5 secondes

**✅ Résultat attendu :**
- Le texte doit être TRANSFORMÉ (pas de placeholder)
- Plusieurs paragraphes riches apparaissent
- Pas de message d'erreur

**❌ Si vous voyez `[Texte amélioré par l'IA...]` :**
- La clé n'est pas correcte
- Vérifiez `.env.local`
- Relancez `npm run dev`

## 2.6 - Arrêtez le serveur

**Dans le terminal :**
```bash
Ctrl + C
```

**✅ FAIT !** Votre application fonctionne localement !

---

# ÉTAPE 3 : CRÉER UN COMPTE VERCEL (5 minutes)

## 3.1 - Allez sur Vercel

**Ouvrez :** https://vercel.com

## 3.2 - Créez un compte (si pas déjà fait)

**Cliquez sur :** "Sign Up" (en haut à droite)

**Choisissez une méthode :**

### Option A : GitHub (RECOMMANDÉ)
1. Cliquez **"Continue with GitHub"**
2. Autorisez Vercel à accéder à votre compte GitHub
3. ✅ C'est fait !

### Option B : GitLab
1. Cliquez **"Continue with GitLab"**
2. Autorisez Vercel
3. ✅ C'est fait !

### Option C : Bitbucket
1. Cliquez **"Continue with Bitbucket"**
2. Autorisez Vercel
3. ✅ C'est fait !

### Option D : Email
1. Entrez votre email
2. Vérifiez votre boîte mail
3. Cliquez sur le lien de confirmation
4. ✅ C'est fait !

**✅ FAIT !** Vous avez un compte Vercel !

---

# ÉTAPE 4 : DÉPLOYER SUR VERCEL (5 minutes)

## 4.1 - Sur le Dashboard Vercel

**Vous devriez voir :** Le tableau de bord Vercel

**Cliquez sur :** **"Add New..."** (en haut à droite)

**Puis :** **"Project"**

## 4.2 - Connectez votre repository GitHub

**Si c'est la première fois :**

1. **Cliquez sur :** "Import Git Repository"
2. **Choisissez :** GitHub
3. **Autorisez Vercel** à accéder à vos repositories
4. **Vous verrez :** Une liste de vos repositories

## 4.3 - Trouvez votre projet

**Dans la liste, cherchez :** `Stroy2book`

**OU utilisez la barre de recherche**

**Vous devriez voir :**
```
┌─────────────────────────────┐
│  Yacine391/Stroy2book       │
│  Updated 1 hour ago         │
│                             │
│  [Import]                   │
└─────────────────────────────┘
```

**Cliquez sur :** **"Import"**

## 4.4 - Configurez le projet

**Page de configuration :**

### Project Name
```
Nom: stroy2book (ou ce que vous voulez)
```

### Framework Preset
```
Framework: Next.js ✅ (détecté automatiquement)
```

### Root Directory
```
Root: ./ ✅ (par défaut)
```

### Build and Output Settings
```
Build Command: npm run build ✅ (détecté)
Output Directory: .next ✅ (détecté)
Install Command: npm install ✅ (détecté)
```

**✅ Laissez tout par défaut**, Vercel détecte automatiquement.

## 4.5 - ⚠️ IMPORTANT : Ajoutez la variable d'environnement

**AVANT de cliquer "Deploy" :**

**Cliquez sur :** **"Environment Variables"** (section en bas)

**Vous verrez :**
```
┌─────────────────────────────────────────┐
│  Environment Variables                  │
│                                         │
│  Key          Value         Environments│
│  [__________] [__________] [□□□]        │
│                                         │
│  [+ Add Another]                        │
└─────────────────────────────────────────┘
```

**Remplissez :**

1. **Key (Nom) :**
   ```
   GOOGLE_API_KEY
   ```

2. **Value (Valeur) :**
   ```
   [COLLEZ VOTRE NOUVELLE CLÉ ICI]
   ```
   
   **Exemple :**
   ```
   AIzaSyD_VOTRE_NOUVELLE_CLE_12345
   ```

3. **Environments (Cochez les 3) :**
   ```
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

**✅ Cliquez sur "Add"**

**Vérifiez :**
```
┌─────────────────────────────────────────────┐
│  GOOGLE_API_KEY                             │
│  AIzaSy********** (masquée)                 │
│  Production, Preview, Development           │
└─────────────────────────────────────────────┘
```

## 4.6 - Déployez !

**Tout en bas de la page :**

**Cliquez sur :** **"Deploy"** (gros bouton bleu)

**Vercel va maintenant :**
```
1. ⏳ Cloner votre repository
2. ⏳ Installer les dépendances (npm install)
3. ⏳ Builder l'application (npm run build)
4. ⏳ Déployer sur les serveurs
```

**Temps d'attente : 2-5 minutes**

**Vous verrez :**
```
┌────────────────────────────────┐
│  Building...                   │
│  ████████████░░░░░ 75%         │
│                                │
│  Running "npm run build"...    │
└────────────────────────────────┘
```

## 4.7 - Attendez la fin du déploiement

**Quand c'est terminé, vous verrez :**
```
┌────────────────────────────────────────┐
│  🎉 Congratulations!                   │
│                                        │
│  Your project has been deployed!       │
│                                        │
│  https://stroy2book-abc123.vercel.app  │
│                                        │
│  [Visit] [Share]                       │
└────────────────────────────────────────┘
```

**✅ FAIT !** Votre application est en ligne !

---

# ÉTAPE 5 : TESTER EN LIGNE (2 minutes)

## 5.1 - Visitez votre site

**Cliquez sur :** Le lien affiché (ou le bouton "Visit")

**Exemple de lien :**
```
https://stroy2book-abc123.vercel.app
```

**Vous devriez voir :** Votre application en ligne !

## 5.2 - Testez les actions IA

**Sur votre site en ligne :**

1. **Créez un nouveau projet**
2. **Entrez du texte :**
   ```
   Fais moi un ebook sur l'indépendance de l'Algérie
   ```
3. **Cliquez sur "Améliorer"**
4. **Attendez** 3-5 secondes

**✅ Résultat attendu :**
- Le texte est transformé
- Plusieurs paragraphes riches
- Pas de `[Texte amélioré par l'IA...]`
- Pas d'erreur

## 5.3 - Testez les exports

1. **Générez un ebook complet**
2. **Exportez en PDF**
3. **Téléchargez et ouvrez le PDF**
4. **Vérifiez** : Le contenu est bien le texte transformé

**✅ FAIT !** Tout fonctionne en ligne !

---

# 🎉 FÉLICITATIONS !

Votre application est maintenant **en ligne et accessible au monde entier** !

## 📊 Ce qui a été fait

✅ Clé API configurée localement
✅ Application testée localement
✅ Compte Vercel créé
✅ Projet déployé sur Vercel
✅ Variables d'environnement ajoutées
✅ Application testée en ligne

## 🔗 Votre application

**URL :** `https://stroy2book-[votre-id].vercel.app`

**Vous pouvez maintenant :**
- Partager le lien avec vos amis
- L'utiliser pour créer des ebooks
- Continuer à développer (chaque push = nouveau déploiement)

---

# 🔄 DÉPLOIEMENTS FUTURS (AUTOMATIQUES)

**Chaque fois que vous faites un `git push` :**

1. ⚡ Vercel détecte automatiquement
2. 🔄 Vercel rebuild l'application
3. 🚀 Vercel déploie la nouvelle version
4. ✅ Votre site est mis à jour automatiquement

**Temps : 2-3 minutes par déploiement**

---

# ⚙️ CONFIGURATION AVANCÉE (OPTIONNEL)

## Domaine personnalisé

**Si vous voulez un domaine perso :**

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine
3. Configurez les DNS
4. ✅ Votre site sera sur `www.votre-domaine.com`

## Voir les logs

**Pour debug :**

1. Allez dans **Deployments**
2. Cliquez sur un déploiement
3. **Functions** → **Logs**
4. Vous verrez les logs en temps réel

---

# ❓ PROBLÈMES COURANTS

## Erreur "API key not configured"

**Solution :**
1. Vérifiez que vous avez bien ajouté `GOOGLE_API_KEY`
2. Vérifiez que la clé est correcte
3. Redéployez : **Deployments** → **...** → **Redeploy**

## Erreur "Build failed"

**Solution :**
1. Regardez les logs de build
2. L'erreur est affichée dans la console
3. Corrigez localement
4. Push → Vercel redéploie automatiquement

## Actions IA ne fonctionnent pas

**Solution :**
1. Vérifiez la clé API dans Vercel
2. Testez la clé sur Google AI Studio
3. Régénérez si nécessaire

---

# 📞 BESOIN D'AIDE ?

**Documentation Vercel :**
- Guide : https://vercel.com/docs
- Support : https://vercel.com/support

**Vérifiez aussi :**
- `DEPLOIEMENT-VERCEL.md` (guide complet)
- `RESUME-DEPLOIEMENT.md` (résumé)
- Les logs dans Vercel Dashboard

---

**🎉 Profitez de votre application en ligne !**
