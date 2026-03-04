import * as cron from 'node-cron';
import { emailBackupService } from './email-backup.service';

/**
 * Daily Email Backup Scheduler
 * Sends automated backup emails to administrators
 */
export class DailyBackupScheduler {
  private task: cron.ScheduledTask | null = null;

  /**
   * Start the daily backup scheduler
   * Runs at 11:59 PM every day
   */
  start() {
    // Schedule: Every day at 11:59 PM
    // Cron format: minute hour day month weekday
    // 59 23 * * * = 11:59 PM every day
    this.task = cron.schedule('59 23 * * *', async () => {
      console.log('\n🕐 Running scheduled daily backup email...');
      console.log(`📅 Time: ${new Date().toLocaleString('en-GB')}`);
      
      try {
        const result = await emailBackupService.sendDailyBackup();
        
        if (result.success) {
          console.log(`✅ ${result.message}`);
          if (result.sentTo) {
            console.log(`📧 Recipients: ${result.sentTo.join(', ')}`);
          }
        } else {
          console.error(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error);
      }
      
      console.log('✅ Daily backup task completed\n');
    }, {
      timezone: 'Africa/Kampala', // East Africa Time (EAT)
    });

    this.task.start();

    console.log('📧 Daily backup email scheduler started!');
    console.log('⏰ Scheduled to run every day at 11:59 PM (EAT)');
    console.log(`🌍 Timezone: Africa/Kampala (UTC+3)`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('⏹️ Daily backup scheduler stopped');
    }
  }

  /**
   * Manually trigger a backup (for testing)
   */
  async triggerManual() {
    console.log('🔧 Manually triggering daily backup email...');
    return await emailBackupService.sendDailyBackup();
  }
}

// Export singleton instance
export const dailyBackupScheduler = new DailyBackupScheduler();
