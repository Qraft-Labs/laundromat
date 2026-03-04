export interface Customer {
  id: number;
  customer_id: string; // e.g., "C001"
  name: string;
  phone: string;
  email?: string;
  location?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerCreateDTO {
  name: string;
  phone: string;
  email?: string;
  location?: string;
  notes?: string;
}

export interface CustomerUpdateDTO {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  notes?: string;
}

export interface CustomerStats {
  total_orders: number;
  total_spent: number;
  last_order_date?: Date;
}
