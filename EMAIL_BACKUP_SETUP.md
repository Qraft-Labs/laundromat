# 📧 Daily Email Backup Setup Guide

    ## Overview
    The system now automatically sends daily transaction summaries to all administrators at **11:59 PM (EAT)** every day.

    ## What's Included in Daily Emails
    Each daily backup email contains:
    - ✅ **Today's Orders** - All orders with customer details, amounts, and status
    - ✅ **New Customers** - All customers registered today
    - ✅ **Today's Deliveries** - All deliveries scheduled for today with status
    - ✅ **Summary Statistics** - Total orders, revenue, new customers, and deliveries

    ## Email Configuration Required

    ### Step 1: Generate Gmail App Password
    Since you're using Gmail, you need to create an **App Password** (not your regular Gmail password):

    1. Go to your Google Account: https://myaccount.google.com/
    2. Navigate to **Security**
    3. Enable **2-Step Verification** (if not already enabled)
    4. Search for "App passwords" or go to: https://myaccount.google.com/apppasswords
    5. Generate a new app password:
    - Select app: **Mail**
    - Select device: **Other (Custom name)** → Enter "Lush Laundry Backup"
    - Click **Generate**
    6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

    ### Step 2: Update Backend .env File
    Open `backend/.env` and update these lines:

    ```env
    # Email Configuration (Gmail)
    EMAIL_USER=your-actual-gmail@gmail.com
    EMAIL_PASSWORD=your-16-character-app-password
    ```

    **Example:**
    ```env
    EMAIL_USER=husseinngobi@gmail.com
    EMAIL_PASSWORD=abcd efgh ijkl mnop
    ```

    ⚠️ **Important**: Remove spaces from the app password when pasting!

    ### Step 3: Restart Backend Server
    After updating `.env`, restart your backend server:

    ```bash
    cd backend
    npm run dev
    ```

    You should see this message in the terminal:
    ```
    📧 Daily backup email scheduler started!
    ⏰ Scheduled to run every day at 11:59 PM (EAT)
    ```

    ## How to Use

    ### Automatic Daily Emails
    - The system automatically sends backup emails **every day at 11:59 PM (EAT)**
    - All users with **Administrator role** and a configured email will receive it
    - No manual action required!

    ### Manual Testing

    #### From the UI (Settings Page):
    1. Navigate to **Settings** → Scroll to **Data Management** section
    2. Find the "📧 Daily Transaction Backups" card
    3. Click **"Send Backup Now"** - Sends today's transactions to all admins
    4. Click **"Send Test Email"** - Sends a test email to any address you specify

    #### From the API:
    ```bash
    # Send daily backup now
    POST http://localhost:5000/api/backup/email/send-now

    # Send test email
    POST http://localhost:5000/api/backup/email/test
    Body: { "email": "test@example.com" }
    ```

    ## Who Receives the Emails?
    The system queries the database for all users where:
    - `role = 'ADMIN'`
    - `email IS NOT NULL`
    - `email != ''`

    To add/update admin emails:
    1. Go to **Settings** → **User Management**
    2. Edit user and ensure their email is filled in
    3. Ensure their role is set to **Administrator**

    ## Troubleshooting

    ### Email Not Sending
    **Check backend logs for error messages:**
    ```bash
    cd backend
    npm run dev
    ```

    **Common issues:**
    1. **Authentication Error** - App password is wrong or has spaces
    - Solution: Regenerate app password and paste without spaces
    
    2. **No Recipients Found** - No admin users have emails configured
    - Solution: Add email addresses to admin user accounts
    
    3. **Service Not Configured** - Gmail credentials not set
    - Solution: Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

    ### Test Email Function
    Use the test email function to verify configuration:
    1. Go to Settings → Data Management
    2. Click "Send Test Email"
    3. Enter your email address
    4. Check your inbox (and spam folder)

    If the test email arrives, the system is working correctly!

    ## Email Format
    The daily backup email is formatted as a professional HTML email with:
    - 📊 **Summary Cards** - Quick statistics at the top
    - 📋 **Tables** - Detailed transaction data
    - 🎨 **Professional Styling** - Clean, readable layout
    - ⏰ **Timestamp** - When the backup was generated

    ## Difference from "Download Overall Backup"
    - **Daily Email Backups**: Only today's transactions, automatically sent to admins
    - **Download Overall Backup**: ALL historical data, manually downloaded as JSON file

    Both features complement each other for comprehensive data backup!

    ## Schedule Details
    - **Frequency**: Every day
    - **Time**: 11:59 PM (East Africa Time - EAT)
    - **Timezone**: Africa/Kampala (UTC+3)
    - **Technology**: node-cron scheduler

    ## Next Steps
    1. ✅ Generate Gmail App Password
    2. ✅ Update backend/.env with credentials
    3. ✅ Restart backend server
    4. ✅ Send test email to verify
    5. ✅ Wait for automatic email at 11:59 PM tonight!

    ## Support
    If you encounter issues:
    1. Check backend terminal for error logs
    2. Verify Gmail app password is correct
    3. Ensure admin users have email addresses
    4. Try the test email function first
    5. Check spam/junk folder in Gmail

    ---

    **System Status**: ✅ Fully implemented and ready to use after email configuration!
