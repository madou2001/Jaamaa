-- Script de débogage pour vérifier l'accès admin
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si l'utilisateur existe dans auth.users
SELECT 
  id, 
  email, 
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'doumass124@gmail.com'  -- Remplacez par votre email
ORDER BY created_at DESC;

-- 2. Vérifier le profil dans user_profiles
SELECT 
  id, 
  email, 
  role, 
  full_name, 
  created_at,
  updated_at
FROM public.user_profiles 
WHERE email = 'doumass124@gmail.com'  -- Remplacez par votre email
ORDER BY created_at DESC;

-- 3. Vérifier tous les admins
SELECT 
  id, 
  email, 
  role, 
  full_name, 
  created_at
FROM public.user_profiles 
WHERE role = 'admin'
ORDER BY created_at;

-- 4. Vérifier si la table user_profiles existe et sa structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. Tester la fonction is_admin avec votre ID
-- Remplacez 'VOTRE_UUID_ICI' par votre vrai UUID
SELECT public.is_admin('VOTRE_UUID_ICI'::UUID) as is_admin_result;

-- 7. Vérifier les logs d'erreur récents (si disponibles)
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 10;
