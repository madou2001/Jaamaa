-- Insérer des catégories de base si elles n'existent pas déjà
INSERT INTO public.categories (name, slug, description) 
SELECT * FROM (VALUES
  ('Électronique', 'electronique', 'Tous les appareils électroniques et gadgets'),
  ('Mode', 'mode', 'Vêtements et accessoires de mode'),
  ('Maison & Jardin', 'maison-jardin', 'Articles pour la maison et le jardin'),
  ('Sports & Loisirs', 'sports-loisirs', 'Équipements sportifs et de loisirs'),
  ('Livres', 'livres', 'Livres et publications'),
  ('Beauté & Santé', 'beaute-sante', 'Produits de beauté et de santé'),
  ('Automobile', 'automobile', 'Accessoires et pièces automobiles'),
  ('Jouets & Enfants', 'jouets-enfants', 'Jouets et articles pour enfants')
) AS t(name, slug, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE slug = t.slug
);
