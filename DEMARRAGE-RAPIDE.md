# ⚡ Démarrage rapide - Configuration Supabase

## 🎯 Ce qu'il faut faire maintenant

Votre application a été migrée vers Supabase. Pour qu'elle fonctionne, vous devez configurer Supabase (ça prend **10 minutes**).

## 📋 Checklist (à faire dans l'ordre)

### ✅ Étape 1 : Créer un compte Supabase (2 min)

1. Allez sur **https://supabase.com**
2. Cliquez sur "Start your project"  
3. Connectez-vous avec GitHub (recommandé) ou email

### ✅ Étape 2 : Créer un projet (2 min)

1. Cliquez sur "New Project"
2. Remplissez :
   - **Name** : `hb-creator`
   - **Database Password** : Générez un mot de passe fort (sauvegardez-le !)
   - **Region** : Europe (West) ou la région la plus proche
   - **Plan** : Free
3. Cliquez sur "Create new project"
4. ⏳ Attendez 1-2 minutes...

### ✅ Étape 3 : Récupérer les credentials (1 min)

1. Dans votre projet Supabase, allez dans **Settings** (⚙️)
2. Cliquez sur **API**
3. Copiez ces 2 valeurs :
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public key** (une longue chaîne commençant par `eyJ...`)

### ✅ Étape 4 : Créer les tables (2 min)

1. Dans Supabase, allez dans **SQL Editor** (icône </>)
2. Cliquez sur "New query"
3. Ouvrez le fichier **`supabase-schema.sql`** de votre projet
4. Copiez TOUT le contenu
5. Collez dans l'éditeur Supabase
6. Cliquez sur "Run" (ou Ctrl+Enter)
7. ✅ Vous devriez voir "Success. No rows returned"

### ✅ Étape 5 : Configurer en local (1 min)

Créez un fichier **`.env.local`** à la racine du projet :

```bash
# Copiez-collez vos vraies valeurs ici ⬇️
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...votre-longue-cle...

JWT_SECRET=changez-moi-par-un-secret-unique-et-long

# Clés API optionnelles
OPENAI_API_KEY=
GOOGLE_API_KEY=
```

### ✅ Étape 6 : Tester en local (1 min)

```bash
npm run dev
```

Puis :
1. Ouvrez http://localhost:3001
2. Allez à "Sécurité" ou cliquez "Se connecter"
3. Créez un compte (Inscription)
4. ✅ Si ça marche, votre compte est dans Supabase !

**Vérifiez dans Supabase** :
- Allez dans **Table Editor** → `users`
- Vous devriez voir votre utilisateur !

### ✅ Étape 7 : Déployer sur Vercel (1 min)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet HB Creator
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces 3 variables :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Collez votre URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Collez votre clé anon |
| `JWT_SECRET` | Un secret unique et long |

5. Sauvegardez
6. Push votre code → Vercel redéploie automatiquement
7. ✅ Testez sur votre URL Vercel !

## 🎉 C'est fini !

Votre application fonctionne maintenant en local ET sur Vercel !

## 🆘 Problèmes ?

### Erreur "Supabase not configured"
➡️ Vérifiez que `.env.local` existe et contient les bonnes valeurs

### Erreur "relation users does not exist"  
➡️ Vous n'avez pas exécuté `supabase-schema.sql` dans Supabase

### Le build Vercel échoue
➡️ Vérifiez que vous avez bien ajouté les variables d'environnement sur Vercel

### Impossible de créer un compte
➡️ Vérifiez les credentials dans `.env.local`
➡️ Regardez les logs dans la console du navigateur (F12)

## 📚 Documentation complète

- **`SUPABASE-SETUP.md`** - Guide détaillé avec captures d'écran
- **`MIGRATION-VERS-SUPABASE.md`** - Explication de la migration
- **`AUTHENTICATION-SETUP.md`** - Documentation technique

## 💡 Astuce

Une fois Supabase configuré, vous pouvez :
- Voir vos utilisateurs dans **Table Editor**
- Exécuter des requêtes SQL dans **SQL Editor**
- Voir les logs en temps réel dans **Database → Logs**
- Gérer les sauvegardes dans **Database → Backups**

---

**Temps total estimé : 10 minutes ⏱️**

Suivez ces étapes dans l'ordre et tout fonctionnera parfaitement ! 🚀
