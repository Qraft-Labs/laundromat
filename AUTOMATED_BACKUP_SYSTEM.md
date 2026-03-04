# 🔄 Automated Backup System

    ## Overview
    The automated backup system runs daily at 3:00 AM to create database backups automatically.

    ## Features

    ### ✅ Automated Daily Backups
    - **Schedule**: Every day at 3:00 AM
    - **Location**: `backend/backups/` directory
    - **Filename Format**: `automated_backup_YYYY-MM-DDTHH-MM-SS.json`
    - **Retention**: Keeps last 7 daily backups (older ones automatically deleted)

    ### ✅ Manual Backups
    - **Via Settings Page**: Download backup button (JSON file)
    - **Via API**: `POST /api/backup/create`
    - **Filename Format**: `lush_laundry_backup_YYYY-MM-DD.json`

    ### ✅ Backup Contents
    All backups include:
    - ✓ Customers
    - ✓ Orders
    - ✓ Order Items
    - ✓ Users
    - ✓ Price List
    - ✓ Inventory Items
    - ✓ Inventory Transactions
    - ✓ Deliveries

    ## Implementation

    ### Backend Setup

    **File**: `backend/src/services/backup.scheduler.ts`
    - `initializeBackupScheduler()` - Initialize cron job
    - `runBackupNow()` - Manual trigger for testing
    - `cleanOldBackups()` - Remove old backup files

    **Integration**: `backend/src/index.ts`
    ```typescript
    import { initializeBackupScheduler } from './services/backup.scheduler';

    // In startServer()
    initializeBackupScheduler();
    ```

    ### Cron Schedule
    ```typescript
    cron.schedule('0 3 * * *', async () => {
    // Runs daily at 3:00 AM
    });
    ```

    ## Backup Locations

    ### Automated Backups
    ```
    backend/backups/
    ├── automated_backup_2026-01-09T03-00-00.json
    ├── automated_backup_2026-01-08T03-00-00.json
    ├── automated_backup_2026-01-07T03-00-00.json
    └── ... (keeps last 7)
    ```

    ### Manual Backups
    - Downloaded via browser to user's Downloads folder
    - Admin should store in multiple locations:
    1. Cloud storage (Google Drive/Dropbox)
    2. External USB drive
    3. Off-site location

    ## Retention Policy

    ### Automated Daily Backups
    - **Keep**: Last 7 backups (1 week)
    - **Auto-delete**: Backups older than 7 days
    - **Purpose**: Quick recovery from recent issues

    ### Manual Weekly Backups
    - **Schedule**: Every Sunday via Settings page
    - **Keep**: Last 4 backups (1 month)
    - **Storage**: Cloud storage + Local
    - **Purpose**: Weekly checkpoints

    ### Manual Monthly Backups
    - **Schedule**: 1st of each month
    - **Keep**: Last 12 backups (1 year)
    - **Storage**: External drive + Off-site
    - **Purpose**: Long-term archive

    ### Permanent Archives
    - **Schedule**: End of year
    - **Keep**: All yearly backups
    - **Storage**: Multiple off-site locations
    - **Purpose**: Tax compliance (URA requires 7+ years)

    ## Testing

    ### Test Automated Backup
    ```typescript
    // In backend/src/services/backup.scheduler.ts
    import { runBackupNow } from './services/backup.scheduler';

    // Run manually
    runBackupNow();
    ```

    ### Verify Backup Created
    ```bash
    # Check backups directory
    ls backend/backups/

    # View backup contents
    cat backend/backups/automated_backup_*.json | jq .
    ```

    ### Check Cron Job Running
    ```bash
    # Server logs will show:
    📅 Automated backup scheduler initialized (Daily at 3:00 AM)

    # At 3:00 AM:
    🕐 Starting automated daily backup...
    ✅ Automated backup completed: automated_backup_2026-01-09T03-00-00.json
    📁 Location: /path/to/backend/backups/automated_backup_2026-01-09T03-00-00.json
    ```

    ## Monitoring

    ### Check Last Backup
    ```bash
    # Find most recent automated backup
    ls -lt backend/backups/ | head -n 2
    ```

    ### Backup File Size
    ```bash
    # Check backup size
    du -h backend/backups/automated_backup_*.json
    ```

    ### Database Size
    ```sql
    -- Check current database size
    SELECT pg_size_pretty(pg_database_size(current_database()));
    ```

    ## Troubleshooting

    ### Backup Not Running
    1. Check server logs for scheduler initialization message
    2. Verify `node-cron` package installed: `npm list node-cron`
    3. Check server timezone matches expected 3:00 AM
    4. Verify backups directory exists and has write permissions

    ### Backup Files Too Large
    1. Normal: 5-50 MB for small business
    2. Large: 50-200 MB for medium business
    3. Solution: Compress backups with gzip
    4. Consider database cleanup of old data

    ### Disk Space Full
    1. Check available disk space: `df -h`
    2. Manually delete old backups if needed
    3. Adjust retention policy (keep fewer days)
    4. Move backups to external storage

    ### Backup Fails
    1. Check database connection
    2. Verify all tables exist
    3. Check file write permissions
    4. Review server error logs

    ## Recovery Procedure

    ### Restore from Backup (Manual Process)

    **⚠️ WARNING**: Restoring will overwrite current database!

    1. **Stop the application**
    ```bash
    # Stop backend server
    pm2 stop lush-backend
    # OR
    Ctrl+C in terminal
    ```

    2. **Backup current database first**
    ```bash
    # Create safety backup before restore
    pg_dump lush_laundry > current_backup.sql
    ```

    3. **Parse backup JSON**
    ```javascript
    const backup = require('./backups/automated_backup_2026-01-09.json');
    ```

    4. **Restore each table**
    ```sql
    -- Example: Restore customers table
    TRUNCATE TABLE customers RESTART IDENTITY CASCADE;
    INSERT INTO customers (column1, column2, ...) VALUES (...);
    ```

    5. **Verify data integrity**
    ```sql
    SELECT COUNT(*) FROM customers;
    SELECT COUNT(*) FROM orders;
    -- Compare with backup metadata
    ```

    6. **Restart application**
    ```bash
    pm2 start lush-backend
    ```

    ## Best Practices

    ### ✅ DO
    - Keep automated backups running 24/7
    - Download manual weekly backup every Sunday
    - Store backups in 3+ different locations
    - Test restore procedure quarterly
    - Monitor backup file sizes
    - Keep 7+ years for tax compliance
    - Encrypt backups containing sensitive data

    ### ❌ DON'T
    - Rely only on automated backups
    - Store all backups in same location
    - Delete backups without verification
    - Ignore backup failure notifications
    - Store backups on same server as database
    - Share backup files via email
    - Store backups unencrypted on USB drives

    ## Security Considerations

    ### Backup File Security
    - **Contains**: Customer data, phone numbers, order history
    - **Classification**: Confidential business data
    - **Encryption**: Consider encrypting backup files
    - **Access Control**: Limit access to admin only
    - **Transmission**: Use secure channels (HTTPS, encrypted storage)

    ### Storage Security
    ```bash
    # Set proper file permissions
    chmod 600 backend/backups/*.json
    chown www-data:www-data backend/backups/

    # Encrypt sensitive backups
    gpg --encrypt --recipient admin@lush.ug backup.json
    ```

    ## Performance Impact

    ### Automated Backup (3:00 AM)
    - **Duration**: 2-30 seconds (depends on database size)
    - **CPU Usage**: Minimal
    - **Disk I/O**: Moderate during backup
    - **User Impact**: None (runs during off-hours)

    ### Manual Backup (Settings Page)
    - **Duration**: 1-5 seconds
    - **Impact**: Slight delay for user downloading
    - **Concurrent Users**: No impact

    ## Future Enhancements

    ### High Priority
    - [ ] **Backup Restore UI**: Upload and restore from backup file
    - [ ] **Email Notifications**: Send backup success/failure emails
    - [ ] **Compression**: Gzip backup files to save space
    - [ ] **Incremental Backups**: Only backup changed data

    ### Medium Priority
    - [ ] **Cloud Upload**: Auto-upload to Google Drive/AWS S3
    - [ ] **Backup Verification**: Automated integrity checks
    - [ ] **Scheduled Reports**: Weekly backup status email
    - [ ] **Backup Dashboard**: View backup history in Settings

    ### Low Priority
    - [ ] **Backup Encryption**: Auto-encrypt with GPG
    - [ ] **Multi-server Backups**: Replicate to backup server
    - [ ] **Point-in-Time Recovery**: Restore to specific timestamp
    - [ ] **Backup Comparison**: Compare two backups for differences

    ---

    ## Quick Reference

    ### Important Files
    ```
    backend/src/services/backup.scheduler.ts  - Cron job scheduler
    backend/src/controllers/backup.controller.ts - Manual backup API
    backend/src/index.ts - Scheduler initialization
    backend/backups/ - Automated backup storage
    ```

    ### Key Commands
    ```bash
    # Install dependencies
    npm install node-cron @types/node-cron

    # Start server (enables scheduler)
    npm run dev

    # Check backups
    ls backend/backups/

    # Manual backup via API
    curl -X POST http://localhost:5000/api/backup/create \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"tables": "all"}'
    ```

    ### Cron Schedule Examples
    ```typescript
    '0 3 * * *'      // Daily at 3:00 AM
    '0 */6 * * *'    // Every 6 hours
    '0 0 * * 0'      // Weekly on Sunday at midnight
    '0 0 1 * *'      // Monthly on 1st at midnight
    ```

    ---

    **Status**: ✅ Production Ready  
    **Version**: 1.0  
    **Last Updated**: January 9, 2026
