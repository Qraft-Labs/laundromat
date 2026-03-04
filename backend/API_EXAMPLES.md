# Lush Laundry API Test Examples

    ## 1. Authentication

    ### Register New User
    ```bash
    POST http://localhost:5000/api/auth/register
    Content-Type: application/json

    {
    "email": "cashier@lushlaundry.com",
    "password": "Cashier123!",
    "full_name": "Jane Doe",
    "phone": "+256 704 555 666"
    }

    # Response: User created with PENDING status (needs admin approval)
    ```

    ### Login
    ```bash
    POST http://localhost:5000/api/auth/login
    Content-Type: application/json

    {
    "email": "admin@lushlaundry.com",
    "password": "Admin123!"
    }

    # Response includes JWT token - save this for authenticated requests
    ```

    ### Get Current User
    ```bash
    GET http://localhost:5000/api/auth/me
    Authorization: Bearer YOUR_JWT_TOKEN
    ```

    ## 2. User Management (Admin Only)

    ### Get All Users
    ```bash
    GET http://localhost:5000/api/users
    Authorization: Bearer ADMIN_TOKEN
    ```

    ### Approve Pending User
    ```bash
    PUT http://localhost:5000/api/users/3/approve
    Authorization: Bearer ADMIN_TOKEN
    ```

    ### Change User Role to Admin
    ```bash
    PUT http://localhost:5000/api/users/3/role
    Authorization: Bearer ADMIN_TOKEN
    Content-Type: application/json

    {
    "role": "ADMIN"
    }
    ```

    ## 3. Customer Management

    ### Get All Customers
    ```bash
    GET http://localhost:5000/api/customers
    Authorization: Bearer YOUR_TOKEN

    # With search
    GET http://localhost:5000/api/customers?search=Sarah
    ```

    ### Create Customer
    ```bash
    POST http://localhost:5000/api/customers
    Authorization: Bearer YOUR_TOKEN
    Content-Type: application/json

    {
    "name": "Alice Namukasa",
    "phone": "+256 709 876 543",
    "email": "alice@email.com",
    "location": "Kampala, Uganda",
    "notes": "VIP customer"
    }
    ```

    ### Get Customer Details
    ```bash
    GET http://localhost:5000/api/customers/1
    Authorization: Bearer YOUR_TOKEN
    ```

    ### Update Customer
    ```bash
    PUT http://localhost:5000/api/customers/1
    Authorization: Bearer YOUR_TOKEN
    Content-Type: application/json

    {
    "phone": "+256 709 999 888",
    "location": "New location"
    }
    ```

    ## 4. Price Management

    ### Get All Prices
    ```bash
    GET http://localhost:5000/api/prices
    Authorization: Bearer YOUR_TOKEN

    # Filter by category
    GET http://localhost:5000/api/prices?category=gents

    # Get only active items
    GET http://localhost:5000/api/prices?active=true
    ```

    ### Create Price Item (Admin Only)
    ```bash
    POST http://localhost:5000/api/prices
    Authorization: Bearer ADMIN_TOKEN
    Content-Type: application/json

    {
    "item_id": "g99",
    "name": "Designer Suit",
    "category": "gents",
    "price": 25000,
    "ironing_price": 12500
    }
    ```

    ### Update Price (Admin Only)
    ```bash
    PUT http://localhost:5000/api/prices/1
    Authorization: Bearer ADMIN_TOKEN
    Content-Type: application/json

    {
    "price": 20000,
    "ironing_price": 10000
    }
    ```

    ### Deactivate Price Item (Admin Only)
    ```bash
    PUT http://localhost:5000/api/prices/1
    Authorization: Bearer ADMIN_TOKEN
    Content-Type: application/json

    {
    "is_active": false
    }
    ```

    ## 5. Order Management

    ### Get All Orders
    ```bash
    GET http://localhost:5000/api/orders
    Authorization: Bearer YOUR_TOKEN

    # Filter by status
    GET http://localhost:5000/api/orders?status=pending

    # Filter by customer
    GET http://localhost:5000/api/orders?customer_id=1

    # Filter by date range
    GET http://localhost:5000/api/orders?from_date=2024-01-01&to_date=2024-01-31
    ```

    ### Get Order Details
    ```bash
    GET http://localhost:5000/api/orders/1
    Authorization: Bearer YOUR_TOKEN

    # Response includes order details and all items
    ```

    ### Create New Order
    ```bash
    POST http://localhost:5000/api/orders
    Authorization: Bearer YOUR_TOKEN
    Content-Type: application/json

    {
    "customer_id": 1,
    "due_date": "2024-01-20",
    "items": [
        {
        "price_item_id": 1,
        "service_type": "wash",
        "quantity": 2
        },
        {
        "price_item_id": 3,
        "service_type": "iron",
        "quantity": 1
        }
    ],
    "discount": 5000,
    "notes": "Express service"
    }

    # System automatically:
    # - Generates order number (ORD-2024-001)
    # - Calculates prices from price list
    # - Computes subtotal and total
    # - Creates order items
    ```

    ### Update Order Status
    ```bash
    PUT http://localhost:5000/api/orders/1/status
    Authorization: Bearer YOUR_TOKEN
    Content-Type: application/json

    {
    "status": "processing"
    }

    # Valid statuses: pending, processing, ready, delivered, cancelled
    ```

    ### Update Order Details
    ```bash
    PUT http://localhost:5000/api/orders/1
    Authorization: Bearer YOUR_TOKEN
    Content-Type: application/json

    {
    "status": "ready",
    "due_date": "2024-01-25",
    "discount": 10000,
    "notes": "Customer called to extend pickup"
    }
    ```

    ## 6. Reports & Analytics (Admin Only)

    ### Dashboard Statistics
    ```bash
    GET http://localhost:5000/api/reports/dashboard
    Authorization: Bearer ADMIN_TOKEN

    # Returns:
    # - Today's orders and revenue
    # - Order counts by status
    # - Customer statistics
    # - Average order value
    # - Recent orders
    ```

    ### Revenue Report
    ```bash
    GET http://localhost:5000/api/reports/revenue
    Authorization: Bearer ADMIN_TOKEN

    # Default: week
    GET http://localhost:5000/api/reports/revenue?period=week

    # Options: day, week, month, year
    GET http://localhost:5000/api/reports/revenue?period=month

    # Returns:
    # - Daily revenue breakdown
    # - Revenue by category
    # - Top customers
    # - Summary totals
    ```

    ### Customer Analytics
    ```bash
    GET http://localhost:5000/api/reports/customers
    Authorization: Bearer ADMIN_TOKEN

    # Returns:
    # - Customer segmentation (VIP, High Value, Regular, New)
    # - Customer retention (one-time, occasional, regular)
    # - New vs Returning customers
    ```

    ## 7. Health Check

    ### API Health
    ```bash
    GET http://localhost:5000/api/health

    # No auth required
    # Returns: status, timestamp, uptime
    ```

    ## Using with cURL

    ### Login Example
    ```bash
    curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@lushlaundry.com",
        "password": "Admin123!"
    }'
    ```

    ### Get Customers Example
    ```bash
    # Save token from login response
    TOKEN="your_jwt_token_here"

    curl -X GET http://localhost:5000/api/customers \
    -H "Authorization: Bearer $TOKEN"
    ```

    ### Create Order Example
    ```bash
    curl -X POST http://localhost:5000/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "customer_id": 1,
        "items": [
        {
            "price_item_id": 1,
            "service_type": "wash",
            "quantity": 2
        }
        ]
    }'
    ```

    ## Using with Postman

    1. Import the endpoints into Postman
    2. Create an environment with:
    - `base_url`: http://localhost:5000
    - `token`: (set after login)
    3. Use `{{base_url}}/api/auth/login` for login
    4. Save the token from response to environment
    5. Use `Bearer {{token}}` in Authorization header for other requests

    ## Error Responses

    ### 400 Bad Request
    ```json
    {
    "errors": [
        {
        "field": "email",
        "message": "Invalid email format"
        }
    ]
    }
    ```

    ### 401 Unauthorized
    ```json
    {
    "error": "Invalid or expired token"
    }
    ```

    ### 403 Forbidden
    ```json
    {
    "error": "Insufficient permissions",
    "required": ["ADMIN"],
    "current": "USER"
    }
    ```

    ### 404 Not Found
    ```json
    {
    "error": "Resource not found"
    }
    ```

    ### 409 Conflict
    ```json
    {
    "error": "Resource already exists",
    "details": "Email already exists"
    }
    ```

    ### 500 Server Error
    ```json
    {
    "error": "Internal server error"
    }
    ```
