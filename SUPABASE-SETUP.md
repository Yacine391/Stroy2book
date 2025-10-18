# 🚀 Configuration Supabase pour HB Creator

## Vue d'ensemble

Votre application utilise maintenant **Supabase** (Postgres cloud) au lieu de SQLite. Cela permet un déploiement sur Vercel et une meilleure scalabilité.

## ✅ Avantages de Supabase

- ✅ **Gratuit** jusqu'à 500 MB + 50K utilisateurs
- ✅ **Compatible Vercel** (100%)
- ✅ **Postgres** (plus robuste que SQLite)
- ✅ **Dashboard admin** pour gérer les données
- ✅ **Backups automatiques**
- ✅ **API REST automatique**
- ✅ **Row Level Security** pour la sécurité

## 📝 Configuration (10 minutes)

### Étape 1 : Créer un compte Supabase

1. Allez sur **https://supabase.com**
2. Cliquez sur "Start your project"
3. Créez un compte (avec GitHub, c'est plus rapide)

### Étape 2 : Créer un nouveau projet

1. Cliquez sur "New Project"
2. Remplissez les informations :
   - **Name** : `hb-creator` (ou le nom que vous voulez)
   - **Database Password** : Générez un mot de passe fort (gardez-le précieusement !)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free (gratuit)
3. Cliquez sur "Create new project"
4. ⏳ Attendez 1-2 minutes que le projet soit créé

### Étape 3 : Récupérer les credentials

1. Une fois le projet créé, allez dans **Settings** (icône ⚙️ dans la barre latérale)
2. Cliquez sur **API** dans le menu de gauche
3. Vous verrez deux informations importantes :

   **Project URL** (exemple) :
   ```
   https://abcdefghijklmnop.supabase.co
   ```

   **anon public key** (exemple) :
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU1NTU1NSwiZXhwIjoxOTUyMTMxNTU1fQ...
   ```

4. **Copiez ces deux valeurs** (vous en aurez besoin à l'étape suivante)

### Étape 4 : Créer les tables dans Supabase

1. Dans Supabase, allez dans **SQL Editor** (icône </> dans la barre latérale)
2. Cliquez sur "New query"
3. Ouvrez le fichier `supabase-schema.sql` dans votre projet
4. **Copiez tout le contenu** du fichier
5. **Collez-le** dans l'éditeur SQL de Supabase
6. Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)
7. ✅ Vous devriez voir "Success. No rows returned"

Les tables sont maintenant créées ! Vous pouvez les voir dans **Table Editor**.

### Étape 5 : Configurer les variables d'environnement

#### En local (développement)

1. Créez un fichier `.env.local` à la racine de votre projet :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-tres-longue

# JWT Secret
JWT_SECRET=votre-secret-unique-et-securise

# Autres clés API (si nécessaire)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
```

2. **Remplacez** les valeurs par celles que vous avez copiées à l'étape 3

#### Sur Vercel (production)

1. Allez sur votre dashboard Vercel
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces 3 variables :

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | https://votre-projet.supabase.co |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | votre-cle-anon-tres-longue |
   | `JWT_SECRET` | votre-secret-unique-et-securise |

5. Cliquez sur "Save"
6. **Redéployez** votre application

### Étape 6 : Tester l'authentification

1. Démarrez votre serveur local :
   ```bash
   npm run dev
   ```

2. Ouvrez http://localhost:3001

3. Créez un compte :
   - Cliquez sur "Se connecter"
   - Choisissez "Inscription"
   - Remplissez le formulaire
   - Cliquez sur "Créer un compte"

4. ✅ Si tout fonctionne, vous devriez être connecté !

5. Vérifiez dans Supabase :
   - Allez dans **Table Editor**
   - Cliquez sur la table `users`
   - Vous devriez voir votre nouvel utilisateur !

## 🎯 Vérification du bon fonctionnement

### Vérifier les tables créées

Dans Supabase, allez dans **Table Editor**. Vous devriez voir :
- ✅ `users` (utilisateurs)
- ✅ `sessions` (sessions de connexion)
- ✅ `subscriptions` (abonnements)
- ✅ `projects` (projets/ebooks)

### Vérifier les données

Après avoir créé un compte :
1. Table `users` : Vous devriez voir votre utilisateur
2. Table `subscriptions` : Un abonnement gratuit créé automatiquement
3. Après avoir créé un ebook : Table `projects` devrait avoir une entrée

## 🔒 Sécurité

### Row Level Security (RLS)

Le schéma SQL active automatiquement RLS sur toutes les tables. Cela signifie que :
- ✅ Les utilisateurs ne peuvent accéder qu'à leurs propres données
- ✅ Les requêtes sont sécurisées au niveau de la base de données
- ✅ Même si quelqu'un obtient votre clé API, il ne peut pas voir toutes les données

### Bonnes pratiques

1. **Ne commitez jamais** le fichier `.env.local` dans Git
2. **Utilisez des secrets forts** pour JWT_SECRET
3. **Activez 2FA** sur votre compte Supabase
4. **Configurez des sauvegardes** dans Supabase (Settings → Backups)

## 📊 Dashboard Supabase

### Voir vos utilisateurs

1. Allez dans **Table Editor** → `users`
2. Vous pouvez voir, modifier, supprimer les utilisateurs

### Voir les statistiques

1. Allez dans **SQL Editor**
2. Exécutez cette requête :
   ```sql
   SELECT * FROM user_stats;
   ```
3. Vous verrez les statistiques de tous les utilisateurs

### Nettoyer les sessions expirées

1. Allez dans **SQL Editor**
2. Exécutez :
   ```sql
   SELECT clean_expired_sessions();
   ```

### Changer le plan d'un utilisateur

1. Allez dans **Table Editor** → `subscriptions`
2. Trouvez l'utilisateur
3. Modifiez le champ `plan` (free, premium, ou pro)
4. Les limites seront mises à jour automatiquement via l'API

## 🐛 Dépannage

### Erreur "Supabase not configured"

**Cause** : Les variables d'environnement ne sont pas définies

**Solution** :
1. Vérifiez que `.env.local` existe et contient les bonnes valeurs
2. Redémarrez le serveur (`npm run dev`)
3. Vérifiez qu'il n'y a pas de faute de frappe dans les noms des variables

### Erreur lors de la création d'utilisateur

**Cause possible 1** : Email déjà utilisé
- Solution : Utilisez un autre email

**Cause possible 2** : Problème de connexion à Supabase
- Solution : Vérifiez que les credentials sont corrects

### Les tables n'existent pas

**Cause** : Le schéma SQL n'a pas été exécuté

**Solution** :
1. Allez dans SQL Editor de Supabase
2. Ré-exécutez le contenu de `supabase-schema.sql`
3. Vérifiez qu'il n'y a pas d'erreur

### Erreur "JWT malformed" ou similaire

**Cause** : Problème avec JWT_SECRET

**Solution** :
1. Générez un nouveau secret fort (minimum 32 caractères)
2. Mettez-le à jour dans `.env.local` et Vercel
3. Redémarrez le serveur

## 📈 Passer en production

### Checklist avant le déploiement

- [ ] Tables créées dans Supabase ✅
- [ ] Variables d'environnement configurées sur Vercel ✅
- [ ] Test d'inscription/connexion en local ✅
- [ ] Test d'inscription/connexion sur Vercel ✅
- [ ] RLS activé sur toutes les tables ✅
- [ ] Backups configurés dans Supabase ✅
- [ ] JWT_SECRET fort et unique ✅

### Monitoring

Supabase offre un monitoring intégré :
1. Allez dans **Database** → **Logs**
2. Vous pouvez voir toutes les requêtes SQL
3. Utile pour déboguer les problèmes

### Quotas gratuits

Le plan gratuit de Supabase inclut :
- ✅ 500 MB de base de données
- ✅ 50K utilisateurs actifs/mois
- ✅ 5 GB de bande passante
- ✅ 1 GB de stockage fichiers

C'est largement suffisant pour commencer !

## 🎓 Ressources

- **Documentation Supabase** : https://supabase.com/docs
- **Dashboard Supabase** : https://app.supabase.com
- **SQL Editor** : Pour exécuter des requêtes personnalisées
- **Table Editor** : Pour voir et modifier les données
- **Logs** : Pour déboguer

## ✨ Fonctionnalités avancées (optionnel)

### Authentification intégrée de Supabase

Supabase a sa propre authentification intégrée. Si vous voulez l'utiliser à la place :
- Google OAuth
- GitHub OAuth
- Email Magic Link
- Et bien d'autres...

### Storage pour les fichiers

Supabase Storage permet de stocker des fichiers (images, PDFs, etc.) :
- Idéal pour stocker les couvertures d'ebooks
- Les fichiers générés
- Les images d'illustration

### Realtime

Supabase peut envoyer des mises à jour en temps réel :
- Notifications instantanées
- Collaboration en temps réel
- Synchronisation multi-appareils

---

**Vous êtes prêt ! 🎉**

Une fois Supabase configuré, votre application fonctionnera à la fois en local et sur Vercel.

Si vous rencontrez un problème, consultez les logs dans :
- Terminal local : `npm run dev`
- Supabase Dashboard : Database → Logs
- Vercel Dashboard : Deployments → (cliquez sur un déploiement) → Runtime Logs
