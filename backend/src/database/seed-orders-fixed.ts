import { query } from '../config/database';

interface Customer {
  id: number;
  name: string;
  customer_id: string;
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
    console.log('🌱 Starting to seed orders for all customers...\n');

    // Get all customers
    const customersResult = await query('SELECT id, name, customer_id FROM customers ORDER BY id');
    const customers: Customer[] = customersResult.rows;
    console.log(`📊 Found ${customers.length} customers`);

    // Get all price items
    const priceItemsResult = await query('SELECT id, name, price, ironing_price, category FROM price_items WHERE is_active = TRUE ORDER BY id');
    const priceItems: PriceItem[] = priceItemsResult.rows;
    console.log(`📋 Found ${priceItems.length} active price items`);

    if (priceItems.length === 0) {
      console.log('❌ No price items found. Please seed price items first.');
      return;
    }

    // Get admin user (we'll use them as the staff who created orders)
    const userResult = await query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
    if (userResult.rows.length === 0) {
      console.error('❌ Admin user not found. Please create an admin user first.');
      return;
    }
    const userId = userResult.rows[0].id;
    console.log(`👤 Using user ID ${userId} as order creator\n`);

    const statuses = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];
    const paymentStatuses = ['PAID', 'PARTIAL', 'UNPAID'];
    
    // Get current year and existing order count
    const currentYear = new Date().getFullYear();
    const countResult = await query('SELECT COUNT(*) FROM orders');
    let orderCount = parseInt(countResult.rows[0].count);

    let ordersCreated = 0;
    let totalRevenue = 0;
    let statusCounts = { pending: 0, processing: 0, ready: 0, delivered: 0 };
    let paymentCounts = { PAID: 0, PARTIAL: 0, UNPAID: 0 };

    console.log('🔨 Creating orders (1-5 per customer)...\n');

    // Create 1-5 orders for each customer
    for (let custIndex = 0; custIndex < customers.length; custIndex++) {
      const customer = customers[custIndex];
      const numOrders = Math.floor(Math.random() * 5) + 1; // 1 to 5 orders per customer

      for (let i = 0; i < numOrders; i++) {
        try {
          orderCount++;
          const orderNumber = `ORD${currentYear}${String(orderCount).padStart(4, '0')}`;

          // Random date in the last 90 days
          const daysAgo = Math.floor(Math.random() * 90);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          // Due date 2-5 days after order created
          const dueDate = new Date(createdAt);
          dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 4) + 2);

          // Determine order status based on dates
          const today = new Date();
          let status: string;
          if (dueDate < today) {
            // Past due dates - mostly delivered
            const rand = Math.random();
            if (rand < 0.85) status = 'delivered';
            else if (rand < 0.95) status = 'ready';
            else status = 'processing';
          } else if (dueDate.toDateString() === today.toDateString()) {
            // Today's due date - mostly ready
            const rand = Math.random();
            if (rand < 0.70) status = 'ready';
            else if (rand < 0.90) status = 'processing';
            else status = 'delivered';
          } else {
            // Future due dates - in progress
            const rand = Math.random();
            if (rand < 0.60) status = 'processing';
            else if (rand < 0.85) status = 'pending';
            else status = 'ready';
          }

          // Random number of items (2-8 items per order)
          const numItems = Math.floor(Math.random() * 7) + 2;
          let subtotal = 0;

          // Calculate subtotal from items
          const orderItems = [];
          for (let j = 0; j < numItems; j++) {
            const item = priceItems[Math.floor(Math.random() * priceItems.length)];
            const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
            
            // Random service type (wash or iron)
            const serviceType = Math.random() < 0.6 ? 'wash' : 'iron';
            
            // Calculate unit price based on service type
            let unitPrice = 0;
            if (serviceType === 'wash') {
              unitPrice = item.price;
            } else {
              // Iron service - use ironing price if available, otherwise use regular price
              unitPrice = item.ironing_price || item.price;
            }

            const totalPrice = unitPrice * quantity;
            subtotal += totalPrice;

            orderItems.push({
              priceItemId: item.id,
              quantity,
              unitPrice,
              total: totalPrice,
              serviceType,
              itemName: item.name
            });
          }

          // Apply random discount (20% of orders get discount)
          const hasDiscount = Math.random() < 0.2;
          const discountAmount = hasDiscount ? Math.floor(subtotal * (0.05 + Math.random() * 0.10)) : 0; // 5-15%
          
          // Tax (0 for most laundry services in Uganda, but keep column)
          const tax = 0;
          
          // Calculate total
          const total = subtotal - discountAmount + tax;

          // Determine payment status and amount paid
          let paymentStatus: string;
          let amountPaid: number;
          
          if (status === 'DELIVERED') {
            // Delivered orders - mostly fully paid
            const rand = Math.random();
            if (rand < 0.90) {
              paymentStatus = 'PAID';
              amountPaid = total;
            } else if (rand < 0.97) {
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(total * (0.5 + Math.random() * 0.4)); // 50-90% paid
            } else {
              paymentStatus = 'UNPAID';
              amountPaid = 0;
            }
          } else if (status === 'READY') {
            // Ready orders - some paid upfront
            const rand = Math.random();
            if (rand < 0.40) {
              paymentStatus = 'PAID';
              amountPaid = total;
            } else if (rand < 0.70) {
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(total * (0.3 + Math.random() * 0.5)); // 30-80% paid
            } else {
              paymentStatus = 'UNPAID';
              amountPaid = 0;
            }
          } else {
            // PROCESSING/RECEIVED - mostly unpaid
            const rand = Math.random();
            if (rand < 0.10) {
              paymentStatus = 'PAID';
              amountPaid = total;
            } else if (rand < 0.30) {
              paymentStatus = 'PARTIAL';
              amountPaid = Math.floor(total * (0.2 + Math.random() * 0.4)); // 20-60% paid
            } else {
              paymentStatus = 'UNPAID';
              amountPaid = 0;
            }
          }

          // Random notes for some orders
          const hasNotes = Math.random() < 0.15;
          const noteOptions = [
            'Customer prefers gentle wash',
            'Handle with care - delicate items',
            'Rush order - customer needs by tomorrow',
            'Regular customer - provide discount',
            'Stain removal required',
            'No starch on shirts',
            'Customer will pick up personally',
            null
          ];
          const notes = hasNotes ? noteOptions[Math.floor(Math.random() * noteOptions.length)] : null;

          // Insert order
          const orderResult = await query(
            `INSERT INTO orders (
              order_number, customer_id, user_id, status, due_date,
              subtotal, discount, tax, total, amount_paid, payment_status,
              notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
            RETURNING id`,
            [
              orderNumber,
              customer.id,
              userId,
              status,
              dueDate,
              subtotal,
              discountAmount,
              tax,
              total,
              amountPaid,
              paymentStatus,
              notes,
              createdAt
            ]
          );

          const orderId = orderResult.rows[0].id;

          // Insert order items
          for (const item of orderItems) {
            await query(
              `INSERT INTO order_items (
                order_id, price_item_id, quantity, unit_price, total_price, service_type
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [orderId, item.priceItemId, item.quantity, item.unitPrice, item.total, item.serviceType]
            );
          }

          ordersCreated++;
          totalRevenue += total;
          statusCounts[status as keyof typeof statusCounts]++;
          paymentCounts[paymentStatus as keyof typeof paymentCounts]++;

          // Show progress every 50 orders
          if (ordersCreated % 50 === 0) {
            console.log(`   ✅ Created ${ordersCreated} orders...`);
          }

        } catch (error) {
          console.error(`   ⚠️  Error creating order for ${customer.name}:`, error);
        }
      }

      // Show progress every 50 customers
      if ((custIndex + 1) % 50 === 0) {
        console.log(`   📊 Processed ${custIndex + 1}/${customers.length} customers`);
      }
    }

    // Final statistics
    console.log('\n' + '='.repeat(60));
    console.log('✅ ORDER SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 STATISTICS:\n');
    console.log(`   Total Orders Created:  ${ordersCreated}`);
    console.log(`   Average per Customer:  ${(ordersCreated / customers.length).toFixed(1)}`);
    console.log(`   Total Revenue:         UGX ${totalRevenue.toLocaleString()}`);
    console.log(`   Avg Order Value:       UGX ${Math.floor(totalRevenue / ordersCreated).toLocaleString()}`);
    
    console.log('\n📋 ORDER STATUS BREAKDOWN:\n');
    console.log(`   DELIVERED:   ${statusCounts.delivered.toString().padStart(4)} orders (${Math.floor(statusCounts.delivered/ordersCreated*100)}%)`);
    console.log(`   READY:       ${statusCounts.ready.toString().padStart(4)} orders (${Math.floor(statusCounts.ready/ordersCreated*100)}%)`);
    console.log(`   PROCESSING:  ${statusCounts.processing.toString().padStart(4)} orders (${Math.floor(statusCounts.processing/ordersCreated*100)}%)`);
    console.log(`   PENDING:     ${statusCounts.pending.toString().padStart(4)} orders (${Math.floor(statusCounts.pending/ordersCreated*100)}%)`);

    console.log('\n💰 PAYMENT STATUS BREAKDOWN:\n');
    console.log(`   PAID:        ${paymentCounts.PAID.toString().padStart(4)} orders (${Math.floor(paymentCounts.PAID/ordersCreated*100)}%)`);
    console.log(`   PARTIAL:     ${paymentCounts.PARTIAL.toString().padStart(4)} orders (${Math.floor(paymentCounts.PARTIAL/ordersCreated*100)}%)`);
    console.log(`   UNPAID:      ${paymentCounts.UNPAID.toString().padStart(4)} orders (${Math.floor(paymentCounts.UNPAID/ordersCreated*100)}%)`);

    // Show sample orders
    const sampleResult = await query(`
      SELECT 
        o.order_number, 
        c.name as customer_name,
        o.status,
        o.total,
        o.payment_status,
        o.due_date
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.id DESC
      LIMIT 5
    `);
    
    console.log('\n📋 SAMPLE ORDERS (last 5 created):\n');
    sampleResult.rows.forEach((order, i) => {
      console.log(`   ${i + 1}. ${order.order_number} - ${order.customer_name}`);
      console.log(`      Status: ${order.status} | Payment: ${order.payment_status}`);
      console.log(`      Total: UGX ${parseInt(order.total).toLocaleString()} | Due: ${new Date(order.due_date).toLocaleDateString()}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATA RESTORATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ Your database now has:');
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${ordersCreated} orders with full history`);
    console.log(`   - ${priceItems.length} price items`);
    console.log(`   - Realistic financial data spanning 90 days`);
    console.log('\n💡 Next: Open your dashboard to see the restored data!\n');

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedOrders()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export default seedOrders;
