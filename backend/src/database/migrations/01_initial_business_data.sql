-- ============================================================
-- INITIAL SETUP DATA - After Production Deployment
-- ============================================================
-- Run this AFTER deploying clean database structure
-- This adds essential business data to get started
-- ============================================================

-- ============================================================
-- 1. CREATE YOUR ADMIN ACCOUNT (If using email/password)
-- ============================================================
-- If using Google OAuth, skip this - your account is created automatically on first login

-- Example: Create admin account (REPLACE with your details)
-- Password: Use bcrypt hashed password (generate using: node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))")

/*
INSERT INTO users (email, password, full_name, phone, role, status, auth_provider)
VALUES (
    'admin@lushlaundry.com',                    -- Your email
    '$2a$10$YourBcryptHashedPasswordHere',      -- Generate with bcryptjs
    'Your Full Name',                            -- Your name
    '0700000000',                                -- Your phone
    'ADMIN',
    'ACTIVE',
    'EMAIL'
);
*/

-- ============================================================
-- 2. PRICE LIST (Your Laundry Services)
-- ============================================================
-- Add your actual services and prices
-- This is what customers will see when creating orders

-- Example services (CUSTOMIZE for your business):

INSERT INTO price_items (item_name, price, category, description, is_active)
VALUES 
    -- Laundry Services
    ('Shirt - Wash & Iron', 3000.00, 'Laundry', 'Regular shirt washing and ironing', TRUE),
    ('T-Shirt - Wash & Iron', 2500.00, 'Laundry', 'T-shirt washing and ironing', TRUE),
    ('Trouser - Wash & Iron', 4000.00, 'Laundry', 'Trouser washing and ironing', TRUE),
    ('Jeans - Wash & Iron', 4500.00, 'Laundry', 'Jeans washing and ironing', TRUE),
    ('Dress - Wash & Iron', 5000.00, 'Laundry', 'Ladies dress washing and ironing', TRUE),
    ('Skirt - Wash & Iron', 3500.00, 'Laundry', 'Skirt washing and ironing', TRUE),
    ('Blouse - Wash & Iron', 3000.00, 'Laundry', 'Blouse washing and ironing', TRUE),
    
    -- Dry Cleaning
    ('Suit - Dry Clean', 15000.00, 'Dry Cleaning', 'Full suit dry cleaning', TRUE),
    ('Suit Jacket - Dry Clean', 8000.00, 'Dry Cleaning', 'Suit jacket only', TRUE),
    ('Coat - Dry Clean', 10000.00, 'Dry Cleaning', 'Heavy coat dry cleaning', TRUE),
    ('Tie - Dry Clean', 2000.00, 'Dry Cleaning', 'Tie dry cleaning', TRUE),
    
    -- Bedding
    ('Bed Sheet - Single', 5000.00, 'Bedding', 'Single bed sheet washing', TRUE),
    ('Bed Sheet - Double', 6000.00, 'Bedding', 'Double bed sheet washing', TRUE),
    ('Duvet Cover - Single', 6000.00, 'Bedding', 'Single duvet cover', TRUE),
    ('Duvet Cover - Double', 8000.00, 'Bedding', 'Double duvet cover', TRUE),
    ('Blanket', 7000.00, 'Bedding', 'Blanket washing', TRUE),
    ('Pillow Case', 1500.00, 'Bedding', 'Pillow case washing', TRUE),
    
    -- Special Items
    ('Curtains - Per Panel', 5000.00, 'Special', 'Curtain panel washing', TRUE),
    ('Table Cloth', 4000.00, 'Special', 'Table cloth washing and ironing', TRUE),
    ('Towel - Large', 2500.00, 'Special', 'Large towel washing', TRUE),
    ('Towel - Small', 1500.00, 'Special', 'Small towel washing', TRUE),
    
    -- Express Services (Higher prices for rush)
    ('Express Service - 2 Hours', 10000.00, 'Express', 'Rush service completed in 2 hours', TRUE),
    ('Express Service - Same Day', 5000.00, 'Express', 'Same day delivery', TRUE)
