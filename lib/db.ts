import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// Types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  avatar?: string;
  auth_method: 'email' | 'google';
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan: 'free' | 'premium' | 'pro';
  monthly_ebooks: number;
  used_ebooks: number;
  ai_generations: number;
  used_generations: number;
  illustrations: number;
  used_illustrations: number;
  storage_gb: number;
  used_storage_gb: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Initialiser les tables (sera exécuté automatiquement)
export async function initDatabase() {
  try {
    // Table des utilisateurs
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        auth_method TEXT NOT NULL DEFAULT 'email',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Index
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    // Table des sessions
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;

    // Table des abonnements
    await sql`
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
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;

    // Table des projets
    await sql`
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
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`;

    console.log('✅ Base de données initialisée avec succès');
  } catch (error: any) {
    // Ignorer les erreurs "already exists"
    if (!error.message?.includes('already exists')) {
      console.error('Erreur initialisation DB:', error);
    }
  }
}

// Fonctions pour les utilisateurs
export const userDb = {
  // Créer un utilisateur
  create: async (email: string, password: string, name: string, authMethod: 'email' | 'google' = 'email'): Promise<User> => {
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const result = await sql`
      INSERT INTO users (email, password_hash, name, auth_method)
      VALUES (${email}, ${passwordHash}, ${name}, ${authMethod})
      RETURNING *
    `;
    
    const user = result.rows[0] as User;
    
    // Créer l'abonnement gratuit par défaut
    await sql`
      INSERT INTO subscriptions (user_id)
      VALUES (${user.id})
    `;
    
    return user;
  },

  // Trouver un utilisateur par email
  findByEmail: async (email: string): Promise<User | null> => {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] as User || null;
  },

  // Trouver un utilisateur par ID
  findById: async (id: number): Promise<User | null> => {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result.rows[0] as User || null;
  },

  // Vérifier le mot de passe
  verifyPassword: (user: User, password: string): boolean => {
    return bcrypt.compareSync(password, user.password_hash);
  },

  // Mettre à jour un utilisateur
  update: async (id: number, data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.avatar) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(data.avatar);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = NOW()');
    values.push(id);

    await sql.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }
};

// Fonctions pour les sessions
export const sessionDb = {
  // Créer une session
  create: async (userId: number, token: string, expiresAt: Date): Promise<Session> => {
    const result = await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
      RETURNING *
    `;
    return result.rows[0] as Session;
  },

  // Trouver une session par token
  findByToken: async (token: string): Promise<Session | null> => {
    const result = await sql`
      SELECT * FROM sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `;
    return result.rows[0] as Session || null;
  },

  // Supprimer une session
  delete: async (token: string) => {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  },

  // Nettoyer les sessions expirées
  cleanExpired: async () => {
    await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
  },

  // Supprimer toutes les sessions d'un utilisateur
  deleteByUserId: async (userId: number) => {
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
  }
};

// Fonctions pour les abonnements
export const subscriptionDb = {
  // Récupérer l'abonnement d'un utilisateur
  findByUserId: async (userId: number): Promise<Subscription | null> => {
    const result = await sql`
      SELECT * FROM subscriptions WHERE user_id = ${userId}
    `;
    return result.rows[0] as Subscription || null;
  },

  // Mettre à jour le plan d'abonnement
  updatePlan: async (userId: number, plan: 'free' | 'premium' | 'pro') => {
    let limits = { monthlyEbooks: 3, aiGenerations: 10, illustrations: 5, storageGb: 1 };
    
    if (plan === 'premium') {
      limits = { monthlyEbooks: 25, aiGenerations: 100, illustrations: 50, storageGb: 10 };
    } else if (plan === 'pro') {
      limits = { monthlyEbooks: 100, aiGenerations: 500, illustrations: 200, storageGb: 50 };
    }
    
    const expiresAt = plan !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    await sql`
      UPDATE subscriptions 
      SET plan = ${plan},
          monthly_ebooks = ${limits.monthlyEbooks},
          ai_generations = ${limits.aiGenerations},
          illustrations = ${limits.illustrations},
          storage_gb = ${limits.storageGb},
          expires_at = ${expiresAt},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  },

  // Incrémenter l'utilisation
  incrementUsage: async (userId: number, type: 'ebooks' | 'generations' | 'illustrations', amount: number = 1) => {
    const field = type === 'ebooks' ? 'used_ebooks' : 
                  type === 'generations' ? 'used_generations' : 
                  'used_illustrations';
    
    await sql.query(
      `UPDATE subscriptions 
       SET ${field} = ${field} + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [amount, userId]
    );
  },

  // Réinitialiser les compteurs mensuels
  resetMonthlyUsage: async (userId: number) => {
    await sql`
      UPDATE subscriptions 
      SET used_ebooks = 0,
          used_generations = 0,
          used_illustrations = 0,
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  }
};

// Fonctions pour les projets
export const projectDb = {
  // Créer un projet
  create: async (userId: number, data: {
    title: string;
    author?: string;
    content?: string;
    coverData?: any;
    layoutSettings?: any;
    illustrationsData?: any;
  }) => {
    const result = await sql`
      INSERT INTO projects (
        user_id, title, author, content,
        cover_data, layout_settings, illustrations_data
      )
      VALUES (
        ${userId},
        ${data.title},
        ${data.author || null},
        ${data.content || null},
        ${data.coverData ? JSON.stringify(data.coverData) : null},
        ${data.layoutSettings ? JSON.stringify(data.layoutSettings) : null},
        ${data.illustrationsData ? JSON.stringify(data.illustrationsData) : null}
      )
      RETURNING id
    `;
    return result.rows[0].id;
  },

  // Récupérer tous les projets d'un utilisateur
  findByUserId: async (userId: number) => {
    const result = await sql`
      SELECT * FROM projects 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return result.rows;
  },

  // Récupérer un projet par ID
  findById: async (id: number, userId: number) => {
    const result = await sql`
      SELECT * FROM projects 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return result.rows[0] || null;
  },

  // Mettre à jour un projet
  update: async (id: number, userId: number, data: any) => {
    await sql`
      UPDATE projects 
      SET title = ${data.title},
          author = ${data.author || null},
          content = ${data.content || null},
          cover_data = ${data.coverData ? JSON.stringify(data.coverData) : null},
          layout_settings = ${data.layoutSettings ? JSON.stringify(data.layoutSettings) : null},
          illustrations_data = ${data.illustrationsData ? JSON.stringify(data.illustrationsData) : null},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
  },

  // Supprimer un projet
  delete: async (id: number, userId: number) => {
    await sql`
      DELETE FROM projects 
      WHERE id = ${id} AND user_id = ${userId}
    `;
  }
};

// Initialiser la base de données au démarrage (seulement en production/Vercel)
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  initDatabase().catch(console.error);
}

export default sql;
