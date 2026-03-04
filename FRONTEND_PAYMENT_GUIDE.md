# 📱 Frontend Payment Channel Selection - User Guide

    ## How It Shows on the Frontend

    ### ✅ What We Just Added

    When you click **"Add Payment"** on an order, you'll now see a **professional payment form** that distinguishes between different mobile money transaction types.

    ---

    ## 🖼️ The Payment Dialog - Step by Step

    ### Step 1: Select Payment Method

    **Dropdown Options:**
    ```
    ┌─────────────────────────────────────┐
    │ Select payment method               │
    ├─────────────────────────────────────┤
    │ 💵 Cash                             │
    │ 📱 Mobile Money (MTN/Airtel)        │ ⬅️ Click this
    │ 🏦 Bank Transfer                    │
    └─────────────────────────────────────┘
    ```

    ---

    ### Step 2: When You Select "Mobile Money" - Two More Options Appear

    #### A) **Provider Selection**

    ```
    ┌─────────────────────────────────────┐
    │ Mobile Money Provider               │
    ├─────────────────────────────────────┤
    │ 📲 MTN Mobile Money                 │ ⬅️ Choose MTN or...
    │ 📲 Airtel Money                     │ ⬅️ ...choose Airtel
    └─────────────────────────────────────┘
    ```

    #### B) **Payment Channel - THIS IS THE KEY!** ⭐

    ```
    ┌─────────────────────────────────────────────────────────┐
    │ How was payment received? ⭐                            │
    ├─────────────────────────────────────────────────────────┤
    │ 🏪 Merchant Code (*165#)                                │ ⬅️ RECOMMENDED
    │    Recommended - Customer paid via USSD code            │
    ├─────────────────────────────────────────────────────────┤
    │ 📱 Phone Transfer (P2P)                                 │
    │    Customer sent money directly to your number          │
    ├─────────────────────────────────────────────────────────┤
    │ 🏦 Agent Deposit                                        │
    │    Customer deposited cash at MoMo agent                │
    ├─────────────────────────────────────────────────────────┤
    │ ✍️ Manual Entry                                         │
    │    Recording existing payment                           │
    └─────────────────────────────────────────────────────────┘
    ```

    **Explanation shown below dropdown:**
    - ✅ Merchant Code: "Best for reconciliation - structured reference"
    - ⚠️ P2P: "Requires manual matching with phone statement"
    - 📍 Agent Deposit: "Agent deposit to business account"
    - ✍️ Manual: "Manual recording - specify details below"

    ---

    #### C) **Business Account Selection**

    ```
    If MTN selected:
    ┌─────────────────────────────────────────────────────────┐
    │ Which Business Account Received Payment?                │
    ├─────────────────────────────────────────────────────────┤
    │ 0772 123 456 (MTN Main) - Primary                      │ ⬅️ Your main account
    │ 0777 999 888 (MTN Secondary)                           │ ⬅️ Your backup account
    └─────────────────────────────────────────────────────────┘

    If Airtel selected:
    ┌─────────────────────────────────────────────────────────┐
    │ Which Business Account Received Payment?                │
    ├─────────────────────────────────────────────────────────┤
    │ 0755 123 456 (Airtel Main) - Primary                   │ ⬅️ Your main account
    │ 0750 999 888 (Airtel Secondary)                        │ ⬅️ Your backup account
    └─────────────────────────────────────────────────────────┘
    ```

    **Helper text:** "Select which MTN/Airtel number received this payment"

    ---

    #### D) **Additional Fields (Based on Channel Type)**

    **If you select "Phone Transfer (P2P)"** - Extra field appears:

    ```
    ┌─────────────────────────────────────────────────────────┐
    │ Customer's Phone Number (Optional)                      │
    │ ┌─────────────────────────────────────────────────────┐ │
    │ │ e.g., 0772123456 or 256772123456                    │ │
    │ └─────────────────────────────────────────────────────┘ │
    │ Phone number that sent the money (for P2P tracking)     │
    └─────────────────────────────────────────────────────────┘
    ```

    **Transaction Reference** (always shown for mobile money):

    ```
    ┌─────────────────────────────────────────────────────────┐
    │ Transaction Reference (Optional)                        │
    │ ┌─────────────────────────────────────────────────────┐ │
    │ │ e.g., MP12345678                                    │ │
    │ └─────────────────────────────────────────────────────┘ │
    │ Mobile money confirmation code                          │
    └─────────────────────────────────────────────────────────┘
    ```

    ---

    ## 🎯 Real Examples - What You Do

    ### Example 1: Customer Paid via MTN Merchant Code (*165#)

    **You receive:**
    - Customer calls: "I just paid UGX 50,000 via *165#"
    - Transaction reference: MERCH20260122001

    **What you select:**
    ```
    1. Payment Method: "Mobile Money (MTN/Airtel)"
    2. Provider: "MTN Mobile Money"
    3. How received: "🏪 Merchant Code (*165#)" ⭐
    4. Business Account: "0772 123 456 (MTN Main)"
    5. Transaction Reference: "MERCH20260122001"
    ```

    **Result:**
    ```
    Payment recorded as:
    - Method: Mobile Money (MTN)
    - Channel: MERCHANT
    - Account: 0772123456
    - Reference: MERCH20260122001
    - Status: ✅ Best reconciliation
    ```

    ---

    ### Example 2: Customer Sent Money Directly to Your Phone (P2P)

    **You receive:**
    - You check your phone
    - Customer sent UGX 30,000 from 0772999888
    - Transaction: MP124225266767

    **What you select:**
    ```
    1. Payment Method: "Mobile Money (MTN/Airtel)"
    2. Provider: "MTN Mobile Money"
    3. How received: "📱 Phone Transfer (P2P)"
    4. Business Account: "0772 123 456 (MTN Main)"
    5. Customer Phone: "0772999888"
    6. Transaction Reference: "MP124225266767"
    ```

    **Result:**
    ```
    Payment recorded as:
    - Method: Mobile Money (MTN)
    - Channel: P2P
    - Account: 0772123456
    - Sender: 0772999888
    - Reference: MP124225266767
    - Status: ⚠️ Needs manual verification with phone statement
    ```

    ---

    ### Example 3: Customer Deposited Cash at MoMo Agent

    **You receive:**
    - Customer calls: "I just deposited UGX 100,000 at Wandegeya agent to your number"
    - Agent reference: AGENT20260122001

    **What you select:**
    ```
    1. Payment Method: "Mobile Money (MTN/Airtel)"
    2. Provider: "Airtel Money"
    3. How received: "🏦 Agent Deposit"
    4. Business Account: "0755 123 456 (Airtel Main)"
    5. Transaction Reference: "AGENT20260122001"
    ```

    **Result:**
    ```
    Payment recorded as:
    - Method: Mobile Money (Airtel)
    - Channel: DEPOSIT
    - Account: 0755123456
    - Reference: AGENT20260122001
    - Status: 📍 Agent deposit confirmed
    ```

    ---

    ### Example 4: Manual Entry (Unknown/Old Payment)

    **You receive:**
    - Recording past payment
    - Not sure exact method

    **What you select:**
    ```
    1. Payment Method: "Mobile Money (MTN/Airtel)"
    2. Provider: "MTN Mobile Money"
    3. How received: "✍️ Manual Entry"
    4. Business Account: "0772 123 456 (MTN Main)"
    5. Transaction Reference: (if known)
    ```

    **Result:**
    ```
    Payment recorded as:
    - Method: Mobile Money (MTN)
    - Channel: MANUAL
    - Account: 0772123456
    - Status: Manual recording
    ```

    ---

    ## 📊 What You See After Recording

    **Toast Notification Shows:**

    ✅ **Merchant Code Example:**
    ```
    ✅ Payment Updated
    Added UGX 50,000 via MTN Mobile Money via *165#/*185#
    Order fully paid!
    ```

    ✅ **P2P Example:**
    ```
    ✅ Payment Updated
    Added UGX 30,000 via MTN Mobile Money (P2P)
    Balance: UGX 20,000
    ```

    ✅ **Agent Deposit Example:**
    ```
    ✅ Payment Updated
    Added UGX 100,000 via Airtel Money (Agent Deposit)
    Order fully paid!
    ```

    ---

    ## 🎯 How It Solves Your Question

    ### Your Question:
    > "How do I distinguish between MTN MoMo merchant code payment (*165#) and MTN MoMo P2P deposit?"

    ### Answer:
    **They are NOW SEPARATE OPTIONS in the form!** ✅

    **Old System (Before):**
    ```
    Payment Method: Mobile Money (MTN)  ⬅️ That's all you had
    ```

    **New System (Now):**
    ```
    Payment Method: Mobile Money (MTN)
    ├─ How received?
    │   ├─ 🏪 Merchant Code (*165#)      ⬅️ Customer paid via USSD
    │   ├─ 📱 P2P Transfer               ⬅️ Customer sent to your number
    │   ├─ 🏦 Agent Deposit              ⬅️ Cash deposit at agent
    │   └─ ✍️ Manual Entry               ⬅️ Recording existing payment
    └─ Which account?
        ├─ 0772 123 456 (MTN Main)
        └─ 0777 999 888 (MTN Secondary)
    ```

    ---

    ## 💡 Smart Features

    ### Auto-Recommendations
    - When you select Mobile Money → Defaults to "MERCHANT" (recommended)
    - Shows warning icon (⚠️) for P2P to remind you it needs manual matching
    - Shows checkmark (✅) for Merchant Code confirming best practice

    ### Dynamic Display
    - Account dropdown changes based on provider (MTN shows MTN accounts, Airtel shows Airtel accounts)
    - Sender phone field only appears for P2P transfers
    - Helper text updates based on your selections

    ### Validation
    - Shows which reconciliation type (automatic vs manual)
    - Reminds you to get transaction reference
    - Suggests which method is best for business

    ---

    ## 📋 Configuration Needed (One-Time Setup)

    ### Update Your Business Account Numbers

    In the code, replace these placeholder numbers with YOUR actual business accounts:

    **For MTN:**
    ```tsx
    <SelectItem value="0772123456">0772 123 456 (MTN Main) - Primary</SelectItem>
    <SelectItem value="0777999888">0777 999 888 (MTN Secondary)</SelectItem>
    ```

    **For Airtel:**
    ```tsx
    <SelectItem value="0755123456">0755 123 456 (Airtel Main) - Primary</SelectItem>
    <SelectItem value="0750999888">0750 999 888 (Airtel Secondary)</SelectItem>
    ```

    **Change to YOUR numbers:**
    ```tsx
    // MTN
    <SelectItem value="0772XXXXXX">0772 XXX XXX (Your MTN Main)</SelectItem>

    // Airtel
    <SelectItem value="0755XXXXXX">0755 XXX XXX (Your Airtel Main)</SelectItem>
    ```

    ---

    ## ✅ Summary

    ### What Changed:

    **Before:**
    - Payment Method: "Mobile Money (MTN)" ❌ Too vague
    - No way to tell P2P vs Merchant code
    - No way to track which business account

    **After:**
    - Payment Method: "Mobile Money (MTN)" ✅
    - Payment Channel: "Merchant Code" or "P2P" or "Deposit" ✅
    - Business Account: "0772 123 456 (MTN Main)" ✅
    - All data tracked separately ✅

    ### Result:
    You can now **properly distinguish** between:
    - ✅ MTN Merchant Code payment (*165#)
    - ✅ MTN P2P transfer
    - ✅ MTN Agent deposit
    - ✅ Airtel Merchant Code payment (*185#)
    - ✅ Airtel P2P transfer
    - ✅ Airtel Agent deposit

    **AND** track which business phone number received each payment!

    ---

    **Your accountant will love this level of detail!** 💼✨
