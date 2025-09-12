-- Script pour corriger les politiques RLS et permettre l'administration des produits

-- D'abord, désactiver temporairement RLS sur products pour ajouter les politiques
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

-- Réactiver RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Créer les nouvelles politiques

-- 1. Lecture publique pour tous les produits actifs
CREATE POLICY "Public can view active products" 
    ON public.products 
    FOR SELECT 
    USING (status = 'active');

-- 2. Les utilisateurs authentifiés peuvent voir tous les produits (pour l'admin)
CREATE POLICY "Authenticated users can view all products" 
    ON public.products 
    FOR SELECT 
    TO authenticated
    USING (true);

-- 3. Les utilisateurs authentifiés peuvent insérer des produits (admin)
CREATE POLICY "Authenticated users can insert products" 
    ON public.products 
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 4. Les utilisateurs authentifiés peuvent mettre à jour des produits (admin)
CREATE POLICY "Authenticated users can update products" 
    ON public.products 
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Les utilisateurs authentifiés peuvent supprimer des produits (admin)
CREATE POLICY "Authenticated users can delete products" 
    ON public.products 
    FOR DELETE 
    TO authenticated
    USING (true);

-- Même chose pour les catégories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Supprimer l'ancienne politique categories si elle existe
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

-- Lecture publique pour les catégories
CREATE POLICY "Public can view categories" 
    ON public.categories 
    FOR SELECT 
    USING (true);

-- Gestion complète pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can manage categories" 
    ON public.categories 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Vérifier que les politiques sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;
