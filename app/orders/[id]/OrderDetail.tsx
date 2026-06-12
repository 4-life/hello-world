'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@/app/db/entities/OrderStatus';
import { formatDate, formatTime } from '@/app/orders/format';
import { formatLabel, paymentStatusVariant } from '@/app/orders/statusBadge';
import type { OrderQuery } from '@/app/libs/getOrder';
import useUpdateOrder from '@/app/libs/updateOrder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EngineerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  order: NonNullable<OrderQuery['order']>;
  engineers: EngineerOption[];
  canManage: boolean;
}

export default function OrderDetail({
  order,
  engineers,
  canManage,
}: Props): React.JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<string>(order.status);
  const [engineerId, setEngineerId] = useState<string>(
    order.engineer?.id ?? '',
  );
  const [notes, setNotes] = useState<string>(order.notes ?? '');
  const [serverError, setServerError] = useState<string>('');

  const [updateOrder, { loading: isLoading }] = useUpdateOrder();

  async function handleSave(): Promise<void> {
    setServerError('');
    try {
      await updateOrder({
        variables: {
          data: {
            id: order.id,
            status,
            notes: notes || undefined,
            engineerId: engineerId || null,
          },
        },
      });
      router.refresh();
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to update order',
      );
    }
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Type</span>
          <p>{formatLabel(order.type)}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Scheduled</span>
          <p>
            {order.scheduledDate ? formatDate(order.scheduledDate) : '—'}
            {order.timeWindowStart && order.timeWindowEnd
              ? `, ${formatTime(order.timeWindowStart)}–${formatTime(order.timeWindowEnd)}`
              : ''}
          </p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Created</span>
          <p>{formatDate(order.createdDate)}</p>
        </div>
      </div>

      <Field>
        <FieldLabel>Status</FieldLabel>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(OrderStatus).map((key) => (
              <SelectItem key={key} value={key}>
                {formatLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Engineer</FieldLabel>
        <Select
          value={engineerId || 'unassigned'}
          onValueChange={(v) => setEngineerId(v === 'unassigned' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {engineers.map((engineer) => (
              <SelectItem key={engineer.id} value={engineer.id}>
                {engineer.firstName} {engineer.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </Field>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving…' : 'Save changes'}
      </Button>

      {canManage && (
        <div className="border-t pt-4">
          <span className="text-muted-foreground text-xs">Invoice</span>
          {order.invoice ? (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <Link
                href={`/invoices/${order.invoice.id}`}
                className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
              >
                #{order.invoice.invoiceNumber}
              </Link>
              <span>{order.invoice.amount}</span>
              <Badge
                variant={paymentStatusVariant(order.invoice.paymentStatus)}
              >
                {formatLabel(order.invoice.paymentStatus)}
              </Badge>
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No invoice issued.{' '}
              <Link
                href="/invoices"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Create one
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
