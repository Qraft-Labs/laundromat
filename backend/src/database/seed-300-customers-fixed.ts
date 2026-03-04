import { query } from '../config/database';

// Realistic Ugandan names from different tribes
const firstNames = {
  male: [
    'James', 'John', 'Robert', 'David', 'Richard', 'Joseph', 'Peter', 'Paul', 'Emmanuel', 'Samuel',
    'Moses', 'Joshua', 'Isaac', 'Jacob', 'Daniel', 'Benjamin', 'Stephen', 'Andrew', 'Simon', 'Mark',
    'Patrick', 'Fred', 'Henry', 'Charles', 'George', 'Francis', 'Martin', 'Ronald', 'Denis', 'Brian',
    'Okello', 'Kiprotich', 'Wasswa', 'Kato', 'Sentamu', 'Mukasa', 'Ssali', 'Kiggundu', 'Mwesigwa', 'Byaruhanga'
  ],
  female: [
    'Mary', 'Sarah', 'Ruth', 'Rebecca', 'Rachel', 'Grace', 'Faith', 'Hope', 'Joy', 'Peace',
    'Christine', 'Catherine', 'Margaret', 'Elizabeth', 'Jennifer', 'Susan', 'Jane', 'Patricia', 'Betty', 'Juliet',
    'Nakato', 'Babirye', 'Nambi', 'Namukasa', 'Namusoke', 'Nakigozi', 'Nalongo', 'Namatovu', 'Nansubuga', 'Nankya'
  ]
};

const lastNames = [
  'Mugisha', 'Tumukunde', 'Ainembabazi', 'Twinomuhangi', 'Karungi', 'Kyomugisha', 'Bakashaba',
  'Byamugisha', 'Mwebaze', 'Turyamuhika', 'Rwabinumi', 'Muhwezi', 'Ntunguka', 'Kamatenesi', 'Beinomugisha',
  'Kiiza', 'Mbabazi', 'Asiimwe', 'Tukamushaba', 'Arinaitwe', 'Tumuramye', 'Byarugaba', 'Katusiime',
  'Okello', 'Odongo', 'Opio', 'Akello', 'Achan', 'Adong', 'Atim', 'Aber', 'Akot', 'Auma',
  'Kiwanuka', 'Mukasa', 'Ssebagala', 'Namukasa', 'Nalongo', 'Namatovu', 'Ssekandi', 'Sentamu', 'Nsamba',
  'Musoke', 'Kaggwa', 'Lubega', 'Katende', 'Nsubuga', 'Wasswa', 'Kato', 'Nakato', 'Babirye'
];

// Mbarara zones and streets
const locations = [
  'Katete Zone A, Mbarara', 'Katete Zone B, Mbarara', 'Katete Zone C, Mbarara',
  'Kakoba Division, Mbarara', 'Kakoba Trading Center, Mbarara', 'Kakoba East, Mbarara',
  'Nyamitanga Zone 1, Mbarara', 'Nyamitanga Zone 2, Mbarara', 'Nyamitanga Zone 3, Mbarara',
  'Kamukuzi Division, Mbarara', 'Kamukuzi Hill, Mbarara', 'Kamukuzi Trading Center, Mbarara',
  'Rwebishuri Zone, Mbarara', 'Booma Division, Mbarara', 'Kizungu Zone, Mbarara',
  'Biharwe Zone, Mbarara', 'Ruti Zone, Mbarara', 'Ruharo Zone, Mbarara',
  'Kitengesa Zone, Mbarara', 'Kakyeka Stadium Area, Mbarara', 'High Street, Mbarara',
  'Mbaguta Way, Mbarara', 'Masindi Road, Mbarara', 'Station Road, Mbarara'
];

// Business names for business customers
const businessTypes = [
  'Hotel', 'Restaurant', 'Guest House', 'Clinic', 'School', 'College', 
  'Supermarket', 'Pharmacy', 'Beauty Salon', 'Barber Shop', 'Office',
  'Church', 'Hospital', 'Bank', 'Lodge', 'Motel'
];

const businessAdjectives = [
  'Royal', 'Golden', 'Silver', 'Modern', 'New', 'Elite', 'Prime', 'Top',
  'Quality', 'Best', 'Super', 'Grand', 'Blessed', 'Grace', 'Hope'
];

// Generate random phone number
function generatePhoneNumber(): string {
  const prefix = '2567'; // Uganda code
  const networks = ['00', '01', '02', '03', '04', '05', '50', '51', '52', '53', '54', '55']; // MTN, Airtel, etc.
  const network = networks[Math.floor(Math.random() * networks.length)];
  const last6 = Math.floor(100000 + Math.random() * 900000);
  return `+${prefix}${network}${last6}`;
}

