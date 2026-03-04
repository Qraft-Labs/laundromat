import { query } from '../config/database';

interface Customer {
  id: number;
  name: string;
}

interface PriceItem {
  id: number;
  name: string;
  price: number;
  ironing_price: number;
  category: string;
}

async function seedOrders() {
  try {
    console.log('🌱 Starting to seed orders...');

    // Get all customers
    const customersResult = await query('SELECT id, name FROM customers ORDER BY id');
    const customers: Customer[] = customersResult.rows;
    console.log(`Found ${customers.length} customers`);

    // Get all price items
    const priceItemsResult = await query('SELECT id, name, price, ironing_price, category FROM price_items ORDER BY id');
    const priceItems: PriceItem[] = priceItemsResult.rows;
    console.log(`Found ${priceItems.length} price items`);

    // Get admin user (we'll use them as the staff who created orders)
    const userResult = await query("SELECT id FROM users WHERE email = 'admin@lushlaundry.com' LIMIT 1");
    if (userResult.rows.length === 0) {
      console.error('Admin user not found. Please create an admin user first.');
      return;
    }
    const userId = userResult.rows[0].id;

    const paymentMethods = ['CASH', 'CASH', 'CASH', 'MOBILE_MONEY_MTN', 'MOBILE_MONEY_AIRTEL', 'BANK_TRANSFER', 'ON_ACCOUNT'];
    const serviceTypes = ['WASH', 'IRON', 'EXPRESS'];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get existing order count to continue numbering
    const countResult = await query('SELECT COUNT(*) FROM orders');
    let orderCount = parseInt(countResult.rows[0].count);

    let ordersCreated = 0;

    // Create 1-5 orders for ALL customers (every customer should have at least 1 order)
    for (const customer of customers) {
      const numOrders = Math.floor(Math.random() * 5) + 1; // 1 to 5 orders per customer

      for (let i = 0; i < numOrders; i++) {
        try {
          orderCount++;
          const orderNumber = `ORD${currentYear}${String(orderCount).padStart(4, '0')}`;

          // Random date in the last 90 days
          const daysAgo = Math.floor(Math.random() * 90);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          // Pickup date 2-5 days after order created
          const pickupDate = new Date(createdAt);
          pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 4) + 2);

          // Determine order status based on dates
          const today = new Date();
          let orderStatus: string;
          if (pickupDate < today) {
            // Past orders - mostly delivered
            const rand = Math.random();
            if (rand < 0.85) orderStatus = 'DELIVERED';
            else if (rand < 0.95) orderStatus = 'READY';
            else orderStatus = 'PROCESSING';
          } else if (pickupDate.toDateString() === today.toDateString()) {
            // Today's pickups - mostly ready
            const rand = Math.random();
            if (rand < 0.70) orderStatus = 'READY';
            else if (rand < 0.90) orderStatus = 'PROCESSING';
            else orderStatus = 'DELIVERED';
          } else {
            // Future pickups - in progress
            const rand = Math.random();
            if (rand < 0.60) orderStatus = 'PROCESSING';
            else if (rand < 0.85) orderStatus = 'RECEIVED';
            else orderStatus = 'READY';
          }

          // Random number of items (2-8 items per order)
          const numItems = Math.floor(Math.random() * 7) + 2;
          const orderItemsData = [];
          let subtotal = 0;

          // Select random items
          const selectedItems = [];
          for (let j = 0; j < numItems; j++) {
            const item = priceItems[Math.floor(Math.random() * priceItems.length)];
            const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
            const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity

            let unitPrice = 0;
            if (serviceType === 'WASH') {
              unitPrice = item.price;
            } else if (serviceType === 'IRON') {
              unitPrice = item.ironing_price || item.price;
            } else if (serviceType === 'EXPRESS') {
              unitPrice = item.price * 2; // Double price for express
            }

            const totalPrice = unitPrice * quantity;
            subtotal += totalPrice;

            selectedItems.push({
              itemId: item.id,
              itemName: item.name,
              serviceType,
              quantity,
              unitPrice,
              totalPrice,
            });
          }

          // Apply random discount (20% of orders get discount)
          const hasDiscount = Math.random() < 0.2;
          const discountPercentage = hasDiscount ? (Math.floor(Math.random() * 3) + 1) * 5 : 0; // 5%, 10%, or 15%
          const discountAmount = Math.round((subtotal * discountPercentage) / 100);
          const totalAmount = subtotal - discountAmount;

          // Determine payment status
          let paymentStatus: string;
          let amountPaid: number;
          let balance: number;
          
          if (orderStatus === 'DELIVERED') {
            // Delivered orders - mostly fully paid
            const rand = Math.random();
            if (rand < 0.90) {
              // Fully paid
              paymentStatus = 'PAID';
              amountPaid = totalAmount;
              balance = 0;
            } else {
              // Partially paid
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(totalAmount * (0.5 + Math.random() * 0.4)); // 50-90% paid
              balance = totalAmount - amountPaid;
            }
          } else if (orderStatus === 'READY') {
            // Ready orders - mix of paid, partial, unpaid
            const rand = Math.random();
            if (rand < 0.40) {
              paymentStatus = 'PAID';
              amountPaid = totalAmount;
              balance = 0;
            } else if (rand < 0.70) {
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(totalAmount * Math.random() * 0.8); // 0-80% paid
              balance = totalAmount - amountPaid;
            } else {
              paymentStatus = 'UNPAID';
              amountPaid = 0;
              balance = totalAmount;
            }
          } else {
            // Processing/Received - mostly unpaid or partial
            const rand = Math.random();
            if (rand < 0.30) {
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(totalAmount * 0.5); // 50% deposit
              balance = totalAmount - amountPaid;
            } else {
              paymentStatus = 'UNPAID';
              amountPaid = 0;
              balance = totalAmount;
            }
          }

          const paymentMethod = amountPaid > 0 ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null;

          // Generate transaction reference for mobile money and bank transfers
          let transactionReference = null;
          if (paymentMethod === 'MOBILE_MONEY_MTN') {
            // MTN format: MP + 12 digits
            transactionReference = 'MP' + Math.floor(100000000000 + Math.random() * 900000000000);
          } else if (paymentMethod === 'MOBILE_MONEY_AIRTEL') {
            // Airtel format: AM + 10 digits
            transactionReference = 'AM' + Math.floor(1000000000 + Math.random() * 9000000000);
          } else if (paymentMethod === 'BANK_TRANSFER') {
            // Bank format: BT + 8 digits
            transactionReference = 'BT' + Math.floor(10000000 + Math.random() * 90000000);
          }

          // Random notes (30% of orders have notes)
          const notes = Math.random() < 0.3 ? [
            'Handle with care',
            'Customer wants extra softener',
            'Remove stains carefully',
            'Rush order',
            'Regular customer',
            'VIP customer',
            'Pickup before 3pm',
            'Call before delivery'
          ][Math.floor(Math.random() * 8)] : null;

          // Insert order
          const orderResult = await query(
            `INSERT INTO orders (
              order_number, customer_id, user_id,
              subtotal, discount_percentage, discount_amount, total_amount,
              payment_status, payment_method, amount_paid, balance,
              order_status, pickup_date, transaction_reference, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id`,
            [
              orderNumber,
              customer.id,
              userId,
              subtotal,
              discountPercentage,
              discountAmount,
              totalAmount,
              paymentStatus,
              paymentMethod,
              amountPaid,
              balance,
              orderStatus,
              pickupDate.toISOString().split('T')[0],
              transactionReference,
              notes,
              createdAt.toISOString(),
            ]
          );

          const orderId = orderResult.rows[0].id;

          // Insert order items
          for (const item of selectedItems) {
            await query(
              `INSERT INTO order_items (
                order_id, price_item_id, service_type,
                quantity, unit_price, total_price
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                orderId,
                item.itemId,
                item.serviceType,
                item.quantity,
                item.unitPrice,
                item.totalPrice,
              ]
            );
          }

          ordersCreated++;
          if (ordersCreated % 50 === 0) {
            console.log(`Created ${ordersCreated} orders...`);
          }
        } catch (error) {
          console.error(`Error creating order for customer ${customer.name}:`, error);
        }
      }
    }

    console.log(`✅ Successfully seeded ${ordersCreated} orders for ${customers.length} customers!`);
    
    // Print summary
    const statusSummary = await query(`
      SELECT order_status, COUNT(*) as count 
      FROM orders 
      GROUP BY order_status 
      ORDER BY count DESC
    `);
    console.log('\n📊 Order Status Summary:');
    statusSummary.rows.forEach((row: any) => {
      console.log(`  ${row.order_status}: ${row.count}`);
    });

    const paymentSummary = await query(`
      SELECT payment_status, COUNT(*) as count 
      FROM orders 
      GROUP BY payment_status 
      ORDER BY count DESC
    `);
    console.log('\n💰 Payment Status Summary:');
    paymentSummary.rows.forEach((row: any) => {
      console.log(`  ${row.payment_status}: ${row.count}`);
    });

    const overdueSummary = await query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE pickup_date < CURRENT_DATE 
        AND order_status != 'DELIVERED'
    `);
    console.log(`\n⚠️  Overdue Orders: ${overdueSummary.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
}

seedOrders();
