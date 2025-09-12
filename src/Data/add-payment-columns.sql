-- =============================================
-- AJOUT DES COLONNES PAYMENT DANS LA TABLE ORDERS
-- Pour supporter le paiement à la livraison
-- =============================================

-- Ajouter la colonne payment_method si elle n'existe pas
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('card', 'cash_on_delivery', 'paypal', 'bank_transfer')) DEFAULT 'card';

-- Ajouter la colonne payment_status si elle n'existe pas  
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')) DEFAULT 'pending';

-- Ajouter un index sur payment_method pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Ajouter un index sur payment_status pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Commentaires pour documentation
COMMENT ON COLUMN public.orders.payment_method IS 'Méthode de paiement utilisée (card, cash_on_delivery, paypal, bank_transfer)';
COMMENT ON COLUMN public.orders.payment_status IS 'Statut du paiement (pending, paid, failed, refunded, partially_refunded)';

-- Mise à jour des commandes existantes si nécessaire
-- (Optionnel : définir les commandes existantes comme payées par carte)
UPDATE public.orders 
SET 
  payment_method = 'card',
  payment_status = 'paid'
WHERE 
  payment_method IS NULL 
  OR payment_status IS NULL;
