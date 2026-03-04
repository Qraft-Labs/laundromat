import nodemailer from 'nodemailer';
import { query } from '../config/database';

interface DailyBackupData {
  date: string;
  orders: any[];
  customers: any[];
  deliveries: any[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    deliveriesScheduled: number;
  };
}

/**
 * Email service for sending automated daily backups
 */
export class EmailBackupService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.BACKUP_EMAIL_USER || process.env.EMAIL_USER,
        pass: process.env.BACKUP_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Get today's transactions data
   */
  async getTodayTransactions(): Promise<DailyBackupData> {
    const today = new Date().toISOString().split('T')[0];

    // Get today's orders
    const ordersResult = await query(
      `SELECT o.*, c.name as customer_name, c.phone as customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE DATE(o.created_at) = $1
       ORDER BY o.created_at DESC`,
      [today]
    );

    // Get today's new customers
    const customersResult = await query(
      `SELECT * FROM customers 
       WHERE DATE(created_at) = $1
       ORDER BY created_at DESC`,
      [today]
    );

    // Get today's deliveries
    const deliveriesResult = await query(
      `SELECT d.*, o.order_number, c.name as customer_name
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       WHERE d.scheduled_date = $1
       ORDER BY d.scheduled_time_slot`,
      [today]
    );

    // Calculate summary
    const totalOrders = ordersResult.rows.length;
    const totalRevenue = ordersResult.rows.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const newCustomers = customersResult.rows.length;
    const deliveriesScheduled = deliveriesResult.rows.length;

    return {
      date: today,
      orders: ordersResult.rows,
      customers: customersResult.rows,
      deliveries: deliveriesResult.rows,
      summary: {
        totalOrders,
        totalRevenue,
        newCustomers,
        deliveriesScheduled,
      },
    };
  }

  /**
   * Format daily backup data as HTML email
   */
  formatEmailHTML(data: DailyBackupData): string {
    const { date, orders, customers, deliveries, summary } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
    .summary { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .summary-item { background: white; padding: 15px; border-radius: 6px; }
    .summary-value { font-size: 24px; font-weight: bold; color: #6366f1; }
    .section { margin: 30px 0; }
    .section-title { font-size: 20px; font-weight: bold; color: #6366f1; margin-bottom: 15px; border-bottom: 2px solid #6366f1; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #6366f1; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    tr:hover { background: #f9fafb; }
    .footer { text-align: center; color: #6b7280; margin-top: 40px; padding: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧺 Lush Laundry - Daily Backup Report</h1>
    <p>Date: ${new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div style="padding: 20px;">
    <!-- Summary Section -->
    <div class="summary">
      <h2 style="margin-top: 0;">📊 Daily Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div>Total Orders</div>
          <div class="summary-value">${summary.totalOrders}</div>
        </div>
        <div class="summary-item">
          <div>Revenue</div>
          <div class="summary-value">${summary.totalRevenue.toLocaleString()} UGX</div>
        </div>
        <div class="summary-item">
          <div>New Customers</div>
          <div class="summary-value">${summary.newCustomers}</div>
        </div>
        <div class="summary-item">
          <div>Deliveries Scheduled</div>
          <div class="summary-value">${summary.deliveriesScheduled}</div>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div class="section">
      <h3 class="section-title">📦 Today's Orders (${orders.length})</h3>
      ${orders.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td><strong>${order.order_number}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.customer_phone}</td>
                <td>${parseFloat(order.total_amount).toLocaleString()} UGX</td>
                <td>${order.order_status}</td>
                <td>${new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No orders created today.</p>'}
    </div>

    <!-- Customers Section -->
    <div class="section">
      <h3 class="section-title">👥 New Customers (${customers.length})</h3>
      ${customers.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(customer => `
              <tr>
                <td><strong>${customer.customer_id}</strong></td>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.customer_type}</td>
                <td>${new Date(customer.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No new customers registered today.</p>'}
    </div>

    <!-- Deliveries Section -->
    <div class="section">
      <h3 class="section-title">🚚 Today's Deliveries (${deliveries.length})</h3>
      ${deliveries.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Time Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${deliveries.map(delivery => `
              <tr>
                <td><strong>${delivery.order_number}</strong></td>
                <td>${delivery.customer_name}</td>
                <td>${delivery.delivery_type}</td>
                <td>${delivery.scheduled_time_slot || 'Not set'}</td>
                <td>${delivery.delivery_status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No deliveries scheduled for today.</p>'}
    </div>
  </div>

  <div class="footer">
    <p><strong>Lush Laundry Management System</strong></p>
    <p>This is an automated daily backup email. Please keep this for your records.</p>
    <p style="font-size: 12px; color: #9ca3af;">Generated on ${new Date().toLocaleString('en-GB')}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get all administrator emails
   */
  async getAdminEmails(): Promise<string[]> {
    const result = await query(
      `SELECT email FROM users 
       WHERE role = 'ADMIN' AND email IS NOT NULL AND email != ''
       ORDER BY email`
    );
    
    return result.rows.map(row => row.email);
  }

  /**
   * Send daily backup email to all administrators
   */
  async sendDailyBackup(): Promise<{ success: boolean; message: string; sentTo?: string[] }> {
    try {
      console.log('📧 Starting daily backup email generation...');

      // Get admin emails
      const adminEmails = await this.getAdminEmails();
      
      if (adminEmails.length === 0) {
        console.log('⚠️ No administrator emails found');
        return {
          success: false,
          message: 'No administrator emails configured',
        };
      }

      console.log(`📬 Found ${adminEmails.length} administrator email(s)`);

      // Get today's data
      const backupData = await this.getTodayTransactions();
      console.log(`📊 Collected data: ${backupData.summary.totalOrders} orders, ${backupData.summary.newCustomers} customers, ${backupData.summary.deliveriesScheduled} deliveries`);

      // Format email
      const htmlContent = this.formatEmailHTML(backupData);

      // Send email to all admins
      const mailOptions = {
        from: `"Lush Laundry System" <${process.env.BACKUP_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: adminEmails.join(', '),
        subject: `🧺 Daily Backup - ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${backupData.summary.totalOrders} Orders`,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Daily backup email sent successfully to: ${adminEmails.join(', ')}`);

      return {
        success: true,
        message: `Daily backup email sent to ${adminEmails.length} administrator(s)`,
        sentTo: adminEmails,
      };
    } catch (error) {
      console.error('❌ Failed to send daily backup email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send backup email',
      };
    }
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(testEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.sendMail({
        from: `"Lush Laundry System" <${process.env.BACKUP_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: testEmail,
        subject: '✅ Lush Laundry - Email Backup Test',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #6366f1;">Email Backup Configuration Test</h2>
            <p>This is a test email to verify that your automated backup email system is working correctly.</p>
            <p>If you received this email, your configuration is correct! ✅</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Daily backup emails will be sent automatically at 11:59 PM every day.<br>
              Sent from: Lush Laundry Management System
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email',
      };
    }
  }
}

// Export singleton instance
export const emailBackupService = new EmailBackupService();
