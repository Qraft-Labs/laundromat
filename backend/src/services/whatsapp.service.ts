import twilio from 'twilio';

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

interface SendMessageOptions {
  to: string; // Customer phone number with country code (e.g., +256754723614)
  message: string;
  orderId?: number;
  orderNumber?: string;
  mediaUrl?: string; // URL to PDF or image attachment
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send WhatsApp message to customer
 */
export const sendWhatsAppMessage = async (
  options: SendMessageOptions
): Promise<MessageResult> => {
  try {
    const { to, message, mediaUrl } = options;
    
    // Ensure phone number has whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    console.log(`📱 Sending WhatsApp to ${formattedTo}:`, message);
    if (mediaUrl) console.log(`📎 With attachment: ${mediaUrl}`);
    
    const messageData: any = {
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      body: message,
    };
    
    // Add media attachment if provided (PDF must be publicly accessible URL)
    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }
    
    const response = await client.messages.create(messageData);
    
    console.log(`✅ Message sent! SID: ${response.sid}, Status: ${response.status}`);
    
    return {
      success: true,
      messageId: response.sid,
    };
  } catch (error: any) {
    console.error('❌ WhatsApp send error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send order confirmation message
 */
export const sendOrderConfirmation = async (
  customerName: string,
  customerPhone: string,
  orderNumber: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    total: number;
    amountPaid: number;
    balance: number;
    pickupDate: string;
  }
): Promise<MessageResult> => {
  // Build itemized list
  const itemsList = orderDetails.items
    .map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${item.price.toLocaleString()} UGX`)
    .join('\n');

  const message = `Hello ${customerName}! 👋

🧺 *ORDER CONFIRMATION*
Order #: ${orderNumber}
Date: ${new Date().toLocaleDateString()}

*ITEMS:*
${itemsList}

*PAYMENT SUMMARY:*
💰 Total: ${orderDetails.total.toLocaleString()} UGX
💵 Paid: ${orderDetails.amountPaid.toLocaleString()} UGX
${orderDetails.balance > 0 ? `⚠️ Balance Due: ${orderDetails.balance.toLocaleString()} UGX` : '✅ Fully Paid'}

📅 Pickup Date: ${orderDetails.pickupDate}

We'll notify you when ready!

📋 *TERMS & CONDITIONS:*
✓ Check items carefully before collection
✓ Complaints must be made within 7 days of pickup

Thank you for choosing Lush Laundry! ✨`;
  
  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    orderNumber,
  });
};

/**
 * Send order ready notification with order details
 */
export const sendOrderReady = async (
  customerName: string,
  customerPhone: string,
  orderNumber: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number }>;
    orderDate: string;
    totalAmount: number;
    amountPaid: number;
    balance: number;
  }
): Promise<MessageResult> => {
  // Build items list (without prices)
  const itemsList = orderDetails.items
    .map((item) => `• ${item.name} x${item.quantity}`)
    .join('\n');

  const message = `Good news ${customerName}! 🎉

✅ *ORDER READY FOR PICKUP*

Order #: ${orderNumber}
Order Date: ${orderDetails.orderDate}
Ready: ${new Date().toLocaleDateString()}

*YOUR ITEMS:*
${itemsList}

*PAYMENT:*
💰 Total: ${orderDetails.totalAmount.toLocaleString()} UGX
💵 Paid: ${orderDetails.amountPaid.toLocaleString()} UGX
${orderDetails.balance > 0 ? `⚠️ Balance Due: ${orderDetails.balance.toLocaleString()} UGX` : '✅ Fully Paid'}

📍 Visit Lush Laundry anytime to collect!

📋 *REMINDER:*
✓ Check items carefully before collection
✓ Complaints must be made within 7 days of pickup

Thank you for choosing us! ✨`;
  
  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    orderNumber,
  });
};

/**
 * Send payment confirmation
 */
export const sendPaymentConfirmation = async (
  customerName: string,
  customerPhone: string,
  orderId: number,
  amountPaid: number
): Promise<MessageResult> => {
  const message = `Payment Received! ✅\n\nThank you ${customerName}!\n\nOrder #${orderId}\nAmount: ${amountPaid.toLocaleString()} UGX\n\nYour receipt has been generated.\n\nLush Laundry - We care for your clothes! 🧺`;
  
  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    orderId,
  });
};

/**
 * Send delivery notification
 */
export const sendDeliveryNotification = async (
  customerName: string,
  customerPhone: string,
  orderId: number,
  driverName: string,
  eta: string
): Promise<MessageResult> => {
  const message = `Your order is on the way! 🚗\n\nHi ${customerName},\n\nOrder #${orderId} is being delivered.\n\nDriver: ${driverName}\nEstimated Arrival: ${eta}\n\nLush Laundry 🧺`;
  
  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    orderId,
  });
};

/**
 * Send overdue payment reminder
 */
export const sendPaymentReminder = async (
  customerName: string,
  customerPhone: string,
  orderId: number,
  amountDue: number,
  daysPastDue: number
): Promise<MessageResult> => {
  const message = `Payment Reminder 📋\n\nHi ${customerName},\n\nOrder #${orderId} has an outstanding balance.\n\nAmount Due: ${amountDue.toLocaleString()} UGX\nDays Overdue: ${daysPastDue}\n\nPlease visit us or call to arrange payment.\n\nLush Laundry\n📞 Contact us anytime`;
  
  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    orderId,
  });
};
