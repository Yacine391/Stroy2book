# 🔧 CONFIGURER .env.local AVEC GROQ

**IMPORTANT** : `.env.local` n'est PAS dans Git (sécurité)

---

## ✅ CONFIGURATION LOCALE (2 MINUTES)

### Étape 1 : Après git pull

```bash
git pull origin main
```

### Étape 2 : Créez .env.local

```bash
# Copiez le template
cp .env.local.example .env.local
```

### Étape 3 : Éditez .env.local

Ouvrez `.env.local` et modifiez :

```bash
# Changez ces lignes :
AI_PROVIDER=groq
GROQ_API_KEY=gsk_VOTRE_VRAIE_CLE_ICI
GROQ_MODEL=llama-3.1-70b-versatile

# Gardez aussi Gemini en backup (optionnel)
GOOGLE_API_KEY=AIzaSy_VOTRE_CLE_SI_VOUS_LAVEZ
```

### Étape 4 : Testez en local

```bash
npm run dev
```

Créez un ebook, testez "Améliorer" → **Devrait être ultra-rapide !** ⚡

---

## 📋 FICHIER .env.local COMPLET

Voici ce que vous devriez avoir :

```bash
# Configuration HB Creator
# Provider IA principal
AI_PROVIDER=groq

# Groq (100% GRATUIT, ultra-rapide)
GROQ_API_KEY=gsk_VOTRE_CLE_GROQ_ICI
GROQ_MODEL=llama-3.1-70b-versatile

# Gemini (backup, optionnel)
GOOGLE_API_KEY=AIzaSy_VOTRE_CLE_SI_VOUS_LAVEZ

# URL app (optionnel)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 🚀 ENSUITE : VERCEL

Une fois que ça marche en local, configurez Vercel :

👉 https://vercel.com/dashboard

Ajoutez les mêmes variables dans **Environment Variables**.

---

**C'est tout !** Une fois `.env.local` créé et Vercel configuré, vous aurez l'IA la plus rapide ! ⚡
