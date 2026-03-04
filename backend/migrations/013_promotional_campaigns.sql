-- Promotional Campaigns Table
-- Business-created special offers (Christmas, festivals, promotional days)

CREATE TABLE IF NOT EXISTS promotional_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
  sms_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_customer_type VARCHAR(50) DEFAULT 'ALL', -- ALL, INDIVIDUAL, BUSINESS
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaign SMS Log - Track which customers received SMS
CREATE TABLE IF NOT EXISTS campaign_sms_log (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(50) NOT NULL,
  message_sent TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, FAILED
  UNIQUE(campaign_id, customer_id)
);

-- Indexes for performance
CREATE INDEX idx_campaigns_dates ON promotional_campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_active ON promotional_campaigns(is_active);
CREATE INDEX idx_campaign_sms_log_campaign ON campaign_sms_log(campaign_id);
CREATE INDEX idx_campaign_sms_log_customer ON campaign_sms_log(customer_id);
CREATE INDEX idx_campaign_sms_log_sent_at ON campaign_sms_log(sent_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON promotional_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_timestamp();

COMMENT ON TABLE promotional_campaigns IS 'Business-created promotional campaigns and special offers';
COMMENT ON COLUMN promotional_campaigns.discount_percentage IS 'Percentage discount (e.g., 20 for 20% off)';
COMMENT ON COLUMN promotional_campaigns.discount_amount IS 'Fixed amount discount in UGX';
COMMENT ON COLUMN promotional_campaigns.sms_message IS 'SMS template to send to customers';
COMMENT ON COLUMN promotional_campaigns.target_customer_type IS 'ALL, INDIVIDUAL, or BUSINESS - who receives this offer';
COMMENT ON TABLE campaign_sms_log IS 'Log of SMS sent to customers for each campaign';
