import type { ChangeEvent } from 'react';
import { OrderType } from '@/app/db/entities/OrderType';
import { OrderStatus } from '@/app/db/entities/OrderStatus';
import type { CreateOrderFormValues } from '@/app/libs/createOrderSchema';
import { formatLabel } from '@/app/orders/statusBadge';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
  values: CreateOrderFormValues;
  errors?: Partial<Record<keyof CreateOrderFormValues, string>>;
  engineers: EngineerOption[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: keyof CreateOrderFormValues, value: string) => void;
  serverError?: string;
}

export default function CreateOrderForm({
  values,
  errors = {},
  engineers,
  onChange,
  onSelectChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Type *</FieldLabel>
          <Select
            value={values.type}
            onValueChange={(v) => onSelectChange('type', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(OrderType).map((key) => (
                <SelectItem key={key} value={key}>
                  {formatLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.type}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(v) => onSelectChange('status', v)}
          >
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
          <FieldError>{errors.status}</FieldError>
        </Field>
      </div>

      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
        <Field>
          <FieldLabel>Scheduled date</FieldLabel>
          <DatePicker
            value={values.scheduledDate}
            onChange={(value) => onSelectChange('scheduledDate', value)}
            aria-invalid={!!errors.scheduledDate}
          />
          <FieldError>{errors.scheduledDate}</FieldError>
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:contents">
          <Field>
            <FieldLabel>From</FieldLabel>
            <TimePicker
              value={values.timeWindowStart}
              onChange={(value) => onSelectChange('timeWindowStart', value)}
              aria-invalid={!!errors.timeWindowStart}
            />
            <FieldError>{errors.timeWindowStart}</FieldError>
          </Field>

          <Field>
            <FieldLabel>To</FieldLabel>
            <TimePicker
              value={values.timeWindowEnd}
              onChange={(value) => onSelectChange('timeWindowEnd', value)}
              aria-invalid={!!errors.timeWindowEnd}
            />
            <FieldError>{errors.timeWindowEnd}</FieldError>
          </Field>
        </div>
      </div>

      <Field>
        <FieldLabel>Engineer</FieldLabel>
        <Select
          value={values.engineerId || 'unassigned'}
          onValueChange={(v) =>
            onSelectChange('engineerId', v === 'unassigned' ? '' : v)
          }
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
        <FieldError>{errors.engineerId}</FieldError>
      </Field>

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
