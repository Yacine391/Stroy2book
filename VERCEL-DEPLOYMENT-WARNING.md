# ⚠️ ATTENTION : Problème de déploiement Vercel

## 🚨 Problème identifié

Le système d'authentification utilise **SQLite** (`better-sqlite3`) qui est un **module natif** et **NE FONCTIONNE PAS sur Vercel** en mode serverless.

### Pourquoi ?
- Vercel utilise des fonctions serverless (AWS Lambda)
- `better-sqlite3` nécessite une compilation native (bindings C++)
- Les fonctions serverless ne peuvent pas exécuter de code natif

### Erreur attendue sur Vercel
```
Module not found: Can't resolve 'better-sqlite3'
```

## ✅ Solutions possibles

### Option 1 : Utiliser Vercel Postgres (RECOMMANDÉ)

**Avantages** : Intégration native Vercel, rapide, scalable

```bash
# Installer Vercel Postgres
npm install @vercel/postgres

# Ajouter une base de données dans le dashboard Vercel
# https://vercel.com/dashboard -> Storage -> Create Database
```

**Code à modifier** :
```typescript
// lib/db.ts - Remplacer SQLite par Postgres
import { sql } from '@vercel/postgres';

// CREATE TABLE users...
await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    ...
  )
`;
```

### Option 2 : Utiliser Supabase (GRATUIT)

**Avantages** : Gratuit, Postgres, authentification incluse

```bash
npm install @supabase/supabase-js

# Créer un compte sur https://supabase.com
# Récupérer les credentials
```

### Option 3 : Utiliser PlanetScale (MySQL)

**Avantages** : Gratuit, rapide, bonne intégration Vercel

```bash
npm install @planetscale/database
```

### Option 4 : Utiliser Prisma + Base cloud

**Avantages** : ORM moderne, type-safe

```bash
npm install prisma @prisma/client
npx prisma init
```

### Option 5 : Déployer sur un VPS (non serverless)

**Si vous voulez garder SQLite** :
- Railway.app
- Render.com
- DigitalOcean App Platform
- Un VPS classique (Hetzner, OVH, etc.)

## 🚀 Solution rapide pour tester (développement uniquement)

### Utiliser une base de données en mémoire pour le développement

Créez `lib/db-dev.ts` :
```typescript
// Version développement avec SQLite
import Database from 'better-sqlite3';
// ... votre code actuel
```

Créez `lib/db-vercel.ts` :
```typescript
// Version Vercel avec Postgres
import { sql } from '@vercel/postgres';
// ... adapter pour Postgres
```

Dans `lib/db.ts` :
```typescript
export * from process.env.VERCEL 
  ? './db-vercel' 
  : './db-dev';
```

## 📝 Ma recommandation

Pour un projet en production avec Vercel, je recommande **Supabase** car :

✅ **Gratuit** jusqu'à 500 MB
✅ **Postgres** (plus robuste que SQLite)
✅ **Authentification intégrée** (vous pouvez même simplifier le code)
✅ **API REST et Realtime**
✅ **Dashboard d'administration**
✅ **Backups automatiques**

### Migration vers Supabase (30 minutes)

1. **Créer un compte Supabase** : https://supabase.com
2. **Créer un projet** et récupérer l'URL et la clé
3. **Installer le client** :
   ```bash
   npm install @supabase/supabase-js
   ```
4. **Remplacer lib/db.ts** par :
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   
   export { supabase };
   ```
5. **Créer les tables dans Supabase** (via SQL Editor)
6. **Adapter les API routes** pour utiliser `supabase` au lieu de `db`

## 🔧 Action immédiate

Pour l'instant, **le déploiement sur Vercel va échouer**. Vous devez choisir une des options ci-dessus.

### Désactiver temporairement l'authentification pour Vercel

Si vous voulez déployer rapidement sans auth :

1. Créez `lib/feature-flags.ts` :
```typescript
export const ENABLE_AUTH = process.env.ENABLE_AUTH === 'true';
```

2. Dans les API routes, ajoutez :
```typescript
if (!ENABLE_AUTH) {
  return NextResponse.json({ error: 'Auth disabled' }, { status: 503 });
}
```

3. Sur Vercel, ne définissez pas `ENABLE_AUTH` pour désactiver l'auth temporairement

## 📞 Besoin d'aide ?

Si vous voulez que je vous aide à migrer vers une solution compatible Vercel :
1. **Supabase** (le plus simple) - dites-moi et je modifie le code
2. **Vercel Postgres** (native) - je peux adapter aussi
3. **Autre solution** - décrivez vos besoins

## 🎯 Pour continuer le développement local

Le code actuel fonctionne parfaitement en local avec :
```bash
npm run dev
```

Mais pour le déployer sur Vercel, il faut choisir une des solutions ci-dessus.

---

**Résumé** : SQLite ne fonctionne pas sur Vercel. Il faut utiliser une base de données cloud (Supabase, Vercel Postgres, PlanetScale) ou déployer sur un serveur non-serverless.
