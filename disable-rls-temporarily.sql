-- Solution rapide : Désactiver RLS temporairement pour tester
-- Ce script désactive RLS sur toutes les tables pour permettre l'accès public

-- 1. Désactiver RLS sur toutes les tables principales
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier si d'autres tables existent et les désactiver aussi
DO $$
BEGIN
    -- Désactiver RLS sur orders si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Désactiver RLS sur order_items si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Désactiver RLS sur profiles si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3. Vérifier l'état des tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'orders', 'order_items', 'profiles');

-- 4. Tester l'accès aux données
SELECT 'Categories count:' as test, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Products count:' as test, COUNT(*) as count FROM public.products;

-- 5. Message de confirmation
SELECT 'RLS désactivé avec succès! Votre site devrait maintenant fonctionner.' as status;
