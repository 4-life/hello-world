'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentStatus } from '@/app/db/entities/PaymentStatus';
import { formatDate } from '@/app/orders/format';
import { formatLabel, orderStatusVariant } from '@/app/orders/statusBadge';
import type { InvoiceQuery } from '@/app/libs/getInvoice';
import useUpdateInvoice from '@/app/libs/updateInvoice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  invoice: NonNullable<InvoiceQuery['invoice']>;
}

export default function InvoiceDetail({ invoice }: Props): React.JSX.Element {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string>(
    invoice.paymentStatus,
  );
  const [amount, setAmount] = useState<string>(String(invoice.amount));
  const [dueDate, setDueDate] = useState<string>(
    (invoice.dueDate as unknown as string) ?? '',
  );
  const [notes, setNotes] = useState<string>(invoice.notes ?? '');
  const [serverError, setServerError] = useState<string>('');

  const [updateInvoice, { loading: isLoading }] = useUpdateInvoice();

  async function handleSave(): Promise<void> {
    setServerError('');
    try {
      await updateInvoice({
        variables: {
          data: {
            id: invoice.id,
            paymentStatus,
            amount: Number(amount),
            dueDate: dueDate || undefined,
            notes: notes || undefined,
          },
        },
      });
      router.refresh();
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to update invoice',
      );
    }
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Client</span>
          <p>
            <Link
              href={`/clients/${invoice.client.id}`}
              className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
            >
              {invoice.client.name}
            </Link>
          </p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Order</span>
          <p>
            {invoice.order ? (
              <Link
                href={`/orders/${invoice.order.id}`}
                className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
              >
                #{invoice.order.orderNumber}
              </Link>
            ) : (
              '—'
            )}
          </p>
        </div>

        {invoice.order && (
          <div>
            <span className="text-muted-foreground text-xs">Order status</span>
            <p>
              <Badge variant={orderStatusVariant(invoice.order.status)}>
                {formatLabel(invoice.order.status)}
              </Badge>
            </p>
          </div>
        )}

        <div>
          <span className="text-muted-foreground text-xs">Issued</span>
          <p>{formatDate(invoice.issuedDate)}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Created</span>
          <p>{formatDate(invoice.createdDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Amount</FieldLabel>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>Payment status</FieldLabel>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PaymentStatus).map((key) => (
                <SelectItem key={key} value={key}>
                  {formatLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>Due date</FieldLabel>
        <DatePicker value={dueDate} onChange={setDueDate} />
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
    </div>
  );
}
