-- Create promotions/campaigns table for special offers
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active promotions
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

COMMENT ON TABLE promotions IS 'Special offers and promotional campaigns';
COMMENT ON COLUMN promotions.name IS 'Campaign name (e.g., Christmas Discount, Easter Special)';
COMMENT ON COLUMN promotions.discount_percentage IS 'Discount percentage for this promotion';
COMMENT ON COLUMN promotions.message IS 'SMS message to send to customers';
COMMENT ON COLUMN promotions.is_active IS 'Whether this promotion is currently active';
COMMENT ON COLUMN promotions.sms_sent IS 'Whether SMS has been sent to customers';
