-- Create customers matching the pending payment senders
INSERT INTO customers (customer_id, name, phone, customer_type, created_at) VALUES
('CUST20260305', 'Sarah Nakato', '256700123456', 'INDIVIDUAL', '2026-01-17 15:00:00'),
('CUST20260306', 'David Okello', '256700987654', 'INDIVIDUAL', '2026-01-17 16:00:00'),
('CUST20260307', 'Grace Namuli', '256750111222', 'INDIVIDUAL', '2026-01-17 17:00:00'),
('CUST20260308', 'John Kiprotich', '256700555666', 'INDIVIDUAL', '2026-01-18 08:00:00'),
('CUST20260309', 'Mary Achieng', '256750333444', 'INDIVIDUAL', '2026-01-18 09:00:00');

-- Get the customer IDs we just created
DO $$
DECLARE
    sarah_id INT;
    david_id INT;
    grace_id INT;
    john_id INT;
    mary_id INT;
BEGIN
    -- Get customer IDs
    SELECT id INTO sarah_id FROM customers WHERE phone = '256700123456';
    SELECT id INTO david_id FROM customers WHERE phone = '256700987654';
    SELECT id INTO grace_id FROM customers WHERE phone = '256750111222';
    SELECT id INTO john_id FROM customers WHERE phone = '256700555666';
    SELECT id INTO mary_id FROM customers WHERE phone = '256750333444';

    -- Create orders for each customer with amounts matching their pending payments
    
    -- Order 1: Sarah Nakato - UGX 75,000 (UNPAID, ready to receive payment)
    INSERT INTO orders (order_number, customer_id, user_id, subtotal, total, total_amount, payment_status, payment_method, amount_paid, balance, order_status, created_at, updated_at)
    VALUES ('ORD20260870', sarah_id, 4, 75000, 75000, 75000, 'UNPAID', NULL, 0, 75000, 'RECEIVED', '2026-01-17 15:30:00', '2026-01-17 15:30:00');

    -- Order 2: David Okello - UGX 120,000 (UNPAID)
    INSERT INTO orders (order_number, customer_id, user_id, subtotal, total, total_amount, payment_status, payment_method, amount_paid, balance, order_status, created_at, updated_at)
    VALUES ('ORD20260871', david_id, 4, 120000, 120000, 120000, 'UNPAID', NULL, 0, 120000, 'RECEIVED', '2026-01-17 16:30:00', '2026-01-17 16:30:00');

    -- Order 3: Grace Namuli - UGX 50,000 (UNPAID)
    INSERT INTO orders (order_number, customer_id, user_id, subtotal, total, total_amount, payment_status, payment_method, amount_paid, balance, order_status, created_at, updated_at)
    VALUES ('ORD20260872', grace_id, 5, 50000, 50000, 50000, 'UNPAID', NULL, 0, 50000, 'RECEIVED', '2026-01-17 17:30:00', '2026-01-17 17:30:00');

    -- Order 4: John Kiprotich - UGX 200,000 (UNPAID)
    INSERT INTO orders (order_number, customer_id, user_id, subtotal, total, total_amount, payment_status, payment_method, amount_paid, balance, order_status, created_at, updated_at)
    VALUES ('ORD20260873', john_id, 4, 200000, 200000, 200000, 'UNPAID', NULL, 0, 200000, 'RECEIVED', '2026-01-18 08:30:00', '2026-01-18 08:30:00');

    -- Order 5: Mary Achieng - UGX 95,000 (UNPAID)
    INSERT INTO orders (order_number, customer_id, user_id, subtotal, total, total_amount, payment_status, payment_method, amount_paid, balance, order_status, created_at, updated_at)
    VALUES ('ORD20260874', mary_id, 5, 95000, 95000, 95000, 'UNPAID', NULL, 0, 95000, 'RECEIVED', '2026-01-18 09:30:00', '2026-01-18 09:30:00');

END $$;

-- Verify the data
SELECT 
    o.order_number,
    c.name as customer_name,
    c.phone,
    o.total_amount,
    o.payment_status,
    o.order_status
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_number IN ('ORD20260870', 'ORD20260871', 'ORD20260872', 'ORD20260873', 'ORD20260874')
ORDER BY o.created_at;
