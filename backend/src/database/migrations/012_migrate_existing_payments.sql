-- Populate payments table with existing order payment data
-- This migrates historical payment data from orders table to the new payments table

INSERT INTO payments (
  order_id,
  customer_id,
  amount,
  payment_method,
  transaction_reference,
  payment_date,
  notes,
  created_by,
  created_at
)
SELECT 
  o.id as order_id,
  o.customer_id,
  o.amount_paid as amount,
  COALESCE(o.payment_method, 'CASH') as payment_method,
  o.transaction_reference,
  COALESCE(o.updated_at, o.created_at) as payment_date,
  CONCAT('Historical payment - Order ', o.order_number) as notes,
  o.user_id as created_by,
  o.created_at
FROM orders o
WHERE o.amount_paid > 0
  AND NOT EXISTS (
    -- Only insert if no payment record exists for this order yet
    SELECT 1 FROM payments p WHERE p.order_id = o.id
  )
ORDER BY o.created_at ASC;

-- Show results
SELECT 
  COUNT(*) as total_payments_migrated,
  COALESCE(SUM(amount), 0) as total_amount_migrated
FROM payments
WHERE notes LIKE 'Historical payment%';
