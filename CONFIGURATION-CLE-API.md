# 🔑 CONFIGURATION DE LA CLÉ API GOOGLE GEMINI

## ⚠️ PROBLÈME ACTUEL

Les actions IA ne fonctionnent pas car la clé API Google Gemini codée en dur **N'EST PLUS VALIDE**.

Vous devez **OBLIGATOIREMENT** obtenir votre propre clé API Google Gemini gratuite.

---

## 📋 ÉTAPES POUR OBTENIR VOTRE CLÉ API (5 MINUTES)

### 1️⃣ Aller sur le site Google AI Studio

Ouvrez votre navigateur et allez sur :
```
https://makersuite.google.com/app/apikey
```

OU

```
https://aistudio.google.com/app/apikey
```

### 2️⃣ Se connecter avec votre compte Google

- Utilisez n'importe quel compte Google (Gmail, etc.)
- Pas besoin de carte bancaire
- **C'EST GRATUIT**

### 3️⃣ Créer une clé API

1. Cliquez sur **"Create API key"** ou **"Créer une clé API"**
2. Sélectionnez ou créez un projet Google Cloud
3. Copiez la clé qui commence par `AIzaSy...`

### 4️⃣ Configurer la clé dans votre projet

**Option A - Fichier .env.local (RECOMMANDÉ)**

Créez ou modifiez le fichier `/workspace/.env.local` :

```bash
GOOGLE_API_KEY=AIzaSy_VOTRE_CLE_ICI
```

**Option B - Variables d'environnement**

Si vous déployez sur Vercel :
1. Allez dans Project Settings → Environment Variables
2. Ajoutez `GOOGLE_API_KEY` avec votre clé

### 5️⃣ Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez-le
npm run dev
```

---

## ✅ VÉRIFIER QUE ÇA MARCHE

### Test rapide (en Node.js)

```bash
node test-ai-action.js
```

Si vous voyez :
- ✅ "TEST RÉUSSI" → Tout fonctionne !
- ❌ "ERREUR 404" → La clé n'est pas valide
- ❌ "ERREUR 403" → Vérifiez que l'API Gemini est activée

### Test dans l'application

1. Lancez l'application : `npm run dev`
2. Créez un nouveau projet
3. Entrez du texte : "Fais moi un ebook sur l'indépendance de l'Algérie"
4. Cliquez sur une action IA (ex: "Améliorer")
5. Attendez quelques secondes
6. **Vous devriez voir du vrai contenu transformé**, PAS juste `[Texte amélioré par l'IA...]`

---

## 🔍 DÉPANNAGE

### Erreur 404 "models/gemini-pro is not found"

**Cause :** La clé API n'est pas valide ou a expiré

**Solution :**
1. Obtenez une nouvelle clé sur https://makersuite.google.com/app/apikey
2. Remplacez la clé dans `.env.local`
3. Redémarrez le serveur

### Erreur 403 "API key not valid"

**Cause :** La clé est invalide ou l'API n'est pas activée

**Solution :**
1. Vérifiez que vous avez copié la clé complète
2. Vérifiez qu'il n'y a pas d'espace avant/après la clé
3. Créez une nouvelle clé si nécessaire

### Erreur 429 "Quota exceeded"

**Cause :** Vous avez dépassé le quota gratuit (rare)

**Solution :**
1. Attendez 24h (le quota se réinitialise)
2. OU créez un nouveau projet Google Cloud avec une nouvelle clé

### L'action IA retourne "[Texte amélioré par l'IA...]"

**Cause :** L'API échoue et le fallback est utilisé

**Solution :**
1. Vérifiez votre clé API dans `.env.local`
2. Redémarrez le serveur : `Ctrl+C` puis `npm run dev`
3. Regardez les logs de la console pour voir l'erreur exacte

---

## 📊 QUOTA GRATUIT GOOGLE GEMINI

- **Requêtes par minute :** 60
- **Requêtes par jour :** 1,500
- **Tokens par minute :** 32,000

Pour une utilisation normale (ebook de 20 pages), le quota gratuit est **largement suffisant**.

---

## 🚀 RÉCAPITULATIF RAPIDE

```bash
# 1. Obtenir la clé
# → https://makersuite.google.com/app/apikey

# 2. Créer .env.local
echo "GOOGLE_API_KEY=AIzaSy_VOTRE_CLE" > .env.local

# 3. Tester
node test-ai-action.js

# 4. Si OK, lancer l'app
npm run dev
```

---

## ❓ BESOIN D'AIDE ?

Si vous avez des problèmes :

1. Vérifiez les logs de la console du navigateur (F12)
2. Vérifiez les logs du serveur terminal
3. Testez avec `node test-ai-action.js` pour isoler le problème
4. Assurez-vous que votre clé commence bien par `AIzaSy`

---

## 📝 NOTES IMPORTANTES

- ✅ La clé API Google Gemini est **100% GRATUITE**
- ✅ Pas besoin de carte bancaire
- ✅ Le quota gratuit est suffisant pour tester et utiliser l'app
- ⚠️ Ne partagez JAMAIS votre clé API publiquement
- ⚠️ Ajoutez `.env.local` dans `.gitignore` (déjà fait)

---

**Une fois votre clé configurée, les actions IA fonctionneront parfaitement ! 🎉**
