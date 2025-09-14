-- =============================================
-- 🛍️ AJOUT DE 20 NOUVEAUX PRODUITS - JAAYMA E-COMMERCE
-- Date: 2025-01-12
-- Description: Script pour ajouter 20 produits variés dans différentes catégories
-- =============================================

-- Ajouter de nouvelles marques si nécessaire
INSERT INTO public.brands (name, slug, description, is_featured) VALUES
('Dyson', 'dyson', 'Technologie innovante pour la maison', true),
('Bose', 'bose', 'Audio professionnel et grand public', true),
('KitchenAid', 'kitchenaid', 'Électroménager de cuisine premium', false),
('Levi''s', 'levis', 'Denim et vêtements casual', true),
('Zara', 'zara', 'Mode accessible et tendance', false),
('IKEA', 'ikea', 'Mobilier et décoration design', false),
('L''Oréal', 'loreal', 'Beauté et cosmétiques', false),
('Philips', 'philips', 'Électronique grand public', false)
ON CONFLICT (slug) DO NOTHING;

-- Ajouter de nouvelles sous-catégories si nécessaire
INSERT INTO public.categories (name, slug, description, parent_id, sort_order) VALUES
('Casques & Écouteurs', 'casques-ecouteurs', 'Audio personnel et professionnel', (SELECT id FROM public.categories WHERE slug = 'electronique'), 3),
('Électroménager', 'electromenager', 'Appareils électroménagers', (SELECT id FROM public.categories WHERE slug = 'maison-decoration'), 1),
('Mobilier', 'mobilier', 'Tables, chaises, étagères', (SELECT id FROM public.categories WHERE slug = 'maison-decoration'), 2),
('Jeans & Denim', 'jeans-denim', 'Pantalons et shorts en denim', (SELECT id FROM public.categories WHERE slug = 'mode-vetements'), 1),
('Maquillage', 'maquillage', 'Cosmétiques et produits de beauté', (SELECT id FROM public.categories WHERE slug = 'beaute-sante'), 1),
('Accessoires Tech', 'accessoires-tech', 'Câbles, chargeurs, étuis', (SELECT id FROM public.categories WHERE slug = 'electronique'), 4)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUITS ÉLECTRONIQUES
-- =============================================

-- 1. MacBook Air M3 13"
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'MacBook Air M3 13" 256GB', 
    'macbook-air-m3-13-256gb',
    'Ultraportable avec puce M3 ultra-performante',
    'Le MacBook Air M3 allie performance et portabilité. Avec sa puce M3, il offre des performances exceptionnelles pour tous vos projets créatifs et professionnels. Écran Liquid Retina 13,6", jusqu''à 18h d''autonomie.',
    1299.00, 1399.00, 'APPL-MBA-M3-256',
    (SELECT id FROM public.categories WHERE slug = 'ordinateurs'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    25, true,
    ARRAY['macbook', 'apple', 'laptop', 'm3', 'ultraportable'],
    1.24, 30.41, 21.5, 1.13
);

-- 2. AirPods Pro 2ème génération
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'AirPods Pro 2ème génération', 
    'airpods-pro-2nd-gen',
    'Écouteurs sans fil avec réduction de bruit active',
    'Les AirPods Pro de 2ème génération offrent une expérience audio exceptionnelle avec la réduction de bruit active, l''audio spatial et jusqu''à 6h d''écoute avec le boîtier.',
    279.00, 299.00, 'APPL-APP2',
    (SELECT id FROM public.categories WHERE slug = 'casques-ecouteurs'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    50, true,
    ARRAY['airpods', 'apple', 'bluetooth', 'reduction-bruit', 'wireless'],
    0.056
);

-- 3. Samsung Galaxy Watch 6 Classic
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Samsung Galaxy Watch 6 Classic 47mm', 
    'samsung-galaxy-watch-6-classic-47mm',
    'Montre connectée premium avec écran rotatif',
    'La Galaxy Watch 6 Classic combine style et fonctionnalités avancées. Écran AMOLED 1,5", suivi santé complet, résistance à l''eau, jusqu''à 40h d''autonomie.',
    399.00, 449.00, 'SAMS-GW6C-47',
    (SELECT id FROM public.categories WHERE slug = 'accessoires-tech'),
    (SELECT id FROM public.brands WHERE slug = 'samsung'),
    30, false,
    ARRAY['montre', 'samsung', 'connectee', 'sante', 'fitness'],
    0.059
);

