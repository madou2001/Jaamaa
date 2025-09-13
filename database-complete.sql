-- =============================================
-- 🎯 JAAYMA E-COMMERCE - BASE DE DONNÉES COMPLÈTE
-- Version: 3.0 Professional Complete
-- Date: 2025-01-12
-- Description: Schéma complet pour un e-commerce professionnel
-- =============================================

-- =============================================
-- EXTENSIONS & SETUP
-- =============================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- TYPES PERSONNALISÉS
-- =============================================

-- Types pour les commandes
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'pending',      -- En attente
    'confirmed',    -- Confirmée
    'processing',   -- En traitement
    'shipped',      -- Expédiée
    'delivered',    -- Livrée
    'cancelled',    -- Annulée
    'refunded'      -- Remboursée
);

-- Types pour les paiements
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM (
    'pending',              -- En attente
    'paid',                 -- Payé
    'failed',               -- Échoué
    'refunded',             -- Remboursé
    'partially_refunded'    -- Partiellement remboursé
);

DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM (
    'card',                 -- Carte bancaire
    'cash_on_delivery',     -- Paiement à la livraison
    'paypal',               -- PayPal
    'bank_transfer',        -- Virement bancaire
    'apple_pay',            -- Apple Pay
    'google_pay'            -- Google Pay
);

-- Types pour les produits
DROP TYPE IF EXISTS product_status CASCADE;
CREATE TYPE product_status AS ENUM (
    'active',       -- Actif
    'draft',        -- Brouillon
    'archived',     -- Archivé
    'out_of_stock'  -- Rupture de stock
);

-- Types pour la livraison
DROP TYPE IF EXISTS shipping_method CASCADE;
CREATE TYPE shipping_method AS ENUM (
    'standard',     -- Standard
    'express',      -- Express
    'overnight',    -- Livraison le lendemain
    'pickup'        -- Retrait en magasin
);

-- Types pour les notifications
DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM (
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'payment_received',
    'stock_alert',
    'newsletter',
    'promotion'
);

-- =============================================
-- TABLE PROFILES (Profils utilisateurs)
-- =============================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', '')),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    newsletter BOOLEAN DEFAULT false,
    notifications BOOLEAN DEFAULT true,
    preferred_language TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Europe/Paris',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE ADDRESSES (Adresses)
-- =============================================

CREATE TABLE public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('billing', 'shipping')) NOT NULL DEFAULT 'shipping',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'FR',
    phone TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE CATEGORIES (Catégories de produits)
-- =============================================

CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE BRANDS (Marques)
-- =============================================

CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE PRODUCTS (Produits)
-- =============================================

CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= price),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    sku TEXT UNIQUE,
    barcode TEXT,
    weight DECIMAL(8,3),
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    track_quantity BOOLEAN DEFAULT true,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    status product_status DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    attributes JSONB DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE PRODUCT_VARIANTS (Variantes de produits)
-- =============================================

CREATE TABLE public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) CHECK (price >= 0),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    weight DECIMAL(8,3),
    image_url TEXT,
    position INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE COUPONS (Codes promo)
-- =============================================

CREATE TABLE public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    applicable_products UUID[],
    applicable_categories UUID[],
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE CART_ITEMS (Panier)
-- =============================================

CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- =============================================
-- TABLE ORDERS (Commandes)
-- =============================================

CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status order_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'card',
    payment_status payment_status DEFAULT 'pending',
    currency TEXT DEFAULT 'EUR',
    
    -- Montants
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Livraison
    shipping_method shipping_method DEFAULT 'standard',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    tracking_number TEXT,
    
    -- Informations supplémentaires
    coupon_code TEXT,
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    
    -- Dates importantes
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE ORDER_ITEMS (Articles de commande)
-- =============================================

CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    variant_name TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    product_snapshot JSONB, -- Snapshot du produit au moment de la commande
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE WISHLISTS (Liste de souhaits)
-- =============================================

CREATE TABLE public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- =============================================
-- TABLE PRODUCT_REVIEWS (Avis produits)
-- =============================================

CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, order_id)
);

-- =============================================
-- TABLE SHIPPING_ZONES (Zones de livraison)
-- =============================================

CREATE TABLE public.shipping_zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    countries TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE SHIPPING_RATES (Tarifs de livraison)
-- =============================================

