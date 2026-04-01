-- ============================================
-- MI CAMARERO - PRP-001 FUNDACIÓN
-- Esquema multi-tenant completo
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PLANES Y SUSCRIPCIONES
-- ============================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,           -- starter, pro, premium
    display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_menu_items INT NOT NULL DEFAULT 50,
    max_tables INT NOT NULL DEFAULT 10,
    max_staff INT NOT NULL DEFAULT 3,
    max_orders_month INT NOT NULL DEFAULT 500,
    has_online_ordering BOOLEAN DEFAULT false,
    has_upselling BOOLEAN DEFAULT false,
    has_crm BOOLEAN DEFAULT false,
    has_loyalty BOOLEAN DEFAULT false,
    has_custom_branding BOOLEAN DEFAULT false,
    has_analytics BOOLEAN DEFAULT false,
    has_whatsapp BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TENANTS (RESTAURANTES)
-- ============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,   -- para URL: mi-camarero.com/slug
    plan_id UUID REFERENCES plans(id),
    logo_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'ES',
    currency VARCHAR(3) DEFAULT 'EUR',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    tax_rate DECIMAL(5,2) DEFAULT 10.00, -- IVA España
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, past_due, canceled
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    settings JSONB DEFAULT '{}',         -- colores, horarios, config custom
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(200) NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'owner', -- owner, manager, waiter, kitchen
    avatar_url TEXT,
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ============================================
-- CARTA / MENÚ
-- ============================================
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),                    -- emoji o icono
    position INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_categories_tenant ON menu_categories(tenant_id);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    allergens TEXT[],                    -- gluten, lactosa, frutos_secos, etc.
    tags TEXT[],                         -- vegano, picante, sin_gluten, popular
    calories INT,
    prep_time_min INT DEFAULT 15,        -- tiempo estimado preparación
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,      -- producto destacado
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);

CREATE TABLE menu_item_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- "Extra queso", "Tamaño grande"
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    position INT DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- ============================================
-- MESAS
-- ============================================
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    number INT NOT NULL,
    name VARCHAR(50),                    -- "Terraza 1", "Barra"
    capacity INT DEFAULT 4,
    zone VARCHAR(50) DEFAULT 'interior', -- interior, terraza, barra, privado
    qr_code TEXT,                        -- URL del QR
    status VARCHAR(20) DEFAULT 'free',   -- free, occupied, reserved, bill_requested
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tables_tenant ON tables(tenant_id);
CREATE UNIQUE INDEX idx_tables_tenant_number ON tables(tenant_id, number);

-- ============================================
-- PEDIDOS
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id),
    customer_id UUID,                    -- FK a customers (se crea en PRP CRM)
    order_number SERIAL,                 -- número secuencial por restaurante
    type VARCHAR(20) NOT NULL DEFAULT 'dine_in', -- dine_in, takeaway, delivery
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, preparing, ready, served, paid, cancelled
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(20),          -- cash, card, online
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    notes TEXT,
    customer_name VARCHAR(200),          -- para takeaway/delivery
    customer_phone VARCHAR(20),
    customer_address TEXT,               -- para delivery
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_date ON orders(tenant_id, created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    name VARCHAR(200) NOT NULL,          -- snapshot del nombre (por si cambia en carta)
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    extras JSONB DEFAULT '[]',           -- [{name, price}]
    notes TEXT,                          -- "sin cebolla", "poco hecho"
    status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- CLIENTES (CRM)
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(20),
    points INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    visit_count INT DEFAULT 0,
    last_visit TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);

-- ============================================
-- UPSELLING Y REGLAS INTELIGENTES
-- ============================================
CREATE TABLE upsell_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trigger_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    suggest_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'complement', -- complement, upgrade, combo
    discount_percent DECIMAL(5,2) DEFAULT 0,
    message TEXT,                         -- "Acompana con una copa de vino?"
    priority INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upsell_rules_tenant ON upsell_rules(tenant_id);
CREATE INDEX idx_upsell_trigger ON upsell_rules(trigger_item_id);

CREATE TABLE time_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    day_of_week INT[],                   -- 0=domingo, 1=lunes...6=sábado
    start_hour TIME NOT NULL,
    end_hour TIME NOT NULL,
    label VARCHAR(100),                  -- "Especial mediodía", "Happy Hour"
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FIDELIZACIÓN
-- ============================================
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    reward_type VARCHAR(20) NOT NULL,    -- discount_percent, discount_amount, free_item
    reward_value DECIMAL(10,2),
    reward_item_id UUID REFERENCES menu_items(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MÉTRICAS DIARIAS (para dashboard y analytics)
-- ============================================
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    orders_count INT DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    avg_ticket DECIMAL(10,2) DEFAULT 0,
    customers_new INT DEFAULT 0,
    top_items JSONB DEFAULT '[]',        -- [{item_id, name, quantity, revenue}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_daily_metrics_tenant_date ON daily_metrics(tenant_id, date);

-- ============================================
-- SEED: PLANES
-- ============================================
INSERT INTO plans (name, display_name, price_monthly, price_yearly, max_menu_items, max_tables, max_staff, max_orders_month, has_online_ordering, has_upselling, has_crm, has_loyalty, has_custom_branding, has_analytics, has_whatsapp) VALUES
('starter', 'Starter', 29.00, 290.00, 30, 8, 2, 300, false, false, false, false, false, false, false),
('pro', 'Pro', 79.00, 790.00, 100, 25, 5, 2000, true, true, true, false, false, true, false),
('premium', 'Premium', 149.00, 1490.00, 999, 999, 20, 99999, true, true, true, true, true, true, true);
