import { createClient } from '@supabase/supabase-js';
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

// Créer le client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Créer le client seulement si les variables sont définies
let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase credentials not found. Auth will not work. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Helper pour vérifier si Supabase est configuré
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// Fonctions pour les utilisateurs
export const userDb = {
  // Créer un utilisateur
  create: async (email: string, password: string, name: string, authMethod: 'email' | 'google' = 'email'): Promise<User> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        auth_method: authMethod
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating user: ${error.message}`);
    
    // Créer l'abonnement gratuit par défaut
    await supabase
      .from('subscriptions')
      .insert({
        user_id: data.id
      });
    
    return data;
  },

  // Trouver un utilisateur par email
  findByEmail: async (email: string): Promise<User | null> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  },

  // Trouver un utilisateur par ID
  findById: async (id: number): Promise<User | null> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Vérifier le mot de passe
  verifyPassword: (user: User, password: string): boolean => {
    return bcrypt.compareSync(password, user.password_hash);
  },

  // Mettre à jour un utilisateur
  update: async (id: number, data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (data.name) updateData.name = data.name;
    if (data.avatar) updateData.avatar = data.avatar;
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(`Error updating user: ${error.message}`);
  }
};

// Fonctions pour les sessions
export const sessionDb = {
  // Créer une session
  create: async (userId: number, token: string, expiresAt: Date): Promise<Session> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating session: ${error.message}`);
    return data;
  },

  // Trouver une session par token
  findByToken: async (token: string): Promise<Session | null> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  },

  // Supprimer une session
  delete: async (token: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    await supabase
      .from('sessions')
      .delete()
      .eq('token', token);
  },

  // Nettoyer les sessions expirées
  cleanExpired: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  },

  // Supprimer toutes les sessions d'un utilisateur
  deleteByUserId: async (userId: number) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId);
  }
};

// Fonctions pour les abonnements
export const subscriptionDb = {
  // Récupérer l'abonnement d'un utilisateur
  findByUserId: async (userId: number): Promise<Subscription | null> => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  },

  // Mettre à jour le plan d'abonnement
  updatePlan: async (userId: number, plan: 'free' | 'premium' | 'pro') => {
    if (!supabase) throw new Error('Supabase not configured');
    
    let limits = { monthlyEbooks: 3, aiGenerations: 10, illustrations: 5, storageGb: 1 };
    
    if (plan === 'premium') {
      limits = { monthlyEbooks: 25, aiGenerations: 100, illustrations: 50, storageGb: 10 };
    } else if (plan === 'pro') {
      limits = { monthlyEbooks: 100, aiGenerations: 500, illustrations: 200, storageGb: 50 };
    }
    
    const expiresAt = plan !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan,
        monthly_ebooks: limits.monthlyEbooks,
        ai_generations: limits.aiGenerations,
        illustrations: limits.illustrations,
        storage_gb: limits.storageGb,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw new Error(`Error updating plan: ${error.message}`);
  },

  // Incrémenter l'utilisation
  incrementUsage: async (userId: number, type: 'ebooks' | 'generations' | 'illustrations', amount: number = 1) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const field = type === 'ebooks' ? 'used_ebooks' : 
                  type === 'generations' ? 'used_generations' : 
                  'used_illustrations';
    
    // Récupérer la valeur actuelle
    const { data: current } = await supabase
      .from('subscriptions')
      .select(field)
      .eq('user_id', userId)
      .single();
    
    if (current) {
      const newValue = (current[field] || 0) + amount;
      await supabase
        .from('subscriptions')
        .update({
          [field]: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  },

  // Réinitialiser les compteurs mensuels
  resetMonthlyUsage: async (userId: number) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    await supabase
      .from('subscriptions')
      .update({
        used_ebooks: 0,
        used_generations: 0,
        used_illustrations: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
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
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: data.title,
        author: data.author || null,
        content: data.content || null,
        cover_data: data.coverData ? JSON.stringify(data.coverData) : null,
        layout_settings: data.layoutSettings ? JSON.stringify(data.layoutSettings) : null,
        illustrations_data: data.illustrationsData ? JSON.stringify(data.illustrationsData) : null
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating project: ${error.message}`);
    return project.id;
  },

  // Récupérer tous les projets d'un utilisateur
  findByUserId: async (userId: number) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return [];
    return data;
  },

  // Récupérer un projet par ID
  findById: async (id: number, userId: number) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  },

  // Mettre à jour un projet
  update: async (id: number, userId: number, data: any) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('projects')
      .update({
        title: data.title,
        author: data.author || null,
        content: data.content || null,
        cover_data: data.coverData ? JSON.stringify(data.coverData) : null,
        layout_settings: data.layoutSettings ? JSON.stringify(data.layoutSettings) : null,
        illustrations_data: data.illustrationsData ? JSON.stringify(data.illustrationsData) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Error updating project: ${error.message}`);
  },

  // Supprimer un projet
  delete: async (id: number, userId: number) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
  }
};

export default supabase;
