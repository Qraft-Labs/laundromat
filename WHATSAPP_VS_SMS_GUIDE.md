# WhatsApp Business API Setup Guide

    ## 📱 WhatsApp vs SMS for Order Receipts

    ### SMS Receipt (Current - Active) ✅
    **Pros:**
    - ✅ Works immediately with Africa's Talking
    - ✅ Simple text format, universally supported
    - ✅ No app required - works on any phone
    - ✅ Cost: ~UGX 35-70 per receipt (1-2 SMS segments)

    **Cons:**
    - ❌ Limited formatting (plain text only)
    - ❌ Character limit (max ~918 chars before getting expensive)
    - ❌ No images, PDFs, or buttons
    - ❌ Not as "rich" as WhatsApp

    **Current Implementation:**
    When you create an order, customer receives:
    ```
    🧺 LUSH LAUNDRY - ORDER RECEIPT

    Hello Jane Doe!

    Order: ORD20260092
    Date: 09/01/2026

    --- ITEMS ---
    3x Men's Shirt - UGX 15,000
    2x Trousers - UGX 12,000

    Subtotal: UGX 27,000
    Total: UGX 27,000
    Paid: UGX 10,000

    ⚠️ Balance: UGX 17,000

    Thank you for choosing us! 💙
    ```

    ---

    ### WhatsApp Business API (Future Option) 🚀
    **Pros:**
    - ✅ Rich formatting (bold, italics, lists)
    - ✅ Send PDF receipts as attachments
    - ✅ Interactive buttons ("Pay Now", "View Order")
    - ✅ Media support (images, videos)
    - ✅ Delivery and read receipts
    - ✅ No character limits
    - ✅ More professional appearance

    **Cons:**
    - ❌ Requires WhatsApp Business API approval (takes 1-2 weeks)
    - ❌ More expensive: UGX 100-200 per conversation session
    - ❌ Requires business verification with Meta
    - ❌ Customer must have WhatsApp (but 95%+ do in Uganda)
    - ❌ More complex setup

    ---

    ## 🔧 How to Setup WhatsApp Business API

    ### Option 1: Africa's Talking (Recommended for Uganda)
    Africa's Talking offers WhatsApp Business API integration.

    **Steps:**
    1. **Sign up for WhatsApp Business API** at Africa's Talking
    - Visit: https://africastalking.com/whatsapp
    - Cost: Setup fee + per-conversation pricing

    2. **Business Verification**
    - Provide business registration documents
    - WhatsApp reviews and approves (1-2 weeks)
    - Must have Facebook Business Manager account

    3. **Get WhatsApp Number**
    - You need a dedicated phone number for WhatsApp Business
    - Cannot use personal WhatsApp number
    - Africa's Talking can provide one

    4. **Template Messages**
    - WhatsApp requires pre-approved message templates
    - Submit templates like "order_receipt", "order_ready"
    - Approval takes 24-48 hours

    ### Option 2: Twilio WhatsApp
    Alternative provider with similar process.

    **Steps:**
    1. Sign up at https://www.twilio.com/whatsapp
    2. Complete business verification
    3. Get WhatsApp Business Number
    4. Submit message templates
    5. Integrate with Twilio SDK

    ---

    ## 💰 Cost Comparison

    ### SMS (Current)
    - **Order Receipt**: UGX 35-70 (1-2 SMS)
    - **Order Ready**: UGX 35 (1 SMS)
    - **100 orders/month**: ~UGX 7,000

    ### WhatsApp Business API
    - **Setup Fee**: ~$50-100 USD (one-time)
    - **Per Conversation**: UGX 100-200
    - **100 orders/month**: ~UGX 20,000
    - But includes 24-hour conversation window

    **Note**: WhatsApp charges per "conversation session" (24 hours), not per message. So if customer replies, you can send more messages within 24 hours at no extra cost.

    ---

    ## 🎯 Recommendation

    ### Start with SMS (Already Implemented) ✅
    - Works immediately
    - Cost-effective
    - Good customer experience
    - Professional enough for receipts

    ### Upgrade to WhatsApp Later 🚀
    Consider WhatsApp when:
    - Business is growing (200+ orders/month)
    - Want to send PDF receipts
    - Need two-way customer communication
    - Ready to invest in premium messaging

    ---

    ## 📋 SMS Receipt Features (Current)

    Your system now sends SMS receipts automatically when orders are created:

    ✅ **What's Included:**
    - Order number
    - Date created
    - Itemized list (item name, quantity, price)
    - Subtotal and total
    - Amount paid
    - Balance remaining
    - Payment status indicator:
    - ✅ PAID IN FULL (green)
    - ⚠️ Balance: UGX X (yellow)
    - 📌 Total Due: UGX X (red)

    ✅ **When It's Sent:**
    - Immediately after order is created
    - Sent to customer's phone number in database
    - Non-blocking (doesn't slow down order creation)

    ✅ **Testing Mode:**
    - Keep `SMS_ENABLED=false` in `.env`
    - Messages logged to console
    - No SMS sent (no cost)

    ---

    ## 🔮 Future: WhatsApp Integration Code

    When you're ready for WhatsApp, the integration would look like this:

    ```typescript
    // whatsapp.service.ts
    import AfricasTalking from 'africastalking';

    const africastalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY || '',
    username: process.env.AFRICASTALKING_USERNAME || '',
    });

    const whatsapp = africastalking.WhatsApp;

    export const sendWhatsAppReceipt = async (
    customerPhone: string,
    orderNumber: string,
    receiptPDF: Buffer
    ) => {
    try {
        // Send template message with PDF attachment
        const result = await whatsapp.sendMessage({
        to: customerPhone,
        type: 'template',
        template: {
            name: 'order_receipt', // Pre-approved template name
            language: 'en',
            components: [
            {
                type: 'header',
                parameters: [
                {
                    type: 'document',
                    document: {
                    filename: `Receipt_${orderNumber}.pdf`,
                    data: receiptPDF.toString('base64'),
                    },
                },
                ],
            },
            {
                type: 'body',
                parameters: [
                { type: 'text', text: orderNumber },
                ],
            },
            ],
        },
        });

        console.log('✅ WhatsApp receipt sent:', result);
        return true;
    } catch (error) {
        console.error('❌ Failed to send WhatsApp receipt:', error);
        return false;
    }
    };
    ```

    ---

    ## 📞 Contact Africa's Talking for WhatsApp

    **Email**: support@africastalking.com  
    **Phone**: +254 20 2606815  
    **WhatsApp Docs**: https://africastalking.com/whatsapp  
    **Pricing**: Contact sales for Uganda-specific pricing

    ---

    ## ✅ Summary

    **Current Status:**
    - ✅ SMS receipts working (order creation)
    - ✅ SMS notifications working (order ready)
    - ✅ Cost-effective and reliable
    - ✅ No additional setup needed

    **Next Steps (Optional):**
    1. Test SMS receipts with `SMS_ENABLED=false`
    2. When ready, enable SMS with real credits
    3. Monitor costs for 1-2 months
    4. If volumes increase, consider WhatsApp upgrade

    **My Recommendation:**  
    Stick with SMS for now. It's working, affordable, and professional. Consider WhatsApp when you're doing 200+ orders/month and want richer customer engagement.
