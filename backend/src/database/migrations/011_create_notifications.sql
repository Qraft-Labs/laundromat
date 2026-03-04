-- Notifications table for tracking system alerts and messages
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'PENDING_PAYMENT', 'ORDER_UPDATE', 'PAYMENT_ASSIGNED', 'SYSTEM_ALERT', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data (e.g., payment_id, order_id, transaction_reference)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for common queries (unread notifications for a user)
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

COMMENT ON TABLE notifications IS 'System notifications for users including payment alerts, order updates, and system messages';
COMMENT ON COLUMN notifications.type IS 'Notification type: PENDING_PAYMENT, ORDER_UPDATE, PAYMENT_ASSIGNED, SYSTEM_ALERT, LOW_INVENTORY, etc.';
COMMENT ON COLUMN notifications.data IS 'JSON data containing context-specific information like IDs, amounts, references';
