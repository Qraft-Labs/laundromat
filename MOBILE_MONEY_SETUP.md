# Mobile Money Payment Integration Setup

    ## Overview
    The system now supports multiple payment methods:
    - **Cash** - Traditional cash payments
    - **Mobile Money** - MTN Mobile Money & Airtel Money
    - **Bank Transfer** - Bank to bank transfers
    - **On Account** - Credit system for regular customers

    ## Current Implementation (Phase 1)

    ### ✅ What's Ready Now:
    1. **Payment Method Selection**: Users can choose payment method when creating orders
    2. **Mobile Money Provider**: Select between MTN Mobile Money or Airtel Money
    3. **Transaction Reference**: Required field for mobile money and bank transfers
    4. **Payment Notifications**: Admins and cashiers get notified when payments are received
    5. **Transaction Tracking**: All transaction references are stored in the database

    ### 📋 Database Structure:
    - Added `transaction_reference` column to `orders` table
    - Stores mobile money transaction IDs and bank references
    - Links payments to specific orders

    ### 🔔 Notification System:
    - **For Mobile Money/Bank Payments**: Both admins and cashiers receive notifications when payment is made
    - **Message Format**: "Payment of UGX X received via MTN Mobile Money for order ORD20260001 (Ref: MTN-12345)"
    - **Display**: Appears in notification dropdown (bell icon) on dashboard

    ## Deployment Phase (Phase 2) - API Integration

    ### 🚀 MTN Mobile Money API Setup

    #### 1. Register as MTN MoMo Developer
    - Visit: https://momodeveloper.mtn.com/
    - Create developer account
    - Subscribe to Collection API
    - Get your credentials:
    - User ID
    - API Key
    - Primary Key
    - Secondary Key

    #### 2. Environment Variables
    Add to `.env` file:
    ```env
    # MTN Mobile Money
    MTN_MOMO_BASE_URL=https://momodeveloper.mtn.com  # Production
    MTN_MOMO_USER_ID=your_mtn_user_id
    MTN_MOMO_API_KEY=your_mtn_api_key
    MTN_MOMO_PRIMARY_KEY=your_mtn_primary_key
    MTN_MOMO_SECONDARY_KEY=your_mtn_secondary_key
    MTN_MOMO_COLLECTION_PRIMARY_KEY=your_collection_key
    ```

    #### 3. Implementation Steps
    The `mobileMoney.service.ts` file has placeholder functions ready for:
    - `requestMTNPayment()` - Initiate payment request to customer's phone
    - `checkPaymentStatus()` - Verify if payment was successful
    - `processMobileMoneyCallback()` - Handle webhook notifications

    ### 🚀 Airtel Money API Setup

    #### 1. Get Airtel Money Credentials
    - Contact Airtel Uganda Business Team
    - Request API access for merchant payments
    - Get credentials:
    - Client ID
    - Client Secret
    - API Key

    #### 2. Environment Variables
    Add to `.env` file:
    ```env
    # Airtel Money
    AIRTEL_MONEY_BASE_URL=https://openapi.airtel.africa  # Production
    AIRTEL_MONEY_CLIENT_ID=your_airtel_client_id
    AIRTEL_MONEY_CLIENT_SECRET=your_airtel_client_secret
    AIRTEL_MONEY_API_KEY=your_airtel_api_key
    ```

    #### 3. Implementation Steps
    The `mobileMoney.service.ts` file has placeholder functions ready for:
    - `requestAirtelPayment()` - Initiate payment request
    - `checkPaymentStatus()` - Verify payment
    - `processMobileMoneyCallback()` - Handle webhook

    ### 🔗 Webhook Setup (Both Providers)

    #### Create Webhook Endpoint
    You'll need to add routes for payment callbacks:

    ```typescript
    // backend/src/routes/mobileMoney.routes.ts
    router.post('/callback/mtn', async (req, res) => {
    await processMobileMoneyCallback('MTN', req.body);
    res.status(200).send('OK');
    });

    router.post('/callback/airtel', async (req, res) => {
    await processMobileMoneyCallback('AIRTEL', req.body);
    res.status(200).send('OK');
    });
    ```

    #### Register Webhook URLs
    - **MTN**: Register at https://momodeveloper.mtn.com/
    - URL: `https://yourdomain.com/api/mobile-money/callback/mtn`
    - **Airtel**: Provide to Airtel team
    - URL: `https://yourdomain.com/api/mobile-money/callback/airtel`

    ## How It Works

    ### Current Flow (Manual Verification):
    1. Cashier creates order and selects "Mobile Money"
    2. Customer pays using their mobile money app
    3. Customer provides transaction reference
    4. Cashier enters the reference in the system
    5. System stores reference and sends notification
    6. Admin can verify payment in mobile money portal

    ### Future Flow (API Integration):
    1. Cashier creates order and selects "Mobile Money"
    2. System sends payment request to customer's phone
    3. Customer approves payment on their phone
    4. Mobile money provider sends webhook to your system
    5. System automatically:
    - Updates order payment status
    - Sends notification to admins/cashiers
    - Generates receipt
    - Updates accounting records

    ## Benefits of API Integration

    ### ✅ Automated Payment Verification
    - No need to manually enter transaction references
    - Instant payment confirmation

    ### ✅ Real-time Accounting
    - Automatic recording of all transactions
    - Accurate financial reports
    - Reduced human error

    ### ✅ Better Customer Experience
    - Faster order processing
    - Instant receipts
    - No need to provide transaction codes

    ### ✅ Improved Cash Flow Management
    - Real-time payment tracking
    - Automated reconciliation
    - Better visibility of revenue

    ## Security Considerations

    ### 🔒 Best Practices:
    1. **Store API Keys Securely**: Never commit .env file to git
    2. **Use HTTPS**: All API communications must be encrypted
    3. **Validate Webhooks**: Verify signature of incoming callbacks
    4. **Rate Limiting**: Implement API call limits
    5. **Transaction Logs**: Keep detailed logs of all payment attempts
    6. **Reconciliation**: Daily reconciliation with mobile money statements

    ## Testing

    ### Before Going Live:
    1. Use sandbox/test environments provided by MTN/Airtel
    2. Test with small amounts first
    3. Verify all webhooks are received correctly
    4. Ensure notifications work properly
    5. Test refund/reversal scenarios
    6. Verify accounting records are accurate

    ## Support Contacts

    ### MTN Mobile Money:
    - Developer Portal: https://momodeveloper.mtn.com/
    - Support: developer@mtn.com

    ### Airtel Money:
    - Uganda Business: Contact Airtel Uganda directly
    - API Support: Through your account manager

    ## Cost Considerations

    ### Transaction Fees:
    - **MTN Mobile Money**: ~1% per transaction
    - **Airtel Money**: ~1% per transaction
    - **Bank Transfer**: Varies by bank
    - **Cash**: No fees

    ### API Costs:
    - **MTN MoMo**: Free sandbox, production may have monthly fees
    - **Airtel Money**: Negotiate with Airtel team

    ## Next Steps for Deployment

    1. ✅ **Complete Phase 1**: Payment method selection (DONE)
    2. 📋 **Register with MTN MoMo**: Get API credentials
    3. 📋 **Contact Airtel Money**: Get API credentials
    4. 📋 **Update Environment Variables**: Add all API keys
    5. 📋 **Uncomment API Integration Code**: In mobileMoney.service.ts
    6. 📋 **Test in Sandbox**: Verify all functionality
    7. 📋 **Setup Webhooks**: Register callback URLs
    8. 📋 **Go Live**: Switch to production credentials
    9. 📋 **Monitor**: Watch for errors and issues

    ## File Structure
    ```
    backend/
    ├── src/
    │   ├── services/
    │   │   └── mobileMoney.service.ts  # Mobile money API integration
    │   └── controllers/
    │       └── order.controller.ts     # Order creation with payment notifications
    └── add_transaction_reference.js   # Database migration (completed)

    frontend/
    └── src/
        └── pages/
            └── NewOrder.tsx            # Payment method selection UI
    ```

    ## Questions?

    If you have any questions about the mobile money integration during deployment, refer to:
    - MTN MoMo Documentation: https://momodeveloper.mtn.com/api-documentation/
    - Contact your Airtel account manager
    - Review the mobileMoney.service.ts file for implementation details
