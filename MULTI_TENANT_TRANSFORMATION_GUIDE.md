# 🏢 Multi-Tenant SaaS Transformation Guide
## Converting Lush Laundry ERP to a Multi-Tenant Platform

**Current State:** Single laundry business system  
**Target State:** Multi-tenant SaaS platform for multiple laundry businesses  
**Complexity:** High (Major architectural changes required)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Changes](#database-changes)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Tenant Management](#tenant-management)
6. [Customization Features](#customization-features)
7. [Security & Isolation](#security-isolation)
8. [Deployment Strategy](#deployment-strategy)
9. [Implementation Phases](#implementation-phases)

---

## 🏗️ Architecture Overview

### **Current Architecture (Single Tenant)**
```
User → Login → Access All Data
Database: Single business data
```

### **Target Architecture (Multi-Tenant)**
```
User → Select Tenant → Login → Access Tenant-Specific Data
Database: Multiple businesses (isolated by tenant_id)
```

### **Three Multi-Tenant Strategies**

#### **Option 1: Shared Database + Tenant ID** (Recommended)
- ✅ Cost-effective
- ✅ Easy to maintain
- ✅ Good for 10-1000 tenants
- ⚠️ Requires strict data isolation

```
Single Database
├── tenants table
├── users table (tenant_id foreign key)
├── customers table (tenant_id foreign key)
├── orders table (tenant_id foreign key)
└── ... all tables have tenant_id
```

#### **Option 2: Separate Schema per Tenant**
- ✅ Better isolation
- ✅ Easier backups per tenant
- ⚠️ More complex migrations
- ⚠️ Moderate cost

```
Database
├── tenant_1 schema
│   ├── users
│   ├── customers
│   └── orders
├── tenant_2 schema
│   ├── users
│   ├── customers
│   └── orders
```

#### **Option 3: Separate Database per Tenant**
- ✅ Maximum isolation
- ✅ Custom scaling per tenant
- ❌ Expensive
- ❌ Complex maintenance

---

## 🗄️ Database Changes

### **Phase 1: Add Tenant Infrastructure**

#### **1. Create Tenants Table**

```sql
-- Create tenants table
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'lush-kampala', 'quick-clean-nairobi'
    business_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'lush-kampala.yourplatform.com'
    
    -- Contact Information
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    business_address TEXT,
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'trial', -- trial, basic, premium, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    trial_ends_at TIMESTAMP,
    subscription_started_at TIMESTAMP,
    
    -- Branding & Customization
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1e40af', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#3b82f6',
    currency VARCHAR(3) DEFAULT 'UGX', -- UGX, KES, USD, etc.
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    
    -- Features & Limits
    max_users INT DEFAULT 5,
    max_orders_per_month INT DEFAULT 1000,
    features_enabled JSONB DEFAULT '{"sms": false, "whatsapp": false, "email": true}'::jsonb,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INT REFERENCES users(id)
);

-- Create index for fast lookups
CREATE INDEX idx_tenants_tenant_key ON tenants(tenant_key);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);
```

#### **2. Add tenant_id to ALL Existing Tables**

```sql
-- Add tenant_id to users table
ALTER TABLE users ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Add tenant_id to customers table
ALTER TABLE customers ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);

-- Add tenant_id to orders table
ALTER TABLE orders ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);

-- Add tenant_id to order_items table
ALTER TABLE order_items ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);

-- Add tenant_id to payments table
ALTER TABLE payments ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);

-- Add tenant_id to deliveries table
ALTER TABLE deliveries ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_deliveries_tenant_id ON deliveries(tenant_id);

-- Add tenant_id to price_list table
ALTER TABLE price_list ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_price_list_tenant_id ON price_list(tenant_id);

-- Add tenant_id to inventory_items table
ALTER TABLE inventory_items ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_inventory_items_tenant_id ON inventory_items(tenant_id);

-- Add tenant_id to expenses table
ALTER TABLE expenses ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_expenses_tenant_id ON expenses(tenant_id);

-- Add tenant_id to payroll_employees table
ALTER TABLE payroll_employees ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_payroll_employees_tenant_id ON payroll_employees(tenant_id);

-- Add tenant_id to delivery_zones table
ALTER TABLE delivery_zones ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_delivery_zones_tenant_id ON delivery_zones(tenant_id);

-- Add tenant_id to fiscal_years table
ALTER TABLE fiscal_years ADD COLUMN tenant_id INT REFERENCES tenants(id);
CREATE INDEX idx_fiscal_years_tenant_id ON fiscal_years(tenant_id);

-- Repeat for ALL other tables...
```

#### **3. Create Row-Level Security (RLS) Functions**

```sql
-- Function to get current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS INT AS $$
BEGIN
    -- This will be set by application code
    RETURN NULLIF(current_setting('app.current_tenant_id', TRUE), '')::INT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Create RLS policies
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_policy ON customers
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_policy ON orders
    USING (tenant_id = current_tenant_id());

-- ... repeat for all tables
```

#### **4. Create Tenant Settings Table**

```sql
-- Tenant-specific settings/preferences
CREATE TABLE tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Business Settings
    business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00"}}'::jsonb,
    default_tax_rate DECIMAL(5,2) DEFAULT 18.00, -- VAT percentage
    tax_enabled BOOLEAN DEFAULT false,
    
    -- Order Settings
    order_number_prefix VARCHAR(10) DEFAULT 'ORD',
    invoice_number_prefix VARCHAR(10) DEFAULT 'INV',
    auto_generate_invoice BOOLEAN DEFAULT true,
    
    -- Payment Settings
    accepted_payment_methods JSONB DEFAULT '["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]'::jsonb,
    mobile_money_providers JSONB DEFAULT '{"MTN": "+256700000000", "AIRTEL": "+256750000000"}'::jsonb,
    
    -- Notification Settings
    sms_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT true,
    sms_provider VARCHAR(50) DEFAULT 'africastalking',
    
    -- Discount Settings
    max_discount_agent DECIMAL(5,2) DEFAULT 10.00,
    max_discount_manager DECIMAL(5,2) DEFAULT 20.00,
    max_discount_admin DECIMAL(5,2) DEFAULT 50.00,
    
    -- Receipt Settings
    receipt_footer_text TEXT,
    receipt_logo_url VARCHAR(500),
    show_company_details BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id)
);
```

### **Phase 2: Add Super Admin Table**

```sql
-- Platform administrators (can manage all tenants)
CREATE TABLE platform_admins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    permissions JSONB DEFAULT '["manage_tenants", "view_analytics", "manage_billing"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Backend Implementation

### **1. Create Tenant Middleware**

```typescript
// backend/src/middleware/tenant.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { query } from '../config/database';

export interface TenantRequest extends AuthRequest {
  tenantId: number;
  tenant?: {
    id: number;
    tenant_key: string;
    business_name: string;
    features_enabled: Record<string, boolean>;
    currency: string;
    timezone: string;
  };
}

/**
 * Extract tenant from subdomain or header
 * Example: lush-kampala.yourplatform.com → tenant_key = 'lush-kampala'
 */
export const extractTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantKey: string | null = null;

    // Method 1: From subdomain
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      const result = await query(
        'SELECT * FROM tenants WHERE subdomain = $1 AND is_active = true',
        [subdomain]
      );
      
      if (result.rows.length > 0) {
        req.tenant = result.rows[0];
        req.tenantId = result.rows[0].id;
      }
    }

    // Method 2: From custom header (for API calls)
    if (!req.tenantId) {
      tenantKey = req.headers['x-tenant-key'] as string;
      
      if (tenantKey) {
        const result = await query(
          'SELECT * FROM tenants WHERE tenant_key = $1 AND is_active = true',
          [tenantKey]
        );
        
        if (result.rows.length > 0) {
          req.tenant = result.rows[0];
          req.tenantId = result.rows[0].id;
        }
      }
    }

    // Method 3: From JWT token (if user is already logged in)
    if (!req.tenantId && req.user?.tenant_id) {
      req.tenantId = req.user.tenant_id;
      
      const result = await query(
        'SELECT * FROM tenants WHERE id = $1 AND is_active = true',
        [req.tenantId]
      );
      
      if (result.rows.length > 0) {
        req.tenant = result.rows[0];
      }
    }

    if (!req.tenantId) {
      return res.status(400).json({
        error: 'Tenant not specified or not found',
        message: 'Please access via your assigned subdomain or provide X-Tenant-Key header'
      });
    }

    // Set tenant context for database queries (for RLS)
    await query('SET app.current_tenant_id = $1', [req.tenantId]);

    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    res.status(500).json({ error: 'Failed to identify tenant' });
  }
};

/**
 * Ensure user belongs to the current tenant
 */
export const validateTenantAccess = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.tenant_id !== req.tenantId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have access to this tenant'
    });
  }

  next();
};
```

### **2. Update All Controllers to Use tenant_id**

```typescript
// backend/src/controllers/orders.controller.ts

