import type { ChangeEvent } from 'react';
import { UserRole } from '@/app/db/entities/UserRole';
import type { CreateUserFormValues } from '@/app/libs/createUserSchema';
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
  values: CreateUserFormValues;
  errors?: Partial<Record<keyof CreateUserFormValues, string>>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: keyof CreateUserFormValues, value: string) => void;
  serverError?: string;
}

export default function CreateUserForm({
  values,
  errors = {},
  onChange,
  onSelectChange,
  serverError,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Login *</FieldLabel>
          <Input
            name="login"
            value={values.login}
            onChange={onChange}
            placeholder="john_doe"
            autoComplete="off"
            aria-invalid={!!errors.login}
          />
          <FieldError>{errors.login}</FieldError>
        </Field>

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
      </div>

      <Field>
        <FieldLabel>Email *</FieldLabel>
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
        <FieldLabel>Password *</FieldLabel>
        <Input
          name="password"
          type="password"
          value={values.password}
          onChange={onChange}
          placeholder="Min 8 characters"
          aria-invalid={!!errors.password}
        />
        <FieldError>{errors.password}</FieldError>
      </Field>

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

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </div>
  );
}
