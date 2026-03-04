# 📧 BACKUP SYSTEM DOCUMENTATION

    ## Overview
    Your Lush Laundry ERP has a comprehensive automated backup system with failure recovery and retry mechanisms.

    ---

    ## ✅ WHAT'S INCLUDED IN BACKUPS

    ### **All Data Tables:**
    1. ✅ **Customers** - All customer information
    2. ✅ **Orders** - All order records
    3. ✅ **Order Items** - Detailed order line items
    4. ✅ **Users** - User accounts and roles
    5. ✅ **Price List** - Current pricing
    6. ✅ **Inventory Items** - Stock information
    7. ✅ **Inventory Transactions** - Stock movements
    8. ✅ **Deliveries** - Delivery records
    9. ✅ **Expenses** - All expense records
    10. ✅ **Notifications** - System notifications
    11. ✅ **PAYMENTS** - **ALL payment transactions are included in orders table!**

    ### **Payment Data Included:**
    - Payment amounts (amount_paid)
    - Payment methods (Cash, MTN, Airtel, Bank Transfer, On Account)
    - Transaction references (for mobile money/bank transfers)
    - Payment status (PAID/PARTIAL/UNPAID)
    - Payment dates
    - Customer information linked to payments

    ---

    ## 📅 HOW IT WORKS

    ### **Automated Schedule:**
    - ⏰ **Runs daily at 3:00 AM**
    - 📧 Sends email with backup file attached
    - 💾 Also creates local backup files

    ### **Backup Frequencies:**
    You can configure:
    - **Daily** - Every day at 3 AM
    - **Weekly** - Every Sunday at 3 AM
    - **Monthly** - 1st day of month at 3 AM

    ---

    ## 🔄 FAILURE RECOVERY SYSTEM

    ### **What Happens If Backup Fails:**

    1. **System tracks every backup attempt** in `backup_attempts` table
    2. **Records success or failure** with timestamp and error message
    3. **Automatically retries failed backups** the next day
    4. **Retries up to 3 times** for each failed backup
    5. **Keeps trying for 7 days** after initial failure

    ### **Example Scenario:**

    **Day 1 (Monday):** 
    - Backup scheduled at 3 AM
    - ❌ FAILS (internet down, email service issue, server crash)
    - ✅ System records: "Monday backup FAILED"

    **Day 2 (Tuesday):**
    - 3 AM: System checks for failed backups
    - ✅ Finds Monday's failed backup
    - 🔄 **Automatically retries Monday's backup**
    - ✅ If successful, records: "Monday backup SUCCESS (Retry 1)"
    - Then proceeds with Tuesday's regular backup

    **If Tuesday Also Fails:**
    - System now has 2 failed backups to retry (Monday & Tuesday)
    - Will retry both on Wednesday

    ### **Retry Limits:**
    - Maximum 3 retry attempts per backup
    - After 3 failures, stops retrying that specific backup
    - Keeps trying failed backups for 7 days only

    ---

    ## 📧 EMAIL BACKUP CONTENTS

    ### **Email Includes:**
    1. **Subject:** `🗄️ Lush Laundry Daily/Weekly/Monthly Backup - [Date]`

    2. **Email Body Shows:**
    - 📅 Backup Date
    - 📦 File Size (in MB)
    - 👥 Customer Count
    - 📋 Order Count
    - 💰 **Payment Count** (number of payment transactions)
    - 💵 **Total Revenue** (sum of all payments)
    - 📦 Inventory Item Count

    3. **Attached File:** JSON file with ALL data

    ### **Example Email:**
    ```
    🗄️ Automated Database Backup

    Your daily automated backup has been completed successfully.

    📊 Backup Details:
    📅 Date: January 13, 2026, 3:00:00 AM
    📦 Size: 2.5 MB
    👥 Customers: 89
    📋 Orders: 871
    💰 Payments: 784 transactions
    💵 Total Revenue: UGX 210,134,552
    📦 Inventory Items: 156

    💡 Important: Store this backup in a safe location. You can restore your data from this file if needed.
    ```

    ---

    ## 💾 DOWNLOAD DATA FEATURE

    ### **Manual Backup Download:**
    Administrators can download backups anytime from Settings → Data Management

    **Downloaded File Includes:**
    - ✅ All tables (customers, orders, inventory, etc.)
    - ✅ **ALL PAYMENT DATA** (part of orders table)
    - ✅ Payment transaction references
    - ✅ Payment statistics

    **Download Options:**
    1. **Full Backup** - Everything
    2. **Partial Backup** - Select specific tables
    3. **Orders Only** - Includes all payment data

    ---

    ## 🔒 FAILURE SCENARIOS & RECOVERY

    ### **Scenario 1: Server Down During Backup**
    **Problem:** Server crashes at 2:50 AM, backup scheduled for 3:00 AM
    **Solution:**
    - When server comes back online, daily check still runs at 3 AM next day
    - System detects yesterday's backup is missing
    - Automatically creates and sends yesterday's backup
    - Then proceeds with today's backup

    ### **Scenario 2: Internet Down**
    **Problem:** No internet connection when backup tries to send email
    **Solution:**
    - Backup attempt recorded as FAILED with error: "Email send failed"
    - Local backup file still created (no internet needed)
    - Next day at 3 AM: System retries sending email
    - If internet restored, email sent successfully

    ### **Scenario 3: Multiple Days of Failures**
    **Problem:** Server down for 3 days (Monday, Tuesday, Wednesday)
    **Solution:**
    - Thursday 3 AM: System detects 3 failed backups
    - Retries all 3 backups one by one
    - Records success/failure for each retry attempt
    - Then proceeds with Thursday's regular backup

    ### **Scenario 4: Email Service Down**
    **Problem:** Gmail/email service temporarily unavailable
    **Solution:**
    - Email backup fails but local backup succeeds
    - Retry mechanism attempts email send again tomorrow
    - Up to 3 retry attempts over 3 days
    - After 3 failures, manual intervention needed

    ---

    ## 📊 BACKUP STATISTICS

    ### **View Backup History:**
    Admins can see in Settings → Data Management:
    - Last backup date/time
    - Backup status (Success/Failed)
    - Backup size
    - Number of retries
    - Success rate (last 30 days)

    ### **Example Stats:**
    ```
    📊 Backup Statistics (Last 30 Days):
    Total Attempts: 30
    Successful: 28
    Failed: 2
    Pending Retry: 0
    Success Rate: 93.3%
    ```

    ---

    ## 🚨 IMPORTANT NOTES

    ### **Payment Data:**
    ✅ **YES** - Daily payments ARE included in automated backups
    ✅ **YES** - Payment section data CAN be downloaded manually
    ✅ **YES** - Transaction references are backed up
    ✅ **YES** - Payment statistics are shown in backup email

    ### **Server Down Scenarios:**
    ✅ **YES** - System catches up on missed backups when server recovers
    ✅ **YES** - Failed backups are automatically retried
    ✅ **YES** - Up to 7 days of failed backups can be recovered
    ✅ **YES** - System tracks all attempts and statuses

    ### **Email Backup vs Local Backup:**
    - **Email Backup:** Sent to configured email address (offsite backup)
    - **Local Backup:** Saved in `backend/backups/` folder on server
    - **Both happen:** System does both for redundancy

    ### **Retry Logic:**
    - **Maximum 3 retries** per failed backup
    - **7-day window** for recovery
    - **Daily check** at 3 AM
    - **Tracks all attempts** in database

    ---

    ## 🔧 CONFIGURATION

    ### **Enable Automated Backups:**
    1. Go to Settings → Data Management
    2. Click "Configure Email Backups"
    3. Enable automated backups
    4. Set frequency (Daily/Weekly/Monthly)
    5. Enter email address
    6. Save settings

    ### **Test Backup:**
    1. Settings → Data Management
    2. Click "Run Backup Now"
    3. Checks if system is working
    4. Sends test backup email

    ---

    ## ✅ SUMMARY

    **Your backup system:**
    1. ✅ Includes ALL payment data
    2. ✅ Runs automatically daily
    3. ✅ Retries failed backups
    4. ✅ Recovers from server downtime
    5. ✅ Sends email with payment statistics
    6. ✅ Creates local copies
    7. ✅ Tracks success/failure
    8. ✅ Allows manual downloads anytime

    **You're fully protected!** 🛡️
