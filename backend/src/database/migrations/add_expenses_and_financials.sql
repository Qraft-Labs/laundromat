-- Create expense_categories table for organizing expenses
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create expenses table for daily expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id INTEGER REFERENCES expense_categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) DEFAULT 'CASH', -- CASH, MOBILE_MONEY, BANK_TRANSFER, CARD
  paid_to VARCHAR(255), -- Who received the payment
  receipt_number VARCHAR(100),
  notes TEXT,
  recorded_by INTEGER REFERENCES users(id) NOT NULL,
  approved_by INTEGER REFERENCES users(id),
  approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create financial_summary table for quick access to financial metrics
CREATE TABLE IF NOT EXISTS financial_summary (
  id SERIAL PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(12, 2) DEFAULT 0, -- From orders
  total_expenses DECIMAL(12, 2) DEFAULT 0, -- From expenses table
  net_profit DECIMAL(12, 2) DEFAULT 0, -- Revenue - Expenses
  orders_count INTEGER DEFAULT 0,
  expenses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO expense_categories (name, description, color) VALUES
  ('Salaries & Wages', 'Employee salaries and casual workers', '#10b981'),
  ('Transport', 'Transport charges and fuel', '#3b82f6'),
  ('Utilities', 'Electricity, water, internet', '#f59e0b'),
  ('Supplies', 'Cleaning supplies, packaging materials', '#8b5cf6'),
  ('Maintenance', 'Equipment repairs and maintenance', '#ef4444'),
  ('Rent', 'Office/shop rent payments', '#ec4899'),
  ('Marketing', 'Advertising and promotional expenses', '#06b6d4'),
  ('Miscellaneous', 'Other expenses', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_recorded_by ON expenses(recorded_by);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_financial_summary_date ON financial_summary(summary_date DESC);

-- Create function to update financial summary
CREATE OR REPLACE FUNCTION update_financial_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert financial summary for the expense date
  INSERT INTO financial_summary (summary_date, total_expenses, expenses_count, updated_at)
  VALUES (
    NEW.expense_date,
    NEW.amount,
    1,
    NOW()
  )
  ON CONFLICT (summary_date) 
  DO UPDATE SET
    total_expenses = financial_summary.total_expenses + NEW.amount,
    expenses_count = financial_summary.expenses_count + 1,
    net_profit = financial_summary.total_revenue - (financial_summary.total_expenses + NEW.amount),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update financial summary when expense is added
CREATE TRIGGER trigger_update_financial_summary
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_financial_summary();

-- Create function to update revenue from orders
CREATE OR REPLACE FUNCTION update_revenue_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert financial summary for the order date
  INSERT INTO financial_summary (summary_date, total_revenue, orders_count, updated_at)
  VALUES (
    DATE(NEW.created_at),
    NEW.total_amount,
    1,
    NOW()
  )
  ON CONFLICT (summary_date) 
  DO UPDATE SET
    total_revenue = financial_summary.total_revenue + NEW.total_amount,
    orders_count = financial_summary.orders_count + 1,
    net_profit = (financial_summary.total_revenue + NEW.total_amount) - financial_summary.total_expenses,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update revenue when order is created
CREATE TRIGGER trigger_update_revenue_summary
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_revenue_summary();

-- Add comments
COMMENT ON TABLE expenses IS 'Daily expense tracking for operational costs';
COMMENT ON TABLE expense_categories IS 'Categories for organizing expenses';
COMMENT ON TABLE financial_summary IS 'Daily financial summary for quick reporting';
COMMENT ON COLUMN expenses.approval_status IS 'PENDING: awaiting approval, APPROVED: approved by admin, REJECTED: rejected';
COMMENT ON COLUMN expenses.payment_method IS 'Payment method used: CASH, MOBILE_MONEY, BANK_TRANSFER, CARD';
