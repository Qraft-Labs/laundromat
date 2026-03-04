-- Create table for incoming mobile money payments that haven't been assigned to orders yet
CREATE TABLE IF NOT EXISTS pending_payments (
  id SERIAL PRIMARY KEY,
  transaction_reference VARCHAR(100) NOT NULL UNIQUE,
  payment_method VARCHAR(50) NOT NULL, -- 'MOBILE_MONEY_MTN' or 'MOBILE_MONEY_AIRTEL'
  amount DECIMAL(10, 2) NOT NULL,
  sender_phone VARCHAR(20),
  sender_name VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ASSIGNED', 'REJECTED'
  assigned_to_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_pending_payments_status ON pending_payments(status);
CREATE INDEX idx_pending_payments_transaction_ref ON pending_payments(transaction_reference);
CREATE INDEX idx_pending_payments_sender_phone ON pending_payments(sender_phone);

-- Comments
COMMENT ON TABLE pending_payments IS 'Stores incoming mobile money payments from API that need to be assigned to orders';
COMMENT ON COLUMN pending_payments.transaction_reference IS 'Unique transaction reference from mobile money provider';
COMMENT ON COLUMN pending_payments.sender_phone IS 'Phone number that sent the payment';
COMMENT ON COLUMN pending_payments.status IS 'PENDING: waiting to be assigned, ASSIGNED: linked to order, REJECTED: invalid/duplicate';
COMMENT ON COLUMN pending_payments.notes IS 'Cashier notes about the payment assignment';
