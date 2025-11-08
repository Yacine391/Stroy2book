# 🔑 GUIDE COMPLET : Obtenir et Configurer Votre Clé API

## 🎯 OPTION 1 : GOOGLE GEMINI (RECOMMANDÉ - GRATUIT)

### ✅ Avantages
- ✅ **100% GRATUIT** (pas de carte bancaire)
- ✅ **Quota généreux** : 1500 requêtes/jour
- ✅ **Très performant** pour transformer du texte
- ✅ **Rapide** (2-5 secondes par transformation)
- ✅ **Multilingue** excellent (français parfait)
- ✅ **Déjà intégré** dans votre code

### 📋 Étapes détaillées

#### 1️⃣ Aller sur Google AI Studio

Ouvrez votre navigateur :
```
https://makersuite.google.com/app/apikey
```

OU (nouveau lien) :
```
https://aistudio.google.com/app/apikey
```

#### 2️⃣ Se connecter

- Utilisez n'importe quel compte Google (Gmail, etc.)
- Si vous n'avez pas de compte Google, créez-en un (gratuit)

#### 3️⃣ Créer un projet (si demandé)

- Cliquez sur "Create project" ou "Nouveau projet"
- Nom du projet : "HB-Creator" (ou ce que vous voulez)
- Cliquez "Create"

#### 4️⃣ Créer la clé API

1. Cliquez sur **"Create API key"** ou **"Créer une clé API"**
2. Sélectionnez votre projet
3. La clé s'affiche (format : `AIzaSy...`)
4. Cliquez sur **"Copy"** ou copiez manuellement

**⚠️ IMPORTANT : Copiez la clé MAINTENANT, vous ne pourrez plus la voir après !**

#### 5️⃣ Configurer dans votre projet

Ouvrez le fichier `.env.local` à la racine du projet et remplacez :

```bash
GOOGLE_API_KEY=AIzaSy_COLLEZ_VOTRE_CLE_ICI
```

**Exemple réel :**
```bash
GOOGLE_API_KEY=AIzaSyD3k9xP2L1mN4o5Q6r7S8t9U0v1W2x3Y4z
```

#### 6️⃣ Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C dans le terminal)
# Puis relancez :
npm run dev
```

#### 7️⃣ Tester

```bash
node test-ai-action.js
```

Si vous voyez ✅ **"TEST RÉUSSI"** → C'est bon, vous pouvez utiliser l'app !

---

## 🚀 OPTION 2 : OPENAI GPT-4 (PAYANT - QUALITÉ MAXIMALE)

### ✅ Avantages
- ✅ **Qualité exceptionnelle** (meilleur que Gemini)
- ✅ **Créativité supérieure**
- ✅ **Textes plus naturels et fluides**
- ✅ **Meilleur pour les longs textes**

### ❌ Inconvénients
- ❌ **PAYANT** (~$0.03 par transformation)
- ❌ **Carte bancaire obligatoire**
- ❌ **Plus lent** (5-10 secondes)
- ❌ **Modifications de code nécessaires**

### 💰 Coût estimé
- **Test (10-20 transformations)** : ~$0.50
- **Usage normal (100 transformations/mois)** : ~$3-5
- **Usage intensif (500 transformations/mois)** : ~$15-20

### 📋 Étapes

#### 1️⃣ Créer un compte OpenAI

Allez sur : https://platform.openai.com/signup

#### 2️⃣ Ajouter un moyen de paiement

- Menu : Billing → Payment methods
- Ajoutez une carte bancaire
- **⚠️ Définissez une limite** (ex: $10/mois) pour éviter les surprises

#### 3️⃣ Obtenir la clé API

- Menu : API Keys
- Cliquez "Create new secret key"
- Copiez la clé (format : `sk-...`)

#### 4️⃣ Configurer

Ajoutez dans `.env.local` :
```bash
OPENAI_API_KEY=sk-VOTRE_CLE_OPENAI
USE_OPENAI=true
```

#### 5️⃣ Modifier le code

Je vais créer un fichier pour basculer facilement entre Gemini et OpenAI...

---

## 🔵 OPTION 3 : ANTHROPIC CLAUDE (PAYANT - ÉQUILIBRÉ)

### ✅ Avantages
- ✅ **Excellente qualité** (comparable à GPT-4)
- ✅ **Moins cher** que GPT-4 (~$0.01 par transformation)
- ✅ **Très bon en français**
- ✅ **Textes longs** (jusqu'à 200K tokens)

### ❌ Inconvénients
- ❌ **PAYANT**
- ❌ **Carte bancaire obligatoire**
- ❌ **Modifications de code nécessaires**

### 📋 Étapes

1. Créer un compte : https://console.anthropic.com/
2. Ajouter un moyen de paiement
3. Créer une clé API
4. Configurer dans `.env.local`

---

## 📊 COMPARAISON DÉTAILLÉE

| Critère | Google Gemini | OpenAI GPT-4 | Anthropic Claude |
|---------|---------------|--------------|------------------|
| **Prix** | 🟢 Gratuit | 🔴 $0.03/req | 🟡 $0.01/req |
| **Qualité** | 🟢 Très bon | 🟢 Excellent | 🟢 Excellent |
| **Vitesse** | 🟢 Rapide | 🟡 Moyen | 🟢 Rapide |
| **Français** | 🟢 Excellent | 🟢 Excellent | 🟢 Excellent |
| **Textes longs** | 🟡 8K tokens | 🟢 128K tokens | 🟢 200K tokens |
| **Setup** | 🟢 Simple | 🟡 Moyen | 🟡 Moyen |
| **Carte bancaire** | 🟢 Non | 🔴 Oui | 🔴 Oui |

---

## 🎯 MES RECOMMANDATIONS

### Pour DÉBUTER et TESTER (90% des utilisateurs)
👉 **GOOGLE GEMINI** (Option 1)
- Gratuit et performant
- Largement suffisant pour créer des ebooks de qualité
- Aucun risque financier

### Pour USAGE PROFESSIONNEL et QUALITÉ MAXIMALE
👉 **OPENAI GPT-4** (Option 2)
- Textes plus naturels et créatifs
- Meilleur pour les contenus marketing
- Vaut l'investissement si vous vendez vos ebooks

### Pour USAGE INTENSIF et BUDGET LIMITÉ
👉 **ANTHROPIC CLAUDE** (Option 3)
- Bon compromis qualité/prix
- Excellente gestion des textes longs
- Moins cher que GPT-4

---

## ⚡ DÉMARRAGE RAPIDE (OPTION 1 - GRATUIT)

```bash
# 1. Obtenez votre clé gratuite (5 min)
# → https://makersuite.google.com/app/apikey

