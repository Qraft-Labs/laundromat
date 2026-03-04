# 🖨️ Receipt Printing Guide for Lush Laundry ERP

    ## Overview
    The system now includes **Print Receipt** functionality that can work with:
    - ✅ **Regular office printers** (A4/Letter paper)
    - ✅ **Thermal receipt printers** (80mm POS printers)
    - ✅ **Any printer connected to your computer**

    ---

    ## 🎯 How It Works

    ### **1. Browser-Based Printing (Current Implementation)**
    When you click "Print Order Receipt", the system:
    1. Opens a new window with a formatted receipt
    2. Automatically triggers the browser's print dialog
    3. You select your printer and print

    **Advantages:**
    - ✅ Works immediately, no installation needed
    - ✅ Compatible with ANY printer (thermal or regular)
    - ✅ Works on Windows, Mac, Linux
    - ✅ Mobile-friendly (can print from tablets/phones)

    **Best For:**
    - Desktop/laptop computers
    - Regular office printers
    - Manual printing workflow

    ---

    ## 🖨️ Printer Options

    ### **Option 1: Regular Office Printer (A4/Letter)**
    ✅ **Already Working!**
    - Uses standard paper sizes
    - Good for detailed receipts with logos
    - Can be filed for records
    - Works with any office printer

    **How to Use:**
    1. Click "Print Order Receipt" in order details
    2. Select your office printer
    3. Choose paper size (A4 or Letter)
    4. Print!

    ---

    ### **Option 2: Thermal Receipt Printer (80mm POS)**
    ✅ **Already Working!**
    - Receipt is pre-formatted for 80mm width
    - Automatic paper sizing
    - Fast printing
    - No ink required (uses heat)

    **Popular Thermal Printers:**
    - Epson TM-T20
    - Star Micronics TSP143
    - Bixolon SRP-350
    - Any 80mm ESC/POS printer

    **How to Use:**
    1. Connect thermal printer to computer via USB
    2. Install printer driver from manufacturer
    3. Set as default printer (optional)
    4. Click "Print Order Receipt"
    5. Select thermal printer from dialog
    6. Print!

    **Receipt Format:**
    ```
    ╔══════════════════════════════╗
    ║  🧺 LUSH DRY CLEANERS        ║
    ║     & LAUNDROMAT             ║
    ╠══════════════════════════════╣
    ║     📋 ORDER RECEIPT         ║
    ╚══════════════════════════════╝

    ┌───────────────────────────────┐
    │ ORDER DETAILS                 │
    ├───────────────────────────────┤
    │ Order #:  ORD-2026-001        │
    │ Date:     2026-01-09          │
    │ Customer: John Doe            │
    └───────────────────────────────┘

    ┌─────────────────────────────────────┐
    │           ITEMS ORDERED             │
    ├─────────────────────────────────────┤
    │ 1.  Shirt                           │
    │     Dry Clean × 2      UGX 20,000  │
    ├─────────────────────────────────────┤
    │ 2.  Trousers                        │
    │     Launder × 1        UGX 10,000  │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │        PAYMENT SUMMARY              │
    ├─────────────────────────────────────┤
    │ Subtotal:           UGX 30,000     │
    ├─────────────────────────────────────┤
    │ *TOTAL:*            UGX 30,000     │
    ├─────────────────────────────────────┤
    │ Amount Paid:        UGX 30,000     │
    │ *Status:*           ✅ FULLY PAID  │
    └─────────────────────────────────────┘

    📅 Pickup: 2026-01-15

    ═══════════════════════════════════════
    Thank you for choosing Lush!
    📞 Call us for any inquiries
    🌟 We value your business!
    ═══════════════════════════════════════
    ```

    ---

    ### **Option 3: Advanced - ESC/POS Commands (Future Enhancement)**

    For **fully automated thermal printing** without print dialog:

    **What You Need:**
    - ESC/POS compatible thermal printer
    - HTTPS connection (for WebUSB API)
    - Browser support: Chrome, Edge

    **Libraries to Consider:**
    1. **escpos-printer-adapter** - Browser-based ESC/POS
    2. **react-thermal-printer** - React component for thermal printing
    3. **Browser WebUSB API** - Direct USB communication

    **Implementation Steps:**
    ```bash
    # Install thermal printing library
    npm install escpos-printer-adapter

    # Or use WebUSB directly
    # Requires HTTPS and user permission
    ```

    **Code Example:**
    ```typescript
    import { ThermalPrinter } from 'escpos-printer-adapter';

    const printThermal = async (order, items) => {
    const printer = new ThermalPrinter();
    await printer.connect(); // Asks user to select printer
    
    printer.alignCenter();
    printer.bold(true);
    printer.println('LUSH DRY CLEANERS');
    printer.bold(false);
    printer.println('& LAUNDROMAT');
    printer.drawLine();
    
    printer.alignLeft();
    printer.println(`Order #: ${order.order_number}`);
    printer.println(`Date: ${formatDate(order.created_at)}`);
    printer.println(`Customer: ${order.customer_name}`);
    printer.drawLine();
    
    printer.println('ITEMS:');
    items.forEach(item => {
        printer.println(`${item.item_name}`);
        printer.println(`  ${item.service_type} x${item.quantity}  ${formatUGX(item.total_price)}`);
    });
    
    printer.drawLine();
    printer.println(`TOTAL: ${formatUGX(order.total_amount)}`);
    printer.cut();
    await printer.print();
    };
    ```

    **Pros:**
    - ✅ Silent printing (no dialog)
    - ✅ Faster workflow
    - ✅ Professional POS experience

    **Cons:**
    - ❌ Requires HTTPS
    - ❌ Browser compatibility limited
    - ❌ User must grant USB permission
    - ❌ More complex setup

    ---

    ## 🔧 Setup Instructions

    ### **For Regular Printers:**
    1. ✅ Already working - nothing to install!
    2. Just click Print and select your printer

    ### **For Thermal Printers:**

    #### **Windows:**
    1. Connect thermal printer via USB
    2. Windows will detect printer automatically
    3. If not detected:
    - Download driver from manufacturer website
    - Install driver
    - Set printer as "Ready"
    4. Test with "Print Order Receipt" button

    #### **Mac:**
    1. Connect thermal printer
    2. Go to System Preferences → Printers & Scanners
    3. Click "+" to add printer
    4. Select your thermal printer
    5. Download driver if prompted
    6. Test with "Print Order Receipt" button

    #### **Linux:**
    1. Connect printer via USB
    2. Install CUPS: `sudo apt install cups`
    3. Add printer: `sudo lpadmin -p ThermalPrinter -E -v usb://...`
    4. Test with `lpstat -p` to verify
    5. Use "Print Order Receipt" button

    ---

    ## 📱 Mobile Printing

    ### **Android/iOS Devices:**
    - ✅ Works with AirPrint (iOS) or Google Cloud Print (Android)
    - Connect mobile thermal printers via Bluetooth
    - Use browser print functionality

    ### **Bluetooth Thermal Printers:**
    Popular models:
    - **Epson TM-P20** - Portable receipt printer
    - **Star Micronics SM-L200** - Mobile thermal printer
    - **Zebra ZQ110** - Ultra-compact printer

    **How to Connect:**
    1. Pair Bluetooth printer with phone/tablet
    2. Open Lush ERP in browser
    3. Click "Print Order Receipt"
    4. Select Bluetooth printer
    5. Print!

    ---

    ## 💡 Best Practices

    ### **For Regular Office:**
    - Use A4 paper for detailed receipts
    - Keep printed receipts for audit trail
    - Bind monthly receipts for records

    ### **For POS/Counter:**
    - Use 80mm thermal printer
    - Set printer as default for quick printing
    - Keep thermal paper rolls in stock
    - Store receipts in cool, dry place (thermal fades in heat)

    ### **For Busy Shops:**
    - Consider auto-print after order creation
    - Set up multiple printers (one per workstation)
    - Use barcode on receipt for quick scanning

    ---

    ## 🎨 Customization

    ### **Change Business Info:**
    Edit the `printReceipt` function in [Orders.tsx](frontend/src/pages/Orders.tsx):

    ```typescript
    <div class="receipt-header">
    <h1>🧺 LUSH DRY CLEANERS</h1>
    <p>& LAUNDROMAT</p>
    <p>Contact: 0700-XXX-XXX</p> {/* Add your phone */}
    <p>Email: info@lushlaundry.com</p> {/* Add your email */}
    <p>Location: Your Address Here</p> {/* Add address */}
    </div>
    ```

    ### **Add Logo:**
    ```html
    <div class="receipt-header">
    <img src="/logo.png" alt="Logo" style="width: 50mm; height: auto;" />
    <h1>LUSH DRY CLEANERS</h1>
    ...
    </div>
    ```

    ### **Adjust Thermal Width:**
    Default: 80mm
    Change to 58mm:
    ```css
    body {
    width: 58mm; /* Changed from 80mm */
    font-size: 10px; /* Smaller font for narrower paper */
    }
    ```

    ---

    ## 🚀 Advanced Features (Optional)

    ### **Auto-Print on Order Creation:**
    ```typescript
    // In NewOrder.tsx after creating order:
    const handleCreateOrder = async () => {
    const response = await axios.post('/api/orders', orderData);
    const newOrder = response.data.order;
    
    // Auto-print receipt
    printReceipt(newOrder, orderItems);
    
    toast.success('Order created and receipt printed!');
    };
    ```

    ### **Print Multiple Copies:**
    ```typescript
    const printMultiple = (order, items, copies = 2) => {
    for (let i = 0; i < copies; i++) {
        setTimeout(() => printReceipt(order, items), i * 1000);
    }
    };
    ```

    ### **Email + Print Combined:**
    ```typescript
    const sendAndPrint = (order, items) => {
    // Send email (existing functionality)
    sendReceiptEmail(order, items);
    
    // Print receipt
    printReceipt(order, items);
    
    toast.success('Receipt sent via email and printed!');
    };
    ```

    ---

    ## ❓ Troubleshooting

    ### **Print dialog doesn't open:**
    - Check if popup blocker is enabled (disable for Lush ERP)
    - Try a different browser (Chrome, Firefox, Edge)

    ### **Receipt is cut off:**
    - Check printer paper size settings
    - Adjust margins in print dialog
    - Verify `@page` size in CSS matches your printer

    ### **Thermal printer prints blank:**
    - Check thermal paper (might be inserted upside down)
    - Verify printer driver is installed
    - Test printer with other applications first

    ### **Formatting issues:**
    - Receipt uses monospace font for alignment
    - If alignment breaks, check font settings in printer preferences
    - Use Chrome/Edge for best compatibility

    ### **Can't find printer:**
    - Ensure printer is powered on
    - Check USB/network connection
    - Restart printer and try again
    - Update printer driver

    ---

    ## 📞 Support

    For printer-specific issues:
    1. Check manufacturer's support website
    2. Verify driver compatibility with your OS
    3. Test printer with manufacturer's test utility
    4. Contact printer manufacturer support

    For ERP printing issues:
    - Check browser console for errors
    - Verify internet connection
    - Try different browser
    - Clear browser cache and cookies

    ---

    ## ✅ Summary

    **Current Status: ✅ FULLY WORKING**
    - ✅ Print button added to order details
    - ✅ Receipt formatted for 80mm thermal printers
    - ✅ Compatible with regular office printers
    - ✅ Works with ANY printer connected to computer
    - ✅ Cross-platform (Windows, Mac, Linux)
    - ✅ Mobile-friendly (works on tablets/phones)

    **What Works Right Now:**
    1. Click "Print Order Receipt" in order details
    2. Browser opens print dialog
    3. Select any printer (thermal, office, PDF, etc.)
    4. Print receipt

    **No Additional Software Needed!**
    The current implementation works immediately without:
    - ❌ No special drivers required
    - ❌ No additional libraries to install
    - ❌ No complex configuration
    - ❌ No server-side printing setup

    **Just connect your printer and print!** 🎉

    ---

    *Last Updated: January 9, 2026*
