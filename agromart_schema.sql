-- ==========================================
-- AgroMart PostgreSQL Database Schema & RLS
-- Complete Setup for Supabase SQL Editor
-- ==========================================

-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'sold_out', 'archived');
CREATE TYPE inquiry_status AS ENUM ('pending', 'read', 'responded', 'closed');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');

-- ==========================================
-- 2. Core Tables Definition
-- ==========================================

-- USERS TABLE (Extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'buyer'::user_role NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- BUYERS TABLE (1-to-1 extension of users)
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    shipping_address TEXT,
    billing_address TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SELLERS TABLE (1-to-1 extension of users)
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    tax_id TEXT,
    address TEXT,
    status verification_status DEFAULT 'pending'::verification_status NOT NULL,
    rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CATEGORIES TABLE (Hierarchical)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    unit_of_measure TEXT NOT NULL, 
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    status product_status DEFAULT 'active'::product_status NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PRODUCT IMAGES TABLE
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- FAVORITES TABLE (Many-to-Many)
CREATE TABLE public.favorites (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

-- INQUIRIES (Message Threads)
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    status inquiry_status DEFAULT 'pending'::inquiry_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- MESSAGES (Threaded Replies)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ORDERS
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    order_status order_status DEFAULT 'pending'::order_status NOT NULL,
    payment_status payment_status DEFAULT 'unpaid'::payment_status NOT NULL,
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ORDER ITEMS
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- REVIEWS
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (product_id, buyer_id)
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CONTACT MESSAGES (Public form to Admin)
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SYSTEM SETTINGS (Admin Panel)
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AUDIT LOGS (Security)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. Database Indexes for Performance
-- ==========================================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_inquiries_buyer_seller ON public.inquiries(buyer_id, seller_id);
CREATE INDEX idx_messages_inquiry_id ON public.messages(inquiry_id);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- ==========================================
-- 4. Triggers (Timestamps & Auth Sync)
-- ==========================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_buyers_modtime BEFORE UPDATE ON public.buyers FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_sellers_modtime BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_inquiries_modtime BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_system_settings_modtime BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Auto-insert into public.users when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'::user_role);

  INSERT INTO public.users (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    NEW.email,
    assigned_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create role-specific profiles
  IF assigned_role = 'seller' THEN
    INSERT INTO public.sellers (id, business_name, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Unnamed Business'),
      'pending'
    );
  ELSE
    INSERT INTO public.buyers (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow clean re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. Row Level Security (RLS) Helper Functions
-- ==========================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'seller'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- 6. Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Buyers
CREATE POLICY "Buyers can view own profile" ON public.buyers FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Buyers can update own profile" ON public.buyers FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Sellers
CREATE POLICY "Sellers are viewable by everyone" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Sellers can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    public.is_seller() AND 
    EXISTS (SELECT 1 FROM public.sellers WHERE id = auth.uid() AND status = 'verified')
);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id OR public.is_admin());

-- Product Images
CREATE POLICY "Product images viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers manage own product images" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_images.product_id AND seller_id = auth.uid()) OR public.is_admin()
);

-- Favorites
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Inquiries
CREATE POLICY "View own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers/Admins update inquiries" ON public.inquiries FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

-- Messages
CREATE POLICY "View own messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.inquiries WHERE id = messages.inquiry_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())) OR public.is_admin()
);
CREATE POLICY "Insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Orders
CREATE POLICY "View own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Buyers can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers/Admins can update orders" ON public.orders FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

-- Order Items
CREATE POLICY "View own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())) OR public.is_admin()
);
CREATE POLICY "Insert own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
);

-- Reviews
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers/Admins can delete reviews" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id OR public.is_admin());

-- Notifications
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Contact Messages
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin());

-- System Settings
CREATE POLICY "Anyone can read system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage system settings" ON public.system_settings FOR ALL USING (public.is_admin());

-- Audit Logs
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Backend inserts audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ==========================================
-- 7. Supabase Storage Buckets & Policies
-- ==========================================

-- Insert Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false) ON CONFLICT DO NOTHING;

-- Avatars Policies
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can delete their own avatar." ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'avatars');

-- Product Images Policies
CREATE POLICY "Product images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Sellers can upload product images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_seller() AND auth.uid() = owner);
CREATE POLICY "Sellers can update own product images." ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Sellers can delete own product images." ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'product-images');

-- Verification Docs Policies
CREATE POLICY "Admins and Owners can view verification docs." ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND (auth.uid() = owner OR public.is_admin()));
CREATE POLICY "Sellers can upload verification docs." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND public.is_seller() AND auth.uid() = owner);
CREATE POLICY "Owners can update verification docs." ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'verification-docs');
CREATE POLICY "Admins and Owners can delete verification docs." ON storage.objects FOR DELETE USING (bucket_id = 'verification-docs' AND (auth.uid() = owner OR public.is_admin()));