# 2. Ouvrez .env.local et collez votre clé
GOOGLE_API_KEY=AIzaSy_VOTRE_CLE

# 3. Testez
node test-ai-action.js

# 4. Lancez l'app
npm run dev

# 5. Créez votre premier ebook avec IA ! 🎉
```

---

## 🛡️ SÉCURITÉ

### ✅ À FAIRE
- ✅ Ne partagez JAMAIS votre clé API publiquement
- ✅ Gardez `.env.local` dans `.gitignore` (déjà fait)
- ✅ Régénérez votre clé si vous pensez qu'elle a fuité

### ❌ À NE PAS FAIRE
- ❌ Ne commitez pas `.env.local` dans Git
- ❌ Ne postez pas votre clé sur des forums/réseaux sociaux
- ❌ Ne partagez pas votre clé avec d'autres personnes

---

## ❓ FAQ

### Q : Dois-je vraiment remplacer la clé ?
**R :** OUI, absolument. La clé actuelle ne fonctionne plus (quota dépassé). Sans nouvelle clé, les actions IA ne fonctionneront pas.

### Q : C'est vraiment gratuit pour Google Gemini ?
**R :** OUI, 100% gratuit. Quota : 1500 requêtes/jour (largement suffisant).

### Q : Faut-il une carte bancaire pour Gemini ?
**R :** NON, aucune carte bancaire requise.

### Q : Combien de temps pour obtenir une clé ?
**R :** 5 minutes maximum avec Google Gemini.

### Q : Puis-je utiliser plusieurs IA en même temps ?
**R :** Oui, je peux modifier le code pour permettre de basculer entre différentes IA.

### Q : Quelle IA produit les meilleurs textes ?
**R :** GPT-4 > Claude ≈ Gemini. Mais Gemini est gratuit et excellent pour 90% des usages.

### Q : Mon quota gratuit est-il suffisant ?
**R :** OUI. 1500 requêtes/jour = vous pouvez créer ~50-100 ebooks par jour.

### Q : Que se passe-t-il si je dépasse le quota ?
**R :** Avec Gemini gratuit : vous devez attendre 24h OU créer une nouvelle clé.

---

## 🆘 PROBLÈMES COURANTS

### "404 not found"
→ Clé API invalide  
→ **Solution :** Créez une nouvelle clé

### "403 forbidden"
→ API non activée ou clé restreinte  
→ **Solution :** Vérifiez les paramètres de la clé

### "429 quota exceeded"
→ Limite atteinte  
→ **Solution :** Attendez 24h ou créez une nouvelle clé

### Le test échoue
→ Vérifiez que vous avez bien copié/collé la clé complète  
→ Vérifiez qu'il n'y a pas d'espace avant/après  
→ Redémarrez le serveur après modification

---

## 📞 BESOIN D'AIDE ?

1. Testez avec : `node test-ai-action.js`
2. Consultez les logs du navigateur (F12 → Console)
3. Consultez les logs du serveur (terminal)
4. Vérifiez `.env.local`

---

**Ma recommandation finale : Commencez avec Google Gemini (gratuit). Si vous avez besoin de plus tard, on pourra passer à GPT-4. 🚀**
