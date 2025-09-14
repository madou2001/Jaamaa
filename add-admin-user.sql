-- Script pour ajouter un utilisateur admin spécifique
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si l'utilisateur existe dans auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 2. Ajouter ou mettre à jour le profil utilisateur avec le rôle admin
INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '5d5604f2-9d26-4e7e-a202-0ee5d7d74638',
  'doumass124@gmail.com', -- Remplacez par l'email réel de cet utilisateur
  'Administrateur Jaayma',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- 3. Vérifier que l'utilisateur a bien le rôle admin
SELECT id, email, role, full_name, created_at
FROM public.user_profiles 
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 4. Alternative: Si vous voulez utiliser l'email de cet utilisateur spécifique
-- Remplacez 'admin@jaayma.com' par l'email réel de cet utilisateur dans le script ci-dessus

-- 5. Pour vérifier tous les admins
SELECT id, email, role, full_name, created_at
FROM public.user_profiles 
WHERE role = 'admin'
ORDER BY created_at;
