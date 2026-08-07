-- ==========================================
-- AgroMart PostgreSQL Database Schema
-- Phase 2: Schema, RLS, and Auth Configuration
-- ==========================================

-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'sold_out', 'archived');
CREATE TYPE inquiry_status AS ENUM ('pending', 'read', 'responded', 'closed');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');

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

-- SELLERS TABLE (1-to-1 extension of users for seller-specific data)
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

-- CATEGORIES TABLE (Hierarchical for sub-categories)
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
    unit_of_measure TEXT NOT NULL, -- e.g., 'kg', 'ton', 'box'
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    status product_status DEFAULT 'active'::product_status NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    tags TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- FAVORITES TABLE (Many-to-Many: Users <-> Products)
CREATE TABLE public.favorites (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

-- INQUIRIES/MESSAGES TABLE
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status inquiry_status DEFAULT 'pending'::inquiry_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- REVIEWS TABLE
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (product_id, buyer_id) -- One review per product per buyer
);

-- ==========================================
-- 3. Database Indexes for Performance
-- ==========================================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_inquiries_buyer_seller ON public.inquiries(buyer_id, seller_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);

-- ==========================================
-- 4. Triggers (Timestamps & Auth Sync)
-- ==========================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_sellers_modtime BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_inquiries_modtime BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Auto-insert into public.users when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'::user_role),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- If role is seller, also create a pending seller profile
  IF (NEW.raw_user_meta_data->>'role') = 'seller' THEN
    INSERT INTO public.sellers (id, business_name, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Unnamed Business'),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Users Policies
-- ------------------------------------------
-- Anyone can view public user profiles (names, avatars)
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
-- Users can update their own profile; Admins can update any profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ------------------------------------------
-- Sellers Policies
-- ------------------------------------------
CREATE POLICY "Sellers are viewable by everyone" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Sellers can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ------------------------------------------
-- Categories Policies
-- ------------------------------------------
-- Categories are read-only for public, writable by admins
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- ------------------------------------------
-- Products Policies
-- ------------------------------------------
-- Anyone can view active products (or admins can view all)
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());
-- Only verified sellers can insert products
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    public.is_seller() AND 
    EXISTS (SELECT 1 FROM public.sellers WHERE id = auth.uid() AND status = 'verified')
);
-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id OR public.is_admin());

-- ------------------------------------------
-- Favorites Policies
-- ------------------------------------------
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------
-- Inquiries Policies
-- ------------------------------------------
-- Buyers and Sellers can view inquiries involving them
CREATE POLICY "View own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());
-- Buyers can create inquiries
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'buyer');
-- Sellers and Admins can update inquiries (e.g., changing status to responded)
CREATE POLICY "Sellers can update received inquiries" ON public.inquiries FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

-- ------------------------------------------
-- Reviews Policies
-- ------------------------------------------
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'buyer');
CREATE POLICY "Buyers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id OR public.is_admin());
