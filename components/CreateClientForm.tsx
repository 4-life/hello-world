import type { ChangeEvent } from 'react';
import type { CreateClientFormValues } from '@/app/libs/createClientSchema';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

interface Props {
  values: CreateClientFormValues;
  errors?: Partial<Record<keyof CreateClientFormValues, string>>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  serverError?: string;
}

export default function CreateClientForm({
  values,
  errors = {},
  onChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel>Name *</FieldLabel>
        <Input
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="Acme Properties LLC"
          autoComplete="off"
          aria-invalid={!!errors.name}
        />
        <FieldError>{errors.name}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="billing@example.com"
          autoComplete="off"
          aria-invalid={!!errors.email}
        />
        <FieldError>{errors.email}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Phone</FieldLabel>
        <Input
          name="phone"
          value={values.phone}
          onChange={onChange}
          placeholder="+1 234 567 8900"
          autoComplete="off"
          aria-invalid={!!errors.phone}
        />
        <FieldError>{errors.phone}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Address</FieldLabel>
        <textarea
          name="address"
          value={values.address}
          onChange={onChange}
          rows={2}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          aria-invalid={!!errors.address}
        />
        <FieldError>{errors.address}</FieldError>
      </Field>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
