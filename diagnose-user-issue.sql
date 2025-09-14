-- Script de diagnostic complet pour le problème des utilisateurs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure de la table profiles
SELECT 
  'Structure de la table profiles' as info,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Compter les utilisateurs dans auth.users
SELECT 
  'Utilisateurs dans auth.users' as source,
  COUNT(*) as count
FROM auth.users;

-- 3. Compter les utilisateurs dans profiles
SELECT 
  'Utilisateurs dans profiles' as source,
  COUNT(*) as count
FROM public.profiles;

-- 4. Voir tous les utilisateurs dans auth.users
SELECT 
  'Utilisateurs auth.users' as source,
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 5. Voir tous les utilisateurs dans profiles
SELECT 
  'Utilisateurs profiles' as source,
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

-- 6. Identifier les utilisateurs manquants
SELECT 
  'Utilisateurs manquants' as status,
  u.id,
  u.email,
  u.created_at,
  'Dans auth.users mais pas dans profiles' as problem
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 7. Vérifier les contraintes de la table profiles
SELECT 
  'Contraintes de la table profiles' as info,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 8. Vérifier les politiques RLS
SELECT 
  'Politiques RLS' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 9. Test d'insertion simple
INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, created_at, updated_at)
VALUES (
  'test-user-123',
  'test@example.com',
  'Test',
  'User',
  'Test User',
  'user',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 10. Vérifier l'insertion
SELECT 
  'Test d\'insertion' as status,
  id,
  email,
  role
FROM public.profiles 
WHERE id = 'test-user-123';

-- 11. Nettoyer le test
DELETE FROM public.profiles WHERE id = 'test-user-123';

-- 12. Résumé final
SELECT 
  'RÉSUMÉ FINAL' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_users_count,
  (SELECT COUNT(*) FROM public.profiles WHERE role IS NOT NULL) as profiles_with_role,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ Synchronisation OK'
    ELSE '❌ Synchronisation manquante'
  END as sync_status;
