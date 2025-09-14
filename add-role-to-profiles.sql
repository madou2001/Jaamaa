-- Script pour ajouter la colonne 'role' à la table 'profiles' existante
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle de la table profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne 'role' à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user'));

-- 3. Ajouter la colonne 'full_name' si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 4. Mettre à jour la colonne full_name avec first_name + last_name
UPDATE public.profiles 
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL OR full_name = '';

-- 5. Mettre à jour votre profil pour être admin
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'Medoune GUEYE'
WHERE id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638';

-- 6. Vérifier la mise à jour
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

-- 7. Vérifier la nouvelle structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
