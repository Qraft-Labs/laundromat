# SMS Notification System - Setup Guide

    ## ✨ Features Implemented

    Your Lush Laundry system now automatically sends SMS notifications to customers when their orders are ready for pickup!

    ### Automated Notifications
    - 📱 **Order Ready SMS**: Automatically sent when order status changes to "READY"
    - 🎉 Beautiful, professional message format with emojis
    - 📞 Uses customer's phone number from database
    - ⚡ Non-blocking (doesn't slow down order updates)

    ### Message Template
    When an order is marked as READY, customers receive:

    ```
    Hello [Customer Name]! 🎉

    Your laundry order [ORDER123] is ready for pickup!

    📍 Visit us at: Lush Laundry
    ⏰ Mon-Sat: 7:00 AM - 9:00 PM

    Thank you for choosing Lush Laundry! ✨
    ```

    ## 🚀 How to Activate SMS (Africa's Talking)

    ### Step 1: Create Account
    1. Visit https://africastalking.com
    2. Click "Sign Up" and register your business
    3. Verify your email and phone number

    ### Step 2: Get API Credentials
    1. Log in to your Africa's Talking dashboard
    2. Go to **Settings** → **API Key**
    3. Copy your:
    - **Username** (usually "sandbox" for testing)
    - **API Key** (long string like "atsk_xxxxx...")

    ### Step 3: Add Credits
    1. Go to **Payments** → **Buy Credits**
    2. Add credits (minimum UGX 10,000)
    3. **Cost**: ~UGX 35 per SMS in Uganda

    ### Step 4: Configure Backend
    1. Open `backend/.env` file
    2. Update these values:
    ```env
    SMS_ENABLED=true
    AFRICASTALKING_API_KEY=your_actual_api_key_here
    AFRICASTALKING_USERNAME=your_actual_username_here
    SMS_SENDER_ID=LUSHLAUNDRY
    ```

    ### Step 5: Restart Backend
    ```bash
    cd backend
    npm run dev
    ```

    ## 🧪 Testing (Without Spending Money)

    The system has a **testing mode** built-in:

    1. Keep `SMS_ENABLED=false` in `.env`
    2. Update an order to "READY" status
    3. Check backend console - you'll see:
    ```
    📵 SMS disabled. Would have sent:
    { to: '+256700123456', message: '...' }
    ```

    This lets you test the flow without using credits!

    ## 📋 Additional Features Available

    The SMS service includes these ready-to-use functions:

    ### 1. Payment Reminders
    ```typescript
    sendPaymentReminder(phone, orderNumber, customerName, balance)
    ```

    ### 2. Birthday/Anniversary Greetings
    ```typescript
    sendSpecialDayGreeting(phone, customerName, 'birthday', discountPercent)
    ```

    ### 3. Bulk Promotional SMS
    ```typescript
    sendBulkPromo(recipients, promoMessage)
    ```

    ## 🔧 How It Works

    1. **Order Status Update**: When you change an order to "READY" in the Orders page
    2. **Check Previous Status**: System checks if status was not already "READY"
    3. **Get Customer Info**: Fetches customer name and phone from database
    4. **Send SMS**: Calls Africa's Talking API with beautiful message
    5. **Log Result**: Console shows success or failure (doesn't interrupt order update)

    ## 📊 Cost Estimation

    **Uganda SMS Rates** (via Africa's Talking):
    - Local SMS: UGX 30-35 per message
    - 100 messages: ~UGX 3,500
    - 500 messages: ~UGX 17,500
    - 1000 messages: ~UGX 35,000

    **Example Monthly Cost** (100 orders/month):
    - 100 "Order Ready" SMS: ~UGX 3,500/month
    - Very affordable for customer satisfaction! 🎯

    ## ⚙️ Advanced Configuration

    ### Customize Business Hours
    Edit in `.env`:
    ```env
    BUSINESS_HOURS=Mon-Sat: 8:00 AM - 8:00 PM
    ```

    ### Register Custom Sender ID (Optional)
    1. In Africa's Talking dashboard, go to **SMS** → **Sender IDs**
    2. Request sender ID (e.g., "LUSHLAUNDRY")
    3. Approval takes 1-2 business days
    4. Update `.env`: `SMS_SENDER_ID=LUSHLAUNDRY`

    Default sender ID is your Africa's Talking shortcode (works immediately).

    ## 🐛 Troubleshooting

    ### SMS Not Sending
    1. Check backend console for error messages
    2. Verify `SMS_ENABLED=true` in `.env`
    3. Confirm API credentials are correct
    4. Ensure you have credits in your Africa's Talking account
    5. Check phone number format: `+256700123456` (international format)

    ### Invalid Phone Number Error
    - Phone numbers must be in international format
    - Uganda: `+256` prefix
    - Remove spaces and dashes
    - Example: `+256700123456` ✅ NOT `0700123456` ❌

    ### Testing Without Credits
    - Set `SMS_ENABLED=false`
    - Messages will be logged to console only
    - Perfect for development!

    ## 📞 Support

    **Africa's Talking Support**:
    - Email: support@africastalking.com
    - Phone: +254 20 2606815
    - Docs: https://developers.africastalking.com/

    **Lush Laundry SMS Service**:
    - All SMS functions are in: `backend/src/services/sms.service.ts`
    - Integration is in: `backend/src/controllers/order.controller.ts`

    ## 🎯 Next Steps

    1. ✅ Sign up for Africa's Talking
    2. ✅ Add credits to your account
    3. ✅ Update `.env` with API credentials
    4. ✅ Set `SMS_ENABLED=true`
    5. ✅ Test by marking an order as READY
    6. ✅ Check customer receives SMS!

    Enjoy automated customer notifications! 🚀