ON CONFLICT (item_name) DO NOTHING;

-- ============================================================
-- 3. EXPENSE CATEGORIES
-- ============================================================
-- Categories for tracking business expenses

INSERT INTO expense_categories (name, description, is_active)
VALUES 
    ('Utilities', 'Water, electricity, internet bills', TRUE),
    ('Salaries', 'Staff wages and payments', TRUE),
    ('Supplies', 'Detergent, softener, hangers, plastic bags', TRUE),
    ('Equipment', 'Washing machines, irons, maintenance', TRUE),
    ('Rent', 'Shop/office rent payments', TRUE),
    ('Transport', 'Delivery and pickup transport costs', TRUE),
    ('Marketing', 'Advertising and promotional materials', TRUE),
    ('Repairs', 'Equipment repairs and maintenance', TRUE),
    ('Licenses', 'Business licenses and permits', TRUE),
    ('Miscellaneous', 'Other business expenses', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. INVENTORY ITEMS (Optional - If you track inventory)
-- ============================================================
-- Track detergents, supplies, packaging materials

/*
INSERT INTO inventory_items (item_name, category, quantity, unit, unit_cost, reorder_level, notes)
VALUES 
    ('Detergent - Ariel (5kg)', 'Cleaning Supplies', 10, 'bags', 25000.00, 3, 'Main laundry detergent'),
    ('Fabric Softener (2L)', 'Cleaning Supplies', 8, 'bottles', 15000.00, 2, 'For soft finish'),
    ('Bleach (1L)', 'Cleaning Supplies', 5, 'bottles', 8000.00, 2, 'For white items'),
    ('Starch Spray', 'Cleaning Supplies', 6, 'cans', 5000.00, 2, 'For ironing'),
    ('Plastic Hangers', 'Packaging', 200, 'pieces', 500.00, 50, 'For hanging clothes'),
    ('Plastic Bags - Large', 'Packaging', 500, 'pieces', 300.00, 100, 'For packaging orders'),
    ('Plastic Bags - Medium', 'Packaging', 300, 'pieces', 200.00, 50, 'For small orders'),
    ('Tags/Labels', 'Packaging', 1000, 'pieces', 100.00, 200, 'For labeling orders')
ON CONFLICT (item_name) DO NOTHING;
*/

-- ============================================================
-- 5. CREATE STAFF ACCOUNTS (After your admin)
-- ============================================================
-- Add cashiers or desktop agents

/*
-- Example: Create cashier account
INSERT INTO users (email, password, full_name, phone, role, status, auth_provider, must_change_password)
VALUES (
    'cashier@lushlaundry.com',
    '$2a$10$YourBcryptHashedPasswordHere',      -- Temporary password, they'll change it
    'Cashier Name',
    '0700000001',
    'DESKTOP_AGENT',
    'ACTIVE',
    'EMAIL',
    TRUE                                         -- Force password change on first login
);
*/

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify your setup

-- Check price items added
-- SELECT COUNT(*), category FROM price_items GROUP BY category;

-- Check expense categories
-- SELECT * FROM expense_categories WHERE is_active = TRUE;

-- Check users created
-- SELECT id, email, full_name, role, status FROM users;

-- Check inventory (if added)
-- SELECT item_name, quantity, unit, reorder_level FROM inventory_items;

-- ============================================================
-- SETUP COMPLETE!
-- ============================================================
-- Your system is now ready to:
-- 1. Accept customer registrations
-- 2. Create orders with your price list
-- 3. Track expenses by category
-- 4. Manage inventory (if enabled)
-- 
-- Next steps:
-- - Login to your admin account
-- - Test creating a customer
-- - Test creating an order
-- - You're live! 🚀
-- ============================================================

COMMIT;
