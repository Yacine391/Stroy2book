# 🔧 CRÉER VOTRE .env.local MAINTENANT

**Vous avez** : `.env.local.example` ✅  
**Il faut créer** : `.env.local` avec votre clé Groq

---

## ⚡ MÉTHODE RAPIDE (30 SECONDES)

### Option 1 : Ligne de commande (RAPIDE)

```bash
# Dans le dossier du projet
cd ~/FREELANCE/Story2Book/hb_creator  # (ou votre chemin)

# Copiez le template
cp .env.local.example .env.local

# Éditez le fichier
nano .env.local
# OU
code .env.local
# OU
vim .env.local
```

### Option 2 : Manuellement

1. **Dupliquez le fichier**
   - Faites un clic droit sur `.env.local.example`
   - "Dupliquer" ou "Copier"
   - Renommez la copie en `.env.local`

2. **Ouvrez `.env.local`** avec votre éditeur de code

3. **Cherchez ces lignes** (vers la ligne 28-30) :
   ```bash
   # Par défaut, on utilise Groq (100% GRATUIT et ultra-rapide)
   AI_PROVIDER=groq
   ```

4. **Plus bas** (vers la ligne 59-60), trouvez :
   ```bash
   GROQ_API_KEY=gsk_VOTRE_CLE_GROQ_ICI
   GROQ_MODEL=llama-3.1-70b-versatile
   ```

5. **Remplacez** `gsk_VOTRE_CLE_GROQ_ICI` par votre vraie clé Groq

---

## 📝 CE QUE VOTRE .env.local DOIT CONTENIR

**MINIMUM (pour que ça marche) :**

```bash
AI_PROVIDER=groq
GROQ_API_KEY=gsk_VOTRE_VRAIE_CLE_ICI
GROQ_MODEL=llama-3.1-70b-versatile
```

**COMPLET (recommandé) :**

```bash
# Provider IA principal
AI_PROVIDER=groq

# Groq (100% GRATUIT, ultra-rapide)
GROQ_API_KEY=gsk_VOTRE_VRAIE_CLE_ICI
GROQ_MODEL=llama-3.1-70b-versatile

# Gemini (backup, optionnel)
# GOOGLE_API_KEY=AIzaSy_VOTRE_CLE_SI_VOUS_LAVEZ

# URL app (optionnel)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## ✅ VÉRIFICATION

Une fois créé, vérifiez que :

```bash
# Le fichier existe
ls -la .env.local

# Le fichier contient votre clé
cat .env.local | grep GROQ_API_KEY
```

Vous devriez voir :
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxx
```

---

## 🚀 ENSUITE

### 1. Testez en local

```bash
npm run dev
```

Ouvrez http://localhost:3001
- Créez un ebook
- Cliquez "Améliorer"
- ⚡ **Devrait être ultra-rapide (1 seconde max) !**

### 2. Configurez Vercel

Si ça marche en local, ajoutez dans Vercel :

👉 https://vercel.com/dashboard
- Settings → Environment Variables
- Ajoutez les 3 variables :
  - `AI_PROVIDER` = `groq`
  - `GROQ_API_KEY` = `gsk_...`
  - `GROQ_MODEL` = `llama-3.1-70b-versatile`
- Redéployez

---

## 🆘 SI PROBLÈME

### ".env.local not found"

**Solution** : Le fichier n'existe pas, créez-le :
```bash
touch .env.local
nano .env.local
# Ajoutez les 3 lignes essentielles
```

### "Clé API manquante"

**Solution** : Vérifiez que dans `.env.local` vous avez :
```bash
GROQ_API_KEY=gsk_...  # (pas de guillemets, pas d'espaces)
```

### Ça utilise toujours Gemini

**Solution** : Vérifiez que `AI_PROVIDER=groq` (pas gemini)

---

## 📋 COMMANDES COMPLÈTES

```bash
# 1. Aller dans le projet
cd ~/FREELANCE/Story2Book/hb_creator

# 2. Pull les derniers changements
git pull origin main

# 3. Créer .env.local depuis le template
cp .env.local.example .env.local

# 4. Éditer et ajouter votre clé
nano .env.local
# Changez: GROQ_API_KEY=gsk_VOTRE_VRAIE_CLE_ICI

# 5. Sauvegarder (Ctrl+O puis Ctrl+X dans nano)

# 6. Tester
npm run dev
```

---

**Une fois que c'est fait, revenez me voir et dites-moi si ça marche !** 🚀
