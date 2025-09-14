-- Script pour configurer la gestion des utilisateurs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle de la table profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si nécessaire
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- 5. Créer le nouveau trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Vérifier que tous les utilisateurs ont un rôle
UPDATE public.profiles 
SET role = 'user'
WHERE role IS NULL;

-- 7. Vérifier la contrainte de rôle
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'moderator', 'user'));

-- 8. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 9. Vérifier les données finales
SELECT 
  'Vérification finale' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
  COUNT(CASE WHEN role IS NULL THEN 1 END) as no_role
FROM public.profiles;

-- 10. Afficher tous les utilisateurs avec leurs rôles
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM public.profiles 
ORDER BY created_at DESC;
