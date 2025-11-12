# 🔍 DIAGNOSTIC - Clé API Vercel Non Fonctionnelle

**Problème** : Clé API invalide sur Vercel  
**URL du site** : hbcreator-git-main-yacinehenine04-1162s-projects.vercel.app

---

## 🎯 DIAGNOSTIC RAPIDE

### Symptôme

```
❌ Erreur: Clé API invalide. Obtenez une nouvelle clé sur 
https://makersuite.google.com/app/apikey
```

### Causes possibles

1. ❌ Variables d'environnement non configurées dans Vercel
2. ❌ Variables configurées mais pas sur tous les environnements (Preview manquant)
3. ❌ Clé API expirée ou invalide
4. ❌ Redéploiement non effectué après ajout des variables

---

## ✅ SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier que les variables existent dans Vercel

1. **Allez sur** : https://vercel.com/dashboard
2. **Cliquez sur** : Votre projet (hbcreator ou Story2book)
3. **Allez dans** : **Settings** (en haut à droite)
4. **Menu gauche** : **Environment Variables**

**Vous DEVEZ voir** :
```
✅ GOOGLE_API_KEY    Production, Preview, Development
✅ AI_PROVIDER       Production, Preview, Development
```

**Si vous ne les voyez PAS** → Passez à l'Étape 2  
**Si vous les voyez** → Passez à l'Étape 3

---

### Étape 2 : Ajouter les variables (SI MANQUANTES)

#### Variable 1 : GOOGLE_API_KEY

1. Cliquez sur **"Add New"**
2. Remplissez :
   ```
   Name:  GOOGLE_API_KEY
   ```
3. Value : Collez votre clé API complète (commence par `AIzaSy...`)
   
   **Comment obtenir la clé** :
   - Option A : Sur votre PC : `cat .env.local | grep GOOGLE_API_KEY`
   - Option B : Créer une nouvelle : https://aistudio.google.com/app/apikey

4. **IMPORTANT** : Cochez **LES 3 ENVIRONNEMENTS** :
   ```
   ☑ Production
   ☑ Preview       ← TRÈS IMPORTANT pour les branches Git
   ☑ Development
   ```

5. Cliquez **"Save"**

#### Variable 2 : AI_PROVIDER

1. Cliquez sur **"Add New"**
2. Remplissez :
   ```
   Name:  AI_PROVIDER
   Value: gemini
   ```
3. Cochez **LES 3 ENVIRONNEMENTS** :
   ```
   ☑ Production
   ☑ Preview
   ☑ Development
   ```
4. Cliquez **"Save"**

---

### Étape 3 : Vérifier que les environnements sont bien cochés

**PROBLÈME FRÉQUENT** : Les variables existent mais **Preview** n'est pas coché.

Votre URL de déploiement contient `git-main`, donc c'est un **déploiement Preview**.

**Solution** :

1. Dans Vercel → Settings → Environment Variables
2. Pour **GOOGLE_API_KEY** :
   - Cliquez sur **"Edit"** (icône crayon)
   - Vérifiez que **Preview** est coché ✅
   - Si pas coché → Cochez-le
   - Cliquez **"Save"**

3. Répétez pour **AI_PROVIDER**

---

### Étape 4 : Tester la clé API localement

Avant de redéployer, vérifions que votre clé fonctionne :

```bash
# Sur votre ordinateur
node test-api-simple.js VOTRE_CLE_API
```

**Résultat attendu** :
```
✅ ✅ ✅ SUCCÈS ! ✅ ✅ ✅
🎉 L'API Gemini fonctionne parfaitement !
```

**Si ça échoue** :
- Votre clé est invalide ou expirée
- Créez une nouvelle clé : https://aistudio.google.com/app/apikey
- Utilisez cette nouvelle clé dans Vercel

---

### Étape 5 : Redéployer (OBLIGATOIRE)

Après avoir ajouté ou modifié les variables, vous DEVEZ redéployer.

#### Option A : Via Vercel Dashboard (Recommandé)

1. Allez dans **Deployments**
2. Trouvez le dernier déploiement
3. Cliquez sur les **3 points** (•••) à droite
4. Cliquez **"Redeploy"**
5. Attendez 2-3 minutes

#### Option B : Via Git (automatique)

```bash
# Sur votre ordinateur
git commit --allow-empty -m "chore: Trigger redeploy with env vars"
git push origin main
```

---

### Étape 6 : Vérifier le nouveau déploiement

1. Dans Vercel Dashboard → **Deployments**
2. Attendez que le statut passe de 🔄 **Building** à ✅ **Ready**
3. Notez l'URL du déploiement
4. Ouvrez cette URL dans votre navigateur

---

### Étape 7 : Tester

1. Sur votre site Vercel
2. Créez un nouveau projet
3. Entrez du texte : "Test de configuration"
4. Cliquez **"Améliorer"**
5. ✅ **Ça devrait fonctionner maintenant**

---

## 🔍 DIAGNOSTIC AVANCÉ

### Vérifier les variables via les logs

Dans Vercel Dashboard :
1. Cliquez sur votre déploiement
2. Allez dans **"Functions"** ou **"Runtime Logs"**
3. Cherchez des logs comme :

```
🤖 AI Provider: Google Gemini
🤖 Using AI provider: gemini
```

Si vous voyez :
```
❌ No AI API key configured
```

→ Les variables ne sont pas détectées, recommencez l'Étape 2.

---

## 🆘 PROBLÈMES COURANTS

### Problème 1 : "Preview" n'était pas coché

**Symptôme** : Ça marche en Production mais pas sur les branches Git

