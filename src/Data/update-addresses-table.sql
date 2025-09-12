-- =============================================
-- MISE À JOUR DE LA TABLE ADDRESSES
-- Ajout des colonnes manquantes pour une meilleure compatibilité
-- =============================================

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS address_line_2 TEXT;

-- S'assurer que la colonne company existe
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS company TEXT;

-- S'assurer que la colonne state existe  
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS state TEXT;

-- Ajouter un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Ajouter un index sur is_default pour les performances
CREATE INDEX IF NOT EXISTS idx_addresses_default ON public.addresses(user_id, is_default) WHERE is_default = true;

-- Commentaires pour documentation
COMMENT ON COLUMN public.addresses.address_line_2 IS 'Complément d''adresse (optionnel)';
COMMENT ON COLUMN public.addresses.company IS 'Nom de l''entreprise (optionnel)';
COMMENT ON COLUMN public.addresses.state IS 'État/Région (optionnel)';

-- Fonction pour s'assurer qu'il n'y a qu'une seule adresse par défaut par utilisateur
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la nouvelle adresse est marquée comme par défaut
    IF NEW.is_default = true THEN
        -- Désactiver toutes les autres adresses par défaut pour cet utilisateur
        UPDATE public.addresses 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour s'assurer qu'il n'y a qu'une seule adresse par défaut
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON public.addresses;
CREATE TRIGGER trigger_ensure_single_default_address
    BEFORE INSERT OR UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();
