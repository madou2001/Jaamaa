-- =============================================
-- 🖼️ MISE À JOUR DES IMAGES POUR LES CATÉGORIES
-- Date: 2025-01-12
-- Description: Script pour ajouter des images aux catégories existantes
-- =============================================

-- Mise à jour des images pour les catégories principales
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'electronique';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'mode-vetements';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'sport-loisirs';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'maison-decoration';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'beaute-sante';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'auto-moto';

-- Mise à jour des images pour les sous-catégories
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'smartphones';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'ordinateurs';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'chaussures';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'vetements-sport';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'casques-ecouteurs';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'electromenager';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'mobilier';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'jeans-denim';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'maquillage';

UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop&crop=center'
WHERE slug = 'accessoires-tech';

-- =============================================
-- MESSAGE DE COMPLETION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🖼️ Images ajoutées avec succès à toutes les catégories!';
    RAISE NOTICE '📱 Électronique: Image high-tech moderne';
    RAISE NOTICE '👕 Mode: Image boutique élégante';
    RAISE NOTICE '🏃 Sport: Image équipements sportifs';
    RAISE NOTICE '🏠 Maison: Image intérieur design';
    RAISE NOTICE '💄 Beauté: Image cosmétiques premium';
    RAISE NOTICE '🚗 Auto: Image véhicules';
    RAISE NOTICE '✨ Toutes les images sont optimisées (400x300) et proviennent d''Unsplash';
    RAISE NOTICE '🎯 Les catégories sont maintenant prêtes avec leurs images!';
END $$;
