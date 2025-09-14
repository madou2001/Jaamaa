-- Script pour synchroniser les utilisateurs manquants de auth.users vers profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les utilisateurs dans auth.users
SELECT 
  'Utilisateurs dans auth.users' as source,
  COUNT(*) as count
FROM auth.users;

-- 2. Vérifier les utilisateurs dans profiles
SELECT 
  'Utilisateurs dans profiles' as source,
  COUNT(*) as count
FROM public.profiles;

-- 3. Identifier les utilisateurs manquants
SELECT 
  u.id,
  u.email,
  u.created_at,
  'Manquant dans profiles' as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Synchroniser les utilisateurs manquants
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
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. Vérifier le résultat final
SELECT 
  'Après synchronisation' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ Synchronisation réussie'
    ELSE '❌ Problème de synchronisation'
  END as result;

-- 6. Afficher tous les utilisateurs avec leurs rôles
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
ORDER BY created_at DESC;
