// Version SIMPLE avec localStorage - Marche sans configuration !

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar?: string;
  auth_method: 'email' | 'google';
  created_at: string;
}

export interface Subscription {
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
}

// Helper pour localStorage côté serveur
const isBrowser = typeof window !== 'undefined';

const storage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }
};

// Hash simple pour les mots de passe (côté client uniquement)
function simpleHash(password: string): string {
  // Note: En production, utilisez bcrypt côté serveur
  // Pour l'instant, on utilise btoa (base64) pour que ça fonctionne
  if (typeof window === 'undefined') return password; // Côté serveur, pas de hash
  return btoa(password); // Simple base64, pas secure mais ça marche
}

// Base de données en mémoire (localStorage)
export const userDb = {
  create: async (email: string, password: string, name: string): Promise<User> => {
    const users = JSON.parse(storage.getItem('hb-users') || '[]');
    
    // Vérifier si l'email existe déjà
    if (users.some((u: User) => u.email === email)) {
      throw new Error('Email déjà utilisé');
    }
    
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      password_hash: simpleHash(password),
      name,
      auth_method: 'email',
      created_at: new Date().toISOString()
    };
    
    users.push(user);
    storage.setItem('hb-users', JSON.stringify(users));
    
    // Créer l'abonnement gratuit
    const subscriptions = JSON.parse(storage.getItem('hb-subscriptions') || '{}');
    subscriptions[user.id] = {
      plan: 'free',
      monthly_ebooks: 3,
      used_ebooks: 0,
      ai_generations: 10,
      used_generations: 0,
      illustrations: 5,
      used_illustrations: 0,
      storage_gb: 1,
      used_storage_gb: 0
    };
    storage.setItem('hb-subscriptions', JSON.stringify(subscriptions));
    
    return user;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const users = JSON.parse(storage.getItem('hb-users') || '[]');
    return users.find((u: User) => u.email === email) || null;
  },

  findById: async (id: string | number): Promise<User | null> => {
    const idStr = String(id);
    const users = JSON.parse(storage.getItem('hb-users') || '[]');
    return users.find((u: User) => u.id === idStr) || null;
  },

  verifyPassword: (user: User, password: string): boolean => {
    return user.password_hash === simpleHash(password);
  },

  update: async (id: string | number, data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    const idStr = String(id);
    const users = JSON.parse(storage.getItem('hb-users') || '[]');
    const index = users.findIndex((u: User) => u.id === idStr);
    if (index >= 0) {
      users[index] = { ...users[index], ...data };
      storage.setItem('hb-users', JSON.stringify(users));
    }
  }
};

