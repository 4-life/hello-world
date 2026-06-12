import type { ChangeEvent } from 'react';
import type { CreatePartFormValues } from '@/app/libs/createPartSchema';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

interface Props {
  values: CreatePartFormValues;
  errors?: Partial<Record<keyof CreatePartFormValues, string>>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  serverError?: string;
}

export default function CreatePartForm({
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
          placeholder="Air filter"
          autoComplete="off"
          aria-invalid={!!errors.name}
        />
        <FieldError>{errors.name}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>SKU *</FieldLabel>
          <Input
            name="sku"
            value={values.sku}
            onChange={onChange}
            placeholder="AF-100"
            autoComplete="off"
            aria-invalid={!!errors.sku}
          />
          <FieldError>{errors.sku}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Unit</FieldLabel>
          <Input
            name="unit"
            value={values.unit}
            onChange={onChange}
            placeholder="pcs"
            autoComplete="off"
            aria-invalid={!!errors.unit}
          />
          <FieldError>{errors.unit}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel>Description</FieldLabel>
        <Input
          name="description"
          value={values.description}
          onChange={onChange}
          placeholder="Optional description"
          autoComplete="off"
          aria-invalid={!!errors.description}
        />
        <FieldError>{errors.description}</FieldError>
      </Field>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
