-- =============================================
-- 🖼️ MISE À JOUR DES IMAGES POUR LES PRODUITS
-- Date: 2025-01-12
-- Description: Script pour ajouter des URLs d'images aux produits existants
-- =============================================

-- Mise à jour des images pour les produits électroniques
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'APPL-MBA-M3-256';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'APPL-APP2';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'SAMS-GW6C-47';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'BOSE-QC45';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'APPL-IPA-M2-64';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'SONY-WH1000XM5';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'CANON-R6M2-BODY';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'PHIL-TAH4205';

-- Mise à jour des images pour les produits mode
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'LEVI-501-ORIG';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583743814966-8936f37f0e0e?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'ZARA-TS-BASIC';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'ZARA-ROBE-MIDI';

-- Mise à jour des images pour les produits sport
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'ADID-UB22';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583743814966-8936f37f0e0e?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'NIKE-DF-ADV';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'ADID-3S-SHORT';

-- Mise à jour des images pour les produits maison
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'DYSON-V15-DET';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'KITC-ART-5KSM125';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'IKEA-MALM-160';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'IKEA-EAMES-STYLE';

-- Mise à jour des images pour les produits beauté
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'LOREAL-TM-FT';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'LOREAL-CR-RL';

-- Mise à jour des images pour les produits existants (iPhone, Nike, Samsung)
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'APPL-IPH15P-128';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'NIKE-AM270';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&crop=center',
    images = ARRAY[
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=center'
    ]
WHERE sku = 'SAMS-GS24U';

-- =============================================
-- MESSAGE DE COMPLETION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🖼️ Images ajoutées avec succès à tous les produits!';
    RAISE NOTICE '📱 Images électroniques: MacBook, AirPods, Galaxy Watch, Bose, iPad, Sony, Canon, Philips';
    RAISE NOTICE '👕 Images mode: Levi''s, Zara T-shirt, Zara robe';
    RAISE NOTICE '🏃 Images sport: Adidas Ultraboost, Nike Dri-FIT, Adidas short';
    RAISE NOTICE '🏠 Images maison: Dyson, KitchenAid, IKEA table, IKEA chaise';
    RAISE NOTICE '💄 Images beauté: L''Oréal fond de teint, L''Oréal rouge à lèvres';
    RAISE NOTICE '✨ Toutes les images sont optimisées (800x600) et proviennent d''Unsplash';
    RAISE NOTICE '🎯 Les produits sont maintenant prêts avec leurs images!';
END $$;