export const sessionDb = {
  create: async (userId: string | number, token: string) => {
    const userIdStr = String(userId);
    const sessions = JSON.parse(storage.getItem('hb-sessions') || '{}');
    sessions[token] = {
      userId: userIdStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    storage.setItem('hb-sessions', JSON.stringify(sessions));
    return { userId: userIdStr, token };
  },

  findByToken: async (token: string) => {
    const sessions = JSON.parse(storage.getItem('hb-sessions') || '{}');
    const session = sessions[token];
    if (!session) return null;
    
    if (new Date(session.expiresAt) < new Date()) {
      delete sessions[token];
      storage.setItem('hb-sessions', JSON.stringify(sessions));
      return null;
    }
    
    return session;
  },

  delete: async (token: string) => {
    const sessions = JSON.parse(storage.getItem('hb-sessions') || '{}');
    delete sessions[token];
    storage.setItem('hb-sessions', JSON.stringify(sessions));
  },

  deleteByUserId: async (userId: string | number) => {
    const userIdStr = String(userId);
    const sessions = JSON.parse(storage.getItem('hb-sessions') || '{}');
    Object.keys(sessions).forEach(token => {
      if (sessions[token].userId === userIdStr) {
        delete sessions[token];
      }
    });
    storage.setItem('hb-sessions', JSON.stringify(sessions));
  },

  cleanExpired: async () => {
    const sessions = JSON.parse(storage.getItem('hb-sessions') || '{}');
    const now = new Date();
    Object.keys(sessions).forEach(token => {
      if (new Date(sessions[token].expiresAt) < now) {
        delete sessions[token];
      }
    });
    storage.setItem('hb-sessions', JSON.stringify(sessions));
  }
};

export const subscriptionDb = {
  findByUserId: async (userId: string | number): Promise<Subscription | null> => {
    const userIdStr = String(userId);
    const subscriptions = JSON.parse(storage.getItem('hb-subscriptions') || '{}');
    return subscriptions[userIdStr] || null;
  },

  updatePlan: async (userId: string | number, plan: 'free' | 'premium' | 'pro') => {
    const userIdStr = String(userId);
    const subscriptions = JSON.parse(storage.getItem('hb-subscriptions') || '{}');
    const limits = {
      free: { monthlyEbooks: 3, aiGenerations: 10, illustrations: 5, storageGb: 1, maxPages: 20 },
      premium: { monthlyEbooks: 25, aiGenerations: 100, illustrations: 50, storageGb: 10, maxPages: 100 },
      pro: { monthlyEbooks: 100, aiGenerations: 500, illustrations: 200, storageGb: 50, maxPages: 200 }
    };
    
    const limit = limits[plan];
    subscriptions[userIdStr] = {
      ...subscriptions[userIdStr],
      plan,
      monthly_ebooks: limit.monthlyEbooks,
      ai_generations: limit.aiGenerations,
      illustrations: limit.illustrations,
      storage_gb: limit.storageGb,
      max_pages: limit.maxPages,
      expires_at: plan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
    storage.setItem('hb-subscriptions', JSON.stringify(subscriptions));
  },

  incrementUsage: async (userId: string | number, type: 'ebooks' | 'generations' | 'illustrations', amount: number = 1) => {
    const userIdStr = String(userId);
    const subscriptions = JSON.parse(storage.getItem('hb-subscriptions') || '{}');
    if (subscriptions[userIdStr]) {
      const field = type === 'ebooks' ? 'used_ebooks' : 
                    type === 'generations' ? 'used_generations' : 
                    'used_illustrations';
      subscriptions[userIdStr][field] = (subscriptions[userIdStr][field] || 0) + amount;
      storage.setItem('hb-subscriptions', JSON.stringify(subscriptions));
    }
  },

  resetMonthlyUsage: async (userId: string | number) => {
    const userIdStr = String(userId);
    const subscriptions = JSON.parse(storage.getItem('hb-subscriptions') || '{}');
    if (subscriptions[userIdStr]) {
      subscriptions[userIdStr].used_ebooks = 0;
      subscriptions[userIdStr].used_generations = 0;
      subscriptions[userIdStr].used_illustrations = 0;
      storage.setItem('hb-subscriptions', JSON.stringify(subscriptions));
    }
  }
};

export const projectDb = {
  create: async (userId: string | number, data: any) => {
    const userIdStr = String(userId);
    const projects = JSON.parse(storage.getItem('hb-projects') || '[]');
    const project = {
      id: `project_${Date.now()}`,
      user_id: userIdStr,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    projects.push(project);
    storage.setItem('hb-projects', JSON.stringify(projects));
    return project.id;
  },

  findByUserId: async (userId: string | number) => {
    const userIdStr = String(userId);
    const projects = JSON.parse(storage.getItem('hb-projects') || '[]');
    return projects.filter((p: any) => p.user_id === userIdStr)
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  findById: async (id: string | number, userId: string | number) => {
    const idStr = String(id);
    const userIdStr = String(userId);
    const projects = JSON.parse(storage.getItem('hb-projects') || '[]');
    return projects.find((p: any) => p.id === idStr && p.user_id === userIdStr) || null;
  },

  update: async (id: string | number, userId: string | number, data: any) => {
    const idStr = String(id);
    const userIdStr = String(userId);
    const projects = JSON.parse(storage.getItem('hb-projects') || '[]');
    const index = projects.findIndex((p: any) => p.id === idStr && p.user_id === userIdStr);
    if (index >= 0) {
      projects[index] = {
        ...projects[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      storage.setItem('hb-projects', JSON.stringify(projects));
    }
  },

  delete: async (id: string | number, userId: string | number) => {
    const idStr = String(id);
    const userIdStr = String(userId);
    const projects = JSON.parse(storage.getItem('hb-projects') || '[]');
    const filtered = projects.filter((p: any) => !(p.id === idStr && p.user_id === userIdStr));
    storage.setItem('hb-projects', JSON.stringify(filtered));
  }
};
