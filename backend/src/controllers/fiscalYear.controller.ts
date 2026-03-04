import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all fiscal years
 */
export const getFiscalYears = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        id,
        year_name,
        start_date,
        end_date,
        status,
        closing_date,
        closed_by,
        opening_balance,
        closing_balance,
        net_profit,
        retained_earnings,
        notes,
        created_at
      FROM fiscal_years
      ORDER BY start_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fiscal years:', error);
    res.status(500).json({ error: 'Failed to fetch fiscal years' });
  }
};

/**
 * Get current active fiscal year
 */
export const getCurrentFiscalYear = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT * FROM current_fiscal_year
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active fiscal year found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current fiscal year:', error);
    res.status(500).json({ error: 'Failed to fetch current fiscal year' });
  }
};

/**
 * Create a new fiscal year
 */
export const createFiscalYear = async (req: AuthRequest, res: Response) => {
  try {
    const { year_name, start_date, end_date, opening_balance, notes } = req.body;

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Check for overlapping fiscal years
    const overlapCheck = await query(`
      SELECT id, year_name FROM fiscal_years
      WHERE (start_date <= $1 AND end_date >= $1)
         OR (start_date <= $2 AND end_date >= $2)
         OR (start_date >= $1 AND end_date <= $2)
    `, [start_date, end_date]);

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Date range overlaps with existing fiscal year: ' + overlapCheck.rows[0].year_name 
      });
    }

    // Get retained earnings from previous fiscal year
    const previousYearResult = await query(`
      SELECT 
        closing_balance,
        net_profit,
        retained_earnings
      FROM fiscal_years
      WHERE status = 'CLOSED'
        AND end_date < $1
      ORDER BY end_date DESC
      LIMIT 1
    `, [start_date]);

    let retained_earnings = 0;
    if (previousYearResult.rows.length > 0) {
      const prevYear = previousYearResult.rows[0];
      retained_earnings = parseFloat(prevYear.retained_earnings || 0) + parseFloat(prevYear.net_profit || 0);
    }

    const result = await query(`
      INSERT INTO fiscal_years (year_name, start_date, end_date, opening_balance, retained_earnings, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
      RETURNING *
    `, [year_name, start_date, end_date, opening_balance || 0, retained_earnings, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fiscal year:', error);
    res.status(500).json({ error: 'Failed to create fiscal year' });
  }
};

/**
 * Close a fiscal year (year-end closing)
 */
