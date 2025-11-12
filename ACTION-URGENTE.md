# ⚡ ACTION URGENTE - Configurer la clé API dans Vercel

**Problème** : Clé API non configurée dans Vercel  
**Temps requis** : 3 minutes  
**Status** : 🔴 **ACTION IMMÉDIATE NÉCESSAIRE**

---

## 🎯 CE QU'IL FAUT FAIRE MAINTENANT (3 MINUTES)

### Étape 1 : Ouvrir Vercel Dashboard

👉 **Cliquez ici** : https://vercel.com/dashboard

### Étape 2 : Sélectionner votre projet

Cliquez sur : **hbcreator** (ou le nom de votre projet Story2book)

### Étape 3 : Aller dans les paramètres

Cliquez sur : **Settings** (en haut à droite)

### Étape 4 : Ouvrir les variables d'environnement

Menu de gauche : **Environment Variables**

### Étape 5 : Ajouter GOOGLE_API_KEY

1. Cliquez **"Add New"** ou **"Add Variable"**

2. Remplissez :
   ```
   Name:  GOOGLE_API_KEY
   Value: [Collez votre clé ici]
   ```

3. **TRÈS IMPORTANT** : Cochez LES 3 cases :
   ```
   ☑ Production
   ☑ Preview       ← ESSENTIEL !
   ☑ Development
   ```

4. Cliquez **"Save"**

### Étape 6 : Ajouter AI_PROVIDER

1. Cliquez à nouveau **"Add New"**

2. Remplissez :
   ```
   Name:  AI_PROVIDER
   Value: gemini
   ```

3. Cochez les 3 cases :
   ```
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

4. Cliquez **"Save"**

### Étape 7 : Redéployer

1. Allez dans **Deployments** (en haut)
2. Dernier déploiement → **•••** (3 points)
3. Cliquez **"Redeploy"**
4. Attendez 2 minutes

### Étape 8 : Tester

1. Ouvrez votre site : https://hbcreator.vercel.app
2. Créez un projet
3. Cliquez "Améliorer"
4. ✅ **Ça devrait marcher !**

---

## 🔑 BESOIN DE LA CLÉ API ?

### Option A : Vous l'avez déjà

Sur votre ordinateur :
```bash
cat .env.local | grep GOOGLE_API_KEY
```

Copiez la valeur (commence par `AIzaSy...`)

### Option B : Créer une nouvelle clé (2 minutes)

1. **Allez sur** : https://aistudio.google.com/app/apikey
2. Connectez-vous avec Google
3. Cliquez **"Create API key"**
4. Copiez la clé (format : `AIzaSy...`)

---

## ⚠️ POINT CRITIQUE

**L'erreur vient du fait que** : Preview n'est PAS coché

Votre URL contient `git-main`, donc c'est un déploiement Preview.

**Vérifiez ABSOLUMENT que Preview est coché** ✅

---

## 📋 CHECKLIST ULTRA-RAPIDE

- [ ] Ouvrir https://vercel.com/dashboard
- [ ] Sélectionner le projet hbcreator
- [ ] Settings → Environment Variables
- [ ] Ajouter `GOOGLE_API_KEY` avec ma clé
- [ ] Cocher **Production, Preview, Development**
- [ ] Save
- [ ] Ajouter `AI_PROVIDER` = `gemini`
- [ ] Cocher **Production, Preview, Development**
- [ ] Save
- [ ] Deployments → Redeploy
- [ ] Attendre 2 minutes
- [ ] Tester sur mon site
- [ ] ✅ Ça marche !

---

## 🆘 AIDE VISUELLE

Guide complet avec captures d'écran : **`DIAGNOSTIC-CLE-API-VERCEL.md`**

---

**FAITES-LE MAINTENANT** → https://vercel.com/dashboard 🚀

Une fois fait, rechargez votre site et ça fonctionnera !
