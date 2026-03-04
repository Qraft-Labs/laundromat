-- Add URA-compliant tax fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 18.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fiscal_verification_code VARCHAR(100);

-- Update existing orders to have proper tax calculations
UPDATE orders 
SET 
  subtotal = ROUND(total_amount / 1.18, 2),
  tax_rate = 18.00,
  tax_amount = ROUND(total_amount - (total_amount / 1.18), 2)
WHERE subtotal IS NULL OR subtotal = 0;

-- Generate invoice numbers for existing orders
UPDATE orders 
SET invoice_number = 'INV-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(id::text, 6, '0')
WHERE invoice_number IS NULL;

-- Create index for invoice lookup
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON orders(invoice_number);

COMMENT ON COLUMN orders.subtotal IS 'Amount before tax (VAT)';
COMMENT ON COLUMN orders.tax_rate IS 'Tax rate percentage (default 18% for Uganda VAT)';
COMMENT ON COLUMN orders.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN orders.invoice_number IS 'URA-compliant invoice number';
COMMENT ON COLUMN orders.fiscal_verification_code IS 'URA EFRIS verification code (when integrated)';
