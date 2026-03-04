-- Add refund support to payments table
-- Refunds are recorded as negative payment amounts

-- Drop the positive-only constraint on amount
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_check;

-- Add columns for refund tracking
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS is_refund BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refunded_payment_id INTEGER REFERENCES payments(id),
  ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP;

-- Create index for refund queries
CREATE INDEX IF NOT EXISTS idx_payments_is_refund ON payments(is_refund);
CREATE INDEX IF NOT EXISTS idx_payments_refunded_payment_id ON payments(refunded_payment_id);

-- Add comments for documentation
COMMENT ON COLUMN payments.is_refund IS 'TRUE if this is a refund transaction (negative amount)';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for the refund (required for refund transactions)';
COMMENT ON COLUMN payments.refunded_payment_id IS 'Reference to the original payment being refunded (for audit trail)';
COMMENT ON COLUMN payments.refund_date IS 'When the refund was processed';

-- Update trigger to set refund_date automatically
CREATE OR REPLACE FUNCTION set_refund_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_refund = TRUE AND NEW.refund_date IS NULL THEN
    NEW.refund_date := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_refund_date ON payments;
CREATE TRIGGER trigger_set_refund_date
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_refund_date();

-- Create view for easy refund reporting
CREATE OR REPLACE VIEW refund_summary AS
SELECT 
  p.id as refund_id,
  p.order_id,
  p.customer_id,
  o.order_number,
  c.name as customer_name,
  c.phone as customer_phone,
  ABS(p.amount) as refund_amount,  -- Show as positive for clarity
  p.payment_method,
  p.refund_reason,
  p.refund_date,
  p.created_by as refunded_by_user_id,
  u.full_name as refunded_by_staff,
  op.amount as original_payment_amount,
  op.payment_date as original_payment_date
FROM payments p
LEFT JOIN orders o ON p.order_id = o.id
LEFT JOIN customers c ON p.customer_id = c.id
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN payments op ON p.refunded_payment_id = op.id
WHERE p.is_refund = TRUE
ORDER BY p.refund_date DESC;

COMMENT ON VIEW refund_summary IS 'Summary of all refund transactions with order and customer details';

-- Add check to ensure refund has reason
ALTER TABLE payments
  ADD CONSTRAINT refund_must_have_reason 
  CHECK (
    (is_refund = FALSE) OR 
    (is_refund = TRUE AND refund_reason IS NOT NULL)
  );

-- Migration complete
SELECT 'Refund support added to payments table' as status;
