-- Payroll and Salary Management System
-- This handles employee salaries (separate from operational expenses)

-- Create employees table for payroll
CREATE TABLE IF NOT EXISTS payroll_employees (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_id_number VARCHAR(100) UNIQUE, -- National ID or employee number
  position VARCHAR(100) NOT NULL, -- Job title: Cashier, Cleaner, Driver, etc.
  phone VARCHAR(20),
  email VARCHAR(255),
  salary_amount DECIMAL(12, 2) NOT NULL, -- Monthly salary
  payment_frequency VARCHAR(50) DEFAULT 'MONTHLY', -- MONTHLY, BI_WEEKLY, WEEKLY
  bank_account VARCHAR(100),
  bank_name VARCHAR(100),
  hire_date DATE NOT NULL,
  employment_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ON_LEAVE, TERMINATED
  added_by INTEGER REFERENCES users(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create salary payments table
CREATE TABLE IF NOT EXISTS salary_payments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES payroll_employees(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  payment_period VARCHAR(100) NOT NULL, -- e.g., "January 2026", "Week 1-2 January"
  amount_paid DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- CASH, MOBILE_MONEY, BANK_TRANSFER
  transaction_reference VARCHAR(100),
  deductions DECIMAL(12, 2) DEFAULT 0, -- Tax, NSSF, loans, etc.
  bonuses DECIMAL(12, 2) DEFAULT 0, -- Performance bonus, overtime
  net_amount DECIMAL(12, 2) NOT NULL, -- amount_paid - deductions + bonuses
  paid_by INTEGER REFERENCES users(id) NOT NULL, -- Admin who processed payment
  payment_status VARCHAR(50) DEFAULT 'PAID', -- PAID, PENDING, FAILED
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_employees_status ON payroll_employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON salary_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_period ON salary_payments(payment_period);

-- Update financial_summary to include salaries
ALTER TABLE financial_summary 
ADD COLUMN IF NOT EXISTS total_salaries DECIMAL(12, 2) DEFAULT 0;

-- Update net_profit calculation to include salaries
-- Net Profit = Revenue - Expenses - Salaries
CREATE OR REPLACE FUNCTION update_salary_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert financial summary for the payment date
  INSERT INTO financial_summary (summary_date, total_salaries, updated_at)
  VALUES (
    NEW.payment_date,
    NEW.net_amount,
    NOW()
  )
  ON CONFLICT (summary_date) 
  DO UPDATE SET
    total_salaries = financial_summary.total_salaries + NEW.net_amount,
    net_profit = financial_summary.total_revenue - financial_summary.total_expenses - (financial_summary.total_salaries + NEW.net_amount),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for salary payments
DROP TRIGGER IF EXISTS salary_payment_trigger ON salary_payments;
CREATE TRIGGER salary_payment_trigger
  AFTER INSERT ON salary_payments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'PAID')
  EXECUTE FUNCTION update_salary_summary();

-- Add some test employees (adjust based on your business)
INSERT INTO payroll_employees (employee_name, employee_id_number, position, phone, salary_amount, payment_frequency, hire_date, added_by, employment_status)
SELECT 
  'Mary Nakato', 'EMP001', 'Senior Cashier', '0700123456', 600000, 'MONTHLY', '2024-01-15', 
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM payroll_employees WHERE employee_id_number = 'EMP001');

INSERT INTO payroll_employees (employee_name, employee_id_number, position, phone, salary_amount, payment_frequency, hire_date, added_by, employment_status)
SELECT 
  'Peter Okello', 'EMP002', 'Delivery Driver', '0700234567', 450000, 'MONTHLY', '2024-03-01',
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM payroll_employees WHERE employee_id_number = 'EMP002');

INSERT INTO payroll_employees (employee_name, employee_id_number, position, phone, salary_amount, payment_frequency, hire_date, added_by, employment_status)
SELECT 
  'Sarah Nambi', 'EMP003', 'Cleaner & Helper', '0700345678', 350000, 'MONTHLY', '2024-06-01',
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM payroll_employees WHERE employee_id_number = 'EMP003');

-- Add salary payments for January 2026
INSERT INTO salary_payments (employee_id, payment_date, payment_period, amount_paid, payment_method, deductions, bonuses, net_amount, paid_by, payment_status, notes)
SELECT 
  pe.id, 
  '2026-01-05', 
  'January 2026', 
  pe.salary_amount,
  'BANK_TRANSFER',
  pe.salary_amount * 0.10, -- 10% deductions (tax, NSSF)
  0,
  pe.salary_amount * 0.90, -- Net = 90% after deductions
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
  'PAID',
  'Monthly salary payment for January 2026'
FROM payroll_employees pe
WHERE pe.employment_status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM salary_payments sp 
    WHERE sp.employee_id = pe.id AND sp.payment_period = 'January 2026'
  );

COMMENT ON TABLE payroll_employees IS 'Employees on regular payroll (not casual/temporary workers)';
COMMENT ON TABLE salary_payments IS 'Monthly salary payments to employees';
COMMENT ON COLUMN salary_payments.deductions IS 'Tax, NSSF, pension, loans deducted';
COMMENT ON COLUMN salary_payments.bonuses IS 'Performance bonus, overtime, allowances added';
COMMENT ON COLUMN salary_payments.net_amount IS 'Final amount paid to employee (gross - deductions + bonuses)';
