-- Script pour corriger la table user_profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si la table existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
) as table_exists;

-- 2. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vérifier la structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Désactiver temporairement RLS pour tester
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 5. Insérer votre profil admin
INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '5d5604f2-9d26-4e7e-a202-0ee5d7d74638',
  'doumass124@gmail.com',
  'Administrateur Jaayma',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = 'doumass124@gmail.com',
  updated_at = NOW();

-- 6. Vérifier l'insertion
SELECT * FROM public.user_profiles WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 7. Réactiver RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Créer les politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Test final
SELECT 
  'Test final' as status,
  id, 
  email, 
  role, 
  full_name
FROM public.user_profiles 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';
