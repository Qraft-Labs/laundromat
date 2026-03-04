-- Migration: Add Refund Approval Workflow
-- Description: Adds refund_requests table for desktop agent approval workflow
-- Date: 2024-02-10

-- =====================================================
-- 1. Create refund_requests table
-- =====================================================
CREATE TABLE IF NOT EXISTS refund_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_amount INTEGER NOT NULL CHECK (requested_amount > 0),
  refund_reason TEXT NOT NULL CHECK (LENGTH(refund_reason) >= 10),
  payment_method VARCHAR(50) DEFAULT 'CASH',
  transaction_reference VARCHAR(255),
  notes TEXT,
  
  -- Request metadata
  requested_by INTEGER NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Approval workflow
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- If approved, links to actual refund payment
  refund_payment_id INTEGER REFERENCES payments(id),
  
  -- Cancel order on approval
  cancel_order BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================
CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE INDEX idx_refund_requests_requested_by ON refund_requests(requested_by);
CREATE INDEX idx_refund_requests_reviewed_by ON refund_requests(reviewed_by);
CREATE INDEX idx_refund_requests_requested_at ON refund_requests(requested_at DESC);

-- =====================================================
-- 3. Create view for pending refund requests with details
-- =====================================================
CREATE OR REPLACE VIEW pending_refund_requests AS
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
  
  -- Calculate available for refund
  (o.amount_paid - COALESCE(
    (SELECT SUM(ABS(amount)) 
     FROM payments 
     WHERE order_id = o.id AND is_refund = TRUE), 
    0
  )) as available_for_refund,
  
  -- Check if request is valid
  CASE 
    WHEN rr.requested_amount <= (o.amount_paid - COALESCE(
      (SELECT SUM(ABS(amount)) 
       FROM payments 
       WHERE order_id = o.id AND is_refund = TRUE), 
      0
    )) THEN TRUE
    ELSE FALSE
  END as is_valid_amount

FROM refund_requests rr
JOIN orders o ON rr.order_id = o.id
JOIN customers c ON o.customer_id = c.id
JOIN users u_requester ON rr.requested_by = u_requester.id
WHERE rr.status = 'PENDING'
ORDER BY rr.requested_at ASC;

-- =====================================================
-- 4. Create trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_refund_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refund_request_updated_at
  BEFORE UPDATE ON refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_refund_request_timestamp();

-- =====================================================
-- 5. Comments for documentation
-- =====================================================
COMMENT ON TABLE refund_requests IS 'Stores refund requests from desktop agents requiring admin approval';
COMMENT ON COLUMN refund_requests.status IS 'PENDING: Awaiting approval, APPROVED: Admin approved and refund processed, REJECTED: Admin rejected request';
COMMENT ON COLUMN refund_requests.refund_payment_id IS 'Links to the actual payment record created when request is approved';
COMMENT ON COLUMN refund_requests.cancel_order IS 'Whether to auto-cancel order if full refund is approved';
COMMENT ON VIEW pending_refund_requests IS 'Shows all pending refund requests with order, customer, and requester details for admin review';

-- =====================================================
-- 6. Sample query to check pending requests
-- =====================================================
-- SELECT * FROM pending_refund_requests;
