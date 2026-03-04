# Financial Calculation Security - Backend Implementation

    ## 🔒 CRITICAL SECURITY PRINCIPLE

    **NEVER TRUST THE FRONTEND FOR FINANCIAL CALCULATIONS**

    All money-related calculations MUST be performed on the backend to prevent:
    - Price manipulation by malicious users
    - Discount fraud
    - Payment amount tampering
    - Data integrity issues

    ---

    ## ✅ Backend Calculation Flow (SECURE)

    ### Order Creation Process

    1. **Frontend Sends:**
    ```json
    {
        "customer_id": 123,
        "items": [
        {
            "price_item_id": 5,
            "service_type": "wash",
            "quantity": 3
        }
        ],
        "discount_percentage": 10,
        "amount_paid": 50000
    }
    ```

    2. **Backend Validates & Calculates:**

    ```typescript
    // Step 1: Fetch ACTUAL prices from database (not from frontend)
    for (const item of items) {
        const priceFromDB = await getPriceFromDatabase(item.price_item_id);
        const actualUnitPrice = item.service_type === 'wash' 
        ? priceFromDB.price 
        : priceFromDB.ironing_price;
        
        // Calculate using DATABASE price (ignore any frontend price)
        const itemTotal = item.quantity * actualUnitPrice;
        subtotal += itemTotal;
    }
    
    // Step 2: Validate discount (prevent abuse)
    if (discount_percentage < 0 || discount_percentage > 50) {
        throw new Error('Invalid discount');
    }
    
    // Step 3: Calculate discount amount
    const discount_amount = Math.round(subtotal * (discount_percentage / 100));
    
    // Step 4: Calculate total
    const total_amount = subtotal - discount_amount;
    
    // Step 5: Calculate balance
    const balance = total_amount - amount_paid;
    ```

    3. **Backend Stores Calculated Values:**
    - All financial values stored in database are backend-calculated
    - Frontend values are IGNORED for money fields

    ---

    ## 🚫 What Frontend CANNOT Control

    - ❌ `unit_price` - Fetched from database
    - ❌ `subtotal` - Calculated from items
    - ❌ `discount_amount` - Calculated from percentage
    - ❌ `total_amount` - Calculated formula
    - ❌ `balance` - Calculated from total - paid

    ## ✅ What Frontend CAN Send

    - ✅ `customer_id` - Validated to exist
    - ✅ `items` (price_item_id, service_type, quantity) - IDs validated
    - ✅ `discount_percentage` - Validated range (0-50%)
    - ✅ `amount_paid` - Validated >= 0
    - ✅ `payment_method` - Validated enum
    - ✅ `notes` - Text only

    ---

    ## 🔐 Security Validations Implemented

    ### 1. Price Verification
    ```typescript
    // Fetch from database - prevent fake prices
    const priceResult = await db.query(
    'SELECT price, ironing_price FROM price_items WHERE id = $1',
    [item.price_item_id]
    );

    if (!priceResult.rows[0]) {
    throw new Error('Invalid item');
    }

    const actualPrice = priceResult.rows[0].price; // Use DB price
    ```

    ### 2. Discount Limits
    ```typescript
    // Max 50% discount to prevent fraud
    if (discount_percentage < 0 || discount_percentage > 50) {
    throw new Error('Discount must be 0-50%');
    }
    ```

    ### 3. Calculation Verification
    ```typescript
    // All calculations on backend
    const subtotal = sum(items.map(i => i.quantity * DB_PRICE));
    const discount = Math.round(subtotal * (discount_percentage / 100));
    const total = subtotal - discount;
    const balance = total - amount_paid;
    ```

    ### 4. Amount Paid Validation
    ```typescript
    // Cannot pay more than total (prevent negative balance abuse)
    if (amount_paid < 0) {
    throw new Error('Invalid payment amount');
    }
    ```

    ---

    ## 📊 Discount System

    The system uses TWO discount fields:

    1. **`discount_percentage`** (NUMERIC)
    - User-facing percentage (e.g., 5, 10, 15)
    - Range: 0-50%
    - Stored for reporting

    2. **`discount_amount`** (INTEGER)
    - Calculated UGX amount
    - Formula: `ROUND(subtotal * (discount_percentage / 100))`
    - Used in total calculation

    **DEPRECATED:** `discount` field (old, not used)

    ---

    ## 🧪 Testing Security

    ### Attack Scenario 1: Price Manipulation
    **Attack:** User modifies frontend to send `unit_price: 1` for expensive item

    **Defense:** Backend ignores frontend price, fetches from database
    ```typescript
    // Frontend sends: { price_item_id: 5, unit_price: 1 }
    // Backend uses:   SELECT price FROM price_items WHERE id = 5
    // Result:         Actual price (e.g., 5000) used, not 1
    ```

    ### Attack Scenario 2: Excessive Discount
    **Attack:** User sends `discount_percentage: 100` for free items

    **Defense:** Backend validates range
    ```typescript
    if (discount_percentage > 50) {
    throw new Error('Max discount is 50%');
    }
    ```

    ### Attack Scenario 3: Fake Total
    **Attack:** User sends `total_amount: 100` when actual is 100,000

    **Defense:** Backend ignores frontend total, calculates itself
    ```typescript
    // Frontend sends: { total_amount: 100 }
    // Backend calculates: subtotal - discount = 100,000
    // Stored: 100,000 (backend value)
    ```

    ---

    ## 📝 Migration Impact

    **Before (INSECURE):**
    ```typescript
    const { subtotal, discount_amount, total_amount } = req.body;
    // DANGEROUS: Trusting frontend calculations
    await db.insert({ subtotal, discount_amount, total_amount });
    ```

    **After (SECURE):**
    ```typescript
    const { items, discount_percentage } = req.body;

    // Calculate on backend
    const subtotal = calculateFromItems(items); // DB prices
    const discount = subtotal * (discount_percentage / 100);
    const total = subtotal - discount;

    await db.insert({ subtotal, discount_amount: discount, total_amount: total });
    ```

    ---

    ## 🎯 Best Practices

    1. ✅ **Always fetch prices from database**
    2. ✅ **Calculate all money values on backend**
    3. ✅ **Validate user inputs (discount range, payment >= 0)**
    4. ✅ **Use Math.round() for UGX (no decimals)**
    5. ✅ **Log all financial transactions**
    6. ✅ **Verify calculations match before storing**

    ---

    ## 🔍 Audit Checklist

    - [x] Order creation calculates subtotal from DB prices
    - [x] Discount percentage validated (0-50%)
    - [x] Discount amount calculated on backend
    - [x] Total amount calculated (subtotal - discount)
    - [x] Balance calculated (total - paid)
    - [x] Frontend money values ignored
    - [x] All item prices fetched from database
    - [x] No direct trust of frontend calculations

    ---

    ## 📌 Summary

    **Frontend Role:** Collect user input (items, quantities, discount %)

    **Backend Role:** Validate input, fetch prices, calculate everything, store results

    **Result:** Secure, tamper-proof financial system ✅
