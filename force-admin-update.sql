-- Script pour forcer la mise à jour du rôle admin
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier l'utilisateur actuel
SELECT 
  id, 
  email, 
  created_at
FROM auth.users 
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email

-- 2. Supprimer l'ancien profil s'il existe
DELETE FROM public.user_profiles 
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email

-- 3. Insérer le nouveau profil avec le rôle admin
INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email

-- 4. Vérifier que l'insertion a fonctionné
SELECT 
  id, 
  email, 
  role, 
  full_name, 
  created_at,
  updated_at
FROM public.user_profiles 
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email

-- 5. Alternative: Mise à jour directe si l'utilisateur existe déjà
UPDATE public.user_profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email

-- 6. Vérification finale
SELECT 
  'Vérification finale' as status,
  id, 
  email, 
  role, 
  full_name
FROM public.user_profiles 
WHERE email = 'doumass124@gmail.com';  -- Remplacez par votre email
