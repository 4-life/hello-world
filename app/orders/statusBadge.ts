import { OrderStatus } from '@/app/db/entities/OrderStatus';
import { PaymentStatus } from '@/app/db/entities/PaymentStatus';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const ORDER_STATUS_VARIANTS: Record<keyof typeof OrderStatus, BadgeVariant> = {
  NEW: 'gray',
  SCHEDULED: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const PAYMENT_STATUS_VARIANTS: Record<
  keyof typeof PaymentStatus,
  BadgeVariant
> = {
  UNPAID: 'red',
  PARTIALLY_PAID: 'amber',
  PAID: 'green',
};

export function orderStatusVariant(status: string): BadgeVariant {
  return ORDER_STATUS_VARIANTS[status as keyof typeof OrderStatus] ?? 'gray';
}

export function paymentStatusVariant(status: string): BadgeVariant {
  return (
    PAYMENT_STATUS_VARIANTS[status as keyof typeof PaymentStatus] ?? 'gray'
  );
}
