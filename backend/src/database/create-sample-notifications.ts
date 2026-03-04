import { query } from '../config/database';

async function createSampleNotifications() {
  try {
    console.log('Creating sample notifications...');

    // Get a sample user ID
    const userResult = await query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0]?.id;

    if (!userId) {
      console.log('No users found in database. Please create a user first.');
      return;
    }

    // Create different types of notifications
    const notifications = [
      {
        type: 'OVERDUE',
        title: '5 orders overdue for pickup',
        message: 'Orders with unpaid balance are overdue. Total: UGX 250,000',
        link: '/orders?payment_status=UNPAID',
      },
      {
        type: 'READY',
        title: 'Order ORD20260787 ready for pickup',
        message: 'Customer John Doe - Call to notify',
        link: '/orders',
      },
      {
        type: 'PAYMENT',
        title: '8 orders with outstanding balance',
        message: 'Total outstanding: UGX 450,000',
        link: '/orders?payment_status=PARTIAL',
      },
      {
        type: 'SUMMARY',
        title: 'Daily Summary - Today',
        message: '12 orders processed, UGX 450,000 revenue, 3 orders ready',
        link: '/dashboard',
      },
      {
        type: 'ANNOUNCEMENT',
        title: 'Shop closes early Friday',
        message: 'Maintenance work scheduled. Closing at 5 PM instead of 9 PM.',
        link: null,
      },
    ];

    for (const notification of notifications) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, notification.type, notification.title, notification.message, notification.link]
      );
    }

    console.log(`✅ Created ${notifications.length} sample notifications for user ${userId}`);
    console.log('You can now view them in the notification dropdown!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create sample notifications:', error);
    process.exit(1);
  }
}

createSampleNotifications();
