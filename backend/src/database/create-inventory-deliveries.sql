-- Create inventory_items table for tracking supplies
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- DETERGENT, PACKAGING, HANGER, ACCESSORY, EQUIPMENT, CHEMICAL, OTHER
  unit VARCHAR(50) NOT NULL, -- kg, liters, pieces, boxes, units
  quantity_in_stock DECIMAL(10, 2) DEFAULT 0,
  reorder_level DECIMAL(10, 2) NOT NULL DEFAULT 10,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  supplier VARCHAR(255),
  last_restock_date TIMESTAMP,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_transactions table for tracking stock movements
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- RESTOCK, USAGE, ADJUSTMENT, WASTAGE
  quantity DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  reference_order_id INTEGER REFERENCES orders(id),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table for pickup/delivery management
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_type VARCHAR(50) NOT NULL, -- PICKUP, DELIVERY
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(50), -- MORNING (8AM-12PM), AFTERNOON (12PM-4PM), EVENING (4PM-8PM)
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  vehicle_number VARCHAR(50),
  delivery_status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_TRANSIT, COMPLETED, FAILED
  actual_delivery_time TIMESTAMP,
  customer_signature TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);

-- Add comments
COMMENT ON TABLE inventory_items IS 'Tracks all inventory items (detergents, packaging, etc.)';
COMMENT ON TABLE inventory_transactions IS 'Records all stock movements';
COMMENT ON TABLE deliveries IS 'Manages customer pickup and delivery schedules';
COMMENT ON COLUMN inventory_items.reorder_level IS 'Minimum stock level before reordering';
COMMENT ON COLUMN deliveries.delivery_type IS 'PICKUP = Customer collects, DELIVERY = We deliver to customer';