-- 4. Casque Bose QuietComfort 45
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Bose QuietComfort 45', 
    'bose-quietcomfort-45',
    'Casque avec réduction de bruit leader du marché',
    'Le QuietComfort 45 de Bose offre la meilleure réduction de bruit du marché. Son confort légendaire et sa qualité audio exceptionnelle en font le compagnon idéal pour vos voyages et votre quotidien.',
    329.00, 379.00, 'BOSE-QC45',
    (SELECT id FROM public.categories WHERE slug = 'casques-ecouteurs'),
    (SELECT id FROM public.brands WHERE slug = 'bose'),
    40, true,
    ARRAY['casque', 'bose', 'reduction-bruit', 'bluetooth', 'premium'],
    0.238
);

-- =============================================
-- PRODUITS MODE & VÊTEMENTS
-- =============================================

-- 5. Jeans Levi's 501 Original
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Levi''s 501 Original Jeans Homme', 
    'levis-501-original-homme',
    'Le jean iconique depuis 1873',
    'Le Levi''s 501 Original est le jean qui a tout inventé. Coupe droite intemporelle, toile denim 100% coton, boutons métalliques authentiques. Un classique qui ne se démode jamais.',
    89.90, 109.90, 'LEVI-501-ORIG',
    (SELECT id FROM public.categories WHERE slug = 'jeans-denim'),
    (SELECT id FROM public.brands WHERE slug = 'levis'),
    100, true,
    ARRAY['jean', 'levis', '501', 'denim', 'classique', 'homme'],
    0.8
);

-- 6. T-shirt Zara Basic
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'T-shirt Zara Basic Coton Bio', 
    'zara-t-shirt-basic-coton-bio',
    'T-shirt basique en coton biologique',
    'T-shirt basique en coton biologique 100%. Coupe confortable, col rond, finition soignée. Disponible en plusieurs coloris. Parfait pour toutes les occasions.',
    19.95, 24.95, 'ZARA-TS-BASIC',
    (SELECT id FROM public.categories WHERE slug = 'mode-vetements'),
    (SELECT id FROM public.brands WHERE slug = 'zara'),
    200, false,
    ARRAY['t-shirt', 'zara', 'coton', 'bio', 'basique'],
    0.2
);

-- 7. Robe Zara Midi
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Robe Zara Midi Floral', 
    'zara-robe-midi-floral',
    'Robe midi avec imprimé floral tendance',
    'Robe midi en viscose avec un magnifique imprimé floral. Coupe ajustée, manches courtes, longueur midi. Parfaite pour le bureau ou les sorties décontractées.',
    39.95, 49.95, 'ZARA-ROBE-MIDI',
    (SELECT id FROM public.categories WHERE slug = 'mode-vetements'),
    (SELECT id FROM public.brands WHERE slug = 'zara'),
    60, false,
    ARRAY['robe', 'zara', 'midi', 'floral', 'femme', 'viscose'],
    0.3
);

-- =============================================
-- PRODUITS SPORT & LOISIRS
-- =============================================

-- 8. Adidas Ultraboost 22
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Adidas Ultraboost 22 Running', 
    'adidas-ultraboost-22-running',
    'Chaussures de running avec technologie Boost',
    'Les Ultraboost 22 d''Adidas offrent un amorti exceptionnel grâce à la technologie Boost. Tige Primeknit+ pour un confort optimal, semelle extérieure Continental pour une adhérence maximale.',
    189.99, 219.99, 'ADID-UB22',
    (SELECT id FROM public.categories WHERE slug = 'chaussures'),
    (SELECT id FROM public.brands WHERE slug = 'adidas'),
    80, true,
    ARRAY['chaussures', 'adidas', 'running', 'ultraboost', 'boost'],
    0.32
);

-- 9. Vêtement Nike Dri-FIT
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Nike Dri-FIT ADV T-Shirt', 
    'nike-dri-fit-adv-t-shirt',
    'T-shirt technique avec technologie Dri-FIT',
    'T-shirt technique Nike avec technologie Dri-FIT ADV pour évacuer la transpiration. Coupe ajustée, col rond, logo Nike brodé. Idéal pour l''entraînement et la compétition.',
    34.99, 39.99, 'NIKE-DF-ADV',
    (SELECT id FROM public.categories WHERE slug = 'vetements-sport'),
    (SELECT id FROM public.brands WHERE slug = 'nike'),
    120, false,
    ARRAY['t-shirt', 'nike', 'dri-fit', 'sport', 'technique'],
    0.15
);

-- 10. Short Adidas 3-Stripes
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Short Adidas 3-Stripes Training', 
    'adidas-3-stripes-training-short',
    'Short d''entraînement avec bandes 3-Stripes',
    'Short d''entraînement Adidas en polyester recyclé. Coupe ample, ceinture élastiquée, poches latérales. Les bandes 3-Stripes iconiques sur les côtés.',
    29.99, 34.99, 'ADID-3S-SHORT',
    (SELECT id FROM public.categories WHERE slug = 'vetements-sport'),
    (SELECT id FROM public.brands WHERE slug = 'adidas'),
    90, false,
    ARRAY['short', 'adidas', 'training', '3-stripes', 'sport'],
    0.2
);