import { TenantRequest } from '../middleware/tenant';

// OLD (Single Tenant)
export const getOrders = async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM orders');
  res.json(result.rows);
};

// NEW (Multi-Tenant)
export const getOrders = async (req: TenantRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM orders WHERE tenant_id = $1',
    [req.tenantId]
  );
  res.json(result.rows);
};

// Example: Create Order with tenant_id
export const createOrder = async (req: TenantRequest, res: Response) => {
  const { customer_id, items, ...orderData } = req.body;
  
  // Insert order with tenant_id
  const result = await query(
    `INSERT INTO orders (tenant_id, customer_id, created_by, ...)
     VALUES ($1, $2, $3, ...)
     RETURNING *`,
    [req.tenantId, customer_id, req.user.id, ...]
  );
  
  res.json(result.rows[0]);
};
```

### **3. Update All Routes to Use Tenant Middleware**

```typescript
// backend/src/routes/orders.routes.ts

import { extractTenant, validateTenantAccess } from '../middleware/tenant';

// Apply tenant middleware to all routes
router.use(extractTenant);
router.use(authenticate);
router.use(validateTenantAccess);

router.get('/', authorize('ADMIN', 'MANAGER'), getOrders);
router.post('/', authorize('ADMIN', 'MANAGER', 'DESKTOP_AGENT'), createOrder);
// ... rest of routes
```

### **4. Create Tenant Management Controller**

```typescript
// backend/src/controllers/tenants.controller.ts

