import cron from 'node-cron';
import { query } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';
import {
  initializeBackupTracking,
  recordBackupAttempt,
  getFailedBackups,
  isTodayBackupComplete,
} from './backup.recovery.service';

/**
 * Automated backup scheduler with email support
 * Checks settings and sends backups via email based on schedule
 */
export const initializeBackupScheduler = async () => {
  // Initialize backup tracking
  await initializeBackupTracking();
  
  // Create backups directory if it doesn't exist
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Schedule daily check at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🕐 Checking automated backup settings...');
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if today's backup already completed
      const alreadyComplete = await isTodayBackupComplete();
      if (alreadyComplete) {
        console.log('✅ Today\'s backup already completed');
        
        // Check for failed backups from previous days
        const failedBackups = await getFailedBackups();
        if (failedBackups.length > 0) {
          console.log(`🔄 Found ${failedBackups.length} failed backup(s) to retry`);
          for (const failed of failedBackups) {
            console.log(`📅 Retrying backup for ${failed.backup_date} (Attempt ${failed.retry_count + 1}/3)`);
            await retryBackup(failed.backup_date);
          }
        }
        
        return;
      }
      
      // Check if email backups are enabled
      const settingsResult = await query('SELECT * FROM backup_email_settings LIMIT 1');
      
      if (settingsResult.rows.length > 0 && settingsResult.rows[0].enabled) {
        const settings = settingsResult.rows[0];
        const todayDate = new Date();
        const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayOfMonth = todayDate.getDate();
        
        let shouldBackup = false;
        
        // Check if today matches the backup frequency
        if (settings.frequency === 'daily') {
          shouldBackup = true;
        } else if (settings.frequency === 'weekly' && dayOfWeek === 0) {
          // Sunday
          shouldBackup = true;
        } else if (settings.frequency === 'monthly' && dayOfMonth === 1) {
          // First day of month
          shouldBackup = true;
        }
        
        if (shouldBackup) {
          console.log(`📧 Starting ${settings.frequency} automated backup...`);
          try {
            await createAndEmailBackup(settings.email, settings.frequency);
            await recordBackupAttempt(today, 'SUCCESS');
          } catch (error: any) {
            console.error('❌ Backup failed:', error);
            await recordBackupAttempt(today, 'FAILED', error.message);
          }
        } else {
          console.log('⏭️  Skipping backup - not scheduled for today');
        }
      } else {
        console.log('⏭️  Email backups disabled - running local backup only');
        try {
          await createLocalBackup(backupDir);
          await recordBackupAttempt(today, 'SUCCESS');
        } catch (error: any) {
          await recordBackupAttempt(today, 'FAILED', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Automated backup check failed:', error);
      // Fallback to local backup
      try {
        await createLocalBackup(backupDir);
        await recordBackupAttempt(today, 'SUCCESS');
      } catch (fallbackError: any) {
        await recordBackupAttempt(today, 'FAILED', fallbackError.message);
      }
    }
  });
  
  console.log('📅 Automated backup scheduler initialized (Checks daily at 3:00 AM)');
};

/**
 * Create backup and send via email
 */
