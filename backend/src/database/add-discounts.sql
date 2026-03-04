-- Add discount/promotional pricing columns to price_items table
ALTER TABLE price_items 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS discount_end_date TIMESTAMP;

-- Add comment explaining discount logic
COMMENT ON COLUMN price_items.discount_percentage IS 'Percentage discount (0-100) for promotional periods';
COMMENT ON COLUMN price_items.discount_start_date IS 'Start date/time for promotional discount';
COMMENT ON COLUMN price_items.discount_end_date IS 'End date/time for promotional discount';

-- Create function to calculate effective price with discount
CREATE OR REPLACE FUNCTION get_effective_price(
  original_price DECIMAL,
  discount_pct DECIMAL,
  start_date TIMESTAMP,
  end_date TIMESTAMP
) RETURNS DECIMAL AS $$
BEGIN
  -- Check if discount is active
  IF discount_pct > 0 
     AND start_date IS NOT NULL 
     AND end_date IS NOT NULL
     AND NOW() >= start_date 
     AND NOW() <= end_date THEN
    RETURN ROUND(original_price * (1 - discount_pct / 100));
  ELSE
    RETURN original_price;
  END IF;
END;
$$ LANGUAGE plpgsql;
