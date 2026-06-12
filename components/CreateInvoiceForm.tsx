import type { ChangeEvent } from 'react';
import { PaymentStatus } from '@/app/db/entities/PaymentStatus';
import type { CreateInvoiceFormValues } from '@/app/libs/createInvoiceSchema';
import { formatLabel } from '@/app/orders/statusBadge';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClientOption {
  id: string;
  name: string;
}

interface OrderOption {
  id: string;
  orderNumber: number;
}

interface Props {
  values: CreateInvoiceFormValues;
  errors?: Partial<Record<keyof CreateInvoiceFormValues, string>>;
  clients: ClientOption[];
  orders: OrderOption[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: keyof CreateInvoiceFormValues, value: string) => void;
  serverError?: string;
}

export default function CreateInvoiceForm({
  values,
  errors = {},
  clients,
  orders,
  onChange,
  onSelectChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel>Client *</FieldLabel>
        <Select
          value={values.clientId}
          onValueChange={(v) => onSelectChange('clientId', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.clientId}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Order</FieldLabel>
        <Select
          value={values.orderId || 'none'}
          onValueChange={(v) =>
            onSelectChange('orderId', v === 'none' ? '' : v)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No linked order</SelectItem>
            {orders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                #{order.orderNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.orderId}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Amount *</FieldLabel>
          <Input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={onChange}
            placeholder="0.00"
            autoComplete="off"
            aria-invalid={!!errors.amount}
          />
          <FieldError>{errors.amount}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Payment status</FieldLabel>
          <Select
            value={values.paymentStatus}
            onValueChange={(v) => onSelectChange('paymentStatus', v)}
          >
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
          <FieldError>{errors.paymentStatus}</FieldError>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Issued date *</FieldLabel>
          <DatePicker
            value={values.issuedDate}
            onChange={(value) => onSelectChange('issuedDate', value)}
            aria-invalid={!!errors.issuedDate}
          />
          <FieldError>{errors.issuedDate}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Due date</FieldLabel>
          <DatePicker
            value={values.dueDate}
            onChange={(value) => onSelectChange('dueDate', value)}
            aria-invalid={!!errors.dueDate}
          />
          <FieldError>{errors.dueDate}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          name="notes"
          value={values.notes}
          onChange={onChange}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          aria-invalid={!!errors.notes}
        />
        <FieldError>{errors.notes}</FieldError>
      </Field>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