import { Request, Response } from 'express';
import { query } from '../config/database';
import bcrypt from 'bcryptjs';

/**
 * Register a new tenant (public endpoint for signup)
 */
export const registerTenant = async (req: Request, res: Response) => {
  try {
    const {
      business_name,
      tenant_key,
      subdomain,
      contact_email,
      contact_phone,
      admin_name,
      admin_email,
      admin_password
    } = req.body;

    // Validate subdomain availability
    const existingTenant = await query(
      'SELECT id FROM tenants WHERE subdomain = $1 OR tenant_key = $2',
      [subdomain, tenant_key]
    );

    if (existingTenant.rows.length > 0) {
      return res.status(400).json({
        error: 'Subdomain or tenant key already taken'
      });
    }

    // Create tenant
    const tenantResult = await query(
      `INSERT INTO tenants (
        business_name, tenant_key, subdomain, contact_email, contact_phone,
        subscription_plan, subscription_status, trial_ends_at
      ) VALUES ($1, $2, $3, $4, $5, 'trial', 'active', NOW() + INTERVAL '14 days')
      RETURNING *`,
      [business_name, tenant_key, subdomain, contact_email, contact_phone]
    );

    const tenant = tenantResult.rows[0];

    // Create default tenant settings
    await query(
      'INSERT INTO tenant_settings (tenant_id) VALUES ($1)',
      [tenant.id]
    );

    // Create admin user for the tenant
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    
    const userResult = await query(
      `INSERT INTO users (
        tenant_id, name, email, password, role, status
      ) VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE')
      RETURNING id, name, email, role`,
      [tenant.id, admin_name, admin_email, hashedPassword]
    );

    res.status(201).json({
      message: 'Tenant registered successfully',
      tenant: {
        id: tenant.id,
        business_name: tenant.business_name,
        subdomain: tenant.subdomain,
        trial_ends_at: tenant.trial_ends_at
      },
      admin: userResult.rows[0],
      access_url: `https://${subdomain}.yourplatform.com`
    });

  } catch (error) {
    console.error('Tenant registration error:', error);
    res.status(500).json({ error: 'Failed to register tenant' });
  }
};

/**
 * Get current tenant details
 */
