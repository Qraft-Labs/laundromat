import pool from '../config/database.js';

const seedLaundryEmployees = async () => {
  const client = await pool.connect();
  
  try {
    console.log('\n👥 Seeding Laundry Business Employees...\n');
    
    await client.query('BEGIN');
    
    // Get admin user ID for 'added_by' field
    const adminResult = await client.query(
      `SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`
    );
    
    if (adminResult.rows.length === 0) {
      throw new Error('Admin user not found. Please create admin first.');
    }
    
    const adminId = adminResult.rows[0].id;
    
    // Clear existing test employees (keep the table)
    await client.query(`DELETE FROM salary_payments WHERE employee_id IN (SELECT id FROM payroll_employees WHERE employee_id_number LIKE 'EMP%')`);
    await client.query(`DELETE FROM payroll_employees WHERE employee_id_number LIKE 'EMP%'`);
    
    // Define realistic laundry business employees
    const employees = [
      // SENIOR MANAGEMENT (Desktop agents and managers are already in users table)
      {
        name: 'Grace Namutebi',
        id_number: 'EMP001',
        position: 'Senior Cashier',
        phone: '+256 772 345 678',
        email: 'grace.cashier@lushlaundry.com',
        salary: 800000, // UGX 800,000/month
        hire_date: '2024-01-15',
        bank_account: '1234567890',
        bank_name: 'Stanbic Bank'
      },
      
      // WASHING DEPARTMENT (Core service providers)
      {
        name: 'Moses Mugisha',
        id_number: 'EMP002',
        position: 'Lead Washer',
        phone: '+256 773 456 789',
        email: null,
        salary: 650000, // UGX 650,000/month
        hire_date: '2024-02-01',
        bank_account: '2345678901',
        bank_name: 'Centenary Bank'
      },
      {
        name: 'Betty Akello',
        id_number: 'EMP003',
        position: 'Washer',
        phone: '+256 774 567 890',
        email: null,
        salary: 550000, // UGX 550,000/month
        hire_date: '2024-03-10',
        bank_account: null,
        bank_name: null // Paid via mobile money
      },
      {
        name: 'Robert Kayondo',
        id_number: 'EMP004',
        position: 'Washer',
        phone: '+256 775 678 901',
        email: null,
        salary: 550000,
        hire_date: '2024-04-05',
        bank_account: null,
        bank_name: null
      },
      {
        name: 'Christine Namara',
        id_number: 'EMP005',
        position: 'Washer (Part-time)',
        phone: '+256 776 789 012',
        email: null,
        salary: 350000, // UGX 350,000/month (part-time)
        hire_date: '2025-01-10',
        bank_account: null,
        bank_name: null
      },
      
      // IRONING DEPARTMENT
      {
        name: 'Patrick Tumusiime',
        id_number: 'EMP006',
        position: 'Lead Ironer',
        phone: '+256 777 890 123',
        email: null,
        salary: 600000, // UGX 600,000/month
        hire_date: '2024-02-15',
        bank_account: '3456789012',
        bank_name: 'DFCU Bank'
      },
      {
        name: 'Mercy Atim',
        id_number: 'EMP007',
        position: 'Ironer',
        phone: '+256 778 901 234',
        email: null,
        salary: 500000,
        hire_date: '2024-05-20',
        bank_account: null,
        bank_name: null
      },
      {
        name: 'Joseph Okwir',
        id_number: 'EMP008',
        position: 'Ironer',
        phone: '+256 779 012 345',
        email: null,
        salary: 500000,
        hire_date: '2024-06-01',
        bank_account: null,
        bank_name: null
      },
      
      // CLEANING & MAINTENANCE
      {
        name: 'Stella Nabirye',
        id_number: 'EMP009',
        position: 'Cleaner & Helper',
        phone: '+256 770 123 456',
        email: null,
        salary: 400000, // UGX 400,000/month
        hire_date: '2024-03-01',
        bank_account: null,
        bank_name: null
      },
      {
        name: 'James Okello',
        id_number: 'EMP010',
        position: 'Cleaner & Helper',
        phone: '+256 771 234 567',
        email: null,
        salary: 400000,
        hire_date: '2024-07-15',
        bank_account: null,
        bank_name: null
      },
      
      // SECURITY
      {
        name: 'Emmanuel Musoke',
        id_number: 'EMP011',
        position: 'Security Guard (Day)',
        phone: '+256 772 345 678',
        email: null,
        salary: 450000, // UGX 450,000/month
        hire_date: '2024-01-20',
        bank_account: '4567890123',
        bank_name: 'PostBank Uganda'
      },
      {
        name: 'David Okware',
        id_number: 'EMP012',
        position: 'Security Guard (Night)',
        phone: '+256 773 456 789',
        email: null,
        salary: 450000,
        hire_date: '2024-01-20',
        bank_account: null,
        bank_name: null
      },
    ];
    
    console.log(`📝 Creating ${employees.length} laundry business employees...\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const emp of employees) {
      try {
        const result = await client.query(
          `INSERT INTO payroll_employees (
            employee_name, 
            employee_id_number, 
            position, 
            phone, 
            email, 
            salary_amount, 
            payment_frequency,
            bank_account,
            bank_name,
            hire_date, 
            employment_status,
            added_by,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id, employee_name, position, salary_amount`,
          [
            emp.name,
            emp.id_number,
            emp.position,
            emp.phone,
            emp.email,
            emp.salary,
            'MONTHLY',
            emp.bank_account,
            emp.bank_name,
            emp.hire_date,
            'ACTIVE',
            adminId,
            `Laundry business employee - ${emp.position}`
          ]
        );
        
        console.log(`✅ ${result.rows[0].employee_name} (${result.rows[0].position}) - UGX ${result.rows[0].salary_amount.toLocaleString()}/month`);
        created++;
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⏭️  Skipped: ${emp.name} (${emp.id_number}) - Already exists`);
          skipped++;
        } else {
          throw error;
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Display summary
    const totalResult = await client.query(`SELECT COUNT(*) as total FROM payroll_employees WHERE employment_status = 'ACTIVE'`);
    const totalEmployees = parseInt(totalResult.rows[0].total);
    
    const totalSalariesResult = await client.query(`
      SELECT SUM(salary_amount) as total_monthly_salaries 
      FROM payroll_employees 
      WHERE employment_status = 'ACTIVE'
    `);
    const totalMonthlySalaries = parseFloat(totalSalariesResult.rows[0].total_monthly_salaries);
    
    console.log('\n============================================================');
    console.log('✅ EMPLOYEE SEEDING COMPLETE!');
    console.log('============================================================\n');
    console.log(`📊 Summary:`);
    console.log(`   Created:  ${created} employees`);
    console.log(`   Skipped:  ${skipped} employees`);
    console.log(`   Total:    ${created + skipped} employees processed\n`);
    
    console.log(`💼 ACTIVE EMPLOYEES: ${totalEmployees}`);
    console.log(`💰 TOTAL MONTHLY PAYROLL: UGX ${totalMonthlySalaries.toLocaleString()}\n`);
    
    // Display by department
    const deptResult = await client.query(`
      SELECT 
        CASE 
          WHEN position LIKE '%Washer%' THEN 'Washing Department'
          WHEN position LIKE '%Ironer%' THEN 'Ironing Department'
          WHEN position LIKE '%Cleaner%' OR position LIKE '%Helper%' THEN 'Cleaning & Maintenance'
          WHEN position LIKE '%Security%' THEN 'Security'
          WHEN position LIKE '%Cashier%' THEN 'Administration'
          ELSE 'Other'
        END as department,
        COUNT(*) as count,
        SUM(salary_amount) as total_salary
      FROM payroll_employees
      WHERE employment_status = 'ACTIVE'
      GROUP BY department
      ORDER BY total_salary DESC
    `);
    
    console.log('📋 EMPLOYEES BY DEPARTMENT:');
    deptResult.rows.forEach(dept => {
      console.log(`   ${dept.department}: ${dept.count} employees - UGX ${parseFloat(dept.total_salary).toLocaleString()}/month`);
    });
    
    console.log('\n============================================================\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding employees:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the seed
seedLaundryEmployees().catch(console.error);
