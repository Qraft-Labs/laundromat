/**
 * WhatsApp/Twilio service (DISABLED)
 *
 * This module intentionally does NOT initialize Twilio.
 * It provides stubs that match the signatures used across the codebase,
 * so the app can compile and run without Twilio credentials.
 */

export type WhatsAppSendInput = {
  to: string;
  message?: string;

  // used by reminder.controller / other places
  orderId?: string | number;

  // used in some places (keep flexible)
  orderNumber?: string | number;

  // allow extra keys without failing type-checking
  [key: string]: any;
};

export type WhatsAppSendResult = {
  success: boolean;
  messageId?: string | null;
  error?: string | null;
};

function disabledResult(): WhatsAppSendResult {
  return {
    success: false,
    messageId: null,
    error: "WhatsApp/Twilio is disabled on this server"
  };
}

/**
 * Generic send function used by routes/controllers.
 */
export async function sendWhatsAppMessage(_input: WhatsAppSendInput): Promise<WhatsAppSendResult> {
  return disabledResult();
}

/**
 * Called as: sendOrderConfirmation(customerName, customerPhone, orderNumber, orderDetails)
 */
export async function sendOrderConfirmation(
  _customerName: string,
  _customerPhone: string,
  _orderNumber: string | number,
  _orderDetails: any
): Promise<WhatsAppSendResult> {
  return disabledResult();
}

/**
 * Called similarly for "ready" notifications (based on your controller usage).
 * Keep signature permissive to avoid future TS breaks.
 */
export async function sendOrderReady(
  _customerName: string,
  _customerPhone: string,
  _orderNumber: string | number,
  _payload?: any
): Promise<WhatsAppSendResult> {
  return disabledResult();
}

export default {
  sendWhatsAppMessage,
  sendOrderConfirmation,
  sendOrderReady
};
