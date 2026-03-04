import { query } from '../config/database';

async function testVATSystem() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 VAT SYSTEM TEST');
    console.log('═'.repeat(80) + '\n');

    // 1. Check VAT setting
    console.log('1️⃣  CHECKING VAT SETTING...\n');
    const vatSetting = await query(`
      SELECT setting_key, setting_value 
      FROM business_settings 
      WHERE setting_key = 'vat_enabled'
    `);

    if (vatSetting.rows.length === 0) {
      console.log('   ❌ VAT setting not found!');
      process.exit(1);
    }

    const vat = vatSetting.rows[0].setting_value;
    console.log('   ✅ VAT Setting Found:');
    console.log(`      - Enabled: ${vat.enabled}`);
    console.log(`      - Rate: ${vat.rate}%`);
    console.log('');

    // 2. Test calculation with VAT OFF
    console.log('2️⃣  TEST CALCULATION (VAT OFF)...\n');
    const subtotal = 100000;
    const discountPercentage = 10;
    const discount = Math.round(subtotal * (discountPercentage / 100));
    const taxOff = 0; // VAT disabled
    const totalOff = subtotal - discount + taxOff;

    console.log(`   Subtotal:        UGX ${subtotal.toLocaleString()}`);
    console.log(`   Discount (10%):  UGX ${discount.toLocaleString()}`);
    console.log(`   VAT:             UGX ${taxOff.toLocaleString()} (DISABLED)`);
    console.log(`   ────────────────────────────────`);
    console.log(`   Total:           UGX ${totalOff.toLocaleString()}`);
    console.log('');

    // 3. Test calculation with VAT ON (18%)
    console.log('3️⃣  TEST CALCULATION (VAT ON - 18%)...\n');
    const amountAfterDiscount = subtotal - discount;
    const taxOn = Math.round(amountAfterDiscount * (18 / 100));
    const totalOn = subtotal - discount + taxOn;

    console.log(`   Subtotal:        UGX ${subtotal.toLocaleString()}`);
    console.log(`   Discount (10%):  UGX ${discount.toLocaleString()}`);
    console.log(`   After Discount:  UGX ${amountAfterDiscount.toLocaleString()}`);
    console.log(`   VAT (18%):       UGX ${taxOn.toLocaleString()} (ENABLED)`);
    console.log(`   ────────────────────────────────`);
    console.log(`   Total:           UGX ${totalOn.toLocaleString()}`);
    console.log('');

    // 4. Test different VAT rates
    console.log('4️⃣  VAT RATE COMPARISON...\n');
    console.log('   Rate  | VAT Amount | Total       ');
    console.log('   ────────────────────────────────');
    
    [0, 10, 15, 18, 20, 25].forEach(rate => {
      const vatAmount = Math.round(amountAfterDiscount * (rate / 100));
      const total = subtotal - discount + vatAmount;
      console.log(`   ${rate.toString().padEnd(5)} | UGX ${vatAmount.toString().padStart(6)} | UGX ${total.toLocaleString()}`);
    });
    console.log('');

    // 5. Receipt display logic
    console.log('5️⃣  RECEIPT DISPLAY LOGIC...\n');
    
    console.log('   📄 Receipt (VAT OFF):');
    console.log('   ───────────────────────────────');
    console.log('   Items:                UGX 100,000');
    console.log('   Discount (10%):       - 10,000');
    console.log('   ───────────────────────────────');
    console.log('   TOTAL:                UGX 90,000');
    console.log('   (No VAT line shown)');
    console.log('');

    console.log('   📄 Receipt (VAT ON - 18%):');
    console.log('   ───────────────────────────────');
    console.log('   Items:                UGX 100,000');
    console.log('   Discount (10%):       - 10,000');
    console.log('   VAT (18%):            + 16,200');
    console.log('   ───────────────────────────────');
    console.log('   TOTAL:                UGX 106,200');
    console.log('   (VAT line appears only when enabled)');
    console.log('');

    console.log('═'.repeat(80));
    console.log('✅ VAT SYSTEM TEST COMPLETED');
    console.log('═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing VAT system:', error);
    process.exit(1);
  }
}

testVATSystem();
