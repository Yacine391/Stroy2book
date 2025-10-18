import Database from 'better-sqlite3';
import { join } from 'path';
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

// Créer ou récupérer l'instance de la base de données
const dbPath = join(process.cwd(), 'hb-creator.db');
const db = new Database(dbPath);

// Initialiser les tables
export function initDatabase() {
  // Table des utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      auth_method TEXT NOT NULL DEFAULT 'email',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Table des sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Index pour améliorer les performances
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Table des abonnements
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
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
    )
  `);

  // Table des projets (pour stocker les ebooks créés)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
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
    )
  `);

  console.log('✅ Base de données initialisée avec succès');
}

// Fonctions pour les utilisateurs
export const userDb = {
  // Créer un utilisateur
  create: (email: string, password: string, name: string, authMethod: 'email' | 'google' = 'email'): User => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, auth_method)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(email, passwordHash, name, authMethod);
    
    // Créer l'abonnement gratuit par défaut
    const subStmt = db.prepare(`
      INSERT INTO subscriptions (user_id)
      VALUES (?)
    `);
    subStmt.run(result.lastInsertRowid);
    
    return userDb.findById(result.lastInsertRowid as number)!;
  },

  // Trouver un utilisateur par email
  findByEmail: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  // Trouver un utilisateur par ID
  findById: (id: number): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  // Vérifier le mot de passe
  verifyPassword: (user: User, password: string): boolean => {
    return bcrypt.compareSync(password, user.password_hash);
  },

  // Mettre à jour un utilisateur
  update: (id: number, data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    const fields = [];
    const values = [];
    
    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.avatar) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = datetime("now")');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users SET ${fields.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);
  }
};

// Fonctions pour les sessions
export const sessionDb = {
  // Créer une session
  create: (userId: number, token: string, expiresAt: Date): Session => {
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, token, expiresAt.toISOString());
    return sessionDb.findByToken(token)!;
  },

  // Trouver une session par token
  findByToken: (token: string): Session | undefined => {
    const stmt = db.prepare(`
      SELECT * FROM sessions 
      WHERE token = ? AND datetime(expires_at) > datetime('now')
    `);
    return stmt.get(token) as Session | undefined;
  },

  // Supprimer une session
  delete: (token: string) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(token);
  },

  // Nettoyer les sessions expirées
  cleanExpired: () => {
    const stmt = db.prepare(`
      DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')
    `);
    stmt.run();
  },

  // Supprimer toutes les sessions d'un utilisateur
  deleteByUserId: (userId: number) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
    stmt.run(userId);
  }
};

// Fonctions pour les abonnements
export const subscriptionDb = {
  // Récupérer l'abonnement d'un utilisateur
  findByUserId: (userId: number): Subscription | undefined => {
    const stmt = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?');
    return stmt.get(userId) as Subscription | undefined;
  },

  // Mettre à jour le plan d'abonnement
  updatePlan: (userId: number, plan: 'free' | 'premium' | 'pro') => {
    let limits = { monthlyEbooks: 3, aiGenerations: 10, illustrations: 5, storageGb: 1 };
    
    if (plan === 'premium') {
      limits = { monthlyEbooks: 25, aiGenerations: 100, illustrations: 50, storageGb: 10 };
    } else if (plan === 'pro') {
      limits = { monthlyEbooks: 100, aiGenerations: 500, illustrations: 200, storageGb: 50 };
    }
    
    const expiresAt = plan !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const stmt = db.prepare(`
      UPDATE subscriptions 
      SET plan = ?, 
          monthly_ebooks = ?,
          ai_generations = ?,
          illustrations = ?,
          storage_gb = ?,
          expires_at = ?,
          updated_at = datetime('now')
      WHERE user_id = ?
    `);
    stmt.run(plan, limits.monthlyEbooks, limits.aiGenerations, limits.illustrations, limits.storageGb, expiresAt, userId);
  },

  // Incrémenter l'utilisation
  incrementUsage: (userId: number, type: 'ebooks' | 'generations' | 'illustrations', amount: number = 1) => {
    const field = type === 'ebooks' ? 'used_ebooks' : 
                  type === 'generations' ? 'used_generations' : 
                  'used_illustrations';
    
    const stmt = db.prepare(`
      UPDATE subscriptions 
      SET ${field} = ${field} + ?,
          updated_at = datetime('now')
      WHERE user_id = ?
    `);
    stmt.run(amount, userId);
  },

  // Réinitialiser les compteurs mensuels
  resetMonthlyUsage: (userId: number) => {
    const stmt = db.prepare(`
      UPDATE subscriptions 
      SET used_ebooks = 0,
          used_generations = 0,
          used_illustrations = 0,
          updated_at = datetime('now')
      WHERE user_id = ?
    `);
    stmt.run(userId);
  }
};

// Fonctions pour les projets
export const projectDb = {
  // Créer un projet
  create: (userId: number, data: {
    title: string;
    author?: string;
    content?: string;
    coverData?: any;
    layoutSettings?: any;
    illustrationsData?: any;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO projects (user_id, title, author, content, cover_data, layout_settings, illustrations_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId,
      data.title,
      data.author || null,
      data.content || null,
      data.coverData ? JSON.stringify(data.coverData) : null,
      data.layoutSettings ? JSON.stringify(data.layoutSettings) : null,
      data.illustrationsData ? JSON.stringify(data.illustrationsData) : null
    );
    return result.lastInsertRowid;
  },

  // Récupérer tous les projets d'un utilisateur
  findByUserId: (userId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `);
    return stmt.all(userId);
  },

  // Récupérer un projet par ID
  findById: (id: number, userId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE id = ? AND user_id = ?
    `);
    return stmt.get(id, userId);
  },

  // Mettre à jour un projet
  update: (id: number, userId: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE projects 
      SET title = ?,
          author = ?,
          content = ?,
          cover_data = ?,
          layout_settings = ?,
          illustrations_data = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(
      data.title,
      data.author || null,
      data.content || null,
      data.coverData ? JSON.stringify(data.coverData) : null,
      data.layoutSettings ? JSON.stringify(data.layoutSettings) : null,
      data.illustrationsData ? JSON.stringify(data.illustrationsData) : null,
      id,
      userId
    );
  },

  // Supprimer un projet
  delete: (id: number, userId: number) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }
};

// Initialiser la base de données au démarrage
initDatabase();

export default db;
