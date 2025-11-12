# 🔑 CONFIGURER LA CLÉ API GOOGLE GEMINI DANS VERCEL

**Problème actuel** : `Clé API invalide`  
**Cause** : La clé API n'est pas configurée dans Vercel  
**Solution** : 5 minutes

---

## 🎯 PROBLÈME

L'application fonctionne en local mais pas en production (Vercel) :

```
❌ Erreur: Clé API invalide. 
Obtenez une nouvelle clé sur https://makersuite.google.com/app/apikey
```

**Pourquoi ?** 

Le fichier `.env.local` qui contient votre clé API est sur votre ordinateur, **pas sur Vercel**.

Il faut ajouter la clé API dans les variables d'environnement de Vercel.

---

## ✅ SOLUTION (5 MINUTES)

### Étape 1 : Récupérer votre clé API

#### Option A : Vous avez déjà une clé

```bash
# Sur votre ordinateur, affichez votre clé
cat .env.local | grep GOOGLE_API_KEY
```

Copiez la valeur (commence par `AIzaSy...`)

#### Option B : Créer une nouvelle clé

1. Allez sur : https://aistudio.google.com/app/apikey
2. Connectez-vous avec Google
3. Cliquez "Create API key"
4. Copiez la clé (format : `AIzaSy...`)

---

### Étape 2 : Ajouter la clé dans Vercel

#### 🌐 Via le Dashboard Vercel (RECOMMANDÉ)

1. **Allez sur** : https://vercel.com/dashboard

2. **Sélectionnez votre projet** : `hbcreator` ou `Story2book`

3. **Cliquez sur** : **Settings** (en haut)

4. **Dans le menu gauche** : **Environment Variables**

5. **Ajoutez 2 variables** :

   **Variable 1** :
   ```
   Name:  GOOGLE_API_KEY
   Value: AIzaSy_VOTRE_CLE_COMPLETE_ICI
   Environment: Production, Preview, Development (cochez les 3)
   ```

   **Variable 2** :
   ```
   Name:  AI_PROVIDER
   Value: gemini
   Environment: Production, Preview, Development (cochez les 3)
   ```

6. **Cliquez sur** : **Save**

---

### Étape 3 : Redéployer

Après avoir ajouté les variables, vous devez redéployer pour qu'elles soient prises en compte.

#### Option A : Redéploiement automatique

1. Dans Vercel Dashboard → **Deployments**
2. Trouvez le dernier déploiement
3. Cliquez sur les **3 points** (•••) à droite
4. Cliquez **Redeploy**
5. Attendez ~2 minutes

#### Option B : Push Git (déclenche un redéploiement)

```bash
# Sur votre ordinateur
git commit --allow-empty -m "chore: Trigger redeploy after env vars"
git push origin main
```

---

## 🧪 TESTER

### Étape 1 : Attendre la fin du déploiement

Dans Vercel Dashboard :
```
🔄 Building...
✅ Ready (après ~2 minutes)
```

### Étape 2 : Tester l'application

1. Ouvrez : https://hbcreator.vercel.app
2. Créez un nouveau projet
3. Entrez du texte : "Test de configuration"
4. Cliquez sur **"Améliorer"**
5. ✅ **Ça devrait fonctionner maintenant !**

### Étape 3 : Vérifier les logs

Console du navigateur (F12) :
```
🤖 Tentative 1/3 avec modèle: gemini-1.5-flash
✅ Succès avec gemini-1.5-flash (tentative 1)
```

---

## 📸 CAPTURES D'ÉCRAN (Guide visuel)

### 1. Dashboard Vercel

```
┌──────────────────────────────────────────┐
│  Vercel Dashboard                        │
├──────────────────────────────────────────┤
│                                          │
│  [hbcreator] ←  Cliquez sur votre projet│
│                                          │
│  → Settings                              │
│    → Environment Variables               │
│                                          │
└──────────────────────────────────────────┘
```

### 2. Ajouter une variable

