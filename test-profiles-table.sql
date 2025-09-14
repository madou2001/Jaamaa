-- Script de test pour vérifier la table profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure de la table profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les données de votre profil
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  full_name, 
  role,
  phone
FROM public.profiles 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 3. Vérifier tous les profils avec leur rôle
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 4. Compter les admins
SELECT 
  COUNT(*) as total_admins
FROM public.profiles 
WHERE role = 'admin';

-- 5. Vérifier les politiques RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Test de lecture avec l'utilisateur actuel
SELECT 
  'Test de lecture' as test_type,
  id, 
  email, 
  role
FROM public.profiles 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';
