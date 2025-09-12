-- =============================================
-- CORRECTION DES POLITIQUES RLS POUR PROFILES
-- =============================================

-- Activer RLS sur la table profiles (si pas déjà fait)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;

-- Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Enable read access for own profile" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Enable insert access for own profile" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Enable update access for own profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================
-- CORRECTION DES POLITIQUES RLS POUR ADDRESSES
-- =============================================

-- Activer RLS sur la table addresses (si pas déjà fait)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;

-- Politique pour permettre aux utilisateurs de lire leurs propres adresses
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres adresses
CREATE POLICY "Users can insert own addresses" ON public.addresses
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres adresses
CREATE POLICY "Users can update own addresses" ON public.addresses
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres adresses
CREATE POLICY "Users can delete own addresses" ON public.addresses
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- CORRECTION DES POLITIQUES RLS POUR ORDERS
-- =============================================

-- Activer RLS sur la table orders (si pas déjà fait)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Politique pour permettre aux utilisateurs de lire leurs propres commandes
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres commandes
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres commandes (limitée)
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CORRECTION DES POLITIQUES RLS POUR ORDER_ITEMS
-- =============================================

-- Activer RLS sur la table order_items (si pas déjà fait)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

-- Politique pour permettre aux utilisateurs de lire leurs propres articles de commande
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Politique pour permettre aux utilisateurs de créer leurs propres articles de commande
CREATE POLICY "Users can insert own order items" ON public.order_items
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =============================================
-- POLITIQUES POUR LA LECTURE PUBLIQUE DES PRODUITS ET CATÉGORIES
-- =============================================

-- Activer RLS sur products mais permettre la lecture publique
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- Politique pour permettre à tous de lire les produits
CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT 
    USING (true);

-- Activer RLS sur categories mais permettre la lecture publique
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;

-- Politique pour permettre à tous de lire les catégories
CREATE POLICY "Enable read access for all users" ON public.categories
    FOR SELECT 
    USING (true);

-- =============================================
-- VÉRIFICATION DES POLITIQUES
-- =============================================

-- Afficher toutes les politiques créées pour vérification
-- (ces requêtes ne modifient rien, juste pour information)

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