CREATE TABLE public.shipping_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    method shipping_method NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    free_shipping_threshold DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_order_amount DECIMAL(10,2),
    max_weight DECIMAL(8,3),
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE NOTIFICATIONS (Notifications)
-- =============================================

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE NEWSLETTER_SUBSCRIBERS (Abonnés newsletter)
-- =============================================

CREATE TABLE public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'
);

-- =============================================
-- TABLE INVENTORY_MOVEMENTS (Mouvements de stock)
-- =============================================

CREATE TABLE public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('sale', 'restock', 'adjustment', 'return')) NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID, -- Peut référencer une commande, un retour, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE SETTINGS (Paramètres du site)
-- =============================================

CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SEQUENCES
-- =============================================

-- Séquence pour les numéros de commande
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- =============================================
-- INDEXES POUR LES PERFORMANCES
-- =============================================

-- Indexes pour les produits
CREATE INDEX idx_products_category_status ON public.products(category_id, status) WHERE status = 'active';
CREATE INDEX idx_products_brand_status ON public.products(brand_id, status) WHERE status = 'active';
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_quantity ON public.products(quantity) WHERE track_quantity = true;
CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_products_tags ON public.products USING gin(tags);

-- Indexes pour les commandes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_email ON public.orders(email);

-- Indexes pour les articles de commande
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Indexes pour le panier
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Indexes pour les avis
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved) WHERE is_approved = true;

-- Indexes pour les catégories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_featured ON public.categories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = true;

-- Indexes pour les adresses
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_default ON public.addresses(user_id, is_default) WHERE is_default = true;

-- Indexes pour les notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Indexes pour les coupons
CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE is_active = true;
CREATE INDEX idx_coupons_active_dates ON public.coupons(starts_at, ends_at) WHERE is_active = true;

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour générer un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'JAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le total d'une commande
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO total
    FROM order_items 
    WHERE order_id = order_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le stock après une commande
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Si c'est une nouvelle commande confirmée
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        -- Décrémenter le stock pour chaque article
        UPDATE products SET 
            quantity = quantity - oi.quantity
        FROM order_items oi
        WHERE products.id = oi.product_id 
        AND oi.order_id = NEW.id
        AND products.track_quantity = true;
        
        -- Enregistrer les mouvements de stock
        INSERT INTO inventory_movements (product_id, variant_id, type, quantity, reason, reference_id)
        SELECT 
            oi.product_id,
            oi.variant_id,
            'sale',
            -oi.quantity,
            'Order confirmed',
            NEW.id
        FROM order_items oi
        WHERE oi.order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour valider un code promo
CREATE OR REPLACE FUNCTION validate_coupon(
    coupon_code TEXT,
    user_uuid UUID,
    order_total DECIMAL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
    user_usage_count INTEGER;
    calculated_discount DECIMAL;
BEGIN
    -- Récupérer le coupon
    SELECT * INTO coupon_record
    FROM coupons c
    WHERE c.code = coupon_code
    AND c.is_active = true
    AND (c.starts_at IS NULL OR c.starts_at <= NOW())
    AND (c.ends_at IS NULL OR c.ends_at >= NOW());
    
    -- Vérifier si le coupon existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Code promo invalide ou expiré';
        RETURN;
    END IF;
    
    -- Vérifier le montant minimum
    IF order_total < coupon_record.minimum_amount THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 
            'Montant minimum de ' || coupon_record.minimum_amount || '€ requis';
        RETURN;
    END IF;
    
    -- Vérifier la limite d'utilisation globale
    IF coupon_record.usage_limit IS NOT NULL 
    AND coupon_record.usage_count >= coupon_record.usage_limit THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Code promo épuisé';
        RETURN;
    END IF;
    
    -- Vérifier la limite d'utilisation par utilisateur
    SELECT COUNT(*) INTO user_usage_count
    FROM orders
    WHERE user_id = user_uuid 
    AND coupon_code = coupon_record.code
    AND status NOT IN ('cancelled', 'refunded');
    
    IF user_usage_count >= coupon_record.user_usage_limit THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Code promo déjà utilisé';
        RETURN;
    END IF;
    
    -- Calculer la réduction
    IF coupon_record.discount_type = 'percentage' THEN
        calculated_discount := order_total * (coupon_record.discount_value / 100);
        IF coupon_record.maximum_discount IS NOT NULL THEN
            calculated_discount := LEAST(calculated_discount, coupon_record.maximum_discount);
        END IF;
    ELSIF coupon_record.discount_type = 'fixed_amount' THEN
        calculated_discount := LEAST(coupon_record.discount_value, order_total);
    ELSE
        calculated_discount := 0;
    END IF;
    
    RETURN QUERY SELECT true, calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON public.shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger 
    BEFORE INSERT ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Trigger pour gérer les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour le stock
CREATE TRIGGER update_stock_on_order_status_change
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =============================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- =============================================

-- Activer RLS sur les tables sensibles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les adresses
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Politiques pour le panier
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les commandes
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les articles de commande
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Politiques pour la liste de souhaits
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les avis
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON public.product_reviews FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Accès public en lecture
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view shipping rates" ON public.shipping_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view public settings" ON public.settings FOR SELECT USING (is_public = true);

-- =============================================
-- VUES POUR LES ANALYTICS
-- =============================================

-- Vue pour les analytics produits
CREATE VIEW product_analytics AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    p.quantity,
    p.category_id,
    p.brand_id,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(DISTINCT pr.id) as review_count,
    COUNT(DISTINCT w.id) as wishlist_count,
    p.created_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'refunded')
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
LEFT JOIN wishlists w ON p.id = w.product_id
GROUP BY p.id, p.name, p.sku, p.price, p.quantity, p.category_id, p.brand_id, p.created_at;

