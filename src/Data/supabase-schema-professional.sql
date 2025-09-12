-- =============================================
-- JAAYMA E-COMMERCE DATABASE SCHEMA
-- Version: 2.0 Professional
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS & TYPES
-- =============================================

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived', 'out_of_stock');
CREATE TYPE shipping_method AS ENUM ('standard', 'express', 'overnight', 'pickup');

-- =============================================
-- PROFILES TABLE
-- =============================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADDRESSES TABLE
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
-- CATEGORIES TABLE
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
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BRANDS TABLE
-- =============================================

CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
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
    status product_status DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRODUCT VARIANTS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COUPONS TABLE
-- =============================================

CREATE TABLE public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================

CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================

CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    currency TEXT DEFAULT 'EUR',
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_method shipping_method DEFAULT 'standard',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    coupon_code TEXT,
    notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WISHLISTS TABLE
-- =============================================

CREATE TABLE public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =============================================
-- PRODUCT REVIEWS TABLE
-- =============================================

CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SHIPPING ZONES TABLE
-- =============================================

CREATE TABLE public.shipping_zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    countries TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SHIPPING RATES TABLE
-- =============================================

CREATE TABLE public.shipping_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    method shipping_method NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_order_amount DECIMAL(10,2),
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
CREATE INDEX idx_products_category_status ON public.products(category_id, status);
CREATE INDEX idx_products_brand_status ON public.products(brand_id, status);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
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

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'JAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Function to handle new user registration
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

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Wishlists policies
CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Product reviews policies
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert own reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Public read access
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can view shipping zones" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Anyone can view active shipping rates" ON public.shipping_rates FOR SELECT USING (is_active = true);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert brands
INSERT INTO public.brands (name, slug, description, logo_url, is_featured) VALUES
('Apple', 'apple', 'Innovation technologique depuis 1976', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg', true),
('Samsung', 'samsung', 'Leader mondial de l''électronique', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', true),
('Nike', 'nike', 'Just Do It - Articles de sport premium', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', true),
('IKEA', 'ikea', 'Design scandinave pour tous', 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', false),
('Adidas', 'adidas', 'The Brand with the 3-Stripes', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', true);

-- Insert categories
INSERT INTO public.categories (name, slug, description, sort_order, is_featured) VALUES
('Électronique', 'electronique', 'Smartphones, ordinateurs, accessoires high-tech', 1, true),
('Mode & Vêtements', 'mode-vetements', 'Vêtements homme, femme, enfant et accessoires', 2, true),
('Maison & Décoration', 'maison-decoration', 'Mobilier, décoration, électroménager', 3, true),
('Sport & Loisirs', 'sport-loisirs', 'Équipements sportifs, fitness, outdoor', 4, true),
('Beauté & Santé', 'beaute-sante', 'Cosmétiques, soins, bien-être', 5, false);

-- Insert subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'iPhone, Samsung Galaxy, etc.', (SELECT id FROM public.categories WHERE slug = 'electronique'), 1),
('Ordinateurs', 'ordinateurs', 'PC, Mac, laptops', (SELECT id FROM public.categories WHERE slug = 'electronique'), 2),
('Vêtements Homme', 'vetements-homme', 'Mode masculine', (SELECT id FROM public.categories WHERE slug = 'mode-vetements'), 1),
('Vêtements Femme', 'vetements-femme', 'Mode féminine', (SELECT id FROM public.categories WHERE slug = 'mode-vetements'), 2),
('Chaussures', 'chaussures', 'Sneakers, boots, sandales', (SELECT id FROM public.categories WHERE slug = 'mode-vetements'), 3);

-- Insert shipping zones
INSERT INTO public.shipping_zones (name, countries) VALUES
('France Métropolitaine', ARRAY['FR']),
('Union Européenne', ARRAY['DE', 'IT', 'ES', 'BE', 'NL', 'PT', 'AT', 'IE', 'LU']),
('International', ARRAY['US', 'CA', 'GB', 'CH', 'JP', 'AU']);

-- Insert shipping rates
INSERT INTO public.shipping_rates (zone_id, name, method, price, min_order_amount, estimated_days_min, estimated_days_max) VALUES
((SELECT id FROM public.shipping_zones WHERE name = 'France Métropolitaine'), 'Livraison Standard', 'standard', 4.90, 0, 2, 4),
((SELECT id FROM public.shipping_zones WHERE name = 'France Métropolitaine'), 'Livraison Express', 'express', 9.90, 0, 1, 2),
((SELECT id FROM public.shipping_zones WHERE name = 'France Métropolitaine'), 'Livraison Gratuite', 'standard', 0.00, 50.00, 3, 5),
((SELECT id FROM public.shipping_zones WHERE name = 'Union Européenne'), 'Livraison Standard UE', 'standard', 12.90, 0, 5, 8),
((SELECT id FROM public.shipping_zones WHERE name = 'International'), 'Livraison Internationale', 'standard', 24.90, 0, 7, 14);

-- Insert sample products
INSERT INTO public.products (
    name, slug, short_description, description, price, compare_price, sku, 
    category_id, brand_id, image_url, featured, quantity, tags
) VALUES
(
    'iPhone 15 Pro 128GB', 
    'iphone-15-pro-128gb',
    'Le smartphone le plus avancé d''Apple avec puce A17 Pro',
    'Découvrez l''iPhone 15 Pro avec sa puce A17 Pro révolutionnaire, son système photo professionnel et son design en titane. Écran Super Retina XDR de 6,1 pouces, caméras 48 Mpx et autonomie exceptionnelle.',
    1199.00, 
    1299.00,
    'APPL-IPH15P-128',
    (SELECT id FROM public.categories WHERE slug = 'smartphones'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
    true,
    50,
    ARRAY['smartphone', 'apple', 'premium', '5g', 'appareil photo']
),
(
    'MacBook Air M2 13"', 
    'macbook-air-m2-13',
    'Ordinateur portable ultra-fin avec puce M2',
    'Le MacBook Air M2 redéfinit la puissance et l''efficacité. Avec sa puce M2, son écran Liquid Retina de 13,6 pouces et son design ultra-fin, c''est l''ordinateur portable parfait pour le travail et la créativité.',
    1299.00,
    1499.00,
    'APPL-MBA-M2-13',
    (SELECT id FROM public.categories WHERE slug = 'ordinateurs'),
    (SELECT id FROM public.brands WHERE slug = 'apple'),
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    true,
    25,
    ARRAY['ordinateur portable', 'apple', 'm2', 'ultrabook']
),
(
    'Nike Air Max 270', 
    'nike-air-max-270',
    'Sneakers avec amorti Air Max visible',
    'Les Nike Air Max 270 offrent un confort exceptionnel grâce à leur unité Air Max de 270 degrés au talon. Design moderne et performance se rencontrent dans cette sneaker emblématique.',
    149.99,
    179.99,
    'NIKE-AM270-BLK',
    (SELECT id FROM public.categories WHERE slug = 'chaussures'),
    (SELECT id FROM public.brands WHERE slug = 'nike'),
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    true,
    100,
    ARRAY['chaussures', 'nike', 'air max', 'sneakers', 'sport']
),
(
    'Samsung Galaxy S24 Ultra', 
    'samsung-galaxy-s24-ultra',
    'Smartphone haut de gamme avec S Pen intégré',
    'Le Galaxy S24 Ultra redéfinit la photographie mobile avec son zoom 100x, son écran Dynamic AMOLED 2X de 6,8 pouces et son S Pen intégré. Performance ultime pour les professionnels exigeants.',
    1299.00,
    1399.00,
    'SAMS-GS24U-256',
    (SELECT id FROM public.categories WHERE slug = 'smartphones'),
    (SELECT id FROM public.brands WHERE slug = 'samsung'),
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    true,
    30,
    ARRAY['smartphone', 'samsung', 'android', 's pen', 'photo']
),
(
    'Adidas Ultraboost 22', 
    'adidas-ultraboost-22',
    'Chaussures de running haute performance',
    'Les Adidas Ultraboost 22 combinent confort et performance avec leur technologie BOOST révolutionnaire. Semelle intermédiaire responsive et tige Primeknit adaptative pour un running optimal.',
    189.99,
    219.99,
    'ADIA-UB22-WHT',
    (SELECT id FROM public.categories WHERE slug = 'chaussures'),
    (SELECT id FROM public.brands WHERE slug = 'adidas'),
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    false,
    75,
    ARRAY['chaussures', 'adidas', 'running', 'boost', 'sport']
);

-- Insert product variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, attributes) VALUES
((SELECT id FROM public.products WHERE slug = 'iphone-15-pro-128gb'), 'Titane Naturel', 'APPL-IPH15P-128-TN', 1199.00, 20, '{"color": "Titane Naturel", "storage": "128GB"}'),
((SELECT id FROM public.products WHERE slug = 'iphone-15-pro-128gb'), 'Titane Bleu', 'APPL-IPH15P-128-TB', 1199.00, 15, '{"color": "Titane Bleu", "storage": "128GB"}'),
((SELECT id FROM public.products WHERE slug = 'iphone-15-pro-128gb'), 'Titane Blanc', 'APPL-IPH15P-128-TW', 1199.00, 15, '{"color": "Titane Blanc", "storage": "128GB"}'),
((SELECT id FROM public.products WHERE slug = 'nike-air-max-270'), 'Noir - 42', 'NIKE-AM270-BLK-42', 149.99, 25, '{"color": "Noir", "size": "42"}'),
((SELECT id FROM public.products WHERE slug = 'nike-air-max-270'), 'Noir - 43', 'NIKE-AM270-BLK-43', 149.99, 30, '{"color": "Noir", "size": "43"}'),
((SELECT id FROM public.products WHERE slug = 'nike-air-max-270'), 'Blanc - 42', 'NIKE-AM270-WHT-42', 149.99, 20, '{"color": "Blanc", "size": "42"}');

-- Insert sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_amount, usage_limit, starts_at, ends_at) VALUES
('WELCOME10', 'Remise de bienvenue 10%', 'percentage', 10.00, 50.00, 1000, NOW(), NOW() + INTERVAL '30 days'),
('BLACKFRIDAY', 'Black Friday 25% de réduction', 'percentage', 25.00, 100.00, 500, NOW(), NOW() + INTERVAL '7 days'),
('FREESHIP', 'Livraison gratuite', 'fixed_amount', 9.90, 30.00, NULL, NOW(), NOW() + INTERVAL '60 days');

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- View for product analytics
CREATE VIEW product_analytics AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    p.quantity,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(pr.id) as review_count,
    p.created_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id, p.name, p.sku, p.price, p.quantity, p.created_at;

-- View for sales analytics
CREATE VIEW sales_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM orders 
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Insert completion message
DO $$
BEGIN
    RAISE NOTICE '🎉 Base de données Jaayma E-commerce créée avec succès!';
    RAISE NOTICE '📊 Tables: %, Indexes: %, Triggers: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public');
    RAISE NOTICE '🛡️ Sécurité RLS activée sur toutes les tables sensibles';
    RAISE NOTICE '📈 Vues analytiques créées pour le reporting';
    RAISE NOTICE '🎯 Prêt pour la production!';
END $$;
