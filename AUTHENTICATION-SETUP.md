# 🔐 Système d'authentification et base de données

## Vue d'ensemble

Le système HB Creator dispose maintenant d'un système complet d'authentification et de gestion des utilisateurs avec :

- ✅ Base de données SQLite pour stocker les données utilisateur
- ✅ Authentification sécurisée avec hashage des mots de passe (bcrypt)
- ✅ Sessions persistantes avec cookies HTTP-only
- ✅ Tokens JWT pour l'authentification
- ✅ Gestion des abonnements (gratuit, premium, pro)
- ✅ Sauvegarde des projets utilisateur

## Architecture

### Base de données

Le système utilise SQLite avec les tables suivantes :

1. **users** - Informations utilisateur
   - id, email, password_hash, name, avatar, auth_method
   - created_at, updated_at

2. **sessions** - Sessions actives
   - id, user_id, token, expires_at, created_at

3. **subscriptions** - Abonnements et quotas
   - id, user_id, plan, limites mensuelles, utilisation
   - expires_at, created_at, updated_at

4. **projects** - Projets/ebooks créés
   - id, user_id, title, author, content, données (cover, layout, illustrations)
   - created_at, updated_at

### Fichiers créés/modifiés

#### Nouveaux fichiers
- `lib/db.ts` - Gestion de la base de données SQLite
- `lib/auth.ts` - Utilitaires d'authentification JWT et cookies
- `app/api/auth/register/route.ts` - API d'inscription
- `app/api/auth/login/route.ts` - API de connexion
- `app/api/auth/logout/route.ts` - API de déconnexion
- `app/api/auth/me/route.ts` - API pour récupérer l'utilisateur connecté
- `app/api/subscription/upgrade/route.ts` - API pour changer de plan
- `app/api/projects/route.ts` - API CRUD pour les projets
- `app/api/projects/[id]/route.ts` - API pour un projet spécifique
- `.env.example` - Exemple de configuration

#### Fichiers modifiés
- `components/security-auth.tsx` - Utilise maintenant les vraies API
- `components/hb-creator-workflow.tsx` - Charge l'utilisateur depuis l'API
- `.gitignore` - Ignore la base de données et fichiers sensibles

## Installation et configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# JWT Secret (IMPORTANT: changez cette valeur en production !)
JWT_SECRET=votre-secret-super-securise-changez-moi-en-production

# OpenAI API Key (si utilisé)
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API Key (si utilisé)
GOOGLE_API_KEY=your-google-api-key-here

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Installation des dépendances

Les dépendances suivantes ont été ajoutées :

```bash
npm install better-sqlite3 bcryptjs jose cookie
npm install --save-dev @types/better-sqlite3 @types/bcryptjs
```

### 3. Démarrage

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

La base de données `hb-creator.db` sera créée automatiquement au premier démarrage.

## Utilisation

### Inscription

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123",
  "name": "Jean Dupont"
}
```

### Connexion

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

### Récupérer l'utilisateur connecté

```typescript
GET /api/auth/me
```

### Déconnexion

```typescript
POST /api/auth/logout
```

### Changer de plan d'abonnement

```typescript
POST /api/subscription/upgrade
Content-Type: application/json

{
  "plan": "premium" // ou "free" ou "pro"
}
```

### Créer un projet

```typescript
POST /api/projects
Content-Type: application/json

{
  "title": "Mon ebook",
  "author": "Jean Dupont",
  "content": "...",
  "coverData": {...},
  "layoutSettings": {...},
  "illustrationsData": {...}
}
```

## Sécurité

### Mesures de sécurité implémentées

1. **Hashage des mots de passe** - bcrypt avec salt factor de 10
2. **Cookies HTTP-only** - Protection contre XSS
3. **Cookies SameSite=Lax** - Protection contre CSRF
4. **Cookies Secure en production** - HTTPS uniquement
5. **JWT avec expiration** - Tokens valides 30 jours
6. **Validation des données** - Vérification des entrées utilisateur
7. **Pas de mots de passe en logs** - Les hashes ne sont jamais renvoyés au client

### Recommandations pour la production

1. **Changez le JWT_SECRET** - Utilisez une valeur aléatoire et complexe
2. **HTTPS obligatoire** - Configurez SSL/TLS
3. **Rate limiting** - Ajoutez des limites de requêtes
4. **Backup de la base de données** - Sauvegardez régulièrement `hb-creator.db`
5. **Monitoring** - Surveillez les tentatives de connexion suspectes
6. **Rotation des secrets** - Changez périodiquement le JWT_SECRET

## Plans d'abonnement

### Gratuit (free)
- 3 ebooks par mois
- 10 générations IA par mois
- 5 illustrations par mois
- 1 GB de stockage

### Premium (9.99€/mois)
- 25 ebooks par mois
- 100 générations IA par mois
- 50 illustrations par mois
- 10 GB de stockage

### Professionnel (19.99€/mois)
- 100 ebooks par mois
- 500 générations IA par mois
- 200 illustrations par mois
- 50 GB de stockage

## Structure de la base de données

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  auth_method TEXT NOT NULL DEFAULT 'email',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Subscriptions
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_ebooks INTEGER NOT NULL DEFAULT 3,
  used_ebooks INTEGER NOT NULL DEFAULT 0,
  ai_generations INTEGER NOT NULL DEFAULT 10,
  used_generations INTEGER NOT NULL DEFAULT 0,
  illustrations INTEGER NOT NULL DEFAULT 5,
  used_illustrations INTEGER NOT NULL DEFAULT 0,
  storage_gb INTEGER NOT NULL DEFAULT 1,
  used_storage_gb INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Projects
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT,
  cover_data TEXT,
  layout_settings TEXT,
  illustrations_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Migration depuis l'ancien système

L'ancien système utilisait `localStorage` pour stocker les données. Le nouveau système :

1. Les utilisateurs existants devront se reconnecter
2. Les données localStorage ne sont plus utilisées
3. Tous les nouveaux comptes seront stockés dans la base de données
4. Le mode invité est toujours disponible (données non persistées)

## Support et maintenance

### Tâches de maintenance

1. **Nettoyage des sessions expirées**
   ```typescript
   import { sessionDb } from '@/lib/db';
   sessionDb.cleanExpired();
   ```

2. **Réinitialisation des quotas mensuels**
   ```typescript
   import { subscriptionDb } from '@/lib/db';
   subscriptionDb.resetMonthlyUsage(userId);
   ```

3. **Backup de la base de données**
   ```bash
   cp hb-creator.db hb-creator.db.backup-$(date +%Y%m%d)
   ```

## Troubleshooting

### La base de données ne se crée pas
- Vérifiez les permissions d'écriture dans le dossier du projet
- Vérifiez que `better-sqlite3` est bien installé

### Erreur "Non authentifié"
- Vérifiez que les cookies sont activés
- Vérifiez que le JWT_SECRET est bien défini
- Effacez les cookies du navigateur

### Les utilisateurs ne peuvent pas se connecter
- Vérifiez les logs serveur pour plus de détails
- Testez avec un nouvel utilisateur (problème de migration?)
- Vérifiez que la base de données n'est pas corrompue

---

**Fait avec ❤️ pour HB Creator**
