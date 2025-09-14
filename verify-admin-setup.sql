-- Script pour vérifier la configuration admin
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
  AND column_name = 'role';

-- 2. Vérifier votre profil spécifiquement
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  full_name, 
  role,
  phone,
  created_at
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
  COUNT(*) as total_admins,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
FROM public.profiles;

-- 5. Vérifier les politiques RLS sur profiles
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Test de lecture directe
SELECT 
  'Test lecture directe' as test_type,
  id, 
  email, 
  role,
  CASE 
    WHEN role = 'admin' THEN 'ADMIN DÉTECTÉ'
    ELSE 'PAS ADMIN'
  END as status
FROM public.profiles 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 7. Vérifier si la colonne role a des contraintes
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
  AND conname LIKE '%role%';
