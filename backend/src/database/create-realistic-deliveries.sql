-- Enhanced deliveries table with realistic Ugandan zones and workflow
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS delivery_drivers CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;

-- Create delivery zones table (Kampala & surrounding areas)
CREATE TABLE delivery_zones (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL UNIQUE,
  zone_code VARCHAR(20) NOT NULL UNIQUE,
  area_description TEXT,
  base_delivery_cost DECIMAL(10, 2) NOT NULL DEFAULT 0, -- in UGX
  estimated_delivery_time_minutes INTEGER DEFAULT 30, -- average time
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery drivers table
CREATE TABLE delivery_drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50), -- MOTORCYCLE, VAN, PICKUP
  vehicle_number VARCHAR(50),
  license_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_DELIVERY, OFF_DUTY, UNAVAILABLE
  total_deliveries INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced deliveries table with proper workflow
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_type VARCHAR(50) NOT NULL, -- PICKUP, DELIVERY
  delivery_zone_id INTEGER REFERENCES delivery_zones(id),
  delivery_address TEXT,
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(50), -- MORNING (8AM-12PM), AFTERNOON (12PM-4PM), EVENING (4PM-8PM)
  
  -- Driver assignment
  driver_id INTEGER REFERENCES delivery_drivers(id),
  
  -- Status workflow: PENDING → ASSIGNED → IN_TRANSIT → DELIVERED/FAILED
  delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
  
  -- Tracking timestamps
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Additional info
  customer_signature TEXT,
  delivery_notes TEXT,
  failed_reason TEXT,
  customer_feedback TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  
  -- Metadata
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert realistic Kampala delivery zones
INSERT INTO delivery_zones (zone_name, zone_code, area_description, base_delivery_cost, estimated_delivery_time_minutes) VALUES
-- Central Kampala (Close - Low cost)
('Kampala Central', 'KLA-CTR', 'City Center, William Street, Market Street, Ben Kiwanuka Street', 5000, 15),
('Nakasero', 'KLA-NKS', 'Nakasero Hill, Parliament Avenue, Government offices area', 6000, 20),
('Kololo', 'KLA-KOL', 'Kololo Hill, Embassy area, Acacia Avenue, Tank Hill', 7000, 20),
('Bugolobi', 'KLA-BUG', 'Bugolobi, Luthuli Avenue, Spring Road', 8000, 25),

-- North Kampala
('Kamwokya', 'KLA-KMW', 'Kamwokya, Kira Road, Bukoto', 8000, 25),
('Ntinda', 'KLA-NTD', 'Ntinda, Stretcher Road, Ntinda Shopping Complex', 10000, 30),
('Naguru', 'KLA-NGR', 'Naguru, Kyambogo Road, UBC area', 9000, 25),
('Mulago', 'KLA-MLG', 'Mulago Hospital area, Makerere University', 8000, 25),

-- East Kampala
('Nakawa', 'KLA-NKW', 'Nakawa Industrial Area, Port Bell Road', 9000, 30),
('Banda', 'KLA-BND', 'Banda, Kireka, Namugongo Road', 12000, 35),
('Bweyogerere', 'KLA-BWY', 'Bweyogerere, Seeta, Namugongo', 15000, 45),

-- South Kampala
('Nsambya', 'KLA-NSM', 'Nsambya, Ggaba Road, Tank Hill', 8000, 25),
('Kabalagala', 'KLA-KBL', 'Kabalagala, Ggaba Road, Kansanga', 9000, 30),
('Muyenga', 'KLA-MYG', 'Muyenga Hill, Tank Hill, Bukasa', 10000, 30),

-- West Kampala
('Mengo', 'KLA-MNG', 'Mengo, Lubaga, Namirembe', 7000, 25),
('Rubaga', 'KLA-RBG', 'Rubaga Hill, Namirembe Road', 8000, 25),
('Ndeeba', 'KLA-NDB', 'Ndeeba, Kibuye, Nsangi Road', 9000, 30),
('Natete', 'KLA-NTT', 'Natete, Busega, Masaka Road', 10000, 35),

-- Outer Kampala (Far - Higher cost)
('Nansana', 'WKP-NNS', 'Nansana, Nabweru, Hoima Road', 15000, 45),
('Kira', 'WKP-KRA', 'Kira Town, Namugongo', 18000, 50),
('Entebbe Road', 'WKP-ENT', 'Entebbe Road, Kajjansi, Bwebajja', 20000, 60),
('Mukono', 'EKP-MKN', 'Mukono Town, Seeta', 25000, 70);

-- Insert realistic delivery drivers
INSERT INTO delivery_drivers (name, phone, vehicle_type, vehicle_number, license_number, total_deliveries, rating) VALUES
('Ssemakula Patrick', '+256772345678', 'MOTORCYCLE', 'UBD 234K', 'DL12345678', 450, 4.8),
('Nakato Sarah', '+256753456789', 'MOTORCYCLE', 'UBE 567M', 'DL23456789', 380, 4.9),
('Mukasa John', '+256701234567', 'VAN', 'UAM 890N', 'DL34567890', 520, 4.7),
('Nambi Grace', '+256782345678', 'MOTORCYCLE', 'UBC 123P', 'DL45678901', 290, 4.85),
('Okello David', '+256754567890', 'VAN', 'UAN 456Q', 'DL56789012', 410, 4.75),
('Nakabugo Mary', '+256703456789', 'MOTORCYCLE', 'UBF 789R', 'DL67890123', 350, 4.9),
('Wasswa Moses', '+256781234567', 'PICKUP', 'UAP 012S', 'DL78901234', 480, 4.6),
('Auma Christine', '+256752345678', 'MOTORCYCLE', 'UBG 345T', 'DL89012345', 310, 4.8);

-- Create indexes for performance
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX idx_deliveries_date ON deliveries(scheduled_date);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_zone ON deliveries(delivery_zone_id);
CREATE INDEX idx_delivery_drivers_status ON delivery_drivers(status);
CREATE INDEX idx_delivery_zones_active ON delivery_zones(is_active);

-- Add comments
COMMENT ON TABLE delivery_zones IS 'Kampala delivery zones with pricing';
COMMENT ON TABLE delivery_drivers IS 'Active delivery drivers and their details';
COMMENT ON TABLE deliveries IS 'Complete delivery workflow tracking';
COMMENT ON COLUMN deliveries.delivery_status IS 'PENDING→ASSIGNED→IN_TRANSIT→DELIVERED/FAILED/CANCELLED';
COMMENT ON COLUMN deliveries.delivery_type IS 'PICKUP = Customer collects from shop, DELIVERY = We deliver to customer';
COMMENT ON COLUMN delivery_drivers.status IS 'Current availability status of driver';

-- Create function to auto-update driver status
CREATE OR REPLACE FUNCTION update_driver_delivery_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_status = 'DELIVERED' AND (OLD.delivery_status IS NULL OR OLD.delivery_status != 'DELIVERED') THEN
    UPDATE delivery_drivers
    SET total_deliveries = total_deliveries + 1
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_delivery_count
AFTER UPDATE ON deliveries
FOR EACH ROW
EXECUTE FUNCTION update_driver_delivery_count();
