# 🚀 Quick Start: Multi-Tenant Transformation

## Overview
This guide helps you transform your single-tenant Lush Laundry ERP into a multi-tenant SaaS platform in manageable steps.

---

## ⚡ Quick Decision Tree

**Question:** How many laundry businesses do you want to support?

- **1-10 businesses** → Use **Shared Database + tenant_id** (Start here)
- **10-50 businesses** → Use **Shared Database + tenant_id** (with optimization)
- **50+ businesses** → Consider **Separate Schemas** or **Separate Databases**

**Recommended:** Start with Shared Database + tenant_id (simplest, most cost-effective)

---

## 📅 Implementation Timeline

| Phase | Duration | Priority | Description |
|-------|----------|----------|-------------|
| Phase 1 | 2-3 weeks | 🔴 Critical | Database migration + tenant infrastructure |
| Phase 2 | 3-4 weeks | 🔴 Critical | Backend multi-tenancy implementation |
| Phase 3 | 2-3 weeks | 🟡 Important | Frontend updates + tenant signup |
| Phase 4 | 2-3 weeks | 🟡 Important | Subscription & billing |
| Phase 5 | 1-2 weeks | 🟢 Nice-to-have | Platform admin dashboard |

**Minimum Viable Multi-Tenant (MVMT):** Phase 1 + Phase 2 + Phase 3 = 7-10 weeks

---

## 🎯 Phase 1: Database Migration (START HERE)

### Step 1: Backup Your Database
```bash
cd backend
npm run db:backup
# Or manually:
pg_dump -U postgres lush_laundry > backup_before_multitenant.sql
```

### Step 2: Run Migration Script
```bash
# Copy the migration script to your database
psql -U postgres -d lush_laundry -f backend/migrations/001_add_multi_tenant_support.sql
```

**What this does:**
- ✅ Creates `tenants` table
- ✅ Creates `tenant_settings` table  
- ✅ Adds `tenant_id` column to all tables
- ✅ Creates indexes for performance
- ✅ Migrates existing data to first tenant ("Lush Laundry")

### Step 3: Verify Migration
```sql
-- Check tenant created
SELECT * FROM tenants;

-- Check all data has tenant_id
SELECT 
    (SELECT COUNT(*) FROM users WHERE tenant_id IS NULL) as users_null,
    (SELECT COUNT(*) FROM customers WHERE tenant_id IS NULL) as customers_null,
    (SELECT COUNT(*) FROM orders WHERE tenant_id IS NULL) as orders_null;
-- All should be 0

-- View tenant distribution
SELECT 
    t.business_name,
    COUNT(DISTINCT u.id) as users,
    COUNT(DISTINCT c.id) as customers,
    COUNT(DISTINCT o.id) as orders
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN customers c ON t.id = c.tenant_id
LEFT JOIN orders o ON t.id = o.tenant_id
GROUP BY t.id, t.business_name;
```

---

## 🔧 Phase 2: Backend Implementation

### Step 1: Create Tenant Middleware

```bash
# Create new file
touch backend/src/middleware/tenant.ts
```

Copy the tenant middleware code from [MULTI_TENANT_TRANSFORMATION_GUIDE.md](MULTI_TENANT_TRANSFORMATION_GUIDE.md)

### Step 2: Update AuthRequest Type

```typescript
// backend/src/middleware/auth.ts
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    tenant_id: number; // ADD THIS
  };
}
```

### Step 3: Update One Controller First (Test Pattern)

```typescript
// backend/src/controllers/customers.controller.ts

import { TenantRequest } from '../middleware/tenant';

// OLD
export const getCustomers = async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM customers');
  res.json(result.rows);
};

// NEW
export const getCustomers = async (req: TenantRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM customers WHERE tenant_id = $1',
    [req.tenantId]
  );
  res.json(result.rows);
};

// Update create customer
export const createCustomer = async (req: TenantRequest, res: Response) => {
  const { name, phone, email } = req.body;
  
  const result = await query(
    `INSERT INTO customers (tenant_id, name, phone, email, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.tenantId, name, phone, email, req.user.id]
  );
  
  res.json(result.rows[0]);
};
```

### Step 4: Update Routes

```typescript
// backend/src/routes/customers.routes.ts