```
┌──────────────────────────────────────────┐
│  Environment Variables                   │
├──────────────────────────────────────────┤
│                                          │
│  Name:  [GOOGLE_API_KEY              ]  │
│  Value: [AIzaSy...                   ]  │
│                                          │
│  ☑ Production                            │
│  ☑ Preview                               │
│  ☑ Development                           │
│                                          │
│  [Save]                                  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔍 VÉRIFIER QUE LES VARIABLES SONT BIEN CONFIGURÉES

### Dans Vercel Dashboard

1. Settings → Environment Variables
2. Vous devriez voir :

```
✅ GOOGLE_API_KEY          Production, Preview, Development
✅ AI_PROVIDER             Production, Preview, Development
```

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Problème 1 : "Clé API invalide" après redéploiement

**Solution** : La clé est peut-être expirée

1. Créez une **nouvelle clé** sur https://aistudio.google.com/app/apikey
2. Remplacez la valeur dans Vercel (Settings → Environment Variables → Edit)
3. Redéployez

### Problème 2 : "API non configurée"

**Solution** : Vérifiez que `AI_PROVIDER` est bien défini

```
Name:  AI_PROVIDER
Value: gemini
```

### Problème 3 : Les variables n'apparaissent pas

**Solution** : Vérifiez que vous avez bien cliqué sur "Save"

1. Rafraîchissez la page Vercel
2. Vérifiez que les variables sont listées
3. Si elles n'y sont pas, ajoutez-les à nouveau

### Problème 4 : "403 Forbidden" ou "Quota dépassé"

**Solution** : La clé a atteint sa limite

1. Créez une **nouvelle clé** sur AI Studio
2. Remplacez dans Vercel
3. Redéployez

---

## 🎯 VARIABLES RECOMMANDÉES (Complètes)

Voici toutes les variables que vous devriez avoir dans Vercel :

### Variables obligatoires

```bash
# Provider IA par défaut
AI_PROVIDER=gemini

# Clé API Google Gemini
GOOGLE_API_KEY=AIzaSy_VOTRE_CLE_ICI
```

### Variables optionnelles

```bash
# Modèle Gemini spécifique (par défaut: gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash

# URL de l'application (optionnel)
NEXT_PUBLIC_APP_URL=https://hbcreator.vercel.app
```

### Variables alternatives (si vous voulez utiliser OpenAI ou Claude)

```bash
# Pour OpenAI GPT-4 (payant)
# OPENAI_API_KEY=sk-VOTRE_CLE_OPENAI
# OPENAI_MODEL=gpt-4
# AI_PROVIDER=openai

# Pour Anthropic Claude (payant)
# ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE_CLAUDE
# CLAUDE_MODEL=claude-3-sonnet-20240229
# AI_PROVIDER=claude
```

---

## 📋 CHECKLIST

Cochez au fur et à mesure :

- [ ] J'ai obtenu ma clé API Google Gemini
- [ ] J'ai ouvert le Dashboard Vercel
- [ ] J'ai sélectionné mon projet (hbcreator)
- [ ] Je suis allé dans Settings → Environment Variables
- [ ] J'ai ajouté `GOOGLE_API_KEY` avec ma clé
- [ ] J'ai ajouté `AI_PROVIDER` avec la valeur `gemini`
- [ ] J'ai coché "Production, Preview, Development" pour les deux
- [ ] J'ai cliqué sur "Save"
- [ ] J'ai redéployé l'application
- [ ] J'ai attendu 2 minutes que le déploiement se termine
- [ ] J'ai testé sur https://hbcreator.vercel.app
- [ ] ✅ Ça fonctionne !

---

## 🎓 COMPRENDRE

### Pourquoi .env.local ne suffit pas ?

```
┌─────────────────────────────────────────┐
│  Votre ordinateur (local)               │
│  ✅ .env.local existe                   │
│  ✅ GOOGLE_API_KEY configurée           │
│  ✅ L'application fonctionne            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Vercel (production)                    │
│  ❌ .env.local n'existe pas             │
│  ❌ Variables d'environnement vides     │
│  ❌ L'application échoue                │
└─────────────────────────────────────────┘
```

**Solution** : Configurer les variables dans Vercel Dashboard

```
┌─────────────────────────────────────────┐
│  Vercel (production)                    │
│  ✅ Variables configurées dans Dashboard│
│  ✅ GOOGLE_API_KEY disponible           │
│  ✅ L'application fonctionne            │
└─────────────────────────────────────────┘
```

---

## 🎉 RÉCAPITULATIF

### Ce qu'il faut faire (5 minutes)

1. **Récupérer votre clé API** (ou en créer une)
2. **Aller sur Vercel Dashboard** → Votre projet → Settings → Environment Variables
3. **Ajouter 2 variables** : `GOOGLE_API_KEY` et `AI_PROVIDER`
4. **Redéployer** (automatique ou via push git)
5. **Tester** après 2 minutes

### Après ça

✅ Votre site fonctionnera en production  
✅ L'IA marchera comme en local  
✅ Plus d'erreur "Clé API invalide"  

---

## 📞 BESOIN D'AIDE ?

### Guides disponibles

- `GUIDE-CLE-API-COMPLET.md` - Comment obtenir une clé API
- `DEPLOIEMENT-VERCEL.md` - Guide complet du déploiement
- `QUELLE-IA-CHOISIR.md` - Comparatif des providers IA

### Support Vercel

- Documentation : https://vercel.com/docs/environment-variables
- Support : https://vercel.com/support

---

**Date** : 2025-11-12  
**Status** : 🔑 **Action requise** - Configurez la clé API dans Vercel  
**Temps estimé** : 5 minutes  

---

*Une fois la clé configurée dans Vercel, tout fonctionnera automatiquement !*
