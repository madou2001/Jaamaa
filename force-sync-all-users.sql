-- Script de synchronisation forcée - À exécuter dans Supabase SQL Editor
-- Ce script va tout corriger et synchroniser

-- 1. Supprimer et recréer la table profiles avec la bonne structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Créer les index
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- 5. Synchroniser TOUS les utilisateurs de auth.users
INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, phone, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    CASE 
      WHEN u.raw_user_meta_data->>'first_name' IS NOT NULL 
           AND u.raw_user_meta_data->>'last_name' IS NOT NULL
           AND u.raw_user_meta_data->>'first_name' != 'EMPTY'
           AND u.raw_user_meta_data->>'last_name' != 'EMPTY'
      THEN CONCAT(
        COALESCE(u.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(u.raw_user_meta_data->>'last_name', '')
      )
      ELSE u.email
    END
  ),
  CASE 
    WHEN u.email = 'admin@jaayma.com' THEN 'admin'
    WHEN u.email = 'madoune.gueye@gmail.com' THEN 'admin'
    WHEN u.email = 'doumass124@gmail.com' THEN 'admin'
    WHEN u.id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
    ELSE 'user'
  END,
  u.raw_user_meta_data->>'phone',
  u.created_at,
  NOW()
FROM auth.users u;

-- 6. Créer un trigger pour synchroniser automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.sync_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
             AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
             AND NEW.raw_user_meta_data->>'first_name' != 'EMPTY'
             AND NEW.raw_user_meta_data->>'last_name' != 'EMPTY'
        THEN CONCAT(
          COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          ' ',
          COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        )
        ELSE NEW.email
      END
    ),
    CASE 
      WHEN NEW.email = 'admin@jaayma.com' THEN 'admin'
      WHEN NEW.email = 'madoune.gueye@gmail.com' THEN 'admin'
      WHEN NEW.email = 'doumass124@gmail.com' THEN 'admin'
      WHEN NEW.id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
      ELSE 'user'
    END,
    NEW.raw_user_meta_data->>'phone',
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer le trigger
DROP TRIGGER IF EXISTS sync_user_on_signup ON auth.users;
CREATE TRIGGER sync_user_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_new_user();

-- 8. Vérification finale
SELECT 
  'SYNCHRONISATION TERMINÉE' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') as users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ SUCCÈS - Tous les utilisateurs synchronisés'
    ELSE '❌ ÉCHEC - Problème de synchronisation'
  END as result;

-- 9. Afficher tous les utilisateurs
SELECT 
  'UTILISATEURS FINAUX' as info,
  id,
  email,
  first_name,
  last_name,
  full_name,
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC;
