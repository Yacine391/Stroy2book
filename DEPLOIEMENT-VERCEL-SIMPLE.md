# 🚀 DÉPLOIEMENT VERCEL - GUIDE SIMPLE

**Date:** 2025-11-08  
**Application:** HB_Creator  
**Durée:** 5-10 minutes

---

## ✅ PRÉ-REQUIS

- ✅ Code sur GitHub (branche `main`)
- ✅ Clé API Google Gemini fonctionnelle
- ✅ Compte GitHub

---

## 🚀 ÉTAPES DE DÉPLOIEMENT

### ÉTAPE 1 : Créer un compte Vercel

1. **Allez sur :** https://vercel.com/signup
2. **Cliquez sur :** "Continue with GitHub"
3. **Autorisez Vercel** à accéder à votre GitHub
4. ✅ Vous êtes connecté !

---

### ÉTAPE 2 : Importer le projet

1. **Sur Vercel Dashboard :** Cliquez sur "Add New..." → "Project"
2. **Cherchez :** "Stroy2book" dans la liste de vos repos GitHub
3. **Cliquez sur :** "Import"

---

### ÉTAPE 3 : Configurer le projet

**Sur la page de configuration :**

#### A. Framework Preset
```
✅ Next.js (détecté automatiquement)
```

#### B. Root Directory
```
✅ ./ (par défaut)
```

#### C. Build Command
```
npm run build
```

#### D. Output Directory
```
.next
```

#### E. Install Command
```
npm install
```

---

### ÉTAPE 4 : ⚠️ CONFIGURER LES VARIABLES D'ENVIRONNEMENT

**C'EST LA PARTIE LA PLUS IMPORTANTE !**

1. **Cliquez sur :** "Environment Variables"
2. **Ajoutez cette variable :**

```
Name:  GOOGLE_API_KEY
Value: AIzaSyDomh29-ozaS4k2AMonHJHFTf4aOIo1FqQ
```

3. **Cochez :** Production, Preview, Development
4. **Cliquez sur :** "Add"

---

### ÉTAPE 5 : Déployer

1. **Cliquez sur :** "Deploy"
2. **Attendez 2-3 minutes** (Vercel va :)
   - ✅ Cloner le code
   - ✅ Installer les dépendances
   - ✅ Builder l'application
   - ✅ Déployer sur le CDN mondial

---

### ÉTAPE 6 : Tester

**Une fois le déploiement terminé :**

1. **Vercel affiche :** "Congratulations! 🎉"
2. **Cliquez sur :** "Visit" ou sur l'URL affichée
3. **L'URL sera du type :** `https://stroy2book-xxx.vercel.app`

**Testez les actions IA en ligne !**

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

### Test 1 : L'application s'ouvre
```
✅ L'interface s'affiche correctement
```

### Test 2 : Les actions IA fonctionnent
```
1. Créez un projet
2. Écrivez du texte
3. Cliquez sur "Améliorer"
4. ✅ Le texte doit être transformé (pas de placeholder)
```

### Test 3 : Les exports fonctionnent
```
1. Exportez en PDF
2. ✅ Le PDF se télécharge et contient le contenu
```

---

## ❌ SI LES ACTIONS IA NE MARCHENT PAS

**Erreur probable :** "Clé API non configurée"

**Solution :**

1. **Allez sur Vercel :** https://vercel.com/dashboard
2. **Sélectionnez votre projet :** "Stroy2book"
3. **Cliquez sur :** "Settings" → "Environment Variables"
4. **Vérifiez que :** `GOOGLE_API_KEY` est bien configurée
5. **Si elle manque ou est incorrecte :**
   - Cliquez sur "Add New"
   - Name: `GOOGLE_API_KEY`
   - Value: `AIzaSyDomh29-ozaS4k2AMonHJHFTf4aOIo1FqQ`
   - Environment: Production + Preview + Development
   - Save
6. **Redéployez :**
   - Allez sur "Deployments"
   - Cliquez sur les "..." du dernier déploiement
   - Cliquez sur "Redeploy"

---

## 🔄 MISES À JOUR FUTURES

**Chaque fois que vous poussez du code sur GitHub (branche main), Vercel redéploie automatiquement !**

```bash
# Sur votre machine locale
git add .
git commit -m "fix: correction du bug X"
git push origin main

# Vercel va automatiquement :
# 1. Détecter le push
# 2. Rebuilder l'application
# 3. Déployer la nouvelle version
# 4. Vous envoyer un email de confirmation
```

---

## 📊 TABLEAU DE BORD VERCEL

**URL :** https://vercel.com/dashboard

**Vous y trouverez :**
- 📊 Statistiques de trafic
- 🚀 Historique des déploiements
- 🔧 Paramètres du projet
- 🔐 Variables d'environnement
- 📈 Métriques de performance

---

## 🎯 RÉCAPITULATIF

```
1. Compte Vercel       → https://vercel.com/signup
2. Importer projet     → "Stroy2book" depuis GitHub
3. Config              → Framework: Next.js
4. Variables d'env     → GOOGLE_API_KEY=AIzaSyDomh...
5. Déployer            → Cliquez "Deploy"
6. Tester              → Ouvrez l'URL Vercel
7. ✅ C'EST EN LIGNE ! → Votre app est accessible 24/7
```

---

## 💡 CONSEILS

### Domaine personnalisé (optionnel)

**Si vous avez un nom de domaine :**

1. Allez sur "Settings" → "Domains"
2. Ajoutez votre domaine (ex: `mon-ebook.com`)
3. Suivez les instructions DNS
4. ✅ Votre app sera sur `mon-ebook.com` !

### SSL/HTTPS

**✅ Automatique !** Vercel génère un certificat SSL gratuit pour vous.

### Performance

**✅ CDN mondial !** Votre app est distribuée sur 100+ serveurs dans le monde entier.

---

## 🎉 APRÈS LE DÉPLOIEMENT

**Vous aurez :**

- ✅ Une URL publique (ex: `stroy2book.vercel.app`)
- ✅ HTTPS activé (sécurisé)
- ✅ CDN mondial (rapide partout)
- ✅ Déploiement continu (auto-update sur git push)
- ✅ Logs et analytics
- ✅ Rollback facile (retour en arrière si problème)

---

**🚀 COMMENCEZ MAINTENANT : https://vercel.com/signup**
