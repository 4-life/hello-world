import type { ChangeEvent } from 'react';
import { UserRole } from '@/app/db/entities/UserRole';
import type { EditProfileFormValues } from '@/app/libs/editProfileSchema';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  values: EditProfileFormValues;
  errors?: Partial<Record<keyof EditProfileFormValues, string>>;
  canEditRole: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: keyof EditProfileFormValues, value: string) => void;
  serverError?: string;
}

export default function EditProfileForm({
  values,
  errors = {},
  canEditRole,
  onChange,
  onSelectChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>First name</FieldLabel>
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
          <FieldLabel>Last name</FieldLabel>
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
        <FieldLabel>Email</FieldLabel>
        <Input
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="user@example.com"
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

      {canEditRole && (
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select
            value={values.role}
            onValueChange={(v) => onSelectChange('role', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UserRole).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.role}</FieldError>
        </Field>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
