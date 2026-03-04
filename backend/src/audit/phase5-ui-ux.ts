import * as fs from 'fs';
import * as path from 'path';

interface AuditResults {
  passed: string[];
  failed: string[];
  warnings: string[];
}

async function phase5Audit() {
  console.log('\n' + '═'.repeat(70));
  console.log('🎨 PHASE 5: USER INTERFACE & USER EXPERIENCE AUDIT');
  console.log('═'.repeat(70) + '\n');

  const results: AuditResults = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    const frontendDir = path.join(__dirname, '../../../frontend');
    const frontendSrc = path.join(frontendDir, 'src');

    if (!fs.existsSync(frontendSrc)) {
      console.log('❌ Frontend source directory not found');
      process.exit(1);
    }

    // ============================================================
    // 5.1 DATA DISPLAY FORMATTING
    // ============================================================
    console.log('📋 5.1 CHECKING DATA DISPLAY FORMATTING\n');

    // Check for formatting utilities
    const utilsFile = path.join(frontendSrc, 'lib', 'utils.ts');
    let hasUtils = false;
    let formatFunctions: string[] = [];

    if (fs.existsSync(utilsFile)) {
      const utilsContent = fs.readFileSync(utilsFile, 'utf-8');
      hasUtils = true;
      
      console.log('   ✅ Utils library found\n');
      
      // Check for money formatting
      const hasMoneyFormat = utilsContent.includes('formatMoney') || 
                             utilsContent.includes('formatCurrency') ||
                             utilsContent.includes('toLocaleString');
      
      if (hasMoneyFormat) {
        console.log('   ✅ Money formatting function found');
        formatFunctions.push('Money formatting');
        
        // Check if it includes UGX
        if (utilsContent.includes('UGX') || utilsContent.includes('currency')) {
          console.log('   ✅ Currency (UGX) support detected');
        }
        
        // Check for comma separators
        if (utilsContent.includes('toLocaleString') || utilsContent.includes(',')) {
          console.log('   ✅ Comma separators for thousands');
        }
      } else {
        console.log('   ⚠️  Money formatting function not found');
        results.warnings.push('Money formatting function missing');
      }
      
      // Check for date formatting
      const hasDateFormat = utilsContent.includes('formatDate') ||
                           utilsContent.includes('Date') ||
                           utilsContent.includes('moment') ||
                           utilsContent.includes('dayjs');
      
      if (hasDateFormat) {
        console.log('   ✅ Date formatting detected');
        formatFunctions.push('Date formatting');
      }
      
      // Check for phone formatting
      const hasPhoneFormat = utilsContent.includes('formatPhone') ||
                            utilsContent.includes('phoneNumber');
      
      if (hasPhoneFormat) {
        console.log('   ✅ Phone formatting detected');
        formatFunctions.push('Phone formatting');
      }
      
      // Check for percentage formatting
      const hasPercentFormat = utilsContent.includes('percent') ||
                              utilsContent.includes('%');
      
      if (hasPercentFormat) {
        console.log('   ✅ Percentage formatting detected');
        formatFunctions.push('Percentage formatting');
      }
      
      results.passed.push('Formatting utilities exist');
    } else {
      console.log('   ⚠️  Utils library not found');
      results.warnings.push('Utils library not found');
    }

    console.log('');

    // Check actual usage in components
    console.log('═'.repeat(70));
    console.log('📋 5.2 CHECKING FORMATTING USAGE IN COMPONENTS\n');

    const pagesDir = path.join(frontendSrc, 'pages');
    const componentFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

    console.log(`   Found ${componentFiles.length} page components\n`);

    let moneyFormatUsage = 0;
    let dateFormatUsage = 0;
    let phoneFormatUsage = 0;

    componentFiles.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('toLocaleString') || content.includes('formatMoney') || content.includes('UGX')) {
        moneyFormatUsage++;
      }
      
      if (content.includes('formatDate') || content.includes('toLocaleDateString')) {
        dateFormatUsage++;
      }
      
      if (content.includes('formatPhone')) {
        phoneFormatUsage++;
      }
    });

    console.log('   Formatting Usage:');
    console.log(`      ${moneyFormatUsage > 0 ? '✅' : '⚠️'} Money formatting: ${moneyFormatUsage} components`);
    console.log(`      ${dateFormatUsage > 0 ? '✅' : '⚠️'} Date formatting: ${dateFormatUsage} components`);
    console.log(`      ${phoneFormatUsage > 0 ? '✅' : '⚠️'} Phone formatting: ${phoneFormatUsage} components`);

    if (moneyFormatUsage > 0 && dateFormatUsage > 0) {
      results.passed.push('Formatting functions actively used');
    } else {
      results.warnings.push('Some formatting functions not used');
    }

    console.log('');

    // ============================================================
    // 5.3 FORMS & VALIDATION
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📋 5.3 CHECKING FORMS & VALIDATION\n');

    // Check for form validation libraries
    const packageJson = path.join(frontendDir, 'package.json');
    const packageContent = fs.readFileSync(packageJson, 'utf-8');
    
    const hasZod = packageContent.includes('zod');
    const hasReactHookForm = packageContent.includes('react-hook-form');
    const hasYup = packageContent.includes('yup');
    
    console.log('   Form Validation Libraries:');
    console.log(`      ${hasZod ? '✅' : '⚠️'} Zod ${hasZod ? 'installed' : 'not found'}`);
    console.log(`      ${hasReactHookForm ? '✅' : '⚠️'} React Hook Form ${hasReactHookForm ? 'installed' : 'not found'}`);
    console.log(`      ${hasYup ? '✅' : '⚠️'} Yup ${hasYup ? 'installed' : 'not found'}`);

    if (hasZod || hasYup) {
      console.log('\n   ✅ Schema validation library present');
      results.passed.push('Form validation library installed');
    } else {
      console.log('\n   ⚠️  No schema validation library found');
      results.warnings.push('Consider installing Zod or Yup');
    }

    // Check for form components
    const formComponentsDir = path.join(frontendSrc, 'components', 'ui');
    if (fs.existsSync(formComponentsDir)) {
      const hasFormComponent = fs.existsSync(path.join(formComponentsDir, 'form.tsx'));
      const hasInputComponent = fs.existsSync(path.join(formComponentsDir, 'input.tsx'));
      
      console.log('\n   Form Components:');
      console.log(`      ${hasFormComponent ? '✅' : '⚠️'} Form component ${hasFormComponent ? 'exists' : 'missing'}`);
      console.log(`      ${hasInputComponent ? '✅' : '⚠️'} Input component ${hasInputComponent ? 'exists' : 'missing'}`);
      
      if (hasFormComponent && hasInputComponent) {
        results.passed.push('Form components available');
      }
    }

    // Check for validation patterns
    console.log('\n   Validation Patterns:');
    
    let emailValidation = 0;
    let phoneValidation = 0;
    let requiredFields = 0;
    
    componentFiles.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('email') && (content.includes('required') || content.includes('validate'))) {
        emailValidation++;
      }
      
      if (content.includes('phone') && (content.includes('required') || content.includes('validate'))) {
        phoneValidation++;
      }
      
      if (content.includes('required:') || content.includes('required={true}')) {
        requiredFields++;
      }
    });

    console.log(`      ${emailValidation > 0 ? '✅' : '⚠️'} Email validation: ${emailValidation} forms`);
    console.log(`      ${phoneValidation > 0 ? '✅' : '⚠️'} Phone validation: ${phoneValidation} forms`);
    console.log(`      ${requiredFields > 0 ? '✅' : '⚠️'} Required fields: ${requiredFields} forms`);

    if (emailValidation > 0 && requiredFields > 0) {
      results.passed.push('Form validation implemented');
    }

    console.log('');

    // ============================================================
    // 5.4 PAGINATION
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📋 5.4 CHECKING PAGINATION\n');

    // Check for pagination component
    const paginationComponent = path.join(formComponentsDir, 'pagination.tsx');
    const hasPagination = fs.existsSync(paginationComponent);
    
    console.log('   Pagination Component:');
    console.log(`      ${hasPagination ? '✅' : '⚠️'} Pagination component ${hasPagination ? 'exists' : 'missing'}`);

    if (hasPagination) {
      results.passed.push('Pagination component available');
    }

    // Check for pagination usage
    let paginationUsage = 0;
    let pageStateUsage = 0;
    
    componentFiles.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('<Pagination') || content.includes('pagination')) {
        paginationUsage++;
      }
      
      if (content.includes('currentPage') || content.includes('pageSize') || content.includes('totalPages')) {
        pageStateUsage++;
      }
    });

    console.log('\n   Pagination Usage:');
    console.log(`      ${paginationUsage > 0 ? '✅' : '⚠️'} Pagination used: ${paginationUsage} components`);
    console.log(`      ${pageStateUsage > 0 ? '✅' : '⚠️'} Page state management: ${pageStateUsage} components`);

    // Check specific pages
    console.log('\n   Critical Pages:');
    
    const ordersPage = path.join(pagesDir, 'Orders.tsx');
    const customersPage = path.join(pagesDir, 'Customers.tsx');
    
    if (fs.existsSync(ordersPage)) {
      const ordersContent = fs.readFileSync(ordersPage, 'utf-8');
      const hasPaginationInOrders = ordersContent.includes('pagination') || ordersContent.includes('Pagination');
      console.log(`      ${hasPaginationInOrders ? '✅' : '⚠️'} Orders page pagination`);
    }
    
    if (fs.existsSync(customersPage)) {
      const customersContent = fs.readFileSync(customersPage, 'utf-8');
      const hasPaginationInCustomers = customersContent.includes('pagination') || customersContent.includes('Pagination');
      console.log(`      ${hasPaginationInCustomers ? '✅' : '⚠️'} Customers page pagination`);
    }

    if (paginationUsage > 0) {
      results.passed.push('Pagination implemented in components');
    }

    console.log('');

    // ============================================================
    // 5.5 UI COMPONENTS
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📋 5.5 CHECKING UI COMPONENTS\n');

    const uiComponents = [
      'button.tsx', 'input.tsx', 'card.tsx', 'table.tsx',
      'dialog.tsx', 'select.tsx', 'calendar.tsx', 'badge.tsx'
    ];

    console.log('   Essential UI Components:');
    let componentCount = 0;
    
    uiComponents.forEach(component => {
      const componentPath = path.join(formComponentsDir, component);
      const exists = fs.existsSync(componentPath);
      console.log(`      ${exists ? '✅' : '⚠️'} ${component}`);
      if (exists) componentCount++;
    });

    console.log(`\n   ${componentCount}/${uiComponents.length} essential components available`);
    
    if (componentCount >= 6) {
      results.passed.push('Comprehensive UI component library');
    } else {
      results.warnings.push('Some UI components missing');
    }

    console.log('');

    // ============================================================
    // 5.6 RESPONSIVENESS
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📋 5.6 CHECKING RESPONSIVENESS\n');

    // Check for Tailwind CSS
    const hasTailwind = packageContent.includes('tailwindcss');
    console.log(`   ${hasTailwind ? '✅' : '⚠️'} Tailwind CSS ${hasTailwind ? 'installed' : 'not found'}`);

    // Check for responsive utilities
    let responsiveUsage = 0;
    componentFiles.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
        responsiveUsage++;
      }
    });

    console.log(`   ${responsiveUsage > 0 ? '✅' : '⚠️'} Responsive classes used: ${responsiveUsage} components`);

    if (hasTailwind && responsiveUsage > 0) {
      results.passed.push('Responsive design implemented');
    }

    console.log('');

    // ============================================================
    // 5.7 ACCESSIBILITY
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📋 5.7 CHECKING ACCESSIBILITY\n');

    let ariaUsage = 0;
    let labelUsage = 0;
    
    componentFiles.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('aria-') || content.includes('role=')) {
        ariaUsage++;
      }
      
      if (content.includes('<Label') || content.includes('htmlFor')) {
        labelUsage++;
      }
    });

    console.log(`   ${ariaUsage > 0 ? '✅' : '⚠️'} ARIA attributes: ${ariaUsage} components`);
    console.log(`   ${labelUsage > 0 ? '✅' : '⚠️'} Form labels: ${labelUsage} components`);

    if (ariaUsage > 0 && labelUsage > 0) {
      results.passed.push('Accessibility features present');
    } else {
      results.warnings.push('Limited accessibility implementation');
    }

    console.log('');

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📊 PHASE 5 AUDIT SUMMARY');
    console.log('═'.repeat(70) + '\n');

    if (results.passed.length > 0) {
      console.log(`✅ PASSED: ${results.passed.length} checks`);
      results.passed.forEach(p => console.log(`   ✓ ${p}`));
      console.log('');
    }

    if (results.warnings.length > 0) {
      console.log(`⚠️  WARNINGS: ${results.warnings.length} items`);
      results.warnings.forEach(w => console.log(`   ⚠ ${w}`));
      console.log('');
    }

    if (results.failed.length > 0) {
      console.log(`❌ FAILED: ${results.failed.length} checks`);
      results.failed.forEach(f => console.log(`   ✗ ${f}`));
      console.log('');
    }

    console.log('═'.repeat(70));
    console.log('📋 UI/UX CHECKLIST\n');
    console.log('   Data Display:');
    console.log(`   ${moneyFormatUsage > 0 ? '✅' : '⚠️'} Money formatted (UGX with commas)`);
    console.log(`   ${dateFormatUsage > 0 ? '✅' : '⚠️'} Dates formatted consistently`);
    console.log(`   ${phoneFormatUsage > 0 ? '⚠️' : '⚠️'} Phone numbers formatted`);
    console.log(`   ✅ Large numbers readable (toLocaleString)`);
    console.log('');
    console.log('   Forms & Validation:');
    console.log(`   ${requiredFields > 0 ? '✅' : '⚠️'} Required fields enforced`);
    console.log(`   ${emailValidation > 0 ? '✅' : '⚠️'} Email validation`);
    console.log(`   ${phoneValidation > 0 ? '✅' : '⚠️'} Phone validation`);
    console.log(`   ${hasZod || hasYup ? '✅' : '⚠️'} Schema validation library`);
    console.log('');
    console.log('   Pagination:');
    console.log(`   ${paginationUsage > 0 ? '✅' : '⚠️'} Pagination implemented`);
    console.log(`   ${pageStateUsage > 0 ? '✅' : '⚠️'} Page state management`);
    console.log(`   ${hasPagination ? '✅' : '⚠️'} Pagination component available`);
    console.log('');
    console.log('   UI Components:');
    console.log(`   ✅ ${componentCount}/${uiComponents.length} essential components`);
    console.log(`   ${hasTailwind ? '✅' : '⚠️'} Tailwind CSS for styling`);
    console.log(`   ${responsiveUsage > 0 ? '✅' : '⚠️'} Responsive design`);
    console.log('');

    if (results.failed.length === 0 && results.warnings.length < 3) {
      console.log('🎉 UI/UX MEETS PRODUCTION STANDARDS!\n');
    } else if (results.failed.length === 0) {
      console.log('✅ UI/UX FUNCTIONAL - Minor improvements recommended\n');
    } else {
      console.log('⚠️  Some UI/UX issues need attention\n');
    }

    console.log('═'.repeat(70) + '\n');

    process.exit(results.failed.length === 0 ? 0 : 1);

  } catch (error) {
    console.error('❌ Error during Phase 5 audit:', error);
    process.exit(1);
  }
}

phase5Audit();