import { extractTenant, validateTenantAccess } from '../middleware/tenant';

// Apply tenant middleware
router.use(extractTenant);
router.use(authenticate);
router.use(validateTenantAccess);

// Existing routes remain the same
router.get('/', authorize('ADMIN', 'MANAGER'), getCustomers);
router.post('/', authorize('ADMIN', 'MANAGER'), createCustomer);
```

### Step 5: Test with Existing Tenant

```bash
# Start backend
npm run dev

# Test API with tenant header
curl -H "X-Tenant-Key: lush-laundry" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/customers
```

### Step 6: Update All Controllers

Follow the same pattern for:
- ✅ orders.controller.ts
- ✅ payments.controller.ts
- ✅ deliveries.controller.ts
- ✅ reports.controller.ts
- ✅ inventory.controller.ts
- ✅ expenses.controller.ts
- ✅ users.controller.ts

**Pattern to follow:**
1. Change `AuthRequest` to `TenantRequest`
2. Add `WHERE tenant_id = $1` to all SELECT queries
3. Add `tenant_id` to all INSERT queries
4. Add tenant validation to UPDATE/DELETE queries

---

## 🎨 Phase 3: Frontend Implementation

### Step 1: Create Tenant Context

```bash
mkdir -p frontend/src/contexts
touch frontend/src/contexts/TenantContext.tsx
```

Copy the TenantContext code from the guide.

### Step 2: Update App.tsx

```typescript
import { TenantProvider } from './contexts/TenantContext';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        {/* Rest of app */}
      </AuthProvider>
    </TenantProvider>
  );
}
```

### Step 3: Create Tenant Signup Page

```bash
touch frontend/src/pages/TenantSignup.tsx
```

### Step 4: Update API Client

```typescript
// frontend/src/lib/api.ts

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Add tenant header to all requests
apiClient.interceptors.request.use((config) => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  
  if (subdomain && subdomain !== 'www') {
    config.headers['X-Tenant-Key'] = subdomain;
  }
  
  return config;
});
```

---

## 🧪 Testing Strategy

### Test Scenario 1: Single Tenant (Current State)
```bash
# Should work exactly as before
# Access: http://localhost:5173
# API calls include tenant header automatically
```

### Test Scenario 2: Create Second Tenant
```sql
-- Manually create second tenant for testing
INSERT INTO tenants (
    tenant_key, business_name, subdomain, contact_email
) VALUES (
    'test-laundry', 'Test Laundry', 'test-laundry', 'test@example.com'
);

INSERT INTO tenant_settings (tenant_id) 
SELECT id FROM tenants WHERE tenant_key = 'test-laundry';
```

### Test Scenario 3: Data Isolation
```bash
# Login to first tenant
curl -X POST http://localhost:5000/api/auth/login \
  -H "X-Tenant-Key: lush-laundry" \
  -d '{"email":"admin@lushlaundry.com","password":"Admin123!"}'

# Get customers (should only see lush-laundry customers)
curl http://localhost:5000/api/customers \
  -H "X-Tenant-Key: lush-laundry" \
  -H "Authorization: Bearer TOKEN_FROM_LOGIN"

# Try accessing with different tenant key (should fail or return empty)
curl http://localhost:5000/api/customers \
  -H "X-Tenant-Key: test-laundry" \
  -H "Authorization: Bearer LUSH_LAUNDRY_TOKEN"
