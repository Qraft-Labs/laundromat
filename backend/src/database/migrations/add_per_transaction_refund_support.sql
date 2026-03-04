-- Migration: Add Per-Transaction Refund Support
-- Description: Adds target_payment_id and refund_type to refund_requests table
--              and updates the pending_refund_requests view
-- Date: 2026-02-12

-- =====================================================
-- 1. Add new columns to refund_requests table
-- =====================================================

-- target_payment_id: Links the refund request to a specific payment transaction
ALTER TABLE refund_requests
ADD COLUMN IF NOT EXISTS target_payment_id INTEGER REFERENCES payments(id);

-- refund_type: 'transaction' | 'order' | 'damage'
ALTER TABLE refund_requests
ADD COLUMN IF NOT EXISTS refund_type VARCHAR(20) NOT NULL DEFAULT 'order'
  CHECK (refund_type IN ('transaction', 'order', 'damage'));

-- Index for quick lookup of refund requests by target payment
CREATE INDEX IF NOT EXISTS idx_refund_requests_target_payment_id 
ON refund_requests(target_payment_id) WHERE target_payment_id IS NOT NULL;

-- =====================================================
-- 2. Drop and recreate the pending_refund_requests view with new fields
-- =====================================================
DROP VIEW IF EXISTS pending_refund_requests;

CREATE VIEW pending_refund_requests AS
SELECT 
  rr.id,
  rr.order_id,
  o.order_number,
  rr.requested_amount,
  rr.refund_reason,
  rr.payment_method,
  rr.transaction_reference,
  rr.notes,
  rr.status,
  rr.requested_at,
  rr.cancel_order,
  rr.target_payment_id,
  rr.refund_type,
  
  -- Requester details
  u_requester.email as requested_by_email,
  u_requester.full_name as requested_by_name,
  u_requester.role as requested_by_role,
  
  -- Order details
  o.total_amount as order_total,
  o.amount_paid as order_amount_paid,
  o.balance as order_balance,
  o.payment_status as order_payment_status,
  o.status as order_status,
  
  -- Customer details
  c.name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email,
  
  -- Target payment details (for per-transaction refunds)
  tp.amount as target_payment_amount,
  tp.payment_method as target_payment_method,
  tp.payment_date as target_payment_date,
  tp.transaction_reference as target_payment_reference,
  
  -- Calculate available for refund (order-level)
  (o.amount_paid - COALESCE(
    (SELECT SUM(ABS(amount)) 
     FROM payments 
     WHERE order_id = o.id AND is_refund = TRUE), 
    0
  )) as available_for_refund,
  
  -- Calculate available for refund on target payment (if per-transaction)
  CASE 
    WHEN rr.target_payment_id IS NOT NULL THEN
      tp.amount - COALESCE(
        (SELECT SUM(ABS(amount))
         FROM payments
         WHERE refunded_payment_id = rr.target_payment_id AND is_refund = TRUE),
        0
      )
    ELSE NULL
  END as target_payment_available,
  
  -- Check if request is valid
  CASE 
    WHEN rr.target_payment_id IS NOT NULL THEN
      -- For per-transaction: check against the specific payment available
      rr.requested_amount <= (
        tp.amount - COALESCE(
          (SELECT SUM(ABS(amount))
           FROM payments
           WHERE refunded_payment_id = rr.target_payment_id AND is_refund = TRUE),
          0
        )
      )
    ELSE
      -- For order-level: check against total available
      rr.requested_amount <= (o.amount_paid - COALESCE(
        (SELECT SUM(ABS(amount)) 
         FROM payments 
         WHERE order_id = o.id AND is_refund = TRUE), 
        0
      ))
  END as is_valid_amount

FROM refund_requests rr
JOIN orders o ON rr.order_id = o.id
JOIN users u_requester ON rr.requested_by = u_requester.id
JOIN customers c ON o.customer_id = c.id
LEFT JOIN payments tp ON rr.target_payment_id = tp.id;

-- =====================================================
-- 3. Add index on payments.refunded_payment_id for FK lookups
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payments_refunded_payment_id 
ON payments(refunded_payment_id) WHERE refunded_payment_id IS NOT NULL;

-- =====================================================
-- Done
-- =====================================================
SELECT 'Per-transaction refund migration completed successfully' as status;
