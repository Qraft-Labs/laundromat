-- Create announcements table to track sent announcements/promotions
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  customer_type VARCHAR(50) DEFAULT 'all', -- 'all', 'active', 'inactive'
  discount_percentage INTEGER DEFAULT 0,
  sent_by INTEGER REFERENCES users(id),
  customers_reached INTEGER DEFAULT 0,
  customers_failed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create scheduled_announcements table for festival/holiday promotions
CREATE TABLE IF NOT EXISTS scheduled_announcements (
  id SERIAL PRIMARY KEY,
  festival_name VARCHAR(255) NOT NULL,
  scheduled_date DATE NOT NULL,
  message TEXT NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_announcements_date ON scheduled_announcements(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_announcements_status ON scheduled_announcements(status);

-- Add comment
COMMENT ON TABLE announcements IS 'Tracks all announcements/promotions sent to customers';
COMMENT ON TABLE scheduled_announcements IS 'Scheduled festival/holiday announcements';
