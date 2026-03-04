# 🔌 API Integrations Guide

    ## Overview

    Before going fully live, you should integrate these essential APIs for better customer experience and automated payment processing.

    ---

    ## 🚦 Integration Priority

    | API | Priority | When to Integrate | Impact |
    |-----|----------|------------------|---------|
    | **Mobile Money** | 🔴 HIGH | Before launch | Direct revenue collection |
    | **WhatsApp Automation** | 🟡 MEDIUM | After launch | Customer communication |
    | **SMS API** | 🟢 LOW | Optional | Backup notifications |

    ---

    ## 💰 Mobile Money Integration

    ### Why You Need This
    - Accept payments directly through MTN Mobile Money, Airtel Money
    - Automated payment confirmation
    - Reduce manual cash handling
    - Customer convenience
    - Real-time payment tracking

    ### Available Options in Uganda

    #### 1. **Flutterwave** (Recommended - Easiest)
    - **Website:** https://flutterwave.com
    - **Supports:** MTN, Airtel, Visa, Mastercard
    - **Pricing:** 3.8% per transaction
    - **Free tier:** Test mode available
    - **Integration:** Simple REST API

    **Pros:**
    ✅ Supports multiple payment methods  
    ✅ Easy to integrate  
    ✅ Good documentation  
    ✅ Test mode for development  
    ✅ Dashboard for tracking  

    **Cons:**
    ❌ 3.8% transaction fee  
    ❌ Requires business registration  

    #### 2. **Beyonic API** (Uganda-focused)
    - **Website:** https://beyonic.com
    - **Supports:** MTN, Airtel
    - **Pricing:** Custom pricing
    - **Best for:** High-volume businesses

    #### 3. **Direct Mobile Money APIs**

    **MTN Mobile Money API:**
    - **Website:** https://momodeveloper.mtn.com
    - **Pricing:** Lower fees (negotiate)
    - **Complexity:** More technical setup required
    - **Best for:** Large businesses

    **Airtel Money API:**
    - **Website:** https://developers.airtel.africa
    - **Similar to MTN in complexity**

    ### How to Integrate Flutterwave (Recommended)

    #### Step 1: Create Account
    ```bash
    1. Go to https://flutterwave.com/ug
    2. Click "Get Started"
    3. Sign up with business email
    4. Complete business verification
    5. Get approved (2-3 days)
    ```

    #### Step 2: Get API Keys
    ```bash
    1. Login to dashboard
    2. Go to Settings → API Keys
    3. Copy:
    - Public Key (for frontend)
    - Secret Key (for backend)
    - Encryption Key (for security)
    ```

    #### Step 3: Install SDK
    ```bash
    # In backend folder
    npm install flutterwave-node-v3
    ```

    #### Step 4: Add Environment Variables
    ```env
    # In backend .env
    FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
    FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
    FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxx
    FLUTTERWAVE_WEBHOOK_SECRET=xxxxx
    ```

    #### Step 5: Backend Integration (Example)

    ```typescript
    // backend/src/services/payment.service.ts
    import Flutterwave from 'flutterwave-node-v3';

    const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY!,
    process.env.FLUTTERWAVE_SECRET_KEY!
    );

    export async function initiateMobileMoneyPayment(orderData: {
    amount: number;
    phoneNumber: string;
    email: string;
    orderId: string;
    customerName: string;
    }) {
    try {
        const payload = {
        tx_ref: `lush-${orderData.orderId}-${Date.now()}`,
        amount: orderData.amount,
        currency: 'UGX',
        network: 'MTN', // or 'AIRTEL'
        email: orderData.email,
        phone_number: orderData.phoneNumber,
        fullname: orderData.customerName,
        redirect_url: `${process.env.FRONTEND_URL}/payment/verify`,
        };

        const response = await flw.MobileMoney.uganda(payload);
        
        return {
        success: true,
        paymentUrl: response.data.link,
        reference: response.data.tx_ref,
        };
    } catch (error) {
        console.error('Payment initiation failed:', error);
        return { success: false, error: error.message };
    }
    }

    export async function verifyPayment(transactionId: string) {
    try {
        const response = await flw.Transaction.verify({ id: transactionId });
        
        if (response.data.status === 'successful' && 
            response.data.amount === expectedAmount &&
            response.data.currency === 'UGX') {
        // Payment verified!
        return {
            success: true,
            data: response.data,
        };
        }
        
        return { success: false, message: 'Payment verification failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
    }

    // Webhook handler (for automatic payment confirmation)
    export async function handleFlutterwaveWebhook(payload: any, signature: string) {
    // Verify webhook signature
    const hash = crypto
        .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET!)
        .update(JSON.stringify(payload))
        .digest('hex');

    if (hash !== signature) {
        throw new Error('Invalid webhook signature');
    }

    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        // Update order payment status in database
        const orderId = extractOrderId(payload.data.tx_ref);
        await updateOrderPaymentStatus(orderId, {
        status: 'PAID',
        amountPaid: payload.data.amount,
        paymentMethod: 'MOBILE_MONEY',
        transactionRef: payload.data.flw_ref,
        });
    }
    }
    ```

    #### Step 6: Frontend Integration

    ```typescript
    // frontend/src/services/payment.ts
    export async function initiatePayment(orderId: string, amount: number) {
    const response = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Redirect to payment page
        window.location.href = data.paymentUrl;
    }
    }
    ```

    ---

    ## 💬 WhatsApp Automation

    ### Why You Need This
    - Send order confirmations
    - Notify customers when order is ready
    - Send delivery notifications
    - Automated reminders for payments
    - Better customer experience

    ### Available Options

    #### 1. **Twilio WhatsApp API** (Recommended)
    - **Website:** https://www.twilio.com/whatsapp
    - **Pricing:** $0.005 per message (~UGX 19)
    - **Free tier:** $15.50 credit (3,100 messages)
    - **Status:** Most reliable

    **Pros:**
    ✅ Official WhatsApp Business API  
    ✅ High reliability  
    ✅ Good documentation  
    ✅ Free trial credit  
    ✅ No approval delays  

    **Cons:**
    ❌ Requires phone number verification  
    ❌ Templates must be approved by WhatsApp  

    #### 2. **WATI (WhatsApp Team Inbox)** (Uganda-focused)
    - **Website:** https://www.wati.io
    - **Pricing:** Starting $49/month
    - **Features:** Inbox + automation
    - **Best for:** Team management

    #### 3. **Africa's Talking** (Local)
    - **Website:** https://africastalking.com
    - **Supports:** WhatsApp, SMS
    - **Pricing:** Competitive local rates

    ### How to Integrate Twilio WhatsApp

    #### Step 1: Setup Twilio Account
    ```bash
    1. Go to https://www.twilio.com/try-twilio
    2. Sign up (get $15 free credit)
    3. Verify your phone number
    4. Enable WhatsApp in console
    5. Request WhatsApp sender approval
    ```

    #### Step 2: Get API Credentials
    ```bash
    1. Go to Console → Account Info
    2. Copy:
    - Account SID
    - Auth Token
    3. Go to WhatsApp → Senders
    4. Copy your WhatsApp number
    ```

    #### Step 3: Create Message Templates
    ```bash
    1. Go to WhatsApp → Message Templates
    2. Create templates (examples below)
    3. Submit for WhatsApp approval (24-48 hours)
    ```

    **Template Examples:**

    **Order Confirmation:**
    ```
    Hello {{1}}, your laundry order #{{2}} has been received! 
    Total: UGX {{3}}
    Items: {{4}}
    Expected ready date: {{5}}
    Thank you for choosing Lush Laundry! 🧺
    ```

    **Order Ready:**
    ```
    Good news {{1}}! Your order #{{2}} is ready for pickup/delivery.
    Balance: UGX {{3}}
    Please collect at your convenience.
    - Lush Laundry Team
    ```

    **Payment Reminder:**
    ```
    Hi {{1}}, friendly reminder about order #{{2}}.
    Outstanding balance: UGX {{3}}
    Please complete payment at your earliest convenience.
    Thank you! 🙏
    ```

    #### Step 4: Install Twilio SDK
    ```bash
    # In backend folder
    npm install twilio
    ```

    #### Step 5: Add Environment Variables
    ```env
    # In backend .env
    TWILIO_ACCOUNT_SID=ACxxxxx
    TWILIO_AUTH_TOKEN=xxxxx
    TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
    ```

    #### Step 6: Backend Integration

    ```typescript
    // backend/src/services/whatsapp.service.ts
    import twilio from 'twilio';

    const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
    );

    export async function sendOrderConfirmation(order: {
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    totalAmount: number;
    items: string;
    readyDate: string;
    }) {
    try {
        const message = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${order.customerPhone}`,
        body: `Hello ${order.customerName}, your laundry order #${order.orderNumber} has been received!
        
    Total: UGX ${order.totalAmount.toLocaleString()}
    Items: ${order.items}
    Expected ready: ${order.readyDate}

    Thank you for choosing Lush Laundry! 🧺`,
        });

        console.log('WhatsApp sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('WhatsApp error:', error);
        return { success: false, error: error.message };
    }
    }

    export async function sendOrderReadyNotification(order: {
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    balance: number;
    }) {
    try {
        const message = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${order.customerPhone}`,
        body: `Good news ${order.customerName}! 

    Your order #${order.orderNumber} is ready for pickup! ✅

    ${order.balance > 0 
    ? `Balance due: UGX ${order.balance.toLocaleString()}` 
    : 'Fully paid - just collect your items!'}

    Location: [Your shop address]
    Hours: Mon-Sat, 8am-8pm

    - Lush Laundry Team`,
        });

        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('WhatsApp error:', error);
        return { success: false, error: error.message };
    }
    }

    export async function sendPaymentReminder(order: {
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    balance: number;
    }) {
    try {
        const message = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${order.customerPhone}`,
        body: `Hi ${order.customerName}, 

    Friendly reminder about order #${order.orderNumber}
    Outstanding balance: UGX ${order.balance.toLocaleString()}

    You can pay via:
    📱 Mobile Money: [Your number]
    💵 Cash at shop
    💳 Card payment

    Thank you! 🙏`,
        });

        return { success: true, messageId: message.sid };
    } catch (error) {
        return { success: false, error: error.message };
    }
    }
    ```

    #### Step 7: Integrate with Order Controller

    ```typescript
    // backend/src/controllers/order.controller.ts
    import { sendOrderConfirmation, sendOrderReadyNotification } from '../services/whatsapp.service';

    export async function createOrder(req: Request, res: Response) {
    try {
        // ... existing order creation code ...
        
        // After order is saved:
        const itemsList = orderItems.map(item => 
        `${item.quantity}x ${item.item_name}`
        ).join(', ');

        // Send WhatsApp confirmation
        await sendOrderConfirmation({
        customerName: customer.name,
        customerPhone: customer.phone,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        items: itemsList,
        readyDate: estimatedReadyDate,
        });

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }

    export async function updateOrderStatus(req: Request, res: Response) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // ... update order status ...

        // If status changed to READY, send notification
        if (status === 'READY') {
        await sendOrderReadyNotification({
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            orderNumber: order.order_number,
            balance: order.balance,
        });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }
    ```

    ---

    ## 📱 SMS API (Optional Backup)

    ### Africa's Talking SMS

    ```bash
    # Install SDK
    npm install africastalking
    ```

    ```typescript
    // Simpler than WhatsApp, no templates needed
    import AfricasTalking from 'africastalking';

    const sms = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
    }).SMS;

    export async function sendSMS(to: string, message: string) {
    try {
        const result = await sms.send({
        to: [to],
        message: message,
        });
        return { success: true, result };
    } catch (error) {
        return { success: false, error };
    }
    }
    ```

    ---

    ## 🚀 Integration Timeline

    ### Before Launch (Critical)
    1. **Mobile Money** (Week 1-2)
    - [ ] Sign up for Flutterwave
    - [ ] Complete business verification
    - [ ] Get API keys
    - [ ] Integrate payment flow
    - [ ] Test with small amounts
    - [ ] Go live

    ### After Launch (Important)
    2. **WhatsApp** (Week 3-4)
    - [ ] Sign up for Twilio
    - [ ] Create message templates
    - [ ] Submit for WhatsApp approval
    - [ ] Integrate notification system
    - [ ] Test with real customers
    - [ ] Monitor delivery rates

    ### Optional (Later)
    3. **SMS Backup** (Month 2+)
    - [ ] Setup Africa's Talking
    - [ ] Add as fallback to WhatsApp
    - [ ] Monitor costs vs value

    ---

    ## 💵 Cost Estimation (Monthly)

    ### Scenario: 100 orders/month

    **Mobile Money (Flutterwave):**
    - Average order: UGX 50,000
    - Fee: 3.8% = UGX 1,900 per order
    - Monthly: UGX 190,000 (worth it for convenience!)

    **WhatsApp (Twilio):**
    - 3 messages per order (confirm, ready, reminder)
    - 300 messages × UGX 19 = UGX 5,700/month
    - Very affordable!

    **Total API Costs: ~UGX 195,700/month**

    **ROI:**
    - Faster payments = better cash flow
    - Less manual work = save staff time
    - Better customer experience = more repeat business
    - **Worth the investment!** ✅

    ---

    ## 🔐 Security Best Practices

    ### API Key Security
    ```env
    # NEVER commit .env files to GitHub!
    # Add to .gitignore:
    .env
    .env.production
    .env.local
    ```

    ### Use Environment Variables
    ```typescript
    // Good ✅
    const apiKey = process.env.FLUTTERWAVE_SECRET_KEY;

    // Bad ❌
    const apiKey = 'FLWSECK-12345...'; // Never hardcode!
    ```

    ### Webhook Security
    ```typescript
    // Always verify webhook signatures
    function verifyWebhookSignature(payload, signature) {
    const hash = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return hash === signature;
    }
    ```

    ---

    ## 📋 Integration Checklist

    ### Mobile Money
    - [ ] Business registered and verified
    - [ ] Flutterwave account approved
    - [ ] API keys obtained
    - [ ] Environment variables set
    - [ ] SDK installed
    - [ ] Payment flow implemented
    - [ ] Webhook handler created
    - [ ] Test transactions successful
    - [ ] Production mode enabled
    - [ ] Customer payments working

    ### WhatsApp
    - [ ] Twilio account created
    - [ ] Phone number verified
    - [ ] WhatsApp sender approved
    - [ ] Message templates created
    - [ ] Templates approved by WhatsApp
    - [ ] SDK installed
    - [ ] Notification service created
    - [ ] Integrated with order flow
    - [ ] Test messages sent
    - [ ] Production ready

    ---

    ## 🆘 Troubleshooting

    ### Mobile Money Issues

    **Payment fails:**
    - Check customer has sufficient balance
    - Verify phone number format (+256...)
    - Check API keys are production keys
    - Monitor Flutterwave dashboard logs

    **Webhook not firing:**
    - Verify webhook URL is public (not localhost)
    - Check webhook secret matches
    - Look at Flutterwave webhook logs
    - Test with webhook tester tools

    ### WhatsApp Issues

    **Messages not sending:**
    - Verify phone number has +country code
    - Check templates are approved
    - Verify WhatsApp number is active
    - Check Twilio logs for errors

    **Template rejected:**
    - No promotional content allowed
    - Must be transactional only
    - Follow WhatsApp content policies
    - Resubmit with modifications

    ---

    ## 🎯 Deployment Order

    ### Recommended Sequence:

    ```
    1. Deploy basic system (without APIs) ✅
    - Test core functionality
    - Get familiar with production
    
    2. Add Mobile Money (1-2 weeks later) 💰
    - Critical for revenue
    - Test thoroughly first
    
    3. Add WhatsApp (2-3 weeks later) 💬
    - Improves experience
    - Not critical for launch
    
    4. Add SMS backup (optional) 📱
    - If WhatsApp has issues
    - Costs more, use sparingly
    ```

    ---

    ## 📞 Support Contacts

    **Flutterwave Support:**
    - Email: developers@flutterwavego.com
    - Docs: https://developer.flutterwave.com

    **Twilio Support:**
    - Support: https://support.twilio.com
    - Docs: https://www.twilio.com/docs/whatsapp

    **Africa's Talking:**
    - Email: help@africastalking.com
    - Docs: https://developers.africastalking.com

    ---

    ## 💡 Pro Tips

    1. **Start Simple**
    - Launch without APIs first
    - Add them incrementally
    - Test each integration thoroughly

    2. **Test Mode First**
    - Use sandbox/test mode
    - Make fake transactions
    - Verify everything works
    - Then switch to production

    3. **Monitor Costs**
    - Check API usage daily
    - Set up billing alerts
    - Compare costs vs benefits

    4. **Customer Experience**
    - Don't spam customers
    - Useful notifications only
    - Allow opt-out option

    5. **Fallback Plans**
    - If API fails, log error
    - Continue operation manually
    - Fix and retry later

    ---

    **Remember:** You CAN launch without these APIs! Add them after your system is stable and running. Core system works fine with manual processes initially. 

    **Priority: Get basic system live → Then add integrations** 🚀