-- =============================================
-- PRODUITS MAISON & DÉCORATION
-- =============================================

-- 11. Aspirateur Dyson V15 Detect
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Aspirateur Dyson V15 Detect', 
    'dyson-v15-detect-aspirateur',
    'Aspirateur sans fil avec détection laser',
    'L''aspirateur Dyson V15 Detect révolutionne le nettoyage avec son laser qui révèle la poussière invisible. Moteur Dyson Hyperdymium, jusqu''à 60 minutes d''autonomie, filtration HEPA.',
    699.00, 799.00, 'DYSON-V15-DET',
    (SELECT id FROM public.categories WHERE slug = 'electromenager'),
    (SELECT id FROM public.brands WHERE slug = 'dyson'),
    15, true,
    ARRAY['aspirateur', 'dyson', 'sans-fil', 'laser', 'detect'],
    3.2, 25.0, 25.0, 120.0
);

-- 12. Robot Mixer KitchenAid
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Robot Mixer KitchenAid Artisan', 
    'kitchenaid-artisan-robot-mixer',
    'Robot mixeur professionnel 5KSM125',
    'Le robot mixeur KitchenAid Artisan est l''outil indispensable de votre cuisine. Moteur puissant 300W, 5 vitesses + pulse, accessoires inclus. Design iconique et robuste.',
    399.00, 449.00, 'KITC-ART-5KSM125',
    (SELECT id FROM public.categories WHERE slug = 'electromenager'),
    (SELECT id FROM public.brands WHERE slug = 'kitchenaid'),
    20, true,
    ARRAY['robot', 'kitchenaid', 'mixeur', 'cuisine', 'professionnel'],
    11.8, 33.0, 20.0, 35.0
);

-- 13. Table IKEA Malm
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Table IKEA Malm 160cm', 
    'ikea-malm-table-160cm',
    'Table à manger en chêne massif',
    'Table à manger IKEA Malm en chêne massif. Design scandinave épuré, finition naturelle, 6 places. Dimensions 160x90cm, hauteur 75cm. Assemblage simple.',
    299.00, 349.00, 'IKEA-MALM-160',
    (SELECT id FROM public.categories WHERE slug = 'mobilier'),
    (SELECT id FROM public.brands WHERE slug = 'ikea'),
    25, false,
    ARRAY['table', 'ikea', 'malm', 'chene', 'manger', 'scandinave'],
    35.0, 160.0, 90.0, 75.0
);

-- 14. Chaise IKEA Eames
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Chaise IKEA Eames Style', 
    'ikea-eames-style-chaise',
    'Chaise design style Eames en plastique',
    'Chaise design inspirée du style Eames. Coque en plastique moulé, pieds en bois, couleurs vives. Confortable et moderne, parfaite pour salle à manger ou bureau.',
    89.99, 109.99, 'IKEA-EAMES-STYLE',
    (SELECT id FROM public.categories WHERE slug = 'mobilier'),
    (SELECT id FROM public.brands WHERE slug = 'ikea'),
    50, false,
    ARRAY['chaise', 'ikea', 'eames', 'design', 'plastique', 'moderne'],
    4.5, 50.0, 50.0, 80.0
);

-- =============================================
-- PRODUITS BEAUTÉ & SANTÉ
-- =============================================

-- 15. Fond de teint L'Oréal True Match
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'L''Oréal True Match Fond de Teint', 
    'loreal-true-match-fond-teint',
    'Fond de teint longue tenue 24h',
    'Fond de teint L''Oréal True Match avec technologie Color Match. Couverture naturelle, longue tenue 24h, finition satinée. Formule non comédogène, SPF 17.',
    16.99, 19.99, 'LOREAL-TM-FT',
    (SELECT id FROM public.categories WHERE slug = 'maquillage'),
    (SELECT id FROM public.brands WHERE slug = 'loreal'),
    80, false,
    ARRAY['fond-teint', 'loreal', 'true-match', 'longue-tenue', 'spf'],
    0.03
);

-- 16. Rouge à lèvres L'Oréal Color Riche
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'L''Oréal Color Riche Rouge à Lèvres', 
    'loreal-color-riche-rouge-levres',
    'Rouge à lèvres haute pigmentation',
    'Rouge à lèvres L''Oréal Color Riche avec haute pigmentation et finition satinée. Formule hydratante, longue tenue, palette de couleurs tendance.',
    12.99, 14.99, 'LOREAL-CR-RL',
    (SELECT id FROM public.categories WHERE slug = 'maquillage'),
    (SELECT id FROM public.brands WHERE slug = 'loreal'),
    100, false,
    ARRAY['rouge-levres', 'loreal', 'color-riche', 'pigmentation', 'hydratant'],
    0.01
);

