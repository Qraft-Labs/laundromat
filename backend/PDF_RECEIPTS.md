# PDF Receipt Generation Feature

    ## Overview

    The system now generates professional PDF receipts for every order and sends them via WhatsApp. This provides customers with a clean, formatted receipt that they can save, print, or share.

    ## How It Works

    ### 1. Order Creation
    When a new order is created:
    1. Order details are saved to the database
    2. A PDF receipt is automatically generated
    3. The PDF is formatted like a thermal printer receipt (80mm width)
    4. The receipt is temporarily saved to `backend/receipts/` folder

    ### 2. PDF Format
    The PDF receipt includes:
    - **Header**: Business name (LUSH DRY CLEANERS & LAUNDROMAT)
    - **Order Details**: Order number, date, customer name
    - **Items List**: Each item with service type, quantity, and amount
    - **Financial Summary**: Subtotal, discount, total, amount paid, balance due
    - **Pickup Date**: Expected pickup date (3 days from order date)
    - **Footer**: Thank you message

    ### 3. WhatsApp Delivery
    - The text receipt is sent via WhatsApp SMS
    - PDF is generated and stored for reference
    - After sending, the PDF is automatically deleted to save storage

    ### 4. Automatic Cleanup
    - Old PDF files (>24 hours) are automatically deleted
    - Cleanup runs every 24 hours
    - Prevents storage buildup

    ## File Structure

    ```
    backend/
    ├── receipts/                          # Temporary PDF storage (auto-created)
    │   └── receipt_ORD20260859_1234567890.pdf
    ├── src/
    │   ├── services/
    │   │   ├── pdf.service.ts            # PDF generation logic
    │   │   └── sms.service.ts            # WhatsApp/SMS sending (updated)
    │   ├── controllers/
    │   │   └── order.controller.ts       # Order creation (updated)
    │   └── index.ts                      # Server startup (cleanup scheduler)
    └── PDF_RECEIPTS.md                   # This file
    ```

    ## Key Functions

    ### `generateOrderReceiptPDF()`
    Located in: `src/services/pdf.service.ts`

    Generates a PDF receipt with thermal printer styling (80mm width).

    **Parameters:**
    ```typescript
    {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderDate: Date;
    pickupDate: Date;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    discount: number;
    total: number;
    amountPaid: number;
    balance: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
    }
    ```

    **Returns:** `Promise<string>` - File path of generated PDF

    **Example:**
    ```typescript
    const pdfPath = await generateOrderReceiptPDF({
    orderNumber: 'ORD20260859',
    customerName: 'John Doe',
    customerPhone: '+256700123456',
    orderDate: new Date(),
    pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    items: [
        { name: 'Shirt - Dry Cleaning', quantity: 2, price: 10000 },
        { name: 'Trousers - Pressing', quantity: 1, price: 5000 }
    ],
    subtotal: 15000,
    discount: 0,
    total: 15000,
    amountPaid: 15000,
    balance: 0,
    paymentStatus: 'PAID'
    });
    // Returns: '/path/to/backend/receipts/receipt_ORD20260859_1234567890.pdf'
    ```

    ### `cleanupOldReceipts()`
    Located in: `src/services/pdf.service.ts`

    Deletes PDF files older than 24 hours from the receipts folder.

    **Usage:**
    - Automatically runs on server startup
    - Runs every 24 hours via setInterval
    - Can be manually called if needed

    ### `sendWhatsAppPDF()`
    Located in: `src/services/sms.service.ts`

    Sends a WhatsApp message with PDF attachment.

    **Note:** Currently configured for Africa's Talking API. May require WhatsApp Business API setup for media attachments.

    ## Configuration

    No additional configuration required! The feature works automatically when:
    1. Customer has a valid phone number
    2. SMS is enabled (`SMS_ENABLED=true` in .env)
    3. Africa's Talking credentials are configured

    ## Dependencies

    ```json
    {
    "pdfkit": "^0.15.x",
    "@types/pdfkit": "^0.13.x"
    }
    ```

    Installed via: `npm install pdfkit @types/pdfkit`

    ## Testing

    ### Manual Test
    1. Start the backend server
    2. Create a new order through the frontend with a customer who has a phone number
    3. Check the console logs:
    ```
    📄 Generating PDF receipt for ORD20260859
    ✅ PDF receipt generated: /path/to/receipts/receipt_ORD20260859_1234567890.pdf
    📱 Sending order receipt SMS for ORD20260859 to +256700123456
    ✅ Order receipt sent via WhatsApp for ORD20260859
    🗑️ Cleaned up PDF: /path/to/receipts/receipt_ORD20260859_1234567890.pdf
    ```
    4. Check the `backend/receipts/` folder (should be empty after successful send)

    ### View Generated PDF
    To keep the PDF for inspection, temporarily comment out the cleanup code in `order.controller.ts`:
    ```typescript
    // Clean up PDF file after sending
    // try {
    //   fs.unlinkSync(pdfPath);
    //   console.log(`🗑️ Cleaned up PDF: ${pdfPath}`);
    // } catch (err) {
    //   console.error(`⚠️ Failed to delete PDF: ${err}`);
    // }
    ```

    ## Future Enhancements

    ### Option 1: WhatsApp Media Attachments
    Upgrade to Africa's Talking WhatsApp Business API to send PDFs directly as attachments instead of just text.

    **Benefits:**
    - Professional appearance
    - Customer can download/save PDF
    - Better for record keeping

    **Requirements:**
    - WhatsApp Business API setup
    - Media hosting (AWS S3, Cloudinary, or public URL)
    - Updated `sendWhatsAppPDF()` implementation

    ### Option 2: Email Receipts
    Add email functionality to send PDF receipts via email in addition to WhatsApp.

    **Implementation:**
    ```typescript
    import nodemailer from 'nodemailer';

    export const sendReceiptEmail = async (
    customerEmail: string,
    orderNumber: string,
    pdfPath: string
    ) => {
    const transporter = nodemailer.createTransporter({...});
    
    await transporter.sendMail({
        to: customerEmail,
        subject: `Receipt for Order ${orderNumber}`,
        text: 'Thank you for your order! Please find your receipt attached.',
        attachments: [{ filename: `receipt_${orderNumber}.pdf`, path: pdfPath }]
    });
    };
    ```

    ### Option 3: QR Code
    Add a QR code to the PDF for order tracking:
    ```typescript
    import QRCode from 'qrcode';

    const qrCodeUrl = await QRCode.toDataURL(`https://lush-laundry.com/track/${orderNumber}`);
    // Add to PDF as image
    ```

    ### Option 4: Branded Header
    Add company logo to the PDF header:
    ```typescript
    doc.image('logo.png', 50, 20, { width: 100, align: 'center' });
    ```

    ## Troubleshooting

    ### PDF Not Generated
    **Symptoms:** No PDF in receipts folder, error in logs

    **Causes:**
    - pdfkit not installed: `npm install pdfkit @types/pdfkit`
    - Permission issues: Check folder write permissions
    - Invalid order data: Verify all required fields are present

    **Solution:**
    ```bash
    # Check if pdfkit is installed
    npm list pdfkit

    # Reinstall if needed
    npm install pdfkit @types/pdfkit

    # Check folder permissions
    ls -la backend/receipts/
    ```

    ### WhatsApp Not Sending
    **Symptoms:** PDF generated but not sent via WhatsApp

    **Causes:**
    - SMS disabled: Check `SMS_ENABLED=true` in .env
    - Invalid Africa's Talking credentials
    - Customer phone number invalid/missing

    **Solution:**
    - Verify environment variables
    - Check Africa's Talking dashboard for API status
    - Test with a valid phone number in international format (+256...)

    ### Storage Filling Up
    **Symptoms:** Many PDF files in receipts folder

    **Causes:**
    - Cleanup not running
    - Files not being deleted after send

    **Solution:**
    - Check server logs for cleanup messages
    - Manually delete old files: `rm backend/receipts/*`
    - Verify cleanup scheduler is running in index.ts

    ## Monitoring

    ### Key Metrics to Monitor
    1. **PDF Generation Success Rate**: % of orders with successful PDF generation
    2. **WhatsApp Delivery Rate**: % of PDFs successfully sent
    3. **Storage Usage**: Size of receipts folder
    4. **Cleanup Effectiveness**: Number of files deleted per cleanup cycle

    ### Console Logs to Watch
    ```
    📄 Generating PDF receipt for ORD... (PDF generation started)
    ✅ PDF receipt generated: ... (PDF creation success)
    📱 Sending order receipt SMS for ... (WhatsApp send started)
    ✅ Order receipt sent via WhatsApp for ... (WhatsApp send success)
    🗑️ Cleaned up PDF: ... (File deletion success)
    🧹 Running scheduled PDF cleanup... (Cleanup cycle started)
    ```

    ### Error Logs to Alert On
    ```
    ❌ PDF generation error: ... (Critical - affects all orders)
    ❌ Failed to send receipt for ...: ... (Warning - specific order affected)
    ⚠️ Failed to delete PDF: ... (Low priority - storage issue)
    ```

    ## Security Considerations

    1. **Temporary Storage**: PDFs are only stored temporarily (deleted after 24 hours max)
    2. **No Personal Data in Filenames**: Uses order numbers and timestamps only
    3. **Access Control**: Receipts folder should not be publicly accessible
    4. **Customer Privacy**: PDFs contain customer info - ensure secure transmission

    ## Best Practices

    1. **Always Clean Up**: Never skip PDF deletion to prevent storage issues
    2. **Log Everything**: Keep detailed logs for debugging and monitoring
    3. **Test Before Deploy**: Test with real phone numbers in staging environment
    4. **Monitor Storage**: Set up alerts for receipts folder size
    5. **Backup Strategy**: Don't rely on temporary PDFs for long-term storage

    ## Support

    For issues or questions:
    1. Check console logs for error messages
    2. Verify environment configuration
    3. Test with Africa's Talking API directly
    4. Review this documentation

    ---

    **Last Updated:** January 2026  
    **Version:** 1.0  
    **Maintainer:** Development Team