// Generate email
function generateEmail(name: string, isIndividual: boolean): string | null {
  if (Math.random() < 0.3) return null; // 30% don't have email
  
  const namePart = name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '');
  
  if (isIndividual) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    return `${namePart}@${domains[Math.floor(Math.random() * domains.length)]}`;
  } else {
    return `info@${namePart.replace(/\./g, '')}.com`;
  }
}

// Generate individual name
function generateIndividualName(): string {
  const isMale = Math.random() < 0.5;
  const firstName = isMale 
    ? firstNames.male[Math.floor(Math.random() * firstNames.male.length)]
    : firstNames.female[Math.floor(Math.random() * firstNames.female.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Generate business name
function generateBusinessName(): string {
  const adjective = businessAdjectives[Math.floor(Math.random() * businessAdjectives.length)];
  const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
  return `${adjective} ${type}`;
}

// Generate customer ID
function generateCustomerId(index: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const num = String(index).padStart(3, '0');
  return `CUST${year}${month}${num}`;
}

async function seedCustomers() {
  console.log('🌱 Starting customer seed (300 customers)...\n');
  
  try {
    // Check existing customer count
    const existingCount = await query('SELECT COUNT(*) as count FROM customers');
    const currentCount = parseInt(existingCount.rows[0].count);
    
    console.log(`📊 Current customer count: ${currentCount}`);
    
    if (currentCount >= 300) {
      console.log(`⚠️  Already have ${currentCount} customers. Skipping seed.`);
      console.log('   (To reseed, delete customers first)\n');
      return;
    }

    const customers: any[] = [];
    const phoneNumbers = new Set<string>();
    const customerIds = new Set<string>();

    console.log('🔨 Generating 300 customers...\n');

    // Generate 300 customers (70% individual, 30% business)
    for (let i = 1; i <= 300; i++) {
      const isIndividual = Math.random() < 0.7;
      const name = isIndividual ? generateIndividualName() : generateBusinessName();
      
      // Ensure unique phone number
      let phone = generatePhoneNumber();
      while (phoneNumbers.has(phone)) {
        phone = generatePhoneNumber();
      }
      phoneNumbers.add(phone);
      
      // Ensure unique customer ID
      let customerId = generateCustomerId(i);
      while (customerIds.has(customerId)) {
        customerId = generateCustomerId(i + Math.floor(Math.random() * 1000));
      }
      customerIds.add(customerId);
      
      const email = generateEmail(name, isIndividual);
      const location = locations[Math.floor(Math.random() * locations.length)];
      const notes = isIndividual ? null : `Business account for ${name}`;
      
      customers.push({
        customerId,
        name,
        phone,
        email,
        location,
        notes
      });

      // Show progress every 50 customers
      if (i % 50 === 0) {
        console.log(`   📝 Generated ${i}/300 customers...`);
      }
    }

    // Insert customers in batches
    console.log('\n📥 Inserting customers into database...\n');
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < customers.length; i += 50) {
      const batch = customers.slice(i, i + 50);
      
      for (const customer of batch) {
        try {
          await query(
            `INSERT INTO customers (
              customer_id, name, phone, email, location, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            ON CONFLICT (customer_id) DO NOTHING`,
            [
              customer.customerId,
              customer.name,
              customer.phone,
              customer.email,
              customer.location,
              customer.notes
            ]
          );
          inserted++;
        } catch (error) {
          skipped++;
          console.log(`   ⚠️  Skipped duplicate: ${customer.name}`);
        }
      }
      
      console.log(`   ✅ Progress: ${inserted}/${customers.length} customers inserted`);
    }

    // Show final statistics
    console.log('\n' + '='.repeat(60));
    console.log('✅ CUSTOMER SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total generated:     ${customers.length}`);
    console.log(`   Successfully added:  ${inserted}`);
    console.log(`   Skipped (existing):  ${skipped}`);
    console.log(`   Individual customers: ~${Math.floor(inserted * 0.7)}`);
    console.log(`   Business customers:   ~${Math.floor(inserted * 0.3)}`);
    console.log('');

    // Show sample customers
    const sampleResult = await query(`
      SELECT customer_id, name, phone, location
      FROM customers
      ORDER BY id DESC
      LIMIT 5
    `);
    
    console.log('📋 Sample customers (last 5 added):');
    sampleResult.rows.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.customer_id} - ${c.name}`);
      console.log(`      Phone: ${c.phone}`);
      console.log(`      Location: ${c.location}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedCustomers()
    .then(() => {
      console.log('🎉 Done! Ready for Phase 2: Seed Orders\n');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export default seedCustomers;
