-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'CASH',
  receipt_number VARCHAR(100),
  
  -- Submitted by (cashier)
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Approval workflow
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  -- Rejection
  rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Add indexes
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by);
CREATE INDEX idx_expenses_approved_by ON expenses(approved_by);

-- Add comments
COMMENT ON TABLE expenses IS 'Daily expenses recorded by cashiers and approved by admins';
COMMENT ON COLUMN expenses.status IS 'PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN expenses.submitted_by IS 'User ID of cashier who recorded the expense';
COMMENT ON COLUMN expenses.approved_by IS 'User ID of admin who approved the expense';
