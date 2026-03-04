import { cn } from '@/lib/utils';

type OrderStatus = 'received' | 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  'received': { label: 'Received', className: 'order-status pending' },
  'pending': { label: 'Pending', className: 'order-status pending' },
  'processing': { label: 'Processing', className: 'order-status processing' },
  'ready': { label: 'Ready', className: 'order-status ready' },
  'delivered': { label: 'Delivered', className: 'order-status delivered' },
  'cancelled': { label: 'Cancelled', className: 'order-status cancelled' },
  // Handle uppercase versions from database
  'RECEIVED': { label: 'Received', className: 'order-status pending' },
  'PENDING': { label: 'Pending', className: 'order-status pending' },
  'PROCESSING': { label: 'Processing', className: 'order-status processing' },
  'READY': { label: 'Ready', className: 'order-status ready' },
  'DELIVERED': { label: 'Delivered', className: 'order-status delivered' },
  'CANCELLED': { label: 'Cancelled', className: 'order-status cancelled' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['pending'];
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