```

---

## 🚀 Quick Deployment (After Phases 1-3)

### Option 1: Keep Single Domain (Simplest)
```
yourdomain.com → Main app
All tenants share same domain
Tenant identified by header or user login
```

### Option 2: Subdomain per Tenant (Professional)
```
lush-laundry.yourplatform.com → Lush Laundry
quick-clean.yourplatform.com  → Quick Clean Laundry
```

**DNS Setup:**
```
*.yourplatform.com → Your Server IP (wildcard)
```

**Nginx:**
```nginx
server {
    server_name ~^(?<subdomain>.+)\.yourplatform\.com$;
    # Frontend serves all subdomains
    # Backend extracts tenant from subdomain
}
```

---

## 💡 Common Pitfalls to Avoid

### ❌ DON'T: Forget tenant_id in queries
```typescript
// WRONG - Will expose all tenants' data
const orders = await query('SELECT * FROM orders');
```

### ✅ DO: Always filter by tenant_id
```typescript
// CORRECT
const orders = await query(
  'SELECT * FROM orders WHERE tenant_id = $1',
  [req.tenantId]
);
```

### ❌ DON'T: Trust tenant_id from frontend
```typescript
// WRONG - Security vulnerability
const tenant_id = req.body.tenant_id; // User can manipulate this!
```

### ✅ DO: Use tenant_id from middleware
```typescript
// CORRECT - Middleware validates this
const tenant_id = req.tenantId; // From authenticated session
```

### ❌ DON'T: Allow cross-tenant references
```typescript
// WRONG - Customer from tenant A trying to create order in tenant B
const order = await query(
  'INSERT INTO orders (customer_id, ...) VALUES ($1, ...)',
  [customer_id] // No tenant validation!
);
```

### ✅ DO: Validate relationships
```typescript
// CORRECT - Verify customer belongs to current tenant
const customer = await query(
  'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
  [customer_id, req.tenantId]
);

if (!customer.rows[0]) {
  throw new Error('Customer not found');
}
```

---

## 📊 Success Criteria

### Phase 1 Complete ✅
- [ ] Migration script runs without errors
- [ ] All tables have tenant_id column
- [ ] Existing data assigned to default tenant
- [ ] No NULL tenant_id values in database

### Phase 2 Complete ✅
- [ ] Tenant middleware extracts tenant correctly
- [ ] All queries filter by tenant_id
- [ ] Cross-tenant data access prevented
- [ ] Existing functionality still works

### Phase 3 Complete ✅
- [ ] Tenant signup page works
- [ ] New tenants can register
- [ ] Tenant branding applies
- [ ] Data isolated between tenants

---

## 🆘 Troubleshooting

### "tenant_id cannot be null" error
```sql
-- Find records without tenant_id
SELECT COUNT(*) FROM customers WHERE tenant_id IS NULL;

-- Assign to default tenant
UPDATE customers SET tenant_id = 1 WHERE tenant_id IS NULL;
```

### "Tenant not found" error
```bash
# Check tenant exists
psql -U postgres -d lush_laundry -c "SELECT * FROM tenants;"

# Verify header is being sent
# In browser console:
console.log(window.location.hostname);
```

### Queries returning empty results
```typescript
// Check tenant_id is set correctly
console.log('Request tenant_id:', req.tenantId);
console.log('User tenant_id:', req.user?.tenant_id);

// Verify data exists for tenant
const check = await query(
  'SELECT COUNT(*) FROM orders WHERE tenant_id = $1',
  [req.tenantId]
);
console.log('Orders count:', check.rows[0].count);
```

---

## 📞 Next Steps

1. **Start with Phase 1** (Database Migration)
2. **Test thoroughly** with existing tenant
3. **Implement Phase 2** (Backend) one controller at a time
4. **Test each controller** before moving to next
5. **Implement Phase 3** (Frontend) after backend is stable
6. **Consider Phase 4** (Billing) only when you have paying customers

---

## 🎓 Learning Resources

- Full Guide: [MULTI_TENANT_TRANSFORMATION_GUIDE.md](MULTI_TENANT_TRANSFORMATION_GUIDE.md)
- Migration Script: [backend/migrations/001_add_multi_tenant_support.sql](backend/migrations/001_add_multi_tenant_support.sql)

---

**Remember:** This is a major architectural change. Test thoroughly at each step!

**Need Help?** Review the full transformation guide for detailed examples and code samples.

---

**Created:** March 4, 2026  
**Status:** Quick Start Guide