const createAndEmailBackup = async (email: string, frequency: string) => {
  try {
    const backupData: any = {
      timestamp: new Date().toISOString(),
      created_by: 'AUTOMATED_BACKUP',
      frequency: frequency,
      version: '1.0',
      data: {},
    };
    
    const tablesToBackup = [
      'customers',
      'orders',
      'order_items',
      'users',
      'price_list',
      'inventory_items',
      'inventory_transactions',
      'deliveries',
      'expenses',
      'notifications',
    ];
    
    // Export each table
    for (const table of tablesToBackup) {
      const result = await query(`SELECT * FROM ${table}`);
      backupData.data[table] = result.rows;
    }
    
    // Calculate backup size and counts
    const backupString = JSON.stringify(backupData, null, 2);
    const sizeInBytes = Buffer.byteLength(backupString, 'utf8');
    const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    const customerCount = backupData.data.customers?.length || 0;
    const orderCount = backupData.data.orders?.length || 0;
    const inventoryCount = backupData.data.inventory_items?.length || 0;
    
    // Calculate payment statistics
    const payments = backupData.data.orders?.filter((o: any) => o.amount_paid > 0) || [];
    const paymentCount = payments.length;
    const totalRevenue = payments.reduce((sum: number, o: any) => sum + parseFloat(o.amount_paid || 0), 0);
    
    // Generate filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `lush_laundry_${frequency}_backup_${timestamp}.json`;
    
    // Create email transporter (using existing SMTP settings)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-password',
      },
    });
    
    // Send email with backup attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: `🗄️ Lush Laundry ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Backup - ${now.toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🗄️ Automated Database Backup</h2>
          <p>Your ${frequency} automated backup has been completed successfully.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📊 Backup Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>📅 Date:</strong> ${now.toLocaleString()}</li>
              <li><strong>📦 Size:</strong> ${sizeMB} MB</li>
              <li><strong>👥 Customers:</strong> ${customerCount}</li>
              <li><strong>📋 Orders:</strong> ${orderCount}</li>
              <li><strong>� Payments:</strong> ${paymentCount} transactions</li>
              <li><strong>💵 Total Revenue:</strong> UGX ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</li>
              <li><strong>�📦 Inventory Items:</strong> ${inventoryCount}</li>
            </ul>
          </div>
          
          <div style="background: #EFF6FF; padding: 15px; border-left: 4px solid #3B82F6; border-radius: 4px;">
            <p style="margin: 0;"><strong>💡 Important:</strong> Store this backup in a safe location. You can restore your data from this file if needed.</p>
          </div>
          
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This is an automated message from your Lush Laundry ERP system.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: backupString,
          contentType: 'application/json',
        },
      ],
    });
    
    // Log to backup history
    await query(`
      CREATE TABLE IF NOT EXISTS backup_history (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        size VARCHAR(50)
      )
    `);
    
    await query(
      'INSERT INTO backup_history (type, created_by, size) VALUES ($1, $2, $3)',
      [`Automated ${frequency}`, 'SYSTEM', `${sizeMB} MB`]
    );
    
    console.log(`✅ ${frequency} backup emailed to ${email}`);
    console.log(`📧 File: ${filename} (${sizeMB} MB)`);
  } catch (error) {
    console.error('❌ Failed to create and email backup:', error);
    throw error;
  }
};

/**
 * Create local backup file (fallback when email is disabled)
 */
const createLocalBackup = async (backupDir: string) => {
  try {
    const backupData: any = {
      timestamp: new Date().toISOString(),
      created_by: 'AUTOMATED_BACKUP',
      version: '1.0',
      data: {},
    };
    
    const tablesToBackup = [
      'customers',
      'orders',
      'order_items',
      'users',
      'price_list',
      'inventory_items',
      'inventory_transactions',
      'deliveries',
    ];
    
    // Export each table
    for (const table of tablesToBackup) {
      const result = await query(`SELECT * FROM ${table}`);
      backupData.data[table] = result.rows;
    }
    
    // Generate filename with date and time
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `automated_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    // Write backup to file
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Automated backup completed: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    
    // Clean up old backups (keep only last 7 daily backups)
    cleanOldBackups(backupDir, 7);
  } catch (error) {
    console.error('❌ Automated backup failed:', error);
  }
};

/**
 * Clean up old backup files
 * Keep only the most recent N backups
 */
const cleanOldBackups = (backupDir: string, keepCount: number) => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('automated_backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time (newest first)
    
    // Delete old backups beyond keepCount
    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Failed to clean old backups:', error);
  }
};

/**
 * Manual trigger for testing backup scheduler
 */
export const runBackupNow = async () => {
  console.log('🚀 Running manual backup...');
  
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    const backupData: any = {
      timestamp: new Date().toISOString(),
      created_by: 'MANUAL_TRIGGER',
      version: '1.0',
      data: {},
    };
    
    const tablesToBackup = [
      'customers',
      'orders',
      'order_items',
      'users',
      'price_list',
      'inventory_items',
      'inventory_transactions',
      'deliveries',
    ];
    
    for (const table of tablesToBackup) {
      const result = await query(`SELECT * FROM ${table}`);
      backupData.data[table] = result.rows;
    }
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `manual_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Manual backup completed: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    
    return { success: true, filename, filepath };
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    return { success: false, error };
  }
};

/**
 * Retry a failed backup for a specific date
 */
const retryBackup = async (backupDate: string) => {
  try {
    // Get backup settings
    const settingsResult = await query('SELECT * FROM backup_email_settings LIMIT 1');
    
    if (settingsResult.rows.length > 0 && settingsResult.rows[0].enabled) {
      const settings = settingsResult.rows[0];
      await createAndEmailBackup(settings.email, `Retry for ${backupDate}`);
      await recordBackupAttempt(backupDate, 'SUCCESS');
      console.log(`✅ Successfully retried backup for ${backupDate}`);
    } else {
      const backupDir = path.join(__dirname, '../../backups');
      await createLocalBackup(backupDir);
      await recordBackupAttempt(backupDate, 'SUCCESS');
      console.log(`✅ Successfully created local backup for ${backupDate}`);
    }
  } catch (error: any) {
    console.error(`❌ Retry failed for ${backupDate}:`, error);
    await recordBackupAttempt(backupDate, 'FAILED', error.message);
  }
};

