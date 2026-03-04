-- Create payments table to track all payment transactions
-- This provides a complete payment history separate from the orders table

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL, -- 'CASH', 'MOBILE_MONEY_MTN', 'MOBILE_MONEY_AIRTEL', 'BANK_TRANSFER'
  transaction_reference VARCHAR(255), -- Reference number for mobile money or bank transfers
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT, -- Additional notes about the payment
  created_by INTEGER REFERENCES users(id), -- User who recorded the payment
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Comments for documentation
COMMENT ON TABLE payments IS 'Complete payment transaction history for all orders';
COMMENT ON COLUMN payments.order_id IS 'Reference to the order this payment is for';
COMMENT ON COLUMN payments.customer_id IS 'Reference to the customer who made the payment';
COMMENT ON COLUMN payments.amount IS 'Amount paid in this transaction';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: CASH, MOBILE_MONEY_MTN, MOBILE_MONEY_AIRTEL, BANK_TRANSFER';
COMMENT ON COLUMN payments.transaction_reference IS 'Transaction reference number for mobile money or bank transfers';
COMMENT ON COLUMN payments.payment_date IS 'When the payment was made';
COMMENT ON COLUMN payments.notes IS 'Additional notes about the payment (e.g., assigned from pending payment)';
COMMENT ON COLUMN payments.created_by IS 'User who recorded/assigned this payment';
