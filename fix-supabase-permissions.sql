-- Script pour corriger les permissions Supabase et résoudre l'erreur 401
-- Ce script configure RLS et les politiques pour permettre l'accès public aux données

-- 1. Vérifier l'état actuel des tables existantes
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'orders', 'order_items', 'profiles');

-- 2. Activer RLS sur les tables principales (seulement celles qui existent)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques pour permettre la lecture publique des catégories
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT USING (true);

-- 4. Créer des politiques pour permettre la lecture publique des produits
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- 5. Vérifier si la table orders existe et la configurer
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow authenticated users to read their own orders" ON public.orders
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Vérifier si la table order_items existe et la configurer
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow authenticated users to read their own order items" ON public.order_items
            FOR SELECT USING (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id));
    END IF;
END $$;

-- 7. Vérifier si la table profiles existe et la configurer
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access to profiles" ON public.profiles
            FOR SELECT USING (true);
        CREATE POLICY "Allow users to update their own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Allow users to insert their own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 8. Vérifier que les politiques ont été créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('categories', 'products', 'orders', 'order_items', 'profiles');

-- 9. Tester l'accès aux données
SELECT 'Categories count:' as test, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Products count:' as test, COUNT(*) as count FROM public.products;

-- 10. Vérifier les permissions sur les tables
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products')
AND grantee = 'anon';

-- 11. Accorder des permissions explicites
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;

-- 12. Vérifier que tout fonctionne
SELECT 'Configuration terminée avec succès!' as status;