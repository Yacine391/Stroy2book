# 🔑 CRÉER VOTRE CLÉ API GROQ (2 MINUTES)

**100% Gratuit** - Pas de carte bancaire requise

---

## 📋 ÉTAPES RAPIDES

### Étape 1 : Aller sur Groq Console

👉 **Cliquez ici** : https://console.groq.com/

### Étape 2 : Créer un compte

Vous avez 2 options :

#### Option A : Avec Google (RAPIDE - 30 secondes)
1. Cliquez **"Sign in with Google"**
2. Sélectionnez votre compte Google
3. Autorisez Groq
4. ✅ **Vous êtes connecté !**

#### Option B : Avec Email
1. Cliquez **"Sign up"**
2. Entrez votre email
3. Choisissez un mot de passe
4. Cliquez **"Create account"**
5. Vérifiez votre email (cliquez sur le lien)
6. ✅ **Vous êtes connecté !**

### Étape 3 : Créer une clé API

Une fois connecté :

1. Vous êtes sur le **Dashboard**
2. À gauche, cliquez sur **"API Keys"**
3. Cliquez sur le bouton **"Create API Key"** (en haut à droite)
4. Une fenêtre s'ouvre :
   ```
   Name: HB Creator
   (laissez les autres options par défaut)
   ```
5. Cliquez **"Submit"** ou **"Create"**
6. **IMPORTANT** : La clé s'affiche (format : `gsk_...`)
7. Cliquez sur **"Copy"** pour copier la clé
8. ⚠️ **SAUVEGARDEZ-LA** (vous ne pourrez plus la voir après)

### Étape 4 : Sauvegarder votre clé

Collez votre clé dans un endroit sûr :
- Notepad
- Note sur téléphone
- Gestionnaire de mots de passe

**Format de la clé** : `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📸 GUIDE VISUEL

### 1. Page d'accueil Groq

```
┌─────────────────────────────────────────┐
│  Groq Cloud                             │
├─────────────────────────────────────────┤
│                                         │
│  The fastest inference for AI apps      │
│                                         │
│  [Sign in with Google]                  │
│  [Sign up with Email]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Dashboard après connexion

```
┌─────────────────────────────────────────┐
│  Menu (gauche)         Dashboard        │
├──────────┬──────────────────────────────┤
│ Home     │  Welcome to Groq!           │
│ API Keys │                             │
│ Docs     │  [Create API Key]           │
│ Billing  │                             │
│          │  Your API Keys:             │
│          │  (liste vide au début)      │
└──────────┴──────────────────────────────┘
```

### 3. Créer une clé

```
┌─────────────────────────────────────────┐
│  Create API Key                         │
├─────────────────────────────────────────┤
│                                         │
│  Name: [HB Creator              ]       │
│                                         │
│  Permissions: Full Access (default)     │
│                                         │
│  [Cancel]           [Create]            │
│                                         │
└─────────────────────────────────────────┘
```

### 4. Clé créée

```
┌─────────────────────────────────────────┐
│  API Key Created                        │
├─────────────────────────────────────────┤
│                                         │
│  gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx         │
│                                         │
│  [Copy]                                 │
│                                         │
│  ⚠️ Save this key now!                  │
│  You won't be able to see it again     │
│                                         │
│  [Done]                                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ VÉRIFICATION

Votre clé doit :
- ✅ Commencer par `gsk_`
- ✅ Faire environ 50-60 caractères
- ✅ Contenir des lettres et chiffres

**Exemple** (ne PAS utiliser celle-ci) :
```
gsk_1a2b3c4d5e6f7g8h9i0jklmnopqrstuvwxyz1234567890
```

---

## 🎯 APRÈS AVOIR CRÉÉ LA CLÉ

### Maintenant, configurez-la dans Vercel :

1. **Allez sur** : https://vercel.com/dashboard
2. Sélectionnez **hbcreator**
3. **Settings** → **Environment Variables**
4. **Ajoutez ces 3 variables** :

**Variable 1 : GROQ_API_KEY**
```
Name:  GROQ_API_KEY
Value: gsk_VOTRE_CLE_ICI (celle que vous venez de copier)

☑ Production
☑ Preview
☑ Development

[Save]
```

**Variable 2 : AI_PROVIDER**
```
Name:  AI_PROVIDER
Ancienne valeur: gemini
Nouvelle valeur: groq

☑ Production
☑ Preview
☑ Development

[Save]
```

**Variable 3 : GROQ_MODEL**
```
Name:  GROQ_MODEL
Value: llama-3.1-70b-versatile

☑ Production
☑ Preview
☑ Development

[Save]
```

5. **Redéployez** :
   - Deployments → ••• → Redeploy
   - Attendez 2 minutes

6. **Testez** votre site !

---

## 🆘 PROBLÈMES FRÉQUENTS

### Problème 1 : "Sign up" ne fonctionne pas

**Solution** : Utilisez "Sign in with Google" à la place

### Problème 2 : Email de vérification non reçu

**Solution** :
1. Vérifiez vos spams
2. Attendez 5 minutes
3. Cliquez sur "Resend email"

### Problème 3 : Bouton "Create API Key" grisé

**Solution** :
1. Rafraîchissez la page
2. Déconnectez-vous et reconnectez-vous
3. Videz le cache du navigateur

### Problème 4 : "Rate limit exceeded"

**Solution** :
- C'est normal au début
- Attendez 1 minute
- Réessayez

---

## 💡 ASTUCES

### Astuce 1 : Nommez bien votre clé

Bon nom : "HB Creator Production"  
Mauvais nom : "test" ou "key1"

### Astuce 2 : Créez plusieurs clés

- Une pour Production
- Une pour Development
- Une pour Test

Comme ça, si une clé est compromise, vous pouvez la révoquer sans tout casser.

### Astuce 3 : Sauvegardez dans Vercel rapidement

Ne perdez pas votre clé ! Ajoutez-la dans Vercel immédiatement après l'avoir créée.

---

## 📊 LIMITES DE L'API GRATUITE

**Quotas Groq gratuits** :
- 30 requêtes par minute
- 14,400 requêtes par jour
- Illimité dans le temps (pas d'expiration)

**Pour votre usage** (100 ebooks/mois) :
- ~5 requêtes par ebook (actions IA)
- = 500 requêtes/mois
- **LARGEMENT dans les limites !** ✅

---

## 🎉 C'EST FAIT !

Une fois la clé créée et configurée dans Vercel :

✅ **Votre application utilisera Groq**
✅ **Génération ultra-rapide** (0.5-1 seconde)
✅ **Plus d'erreur 503**
✅ **100% gratuit**
✅ **Qualité excellente**

---

## 🔗 LIENS UTILES

- **Console Groq** : https://console.groq.com/
- **Documentation** : https://console.groq.com/docs
- **Modèles disponibles** : https://console.groq.com/docs/models
- **Support** : https://console.groq.com/support

---

**Temps total** : 2 minutes  
**Coût** : 0€ (vraiment gratuit)  
**Difficulté** : ⭐ (très facile)

---

**COMMENCEZ ICI** : https://console.groq.com/ 🚀

**Après avoir créé la clé, revenez me voir et je vous aiderai à la configurer dans Vercel !**
