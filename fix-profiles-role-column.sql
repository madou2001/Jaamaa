-- Script pour corriger la colonne role dans la table profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne role si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user'));

-- 3. Ajouter la colonne full_name si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 4. Ajouter la colonne updated_at si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Mettre à jour les données existantes
UPDATE public.profiles 
SET 
  full_name = CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND first_name != 'EMPTY' AND last_name != 'EMPTY'
    THEN CONCAT(first_name, ' ', last_name)
    ELSE email
  END,
  role = CASE 
    WHEN email = 'admin@jaayma.com' THEN 'admin'
    WHEN email = 'madoune.gueye@gmail.com' THEN 'admin'
    WHEN email = 'doumass124@gmail.com' THEN 'admin'
    WHEN id = '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' THEN 'admin'
    ELSE 'user'
  END,
  updated_at = NOW()
WHERE role IS NULL OR full_name IS NULL;

-- 6. Vérifier la nouvelle structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Vérifier les données mises à jour
SELECT 
  id,
  email,
  first_name,
  last_name,
  full_name,
  role,
  phone,
  created_at,
  updated_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 8. Compter les utilisateurs par rôle
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles 
GROUP BY role
ORDER BY count DESC;
