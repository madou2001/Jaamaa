-- Script temporaire pour désactiver RLS et permettre les tests
-- À utiliser UNIQUEMENT en développement !

-- Désactiver RLS sur products pour permettre l'insertion
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur categories 
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Note: En production, vous devriez utiliser le script fix-admin-rls-policies.sql
-- pour créer des politiques appropriées au lieu de désactiver RLS
