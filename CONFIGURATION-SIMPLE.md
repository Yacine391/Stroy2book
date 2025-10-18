# ⚡ Configuration SUPER SIMPLE (2 minutes !)

## 🎯 Aucun compte externe nécessaire !

Tout se configure direct depuis votre **dashboard Vercel**. Pas de Supabase, pas de compte à créer ailleurs !

## 📋 Étapes (2 clics seulement)

### Étape 1 : Créer la base de données sur Vercel (1 minute)

1. Allez sur **https://vercel.com/dashboard**
2. Sélectionnez votre projet **HB Creator**
3. Cliquez sur l'onglet **Storage** (en haut)
4. Cliquez sur **Create Database**
5. Choisissez **Postgres**
6. Donnez-lui un nom : `hb-creator-db`
7. Région : **Choisissez la plus proche** (ex: Frankfurt pour Europe)
8. Cliquez sur **Create**

✅ **C'est tout !** La base de données est créée et connectée automatiquement.

### Étape 2 : Push votre code

```bash
git push
```

Vercel va :
1. Détecter automatiquement la base de données
2. Créer les tables automatiquement (via le code)
3. Déployer l'application

✅ **Ça marche !**

## 🧪 Tester

1. Allez sur votre URL Vercel (ex: `hb-creator.vercel.app`)
2. Cliquez sur "Se connecter" → "Inscription"
3. Créez un compte
4. ✅ Si ça marche, votre compte est dans la base de données Vercel !

## 🆓 C'est gratuit ?

Oui ! Plan gratuit Vercel Postgres :
- ✅ 256 MB de base de données
- ✅ 60 heures de compute/mois
- ✅ Largement suffisant pour démarrer

## 📊 Voir vos données

Dans Vercel :
1. Allez dans **Storage** → Votre base de données
2. Cliquez sur **Data**
3. Vous pouvez voir vos utilisateurs, projets, etc.

Ou :
1. Cliquez sur **Query**
2. Exécutez :
   ```sql
   SELECT * FROM users;
   ```

## 🔧 En local (développement)

Si vous voulez tester en local, Vercel fournit les credentials automatiquement :

```bash
# Dans votre terminal
vercel env pull .env.local
```

Puis :
```bash
npm run dev
```

✅ Ça marche aussi en local !

## 🎉 C'est fini !

**Vraiment, c'est tout !** Pas de :
- ❌ Compte Supabase à créer
- ❌ Fichiers SQL à exécuter
- ❌ Variables d'environnement à copier-coller
- ❌ Configuration compliquée

Juste 2 clics dans Vercel et un `git push` ! 🚀

## 🆘 Problème ?

### La base de données n'apparaît pas

**Solution** : Attendez 30 secondes et rafraîchissez la page

### Erreur "relation users does not exist"

**Cause** : Les tables ne se sont pas créées automatiquement

**Solution** :
1. Allez dans Storage → votre base
2. Cliquez sur Query
3. Copiez-collez ce SQL et exécutez :

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  auth_method TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_ebooks INTEGER NOT NULL DEFAULT 3,
  used_ebooks INTEGER NOT NULL DEFAULT 0,
  ai_generations INTEGER NOT NULL DEFAULT 10,
  used_generations INTEGER NOT NULL DEFAULT 0,
  illustrations INTEGER NOT NULL DEFAULT 5,
  used_illustrations INTEGER NOT NULL DEFAULT 0,
  storage_gb INTEGER NOT NULL DEFAULT 1,
  used_storage_gb INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT,
  cover_data JSONB,
  layout_settings JSONB,
  illustrations_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Le build Vercel échoue

**Solution** : Vérifiez que vous avez bien créé la base de données dans Storage

## 🎊 Résultat

Votre application :
- ✅ Fonctionne sur Vercel
- ✅ Base de données gratuite incluse
- ✅ Aucun compte externe
- ✅ Configuration en 2 clics

**Temps total : 2 minutes ⏱️**

---

**C'est LA solution la plus simple possible ! 🎉**

Plus besoin de Supabase, tout est intégré dans Vercel !
