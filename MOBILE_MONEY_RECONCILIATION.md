# Mobile Money Payment Reconciliation System

    ## Overview
    This system handles incoming mobile money payments from MTN/Airtel APIs that need to be assigned to customer orders.

    ## How It Works

    ### 1. **Payment Flow**

    ```
    Mobile Money API (MTN/Airtel)
            ↓
    Webhook receives payment
            ↓
    Stored in pending_payments table
            ↓
    Notification sent to all staff
            ↓
    Cashier/Admin assigns to order
            ↓
    Payment reflected in order
    ```

    ### 2. **Database Schema**

    **pending_payments table:**
    ```sql
    - id: Serial primary key
    - transaction_reference: Unique transaction ref from provider
    - payment_method: 'MOBILE_MONEY_MTN' or 'MOBILE_MONEY_AIRTEL'
    - amount: Payment amount
    - sender_phone: Phone number that sent payment
    - sender_name: Optional sender name
    - payment_date: When payment was made
    - status: 'PENDING', 'ASSIGNED', or 'REJECTED'
    - assigned_to_order_id: Links to orders table
    - assigned_by: User who assigned it
    - assigned_at: When it was assigned
    - notes: Staff notes about the assignment
    ```

    ## Features Implemented

    ### Backend

    #### 1. **pendingPayment.controller.ts**
    - `getPendingPayments()` - List all unassigned payments
    - `getAssignedPayments()` - View assignment history
    - `searchOrdersForPayment()` - Search orders by customer name/phone/order number
    - `assignPaymentToOrder()` - Assign payment to an order
    - `rejectPendingPayment()` - Mark payment as invalid/duplicate
    - `receiveMobileMoneyPayment()` - Webhook endpoint for MTN/Airtel API

    #### 2. **pendingPayment.routes.ts**
    ```
    GET    /api/pending-payments/pending        - List unassigned payments
    GET    /api/pending-payments/assigned       - List assigned payments
    GET    /api/pending-payments/search-orders  - Search for orders
    POST   /api/pending-payments/:id/assign     - Assign to order
    POST   /api/pending-payments/:id/reject     - Reject payment
    POST   /api/pending-payments/webhook/mobile-money  - Webhook (external API)
    ```

    ### Frontend

    #### 1. **AssignPaymentDialog.tsx**
    Professional modal for assigning payments with:
    - Payment details display
    - Order search by customer name, phone, order number
    - Select order from results
    - Choose payment type (FULL or PARTIAL)
    - Add assignment notes
    - Payment summary preview

    #### 2. **Payments Page Updates** (To be added)
    Add a tabs system:
    - **All Payments** (existing view)
    - **Pending Payments** (new - needs assignment)
    - **Assignment History** (new - recently assigned)

    ## How Cashiers Use It

    ### Scenario 1: Customer Pays from Registered Phone

    1. **Payment arrives** via Mobile Money API
    2. **System matches phone number** to customer automatically
    3. **Cashier reviews** the suggested match
    4. **Clicks "Assign"** to confirm
    5. **Payment applied** to order, customer notified

    ### Scenario 2: Customer Pays from Different Phone

    1. **Payment arrives** from unknown number
    2. **Cashier receives notification** "New payment needs assignment"
    3. **Goes to Payments** → **Pending Payments** tab
    4. **Sees payment**: UGX 50,000 from 0777-123456
    5. **Clicks "Assign Payment"** button
    6. **Searches** by customer name: "John Doe"
    7. **Selects** correct order from results
    8. **Chooses**: "Partial Payment" (if not full amount)
    9. **Adds note**: "Customer called, confirmed payment from spouse's number"
    10. **Clicks "Assign"**
    11. **Order updated**, customer sees payment reflected

    ### Scenario 3: Duplicate or Invalid Payment

    1. **Cashier sees suspicious** payment (duplicate transaction ref)
    2. **Clicks "Reject"** button
    3. **Enters reason**: "Duplicate - already processed"
    4. **Payment marked as rejected**, not shown again

    ## Integration Steps

    ### Step 1: Run Database Migration
    ```bash
    cd backend
    psql -U postgres -d lush_laundry -f src/database/migrations/010_create_pending_payments.sql
    ```

    ### Step 2: Test Backend Endpoints
    ```bash
    # Terminal 1 - Start backend
    cd backend
    npm run dev

    # Terminal 2 - Test webhook (simulate MTN payment)
    curl -X POST http://localhost:5000/api/pending-payments/webhook/mobile-money \
    -H "Content-Type: application/json" \
    -d '{
        "transactionReference": "MP123456789012",
        "paymentMethod": "MOBILE_MONEY_MTN",
        "amount": 50000,
        "senderPhone": "256777123456",
        "senderName": "JOHN DOE"
    }'

    # Should return: {"message": "Payment received and pending assignment"}
    ```

    ### Step 3: Update Payments.tsx

    Add import at top:
    ```tsx
    import AssignPaymentDialog from '@/components/payments/AssignPaymentDialog';
    ```

    Add state for pending payments:
    ```tsx
    const [pendingPayments, setPendingPayments] = useState([]);
    const [selectedPendingPayment, setSelectedPendingPayment] = useState(null);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'history'
    ```

    Add fetch function:
    ```tsx
    const fetchPendingPayments = async () => {
    try {
        const response = await axios.get(
        'http://localhost:5000/api/pending-payments/pending',
        { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingPayments(response.data);
    } catch (error) {
        console.error('Error fetching pending payments:', error);
    }
    };
    ```

    Add tabs UI before the statistics cards:
    ```tsx
    {/* Tabs */}
    <div className="border-b border-border">
    <div className="flex gap-4">
        <button
        onClick={() => setActiveTab('all')}
        className={`pb-2 px-1 border-b-2 ${
            activeTab === 'all'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        >
        All Payments
        </button>
        <button
        onClick={() => setActiveTab('pending')}
        className={`pb-2 px-1 border-b-2 relative ${
            activeTab === 'pending'
            ? 'border-yellow-500 text-yellow-600'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        >
        Pending Assignments
        {pendingPayments.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingPayments.length}
            </span>
        )}
        </button>
        <button
        onClick={() => setActiveTab('history')}
        className={`pb-2 px-1 border-b-2 ${
            activeTab === 'history'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        >
        Assignment History
        </button>
    </div>
    </div>
    ```

    Add pending payments table (when activeTab === 'pending'):
    ```tsx
    {activeTab === 'pending' && (
    <Card>
        <CardHeader>
        <CardTitle>Unassigned Mobile Money Payments</CardTitle>
        </CardHeader>
        <CardContent>
        {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending payments</p>
            <p className="text-sm">All mobile money payments have been assigned</p>
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pendingPayments.map((payment) => (
                <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.transaction_reference}</TableCell>
                    <TableCell className="font-semibold">{formatUGX(payment.amount)}</TableCell>
                    <TableCell>
                    <div>{payment.sender_name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{payment.sender_phone}</div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={payment.payment_method === 'MOBILE_MONEY_MTN' ? 'default' : 'secondary'}>
                        {payment.payment_method === 'MOBILE_MONEY_MTN' ? 'MTN' : 'Airtel'}
                    </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleString('en-GB')}</TableCell>
                    <TableCell>
                    <div className="flex gap-2">
                        <Button
                        size="sm"
                        onClick={() => {
                            setSelectedPendingPayment(payment);
                            setShowAssignDialog(true);
                        }}
                        >
                        Assign
                        </Button>
                        <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectPayment(payment.id)}
                        >
                        Reject
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
        </CardContent>
    </Card>
    )}
    ```

    Add AssignPaymentDialog component:
    ```tsx
    <AssignPaymentDialog
    isOpen={showAssignDialog}
    onClose={() => {
        setShowAssignDialog(false);
        setSelectedPendingPayment(null);
    }}
    payment={selectedPendingPayment}
    token={token}
    onSuccess={() => {
        fetchPendingPayments();
        fetchPayments();
    }}
    />
    ```

    ## Testing Workflow

    ### Test 1: Receive Payment via Webhook
    ```bash
    curl -X POST http://localhost:5000/api/pending-payments/webhook/mobile-money \
    -H "Content-Type: application/json" \
    -d '{
        "transactionReference": "MP987654321098",
        "paymentMethod": "MOBILE_MONEY_MTN",
        "amount": 75000,
        "senderPhone": "256701234567",
        "senderName": "Jane Smith"
    }'
    ```

    ### Test 2: View in UI
    1. Log in as cashier or admin
    2. Go to Payments page
    3. Click "Pending Assignments" tab
    4. Should see the payment

    ### Test 3: Assign Payment
    1. Click "Assign" button on the payment
    2. Search for customer by name or phone
    3. Select the correct order
    4. Choose "Full Payment" or "Partial Payment"
    5. Add note: "Customer confirmed via phone call"
    6. Click "Assign Payment"
    7. Should see success toast
    8. Payment moves to "Assignment History"
    9. Order page shows payment received

    ## API Integration (Production)

    ### MTN Mobile Money Webhook Setup
    ```javascript
    // When deploying, MTN will call this endpoint
    POST https://your-erp-domain.com/api/pending-payments/webhook/mobile-money

    // MTN sends:
    {
    "transactionReference": "MP...",
    "amount": 50000,
    "senderPhone": "256...",
    "senderName": "...",
    "paymentDate": "2026-01-18T..."
    }

    // Your ERP responds:
    {
    "message": "Payment received",
    "status": "success"
    }
    ```

    ### Airtel Money Webhook Setup
    Same endpoint, different paymentMethod:
    ```javascript
    {
    "transactionReference": "AM...",
    "paymentMethod": "MOBILE_MONEY_AIRTEL",
    "amount": 50000,
    ...
    }
    ```

    ## Security Considerations

    1. **Webhook Authentication**: Add API key validation
    ```typescript
    // In receiveMobileMoneyPayment function
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.MOBILE_MONEY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
    }
    ```

    2. **Duplicate Detection**: Already implemented (checks transaction_reference)

    3. **Amount Validation**: Verify amounts match expected ranges

    4. **Phone Number Validation**: Format validation for Ugandan numbers

    ## Benefits

    ✅ **No Manual Entry**: Payments come automatically from API
    ✅ **Prevents Errors**: No typos in transaction references  
    ✅ **Audit Trail**: Full history of who assigned what
    ✅ **Flexibility**: Handle payments from any phone number
    ✅ **Professional**: Clean assignment interface
    ✅ **Security**: Prevents duplicate payments
    ✅ **Notifications**: Staff alerted immediately
    ✅ **Partial Payments**: Support for installments

    ## Future Enhancements

    1. **Auto-matching**: AI suggests likely orders based on amount/timing
    2. **SMS Confirmation**: Send SMS to customer after assignment
    3. **Refund Handling**: Process refunds for overpayments
    4. **Bulk Assignment**: Assign multiple payments at once
    5. **Mobile App**: Assign payments from phone
    6. **Voice Confirmation**: Call customer to confirm
    7. **Payment Link Integration**: Generate payment links for customers

    ## Support

    For questions about mobile money API integration:
    - MTN: Contact MTN Mobile Money Business Support
    - Airtel: Contact Airtel Money Business Support

    For ERP questions: Contact your system administrator