export const closeFiscalYear = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get fiscal year details
    const fiscalYearResult = await query(`
      SELECT * FROM fiscal_years WHERE id = $1
    `, [id]);

    if (fiscalYearResult.rows.length === 0) {
      return res.status(404).json({ error: 'Fiscal year not found' });
    }

    const fiscalYear = fiscalYearResult.rows[0];

    if (fiscalYear.status === 'CLOSED') {
      return res.status(400).json({ error: 'Fiscal year is already closed' });
    }

    const startDate = fiscalYear.start_date;
    const endDate = fiscalYear.end_date;

    // Calculate year-end balances
    // 1. Total Revenue
    const revenueResult = await query(`
      SELECT COALESCE(SUM(amount_paid), 0) as total_revenue
      FROM orders
      WHERE created_at::DATE BETWEEN $1 AND $2
    `, [startDate, endDate]);

    // 2. Total Expenses
    const expensesResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE expense_date BETWEEN $1 AND $2
        AND approval_status = 'APPROVED'
    `, [startDate, endDate]);

    // 3. Total Salaries
    const salariesResult = await query(`
      SELECT COALESCE(SUM(net_amount), 0) as total_salaries
      FROM salary_payments
      WHERE payment_date BETWEEN $1 AND $2
        AND payment_status = 'PAID'
    `, [startDate, endDate]);

    // 4. Cash on hand (all payments received up to end date)
    const cashResult = await query(`
      SELECT COALESCE(SUM(amount_paid), 0) as total_cash
      FROM orders
      WHERE created_at::DATE <= $2
    `, [endDate]);

    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue);
    const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);
    const totalSalaries = parseFloat(salariesResult.rows[0].total_salaries);
    const netProfit = totalRevenue - totalExpenses - totalSalaries;
    const closingBalance = parseFloat(cashResult.rows[0].total_cash);

    // Update fiscal year status
    await query(`
      UPDATE fiscal_years
      SET 
        status = 'CLOSED',
        closing_date = CURRENT_TIMESTAMP,
        closed_by = $1,
        closing_balance = $2,
        net_profit = $3
      WHERE id = $4
    `, [userId, closingBalance, netProfit, id]);

    // Create year-end snapshots
    // Assets
    await query(`
      INSERT INTO year_end_snapshots (fiscal_year_id, account_type, account_name, account_code, closing_balance)
      VALUES 
        ($1, 'ASSET', 'Cash', '1000', $2),
        ($1, 'ASSET', 'Accounts Receivable', '1200', (
          SELECT COALESCE(SUM(balance), 0) FROM orders 
          WHERE payment_status IN ('UNPAID', 'PARTIAL') AND created_at::DATE <= $3
        )),
        ($1, 'ASSET', 'Inventory', '1400', (
          SELECT COALESCE(SUM(quantity_in_stock * unit_cost), 0) FROM inventory_items
          WHERE created_at::DATE <= $3
        ))
    `, [id, closingBalance, endDate]);

    // Revenue
    await query(`
      INSERT INTO year_end_snapshots (fiscal_year_id, account_type, account_name, account_code, closing_balance)
      VALUES ($1, 'REVENUE', 'Sales Revenue', '4000', $2)
    `, [id, totalRevenue]);

    // Expenses
    await query(`
      INSERT INTO year_end_snapshots (fiscal_year_id, account_type, account_name, account_code, closing_balance)
      VALUES 
        ($1, 'EXPENSE', 'Operating Expenses', '5000', $2),
        ($1, 'EXPENSE', 'Salary Expense', '5200', $3)
    `, [id, totalExpenses, totalSalaries]);

    // Update next fiscal year with retained earnings
    const newRetainedEarnings = parseFloat(fiscalYear.retained_earnings || 0) + netProfit;
    await query(`
      UPDATE fiscal_years
      SET 
        opening_balance = $1,
        retained_earnings = $2
      WHERE start_date > $3
        AND status = 'OPEN'
      ORDER BY start_date ASC
      LIMIT 1
    `, [closingBalance, newRetainedEarnings, endDate]);

    res.json({
      message: 'Fiscal year closed successfully',
      year_name: fiscalYear.year_name,
      closing_balance: closingBalance,
      net_profit: netProfit,
      retained_earnings: newRetainedEarnings
    });
  } catch (error) {
    console.error('Error closing fiscal year:', error);
    res.status(500).json({ error: 'Failed to close fiscal year' });
  }
};

/**
 * Reopen a closed fiscal year (only if next year hasn't been closed)
 */
export const reopenFiscalYear = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if any subsequent years are closed
    const checkResult = await query(`
      SELECT COUNT(*) as count
      FROM fiscal_years fy1
      WHERE fy1.id = $1
        AND EXISTS (
          SELECT 1 FROM fiscal_years fy2
          WHERE fy2.start_date > fy1.end_date
            AND fy2.status = 'CLOSED'
        )
    `, [id]);

    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot reopen this fiscal year because subsequent years have been closed' 
      });
    }

    await query(`
      UPDATE fiscal_years
      SET 
        status = 'OPEN',
        closing_date = NULL,
        closed_by = NULL,
        closing_balance = NULL,
        net_profit = NULL
      WHERE id = $1
    `, [id]);

    // Delete year-end snapshots
    await query(`
      DELETE FROM year_end_snapshots WHERE fiscal_year_id = $1
    `, [id]);

    res.json({ message: 'Fiscal year reopened successfully' });
  } catch (error) {
    console.error('Error reopening fiscal year:', error);
    res.status(500).json({ error: 'Failed to reopen fiscal year' });
  }
};

/**
 * Get comparative analysis between two periods
 */
export const getComparativeAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { fiscal_year_1, fiscal_year_2 } = req.query;

    if (!fiscal_year_1 || !fiscal_year_2) {
      return res.status(400).json({ error: 'Two fiscal year IDs are required' });
    }

    // Get fiscal year details
    const fiscalYearsResult = await query(`
      SELECT id, year_name, start_date, end_date
      FROM fiscal_years
      WHERE id IN ($1, $2)
      ORDER BY start_date
    `, [fiscal_year_1, fiscal_year_2]);

    if (fiscalYearsResult.rows.length < 2) {
      return res.status(404).json({ error: 'One or both fiscal years not found' });
    }

    const [year1, year2] = fiscalYearsResult.rows;

    // Revenue comparison
    const revenueCompResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN created_at::DATE BETWEEN $1 AND $2 THEN amount_paid ELSE 0 END), 0) as period_1,
        COALESCE(SUM(CASE WHEN created_at::DATE BETWEEN $3 AND $4 THEN amount_paid ELSE 0 END), 0) as period_2
      FROM orders
    `, [year1.start_date, year1.end_date, year2.start_date, year2.end_date]);

    // Expenses comparison
    const expensesCompResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN expense_date BETWEEN $1 AND $2 THEN amount ELSE 0 END), 0) as period_1,
        COALESCE(SUM(CASE WHEN expense_date BETWEEN $3 AND $4 THEN amount ELSE 0 END), 0) as period_2
      FROM expenses
      WHERE approval_status = 'APPROVED'
    `, [year1.start_date, year1.end_date, year2.start_date, year2.end_date]);

    // Salaries comparison
    const salariesCompResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_date BETWEEN $1 AND $2 THEN net_amount ELSE 0 END), 0) as period_1,
        COALESCE(SUM(CASE WHEN payment_date BETWEEN $3 AND $4 THEN net_amount ELSE 0 END), 0) as period_2
      FROM salary_payments
      WHERE payment_status = 'PAID'
    `, [year1.start_date, year1.end_date, year2.start_date, year2.end_date]);

    const revenue1 = parseFloat(revenueCompResult.rows[0].period_1);
    const revenue2 = parseFloat(revenueCompResult.rows[0].period_2);
    const expenses1 = parseFloat(expensesCompResult.rows[0].period_1);
    const expenses2 = parseFloat(expensesCompResult.rows[0].period_2);
    const salaries1 = parseFloat(salariesCompResult.rows[0].period_1);
    const salaries2 = parseFloat(salariesCompResult.rows[0].period_2);

    const netProfit1 = revenue1 - expenses1 - salaries1;
    const netProfit2 = revenue2 - expenses2 - salaries2;

    const revenueVariance = revenue2 - revenue1;
    const revenueVariancePct = revenue1 > 0 ? ((revenueVariance / revenue1) * 100) : 0;

    const profitVariance = netProfit2 - netProfit1;
    const profitVariancePct = netProfit1 !== 0 ? ((profitVariance / netProfit1) * 100) : 0;

    res.json({
      comparison: {
        period_1: {
          name: year1.year_name,
          start_date: year1.start_date,
          end_date: year1.end_date,
          revenue: revenue1,
          expenses: expenses1,
          salaries: salaries1,
          net_profit: netProfit1
        },
        period_2: {
          name: year2.year_name,
          start_date: year2.start_date,
          end_date: year2.end_date,
          revenue: revenue2,
          expenses: expenses2,
          salaries: salaries2,
          net_profit: netProfit2
        },
        variance: {
          revenue: {
            amount: revenueVariance,
            percentage: revenueVariancePct,
            trend: revenueVariance >= 0 ? 'increase' : 'decrease'
          },
          expenses: {
            amount: expenses2 - expenses1,
            percentage: expenses1 > 0 ? (((expenses2 - expenses1) / expenses1) * 100) : 0,
            trend: expenses2 > expenses1 ? 'increase' : 'decrease'
          },
          net_profit: {
            amount: profitVariance,
            percentage: profitVariancePct,
            trend: profitVariance >= 0 ? 'increase' : 'decrease'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error generating comparative analysis:', error);
    res.status(500).json({ error: 'Failed to generate comparative analysis' });
  }
};

/**
 * Get year-end snapshots for a fiscal year
 */
export const getYearEndSnapshots = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        account_type,
        account_name,
        account_code,
        closing_balance,
        debit_total,
        credit_total
      FROM year_end_snapshots
      WHERE fiscal_year_id = $1
      ORDER BY account_type, account_code
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching year-end snapshots:', error);
    res.status(500).json({ error: 'Failed to fetch year-end snapshots' });
  }
};