**Solution** :
1. Settings → Environment Variables
2. Edit chaque variable
3. Cochez **Preview** ✅
4. Save et redéployez

### Problème 2 : Clé avec espaces ou caractères invisibles

**Symptôme** : La clé semble correcte mais ne marche pas

**Solution** :
1. Copiez la clé depuis AI Studio
2. Collez dans un éditeur de texte (Notepad, VS Code)
3. Supprimez tout espace avant/après
4. Recopiez et collez dans Vercel

### Problème 3 : Mauvaise clé (Cloud Console au lieu de AI Studio)

**Symptôme** : Erreur 404 ou "model not found"

**Solution** :
1. **NE PAS** utiliser de clé de Google Cloud Console
2. **UTILISER** une clé de https://aistudio.google.com/app/apikey
3. Créez une nouvelle clé sur AI Studio
4. Remplacez dans Vercel

### Problème 4 : Variables non sauvegardées

**Symptôme** : Variables disparaissent après rafraîchissement

**Solution** :
1. Vérifiez que vous avez cliqué **"Save"**
2. Rafraîchissez la page
3. Vérifiez que les variables sont listées
4. Si non, recommencez

### Problème 5 : Cache du déploiement

**Symptôme** : Les variables sont là mais ça ne marche pas

**Solution** :
1. Forcez un nouveau build complet
2. Deployments → ••• → **"Redeploy"**
3. Cochez **"Force rebuild"** si disponible

---

## 📊 CHECKLIST DE VÉRIFICATION COMPLÈTE

Cochez chaque point :

### Configuration Vercel

- [ ] Je suis connecté sur https://vercel.com/dashboard
- [ ] J'ai sélectionné le bon projet (hbcreator)
- [ ] Je suis dans Settings → Environment Variables
- [ ] Je vois la variable `GOOGLE_API_KEY`
- [ ] Je vois la variable `AI_PROVIDER`
- [ ] `GOOGLE_API_KEY` a les 3 environnements cochés (Production, **Preview**, Development)
- [ ] `AI_PROVIDER` a les 3 environnements cochés (Production, **Preview**, Development)
- [ ] La valeur de `GOOGLE_API_KEY` commence par `AIzaSy`
- [ ] La valeur de `AI_PROVIDER` est exactement `gemini` (en minuscules)

### Clé API

- [ ] J'ai créé la clé sur https://aistudio.google.com/app/apikey (PAS Cloud Console)
- [ ] J'ai testé la clé en local : `node test-api-simple.js MA_CLE` → ✅ Succès
- [ ] La clé ne contient pas d'espaces avant/après

### Déploiement

- [ ] J'ai redéployé après avoir ajouté les variables
- [ ] J'ai attendu que le build se termine (✅ Ready)
- [ ] Le déploiement est daté d'après l'ajout des variables

### Test

- [ ] J'ai ouvert le nouveau déploiement (pas l'ancien)
- [ ] J'ai créé un projet
- [ ] J'ai testé une action IA
- [ ] ✅ Ça fonctionne maintenant

---

## 🎯 VIDÉO GUIDE (Étapes visuelles)

### 1. Ajouter les variables

```
Vercel Dashboard
    ↓
Sélectionnez votre projet
    ↓
Settings (en haut à droite)
    ↓
Environment Variables (menu gauche)
    ↓
Add New
    ↓
Name: GOOGLE_API_KEY
Value: AIzaSy...
☑ Production
☑ Preview    ← TRÈS IMPORTANT
☑ Development
    ↓
Save
    ↓
Répéter pour AI_PROVIDER
```

### 2. Redéployer

```
Deployments (menu du haut)
    ↓
Dernier déploiement
    ↓
••• (3 points)
    ↓
Redeploy
    ↓
Attendre 2-3 minutes
    ↓
✅ Ready
```

### 3. Tester

```
Cliquez sur l'URL du déploiement
    ↓
Créez un projet
    ↓
Cliquez "Améliorer"
    ↓
✅ Ça marche !
```

---

## 💡 ASTUCE PRO

Pour éviter ces problèmes à l'avenir, vérifiez **TOUJOURS** que :

1. Les variables ont **les 3 environnements** cochés
2. Vous **redéployez** après chaque modification
3. Vous testez sur le **nouveau déploiement** (pas l'ancien)

---

## 📞 BESOIN D'AIDE SUPPLÉMENTAIRE ?

### Option 1 : Partager une capture d'écran

Faites une capture d'écran de :
- Settings → Environment Variables (montrant GOOGLE_API_KEY et AI_PROVIDER)

Je pourrai voir si la configuration est correcte.

### Option 2 : Vérifier les logs Vercel

1. Deployments → Votre dernier déploiement
2. Functions (ou Runtime Logs)
3. Cherchez des messages d'erreur
4. Partagez-les

### Option 3 : Créer une nouvelle clé

Si rien ne marche :
1. Créez une **toute nouvelle clé** sur AI Studio
2. Supprimez l'ancienne variable dans Vercel
3. Ajoutez la nouvelle
4. Redéployez

---

## 🎉 APRÈS LA CORRECTION

Une fois que ça marche, vous verrez dans les logs :

```
🤖 Tentative 1/3 avec modèle: gemini-1.5-flash
✅ Succès avec gemini-1.5-flash (tentative 1)
```

Et votre application générera du vrai contenu IA ! 🚀

---

**Date** : 2025-11-12  
**Status** : 🔍 **Diagnostic en cours**  
**Action** : Suivez les étapes ci-dessus dans l'ordre  

---

*La cause la plus fréquente : "Preview" n'est pas coché dans les variables d'environnement.*
