-- WhatsApp Messages Tracking Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'order_ready', 'payment', 'delivery', 'promotional', 'reminder'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'sent', 'delivered', 'read', 'failed', 'pending'
  whatsapp_message_id VARCHAR(100), -- Message ID from Twilio/WhatsApp
  cost_ugx DECIMAL(10,2) DEFAULT 193.00, -- Cost per message in UGX
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_whatsapp_id ON whatsapp_messages(whatsapp_message_id);

-- Add comment
COMMENT ON TABLE whatsapp_messages IS 'Tracks all WhatsApp messages sent to customers with delivery status';
