-- Script pour synchroniser tous les utilisateurs de auth.users vers profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier combien d'utilisateurs il y a dans auth.users
SELECT 
  'Utilisateurs dans auth.users' as table_name,
  COUNT(*) as count
FROM auth.users;

-- 2. Vérifier combien d'utilisateurs il y a dans profiles
SELECT 
  'Utilisateurs dans profiles' as table_name,
  COUNT(*) as count
FROM public.profiles;

-- 3. Voir les utilisateurs qui sont dans auth.users mais pas dans profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  'Manquant dans profiles' as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Synchroniser tous les utilisateurs manquants
INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    CONCAT(
      COALESCE(u.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(u.raw_user_meta_data->>'last_name', '')
    ),
    u.email
  ),
  CASE 
    WHEN u.email = 'admin@jaayma.com' THEN 'admin'
    WHEN u.email = 'madoune.gueye@gmail.com' THEN 'admin'
    WHEN u.email = 'doumass124@gmail.com' THEN 'admin'
    WHEN u.id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
    ELSE 'user'
  END,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. Vérifier le résultat après synchronisation
SELECT 
  'Après synchronisation' as status,
  COUNT(*) as total_profiles
FROM public.profiles;

-- 6. Afficher tous les utilisateurs avec leurs rôles
SELECT 
  id,
  email,
  first_name,
  last_name,
  full_name,
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 7. Créer un trigger pour synchroniser automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.sync_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      NEW.email
    ),
    CASE 
      WHEN NEW.email = 'admin@jaayma.com' THEN 'admin'
      WHEN NEW.email = 'madoune.gueye@gmail.com' THEN 'admin'
      WHEN NEW.email = 'doumass124@gmail.com' THEN 'admin'
      WHEN NEW.id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
      ELSE 'user'
    END,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS sync_user_on_signup ON auth.users;

-- 9. Créer le nouveau trigger
CREATE TRIGGER sync_user_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_new_user();

-- 10. Vérification finale
SELECT 
  'Synchronisation terminée' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ Synchronisation réussie'
    ELSE '❌ Problème de synchronisation'
  END as result;
