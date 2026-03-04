-- Insert test data for pending payments and notifications

-- Insert 5 test pending payments
INSERT INTO pending_payments (transaction_reference, payment_method, amount, sender_phone, sender_name, payment_date, status) VALUES
('MTN2026011801', 'MTN Mobile Money', 75000.00, '256700123456', 'Sarah Nakato', '2026-01-18 09:15:00', 'PENDING'),
('MTN2026011802', 'MTN Mobile Money', 120000.00, '256700987654', 'David Okello', '2026-01-18 10:30:00', 'PENDING'),
('AIRTEL2026011803', 'Airtel Money', 50000.00, '256750111222', 'Grace Namuli', '2026-01-18 11:45:00', 'PENDING'),
('MTN2026011804', 'MTN Mobile Money', 200000.00, '256700555666', 'John Kiprotich', '2026-01-18 13:20:00', 'PENDING'),
('AIRTEL2026011805', 'Airtel Money', 95000.00, '256750333444', 'Mary Achieng', '2026-01-18 14:50:00', 'PENDING');

-- Create notifications for both users (Admin and Cashier) for each payment
INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) VALUES
-- Payment 1: Sarah Nakato - UGX 75,000 (both users get notification)
(4, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 75,000 from 256700123456 (Sarah Nakato) needs to be assigned to an order', '{"pending_payment_id": 1, "transaction_reference": "MTN2026011801", "amount": 75000, "sender_phone": "256700123456", "sender_name": "Sarah Nakato", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 09:15:00'),
(5, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 75,000 from 256700123456 (Sarah Nakato) needs to be assigned to an order', '{"pending_payment_id": 1, "transaction_reference": "MTN2026011801", "amount": 75000, "sender_phone": "256700123456", "sender_name": "Sarah Nakato", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 09:15:00'),

-- Payment 2: David Okello - UGX 120,000
(4, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 120,000 from 256700987654 (David Okello) needs to be assigned to an order', '{"pending_payment_id": 2, "transaction_reference": "MTN2026011802", "amount": 120000, "sender_phone": "256700987654", "sender_name": "David Okello", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 10:30:00'),
(5, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 120,000 from 256700987654 (David Okello) needs to be assigned to an order', '{"pending_payment_id": 2, "transaction_reference": "MTN2026011802", "amount": 120000, "sender_phone": "256700987654", "sender_name": "David Okello", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 10:30:00'),

-- Payment 3: Grace Namuli - UGX 50,000
(4, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'Airtel Money payment of UGX 50,000 from 256750111222 (Grace Namuli) needs to be assigned to an order', '{"pending_payment_id": 3, "transaction_reference": "AIRTEL2026011803", "amount": 50000, "sender_phone": "256750111222", "sender_name": "Grace Namuli", "payment_method": "Airtel Money"}', FALSE, '2026-01-18 11:45:00'),
(5, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'Airtel Money payment of UGX 50,000 from 256750111222 (Grace Namuli) needs to be assigned to an order', '{"pending_payment_id": 3, "transaction_reference": "AIRTEL2026011803", "amount": 50000, "sender_phone": "256750111222", "sender_name": "Grace Namuli", "payment_method": "Airtel Money"}', FALSE, '2026-01-18 11:45:00'),

-- Payment 4: John Kiprotich - UGX 200,000
(4, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 200,000 from 256700555666 (John Kiprotich) needs to be assigned to an order', '{"pending_payment_id": 4, "transaction_reference": "MTN2026011804", "amount": 200000, "sender_phone": "256700555666", "sender_name": "John Kiprotich", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 13:20:00'),
(5, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'MTN Mobile Money payment of UGX 200,000 from 256700555666 (John Kiprotich) needs to be assigned to an order', '{"pending_payment_id": 4, "transaction_reference": "MTN2026011804", "amount": 200000, "sender_phone": "256700555666", "sender_name": "John Kiprotich", "payment_method": "MTN Mobile Money"}', FALSE, '2026-01-18 13:20:00'),

-- Payment 5: Mary Achieng - UGX 95,000
(4, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'Airtel Money payment of UGX 95,000 from 256750333444 (Mary Achieng) needs to be assigned to an order', '{"pending_payment_id": 5, "transaction_reference": "AIRTEL2026011805", "amount": 95000, "sender_phone": "256750333444", "sender_name": "Mary Achieng", "payment_method": "Airtel Money"}', FALSE, '2026-01-18 14:50:00'),
(5, 'PENDING_PAYMENT', 'New Mobile Money Payment Received', 'Airtel Money payment of UGX 95,000 from 256750333444 (Mary Achieng) needs to be assigned to an order', '{"pending_payment_id": 5, "transaction_reference": "AIRTEL2026011805", "amount": 95000, "sender_phone": "256750333444", "sender_name": "Mary Achieng", "payment_method": "Airtel Money"}', FALSE, '2026-01-18 14:50:00');