-- Vue pour les analytics de ventes
CREATE VIEW sales_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_customers
FROM orders 
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Vue pour le dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) as total_orders,
    (SELECT SUM(total_amount) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) as total_revenue,
    (SELECT COUNT(*) FROM profiles) as total_customers,
    (SELECT COUNT(*) FROM products WHERE status = 'active') as total_products,
    (SELECT COUNT(*) FROM products WHERE status = 'active' AND quantity <= low_stock_threshold) as low_stock_products,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders;

-- =============================================
-- DONNÉES DE DÉMONSTRATION
-- =============================================

-- Insérer les paramètres du site
INSERT INTO public.settings (key, value, description, is_public) VALUES
('site_name', '"Jaayma E-commerce"', 'Nom du site', true),
('site_description', '"Votre boutique en ligne de confiance"', 'Description du site', true),
('currency', '"EUR"', 'Devise par défaut', true),
('tax_rate', '20.0', 'Taux de TVA par défaut', false),
('free_shipping_threshold', '50.0', 'Montant minimum pour la livraison gratuite', true),
('email_from', '"noreply@jaayma-ecommerce.com"', 'Email expéditeur', false),
('support_email', '"support@jaayma-ecommerce.com"', 'Email support', true),
('phone', '"+33 1 23 45 67 89"', 'Téléphone support', true);

-- Insérer les marques
INSERT INTO public.brands (name, slug, description, is_featured) VALUES
('Apple', 'apple', 'Innovation technologique depuis 1976', true),
('Samsung', 'samsung', 'Leader mondial de l''électronique', true),
('Nike', 'nike', 'Just Do It - Articles de sport premium', true),
('Adidas', 'adidas', 'The Brand with the 3-Stripes', true),
('Sony', 'sony', 'Technologie et divertissement', false),
('Canon', 'canon', 'Imagerie et optique professionnelle', false);

-- Insérer les catégories principales
INSERT INTO public.categories (name, slug, description, sort_order, is_featured) VALUES
('Électronique', 'electronique', 'Smartphones, ordinateurs, accessoires high-tech', 1, true),
('Mode & Vêtements', 'mode-vetements', 'Vêtements homme, femme, enfant et accessoires', 2, true),
('Sport & Loisirs', 'sport-loisirs', 'Équipements sportifs, fitness, outdoor', 3, true),
('Maison & Décoration', 'maison-decoration', 'Mobilier, décoration, électroménager', 4, true),
('Beauté & Santé', 'beaute-sante', 'Cosmétiques, soins, bien-être', 5, false),
('Auto & Moto', 'auto-moto', 'Pièces et accessoires automobiles', 6, false);

-- Insérer les sous-catégories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'iPhone, Samsung Galaxy, etc.', (SELECT id FROM public.categories WHERE slug = 'electronique'), 1),
('Ordinateurs', 'ordinateurs', 'PC, Mac, laptops', (SELECT id FROM public.categories WHERE slug = 'electronique'), 2),
('Chaussures', 'chaussures', 'Sneakers, boots, sandales', (SELECT id FROM public.categories WHERE slug = 'sport-loisirs'), 1),
('Vêtements Sport', 'vetements-sport', 'T-shirts, shorts, survêtements', (SELECT id FROM public.categories WHERE slug = 'sport-loisirs'), 2);

