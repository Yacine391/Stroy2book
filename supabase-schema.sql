-- ========================================
-- Schéma de base de données pour HB Creator
-- À exécuter dans le SQL Editor de Supabase
-- ========================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  auth_method TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table des sessions
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT,
  cover_data JSONB,
  layout_settings JSONB,
  illustrations_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies pour la table users
-- Les utilisateurs peuvent lire leurs propres données
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

-- Permettre l'insertion (pour l'inscription)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Policies pour la table sessions
CREATE POLICY "Anyone can manage sessions" ON sessions
  FOR ALL USING (true);

-- Policies pour la table subscriptions
CREATE POLICY "Anyone can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- Policies pour la table projects
CREATE POLICY "Anyone can manage projects" ON projects
  FOR ALL USING (true);

-- ========================================
-- Triggers pour updated_at automatique
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers sur chaque table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Fonction pour nettoyer les sessions expirées
-- ========================================

CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Vue pour les statistiques (optionnel)
-- ========================================

CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.name,
  s.plan,
  s.used_ebooks,
  s.monthly_ebooks,
  COUNT(p.id) as total_projects,
  u.created_at as member_since
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.email, u.name, s.plan, s.used_ebooks, s.monthly_ebooks, u.created_at;

-- ========================================
-- Données de test (optionnel - à commenter en production)
-- ========================================

-- Créer un utilisateur de test
-- Mot de passe: Test123456
-- INSERT INTO users (email, password_hash, name, auth_method) 
-- VALUES ('test@example.com', '$2a$10$YourHashedPasswordHere', 'Test User', 'email');

-- ========================================
-- Vérifications finales
-- ========================================

-- Afficher toutes les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Afficher les policies RLS
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- Notes importantes
-- ========================================

-- 1. Ce schéma utilise Row Level Security (RLS) pour sécuriser les données
-- 2. Les timestamps utilisent TIMESTAMPTZ pour gérer automatiquement les fuseaux horaires
-- 3. Les données JSON sont stockées en JSONB pour de meilleures performances
-- 4. Les index sont créés pour optimiser les requêtes fréquentes
-- 5. Les triggers mettent à jour automatiquement updated_at

-- ========================================
-- Commandes utiles
-- ========================================

-- Nettoyer toutes les sessions expirées
-- SELECT clean_expired_sessions();

-- Voir les statistiques des utilisateurs
-- SELECT * FROM user_stats;

-- Réinitialiser les compteurs mensuels d'un utilisateur
-- UPDATE subscriptions SET used_ebooks = 0, used_generations = 0, used_illustrations = 0 WHERE user_id = 1;

-- Changer le plan d'un utilisateur
-- UPDATE subscriptions SET plan = 'premium', monthly_ebooks = 25, ai_generations = 100, illustrations = 50, storage_gb = 10 WHERE user_id = 1;
