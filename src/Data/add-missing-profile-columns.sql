-- Migration: Ajout des colonnes manquantes à la table profiles
-- Date: 2025-01-12

-- Ajouter la colonne gender
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', ''));

-- Ajouter la colonne newsletter
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT false;

-- Ajouter la colonne notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notifications BOOLEAN DEFAULT true;

-- Mettre à jour la fonction updated_at si elle existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- S'assurer que le trigger existe pour la table profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON COLUMN public.profiles.gender IS 'Genre de l''utilisateur (male, female, other)';
COMMENT ON COLUMN public.profiles.newsletter IS 'Abonnement à la newsletter';
COMMENT ON COLUMN public.profiles.notifications IS 'Notifications par email activées';
