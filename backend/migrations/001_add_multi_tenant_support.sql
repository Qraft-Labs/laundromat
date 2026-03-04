-- Multi-Tenant Migration Script - Phase 1
-- Run this in your PostgreSQL database to start the multi-tenant transformation

BEGIN;

-- ============================================
-- STEP 1: Create Tenants Table
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_key VARCHAR(50) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    
    -- Contact Information
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    business_address TEXT,
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'trial',
    subscription_status VARCHAR(50) DEFAULT 'active',
    trial_ends_at TIMESTAMP,
    subscription_started_at TIMESTAMP,
    
    -- Branding & Customization
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1e40af',
    secondary_color VARCHAR(7) DEFAULT '#3b82f6',
    currency VARCHAR(3) DEFAULT 'UGX',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    
    -- Features & Limits
    max_users INT DEFAULT 5,
    max_orders_per_month INT DEFAULT 1000,
    features_enabled JSONB DEFAULT '{"sms": false, "whatsapp": false, "email": true}'::jsonb,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tenants_tenant_key ON tenants(tenant_key);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);

-- ============================================
-- STEP 2: Create Tenant Settings Table
-- ============================================

CREATE TABLE IF NOT EXISTS tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Business Settings
    business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00"}}'::jsonb,
    default_tax_rate DECIMAL(5,2) DEFAULT 18.00,
    tax_enabled BOOLEAN DEFAULT false,
    
    -- Order Settings
    order_number_prefix VARCHAR(10) DEFAULT 'ORD',
    invoice_number_prefix VARCHAR(10) DEFAULT 'INV',
    auto_generate_invoice BOOLEAN DEFAULT true,
    
    -- Payment Settings
    accepted_payment_methods JSONB DEFAULT '["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]'::jsonb,
    mobile_money_providers JSONB DEFAULT '{"MTN": "+256700000000", "AIRTEL": "+256750000000"}'::jsonb,
    
    -- Notification Settings
    sms_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT true,
    sms_provider VARCHAR(50) DEFAULT 'africastalking',
    
    -- Discount Settings
    max_discount_agent DECIMAL(5,2) DEFAULT 10.00,
    max_discount_manager DECIMAL(5,2) DEFAULT 20.00,
    max_discount_admin DECIMAL(5,2) DEFAULT 50.00,
    
    -- Receipt Settings
    receipt_footer_text TEXT,
    receipt_logo_url VARCHAR(500),
    show_company_details BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id)
);

-- ============================================
-- STEP 3: Create Platform Admins Table
-- ============================================

CREATE TABLE IF NOT EXISTS platform_admins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    permissions JSONB DEFAULT '["manage_tenants", "view_analytics", "manage_billing"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 4: Add tenant_id to Existing Tables
-- ============================================

-- Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);

-- Orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);

-- Order items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant_id ON order_items(tenant_id);

-- Payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);

-- Deliveries table
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tenant_id ON deliveries(tenant_id);

-- Price list table
ALTER TABLE price_list ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_price_list_tenant_id ON price_list(tenant_id);

-- Inventory items table
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);

-- Expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);

-- Payroll employees table
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_payroll_employees_tenant_id ON payroll_employees(tenant_id);

-- Delivery zones table
ALTER TABLE delivery_zones ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_tenant_id ON delivery_zones(tenant_id);

-- Fiscal years table
ALTER TABLE fiscal_years ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_tenant_id ON fiscal_years(tenant_id);

-- ============================================
-- STEP 5: Create Default Tenant from Existing Data
-- ============================================

-- Insert default tenant (Lush Laundry)
INSERT INTO tenants (
    tenant_key, 
    business_name, 
    subdomain, 
    contact_email,
    subscription_plan,
    subscription_status
) VALUES (
    'lush-laundry',
    'Lush Laundry',
    'lush-laundry',
    'admin@lushlaundry.com',
    'enterprise',
    'active'
) ON CONFLICT (tenant_key) DO NOTHING
RETURNING id;

-- Get the tenant ID (adjust this based on your actual first tenant ID)
DO $$
DECLARE
    default_tenant_id INT;
BEGIN
    SELECT id INTO default_tenant_id FROM tenants WHERE tenant_key = 'lush-laundry';
    
    -- Update all existing records with default tenant_id
    UPDATE users SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE customers SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE orders SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE order_items SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE payments SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE deliveries SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE price_list SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE inventory_items SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE expenses SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE payroll_employees SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE delivery_zones SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE fiscal_years SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    
    -- Create default settings for tenant
    INSERT INTO tenant_settings (tenant_id) 
    VALUES (default_tenant_id)
    ON CONFLICT (tenant_id) DO NOTHING;
    
    RAISE NOTICE 'Default tenant created with ID: %', default_tenant_id;
END $$;

-- ============================================
-- STEP 6: Make tenant_id NOT NULL (after data migration)
-- ============================================

-- Uncomment these lines AFTER verifying all data has tenant_id assigned
-- ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE customers ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE order_items ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE payments ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE deliveries ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE price_list ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE inventory_items ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE expenses ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE payroll_employees ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE delivery_zones ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE fiscal_years ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- STEP 7: Verification Queries
-- ============================================

-- Check tenant creation
SELECT * FROM tenants;

-- Check records without tenant_id (should be 0 after migration)
SELECT 
    (SELECT COUNT(*) FROM users WHERE tenant_id IS NULL) as users_without_tenant,
    (SELECT COUNT(*) FROM customers WHERE tenant_id IS NULL) as customers_without_tenant,
    (SELECT COUNT(*) FROM orders WHERE tenant_id IS NULL) as orders_without_tenant;

-- Show tenant distribution
SELECT 
    t.business_name,
    COUNT(DISTINCT u.id) as users,
    COUNT(DISTINCT c.id) as customers,
    COUNT(DISTINCT o.id) as orders
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN customers c ON t.id = c.tenant_id
LEFT JOIN orders o ON t.id = o.tenant_id
GROUP BY t.id, t.business_name;

COMMIT;

-- ============================================
-- SUCCESS!
-- ============================================
-- Next steps:
-- 1. Verify all data has tenant_id assigned
-- 2. Update backend code to use tenant middleware
-- 3. Test thoroughly before making tenant_id NOT NULL
-- 4. Deploy changes gradually
-- ============================================
