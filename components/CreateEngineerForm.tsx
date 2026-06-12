import type { ChangeEvent } from 'react';
import type { CreateEngineerFormValues } from '@/app/libs/createEngineerSchema';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

interface Props {
  values: CreateEngineerFormValues;
  errors?: Partial<Record<keyof CreateEngineerFormValues, string>>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  serverError?: string;
}

export default function CreateEngineerForm({
  values,
  errors = {},
  onChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>First name *</FieldLabel>
          <Input
            name="firstName"
            value={values.firstName}
            onChange={onChange}
            placeholder="John"
            autoComplete="off"
            aria-invalid={!!errors.firstName}
          />
          <FieldError>{errors.firstName}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Last name *</FieldLabel>
          <Input
            name="lastName"
            value={values.lastName}
            onChange={onChange}
            placeholder="Doe"
            autoComplete="off"
            aria-invalid={!!errors.lastName}
          />
          <FieldError>{errors.lastName}</FieldError>
        </Field>
      </div>

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
        <FieldLabel>Email</FieldLabel>
        <Input
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="engineer@example.com"
          autoComplete="off"
          aria-invalid={!!errors.email}
        />
        <FieldError>{errors.email}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Specialization</FieldLabel>
        <Input
          name="specialization"
          value={values.specialization}
          onChange={onChange}
          placeholder="HVAC, Refrigeration…"
          autoComplete="off"
          aria-invalid={!!errors.specialization}
        />
        <FieldError>{errors.specialization}</FieldError>
      </Field>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