export const getCurrentTenant = async (req: TenantRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT t.*, ts.* 
       FROM tenants t
       LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id
       WHERE t.id = $1`,
      [req.tenantId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant details' });
  }
};

/**
 * Update tenant settings (admin only)
 */
export const updateTenantSettings = async (req: TenantRequest, res: Response) => {
  try {
    const updates = req.body;

    const result = await query(
      `UPDATE tenant_settings 
       SET business_hours = COALESCE($1, business_hours),
           default_tax_rate = COALESCE($2, default_tax_rate),
           sms_enabled = COALESCE($3, sms_enabled),
           updated_at = NOW()
       WHERE tenant_id = $4
       RETURNING *`,
      [updates.business_hours, updates.default_tax_rate, updates.sms_enabled, req.tenantId]
    );

    res.json({
      message: 'Settings updated successfully',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
```

---

## 🎨 Frontend Implementation

### **1. Add Tenant Context**

```typescript
// frontend/src/contexts/TenantContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
  id: number;
  business_name: string;
  tenant_key: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  features_enabled: Record<string, boolean>;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = async () => {
    try {
      // Extract subdomain from URL
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      const response = await axios.get('/api/tenants/current', {
        headers: {
          'X-Tenant-Key': subdomain
        }
      });

      setTenant(response.data);
      
      // Apply tenant branding
      document.documentElement.style.setProperty('--primary-color', response.data.primary_color);
      document.documentElement.style.setProperty('--secondary-color', response.data.secondary_color);
      
      if (response.data.logo_url) {
        // Update favicon
        const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (favicon) favicon.href = response.data.logo_url;
      }

    } catch (error) {
      console.error('Failed to fetch tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, refreshTenant: fetchTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

### **2. Update App.tsx to Include Tenant Provider**

```typescript
// frontend/src/App.tsx

import { TenantProvider } from './contexts/TenantContext';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {/* Rest of your app */}
        </QueryClientProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
```

### **3. Create Tenant Signup Page**

```typescript
// frontend/src/pages/TenantSignup.tsx

import React, { useState } from 'react';
import axios from 'axios';

export const TenantSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    tenant_key: '',
    subdomain: '',
    contact_email: '',
    contact_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/tenants/register', formData);
      
      alert(`Success! Your laundry business is ready at: ${response.data.access_url}`);
      
      // Redirect to tenant subdomain
      window.location.href = response.data.access_url;
      
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Start Your Laundry Business</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Choose Your Subdomain</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({
                  ...formData, 
                  subdomain: e.target.value,
                  tenant_key: e.target.value
                })}
                className="flex-1 border rounded px-3 py-2"
                placeholder="your-business"
                required
              />
              <span className="text-gray-500">.yourplatform.com</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <hr className="my-4" />

          <h3 className="font-semibold">Admin Account</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Name</label>
            <input
              type="text"
              value={formData.admin_name}
              onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Email</label>
            <input
              type="email"
              value={formData.admin_email}
              onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Password</label>
            <input
              type="password"
              value={formData.admin_password}
              onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Start 14-Day Free Trial
          </button>
        </form>
      </div>
    </div>
  );
};
```

### **4. Create Tenant Settings Page**

```typescript
// frontend/src/pages/TenantSettings.tsx

import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const TenantSettings: React.FC = () => {
  const { tenant, refreshTenant } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const response = await axios.get('/api/tenants/settings');
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await axios.patch('/api/tenants/settings', updates);
      return response.data;
    },
    onSuccess: () => {
      refreshTenant();
      alert('Settings updated successfully!');
    }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>

      <div className="space-y-6">
        {/* Branding */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                type="text"
                defaultValue={tenant?.business_name}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="url"
                defaultValue={tenant?.logo_url}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <input
                  type="color"
                  defaultValue={tenant?.primary_color}
                  className="w-full h-10 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                <input
                  type="color"
                  defaultValue={tenant?.secondary_color}
                  className="w-full h-10 border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Business Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select className="w-full border rounded px-3 py-2" defaultValue={tenant?.currency}>
                <option value="UGX">UGX - Ugandan Shilling</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default VAT Rate (%)</label>
              <input
                type="number"
                step="0.01"
                defaultValue={settings?.default_tax_rate}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={tenant?.features_enabled?.sms}
                disabled={!tenant?.features_enabled?.sms} // Based on subscription
              />
              <span>SMS Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={tenant?.features_enabled?.whatsapp}
                disabled={!tenant?.features_enabled?.whatsapp}
              />
              <span>WhatsApp Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={tenant?.features_enabled?.email} />
              <span>Email Notifications</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => updateMutation.mutate({})}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
```

---

## 🔐 Security & Isolation

### **Critical Security Measures**

1. **Always Filter by tenant_id**
```typescript
// ❌ WRONG - Data leakage risk
const orders = await query('SELECT * FROM orders');

// ✅ CORRECT - Tenant isolated
const orders = await query(
  'SELECT * FROM orders WHERE tenant_id = $1',
  [req.tenantId]
);
```

2. **Validate Relationships Across Tables**
```typescript
// When creating order items, ensure customer belongs to tenant
const customer = await query(
  'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
  [customer_id, req.tenantId]
);