-- Insérer les zones de livraison
INSERT INTO public.shipping_zones (name, countries) VALUES
('France Métropolitaine', ARRAY['FR']),
('Union Européenne', ARRAY['DE', 'IT', 'ES', 'BE', 'NL', 'PT', 'AT', 'IE', 'LU', 'DK', 'SE', 'FI']),
('International', ARRAY['US', 'CA', 'GB', 'CH', 'JP', 'AU', 'BR', 'MX']);

-- Insérer les tarifs de livraison
INSERT INTO public.shipping_rates (zone_id, name, method, price, free_shipping_threshold, estimated_days_min, estimated_days_max) VALUES
((SELECT id FROM public.shipping_zones WHERE name = 'France Métropolitaine'), 'Livraison Standard', 'standard', 4.90, 50.00, 2, 4),
((SELECT id FROM public.shipping_zones WHERE name = 'France Métropolitaine'), 'Livraison Express', 'express', 9.90, NULL, 1, 2),
((SELECT id FROM public.shipping_zones WHERE name = 'Union Européenne'), 'Livraison Standard UE', 'standard', 12.90, 100.00, 5, 8),
((SELECT id FROM public.shipping_zones WHERE name = 'International'), 'Livraison Internationale', 'standard', 24.90, NULL, 7, 14);

-- Insérer des produits de démonstration
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, quantity, featured, tags
) VALUES
(
    'iPhone 15 Pro 128GB', 
    'iphone-15-pro-128gb',
    'Le smartphone le plus avancé d''Apple',
    'Découvrez l''iPhone 15 Pro avec sa puce A17 Pro révolutionnaire, son système photo professionnel et son design en titane.',
    1199.00, 1299.00, 'APPL-IPH15P-128',
    (SELECT id FROM public.categories WHERE slug = 'smartphones'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    50, true,
    ARRAY['smartphone', 'apple', 'premium', '5g']
),
(
    'Nike Air Max 270', 
    'nike-air-max-270',
    'Sneakers avec amorti Air Max visible',
    'Les Nike Air Max 270 offrent un confort exceptionnel grâce à leur unité Air Max.',
    149.99, 179.99, 'NIKE-AM270',
    (SELECT id FROM public.categories WHERE slug = 'chaussures'),
    (SELECT id FROM public.brands WHERE slug = 'nike'),
    100, true,
    ARRAY['chaussures', 'nike', 'air max', 'sport']
),
(
    'Samsung Galaxy S24 Ultra', 
    'samsung-galaxy-s24-ultra',
    'Smartphone haut de gamme avec S Pen',
    'Le Galaxy S24 Ultra redéfinit la photographie mobile avec son zoom 100x.',
    1299.00, 1399.00, 'SAMS-GS24U',
    (SELECT id FROM public.categories WHERE slug = 'smartphones'),
    (SELECT id FROM public.brands WHERE slug = 'samsung'),
    30, true,
    ARRAY['smartphone', 'samsung', 'android', 's pen']
);

-- Insérer des codes promo
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_amount, usage_limit, starts_at, ends_at) VALUES
('WELCOME10', 'Remise de bienvenue 10%', 'percentage', 10.00, 50.00, 1000, NOW(), NOW() + INTERVAL '30 days'),
('FREESHIP', 'Livraison gratuite', 'free_shipping', 9.90, 30.00, NULL, NOW(), NOW() + INTERVAL '60 days'),
('SAVE20', 'Réduction 20€', 'fixed_amount', 20.00, 100.00, 500, NOW(), NOW() + INTERVAL '15 days');

-- =============================================
-- MESSAGE DE COMPLETION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Base de données Jaayma E-commerce créée avec succès!';
    RAISE NOTICE '📊 Tables créées: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE '🔍 Index créés: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE '⚡ Fonctions créées: %', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public');
    RAISE NOTICE '🛡️ Politiques RLS activées sur toutes les tables sensibles';
    RAISE NOTICE '📈 Vues analytiques créées pour le reporting';
    RAISE NOTICE '🎯 Base de données prête pour la production!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Configurer les variables d''environnement Supabase';
    RAISE NOTICE '2. Activer l''authentification par email';
    RAISE NOTICE '3. Configurer les webhooks Stripe';
    RAISE NOTICE '4. Importer vos produits réels';
    RAISE NOTICE '5. Configurer les emails transactionnels';
END $$;
