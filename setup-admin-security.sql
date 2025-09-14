-- Script de sécurité pour l'admin
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table des profils utilisateurs avec rôles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour que les utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 4. Politique pour que les admins voient tous les profils
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. Politique pour que les admins puissent modifier tous les profils
CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@jaayma.com' THEN 'admin'
      WHEN NEW.email = 'madoune.gueye@gmail.com' THEN 'admin'
      WHEN NEW.id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger pour créer automatiquement un profil à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM public.user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Mettre à jour les utilisateurs existants (si il y en a)
INSERT INTO public.user_profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
   CASE 
     WHEN email = 'admin@jaayma.com' THEN 'admin'
     WHEN email = 'madoune.gueye@gmail.com' THEN 'admin'
     WHEN id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
     ELSE 'user'
   END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 12. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 13. Commentaires pour la documentation
COMMENT ON TABLE public.user_profiles IS 'Profils utilisateurs avec système de rôles';
COMMENT ON COLUMN public.user_profiles.role IS 'Rôle utilisateur: admin, moderator, user';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Récupère le rôle d''un utilisateur';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Vérifie si un utilisateur est admin';