-- =============================================
-- PRODUITS ÉLECTRONIQUES SUPPLÉMENTAIRES
-- =============================================

-- 17. iPad Air M2
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'iPad Air M2 64GB Wi-Fi', 
    'ipad-air-m2-64gb-wifi',
    'Tablette Apple avec puce M2 et écran Liquid Retina',
    'L''iPad Air M2 combine puissance et portabilité. Écran Liquid Retina 10,9", puce M2 ultra-performante, caméra 12MP, Touch ID. Parfait pour la créativité et la productivité.',
    649.00, 699.00, 'APPL-IPA-M2-64',
    (SELECT id FROM public.categories WHERE slug = 'ordinateurs'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    35, true,
    ARRAY['ipad', 'apple', 'm2', 'tablette', 'liquid-retina'],
    0.461, 24.76, 17.85, 0.61
);

-- 18. Écouteurs Sony WH-1000XM5
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight
) VALUES (
    'Sony WH-1000XM5 Casque Bluetooth', 
    'sony-wh-1000xm5-casque-bluetooth',
    'Casque avec réduction de bruit et haute résolution',
    'Le Sony WH-1000XM5 offre une expérience audio exceptionnelle avec réduction de bruit intelligente, audio haute résolution et jusqu''à 30h d''autonomie. Confort premium.',
    399.00, 449.00, 'SONY-WH1000XM5',
    (SELECT id FROM public.categories WHERE slug = 'casques-ecouteurs'),
    (SELECT id FROM public.brands WHERE slug = 'sony'),
    25, true,
    ARRAY['casque', 'sony', 'bluetooth', 'reduction-bruit', 'haute-resolution'],
    0.25
);

-- 19. Appareil photo Canon EOS R6 Mark II
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Canon EOS R6 Mark II Boîtier', 
    'canon-eos-r6-mark-ii-boitier',
    'Appareil photo hybride professionnel 24MP',
    'Le Canon EOS R6 Mark II est un appareil photo hybride professionnel. Capteur 24MP, stabilisation 5 axes, 4K 60p, autofocus intelligent. Parfait pour photo et vidéo.',
    2499.00, 2799.00, 'CANON-R6M2-BODY',
    (SELECT id FROM public.categories WHERE slug = 'electronique'),
    (SELECT id FROM public.brands WHERE slug = 'canon'),
    8, true,
    ARRAY['appareil-photo', 'canon', 'eos', 'hybride', 'professionnel', '4k'],
    0.588, 13.8, 9.8, 8.8
);

-- 20. Enceinte Philips TAH4205
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags, weight, dimensions_length, dimensions_width, dimensions_height
) VALUES (
    'Enceinte Philips TAH4205 Bluetooth', 
    'philips-tah4205-enceinte-bluetooth',
    'Enceinte portable avec son puissant et autonomie longue',
    'Enceinte portable Philips avec son puissant et clair. Connexion Bluetooth 5.0, autonomie jusqu''à 20h, résistance à l''eau IPX7, design compact et moderne.',
    79.99, 99.99, 'PHIL-TAH4205',
    (SELECT id FROM public.categories WHERE slug = 'accessoires-tech'),
    (SELECT id FROM public.brands WHERE slug = 'philips'),
    60, false,
    ARRAY['enceinte', 'philips', 'bluetooth', 'portable', 'waterproof'],
    0.6, 18.0, 7.0, 7.0
);

-- =============================================
-- MESSAGE DE COMPLETION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 20 nouveaux produits ajoutés avec succès!';
    RAISE NOTICE '📱 Électronique: 8 produits (MacBook, AirPods, Galaxy Watch, Bose, iPad, Sony, Canon, Philips)';
    RAISE NOTICE '👕 Mode: 3 produits (Levi''s, Zara T-shirt, Zara robe)';
    RAISE NOTICE '🏃 Sport: 3 produits (Adidas Ultraboost, Nike Dri-FIT, Adidas short)';
    RAISE NOTICE '🏠 Maison: 4 produits (Dyson, KitchenAid, IKEA table, IKEA chaise)';
    RAISE NOTICE '💄 Beauté: 2 produits (L''Oréal fond de teint, L''Oréal rouge à lèvres)';
    RAISE NOTICE '💰 Prix total catalogue: 8,847.85€';
    RAISE NOTICE '🎯 Tous les produits sont actifs et prêts à la vente!';
END $$;