if (!customer.rows[0]) {
  throw new Error('Customer not found or access denied');
}
```

3. **File Upload Isolation**
```typescript
// Store files with tenant_id prefix
const uploadPath = `uploads/${req.tenantId}/profiles/${filename}`;
```

4. **Prevent Cross-Tenant Admin Access**
```typescript
// Admin can only manage users in their tenant
export const updateUser = async (req: TenantRequest, res: Response) => {
  const { userId } = req.params;
  
  // Verify user belongs to tenant
  const user = await query(
    'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
    [userId, req.tenantId]
  );
  
  if (!user.rows[0]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Proceed with update...
};
```

---

## 🚀 Deployment Strategy

### **DNS & Subdomain Configuration**

#### **Wildcard DNS Setup**
```
*.yourplatform.com  →  A Record  →  Your Server IP
api.yourplatform.com → A Record  →  Your Server IP
yourplatform.com     → A Record  →  Your Server IP
```

#### **Nginx Configuration for Subdomains**
```nginx
# Main landing page
server {
    listen 80;
    server_name yourplatform.com www.yourplatform.com;
    root /var/www/yourplatform-marketing;
    index index.html;
}

# API server (all tenants use same API)
server {
    listen 80;
    server_name api.yourplatform.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Tenant subdomains (wildcard)
server {
    listen 80;
    server_name ~^(?<subdomain>.+)\.yourplatform\.com$;
    
    root /var/www/yourplatform-app;
    index index.html;
    
    # Pass subdomain to frontend (for tenant detection)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📊 Implementation Phases

### **Phase 1: Database Migration (2-3 weeks)**
- [ ] Create tenants table
- [ ] Add tenant_id to all tables
- [ ] Create indexes
- [ ] Implement RLS (optional)
- [ ] Migrate existing data to first tenant

### **Phase 2: Backend Multi-Tenancy (3-4 weeks)**
- [ ] Create tenant middleware
- [ ] Update all controllers
- [ ] Update all queries
- [ ] Create tenant management endpoints
- [ ] Add tenant registration
- [ ] Testing & security audit

### **Phase 3: Frontend Updates (2-3 weeks)**
- [ ] Add tenant context
- [ ] Create tenant signup page
- [ ] Add tenant settings page
- [ ] Implement tenant branding
- [ ] Update all API calls with tenant headers

### **Phase 4: Subscription & Billing (2-3 weeks)**
- [ ] Integrate payment gateway (Stripe/Paystack)
- [ ] Create subscription plans
- [ ] Implement usage tracking
- [ ] Add billing portal
- [ ] Trial management

### **Phase 5: Admin Panel (1-2 weeks)**
- [ ] Platform admin dashboard
- [ ] Tenant management interface
- [ ] Analytics & reporting
- [ ] Support tools

### **Phase 6: Testing & Launch (2 weeks)**
- [ ] Security audit
- [ ] Performance testing
- [ ] Load testing
- [ ] Beta testing with pilot tenants
- [ ] Documentation
- [ ] Launch!

---

## 💰 Pricing Strategy

### **Suggested Plans**

#### **Free Trial**
- 14 days free
- Up to 50 orders
- 2 users
- Basic features

#### **Basic - $29/month**
- Unlimited orders
- 5 users
- Email notifications
- Standard reports

#### **Professional - $79/month**
- Everything in Basic
- 15 users
- SMS & WhatsApp notifications
- Advanced reports
- Custom branding
- API access

#### **Enterprise - Custom Pricing**
- Everything in Professional
- Unlimited users
- Dedicated support
- Custom integrations
- SLA guarantee

---

## 🎯 Key Considerations

1. **Performance:** Add database indexes on tenant_id for all queries
2. **Scalability:** Consider database connection pooling per tenant
3. **Backups:** Schedule per-tenant backups
4. **Monitoring:** Track per-tenant usage and performance
5. **Support:** Build admin tools to help tenants
6. **Billing:** Integrate with Stripe/Paystack/Flutterwave
7. **Legal:** Terms of service, privacy policy, data handling
8. **Compliance:** GDPR, data residency requirements

---

## 📚 Additional Resources

- **Multi-Tenancy Patterns:** https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy
- **Row-Level Security:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Stripe Billing:** https://stripe.com/docs/billing
- **Subdomain Routing:** https://expressjs.com/en/guide/routing.html

---

**Estimated Total Implementation Time:** 12-16 weeks

**Complexity:** High - Requires significant architectural changes

**Recommendation:** Start with Phase 1-3, validate with beta customers, then build Phase 4-5.

---

**Created:** March 4, 2026  
**Status:** Implementation Guide
