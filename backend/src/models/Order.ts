export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: number;
  order_number: string; // e.g., "ORD-2024-001"
  customer_id: number;
  user_id: number; // staff who created the order
  status: OrderStatus;
  due_date?: Date;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  price_item_id: number;
  service_type: 'wash' | 'iron';
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface OrderCreateDTO {
  customer_id: number;
  due_date?: string;
  items: Array<{
    price_item_id: number;
    service_type: 'wash' | 'iron';
    quantity: number;
  }>;
  discount?: number;
  notes?: string;
}

export interface OrderUpdateDTO {
  status?: OrderStatus;
  due_date?: string;
  discount?: number;
  notes?: string;
}

export interface OrderWithDetails extends Order {
  customer_name: string;
  customer_phone: string;
  staff_name: string;
  items: Array<OrderItem & {
    item_name: string;
    category: string;
  }>;
}
