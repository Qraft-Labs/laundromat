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

// Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random birthday (18-70 years old)
function randomBirthday(): Date | null {
  if (Math.random() < 0.7) { // 70% have birthdays on file
    const yearsAgo = 18 + Math.floor(Math.random() * 52); // 18-70 years old
    const birthday = new Date();
    birthday.setFullYear(birthday.getFullYear() - yearsAgo);
    birthday.setMonth(Math.floor(Math.random() * 12));
    birthday.setDate(1 + Math.floor(Math.random() * 28));
    return birthday;
  }
  return null;
}

// Generate random anniversary (0-30 years ago)
function randomAnniversary(): Date | null {
  if (Math.random() < 0.3) { // 30% have anniversaries on file
    const yearsAgo = Math.floor(Math.random() * 30);
    const anniversary = new Date();
    anniversary.setFullYear(anniversary.getFullYear() - yearsAgo);
    anniversary.setMonth(Math.floor(Math.random() * 12));
    anniversary.setDate(1 + Math.floor(Math.random() * 28));
    return anniversary;
  }
  return null;
}

// Generate other special dates
function generateOtherDates(): any[] {
  const dates = [];
  const numDates = Math.random() < 0.2 ? Math.floor(Math.random() * 3) : 0; // 20% have other dates
  
  const labels = ['Child Birthday', 'Business Anniversary', 'Mother Birthday', 'Father Birthday', 'Graduation Day'];
  
  for (let i = 0; i < numDates; i++) {
    const date = new Date();
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(1 + Math.floor(Math.random() * 28));
    dates.push({
      date: date.toISOString().split('T')[0],
      label: labels[Math.floor(Math.random() * labels.length)]
    });
  }
  
  return dates;
}

// Generate Ugandan phone number (+256 7XX XXX XXX)
function generatePhoneNumber(): string {
  const prefixes = ['700', '701', '702', '703', '704', '750', '751', '752', '753', '754', '755', '756', '757', '758', '759', '770', '771', '772', '773', '774', '775', '776', '777', '778', '779', '780', '781', '782', '783', '784', '785', '786', '787', '788', '789', '790'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(100000 + Math.random() * 900000);
  return `+256${prefix}${number}`;
}

// Generate email
function generateEmail(name: string, isIndividual: boolean): string | null {
  if (Math.random() < (isIndividual ? 0.4 : 0.8)) { // 40% individuals, 80% businesses have email
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    return `${cleanName}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }
  return null;
}

// Generate customer ID
function generateCustomerId(index: number): string {
  const year = new Date().getFullYear();
  return `CUST${year}${String(index).padStart(4, '0')}`;
}

// Generate business name
function generateBusinessName(): string {
  const adj = businessAdjectives[Math.floor(Math.random() * businessAdjectives.length)];
  const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
  const useFullName = Math.random() < 0.5;
  
  if (useFullName) {
    return `${adj} ${type}`;
  } else {
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${lastName} ${type}`;
  }
}

// Generate individual name
function generateIndividualName(): string {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

export async function seedCustomers() {
  console.log('🌱 Starting customer seed...');
  
  try {
    // Check if we already have many customers
    const existingCount = await query('SELECT COUNT(*) as count FROM customers');
    if (existingCount.rows[0].count >= 300) {
      console.log(`⚠️  Already have ${existingCount.rows[0].count} customers. Skipping seed.`);
      return;
    }

    const customers: any[] = [];
    const phoneNumbers = new Set<string>();
    const customerIds = new Set<string>();

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
      const birthday = isIndividual ? randomBirthday() : null;
      const anniversary = randomAnniversary();
      const otherDates = generateOtherDates();
      const smsOptIn = Math.random() < 0.85; // 85% opt in for SMS
      const customerType = isIndividual ? 'INDIVIDUAL' : 'BUSINESS';
      
      // Random registration date in the past 2 years
      const registrationDate = randomDate(
        new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
        new Date()
      );
      
      customers.push({
        customerId,
        name,
        phone,
        email,
        location,
        birthday,
        anniversary,
        otherDates,
        smsOptIn,
        customerType,
        registrationDate,
        notes: isIndividual ? null : `Business account for ${name}`
      });
    }

    // Insert customers in batches of 50
    console.log(`📥 Inserting ${customers.length} customers...`);
    let inserted = 0;
    
    for (let i = 0; i < customers.length; i += 50) {
      const batch = customers.slice(i, i + 50);
      
      for (const customer of batch) {
        await query(
          `INSERT INTO customers (
            customer_id, name, phone, email, location, notes,
            birthday, anniversary, other_special_dates, sms_opt_in, customer_type,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
          ON CONFLICT (customer_id) DO NOTHING`,
          [
            customer.customerId,
            customer.name,
            customer.phone,
            customer.email,
            customer.location,
            customer.notes,
            customer.birthday,
            customer.anniversary,
            JSON.stringify(customer.otherDates),
            customer.smsOptIn,
            customer.customerType,
            customer.registrationDate
          ]
        );
        inserted++;
      }
      
      console.log(`  ✅ Inserted ${inserted}/${customers.length} customers`);
    }

    // Show statistics
    const stats = {
      total: customers.length,
      individual: customers.filter(c => c.customerType === 'INDIVIDUAL').length,
      business: customers.filter(c => c.customerType === 'BUSINESS').length,
      withBirthday: customers.filter(c => c.birthday).length,
      withAnniversary: customers.filter(c => c.anniversary).length,
      withEmail: customers.filter(c => c.email).length,
      smsOptIn: customers.filter(c => c.smsOptIn).length
    };

    console.log('\n📊 Customer Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Individual: ${stats.individual} (${Math.round(stats.individual / stats.total * 100)}%)`);
    console.log(`   Business: ${stats.business} (${Math.round(stats.business / stats.total * 100)}%)`);
    console.log(`   With Birthday: ${stats.withBirthday} (${Math.round(stats.withBirthday / stats.total * 100)}%)`);
    console.log(`   With Anniversary: ${stats.withAnniversary} (${Math.round(stats.withAnniversary / stats.total * 100)}%)`);
    console.log(`   With Email: ${stats.withEmail} (${Math.round(stats.withEmail / stats.total * 100)}%)`);
    console.log(`   SMS Opt-In: ${stats.smsOptIn} (${Math.round(stats.smsOptIn / stats.total * 100)}%)`);
    
    console.log('\n✅ Customer seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedCustomers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
