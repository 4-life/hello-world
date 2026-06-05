'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateUserForm from '@/components/CreateUserForm';
import useCreateUser from '@/app/libs/createUser';
import {
  INITIAL_VALUES,
  type CreateUserFormValues,
} from '@/app/libs/createUserSchema';

type FieldErrors = Partial<Record<keyof CreateUserFormValues, string>>;

function parseFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof CombinedGraphQLErrors)) return null;
  const ext = err.errors[0]?.extensions;
  if (ext?.code !== 'VALIDATION_ERROR') return null;
  return (ext.fields as FieldErrors) ?? null;
}

export default function CreateUserDialog(): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<CreateUserFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [createUser, { loading: isLoading }] = useCreateUser();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateUserFormValues]) {
      setErrors((prev: FieldErrors) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectChange(
    name: keyof CreateUserFormValues,
    value: string,
  ): void {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: FieldErrors) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(
    e: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setServerError('');
    setErrors({});

    try {
      await createUser({ variables: { data: values } });
      handleOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      const fieldErrors = parseFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setServerError(
          err instanceof Error ? err.message : 'Failed to create user',
        );
      }
    }
  }

  function handleOpenChange(next: boolean): void {
    setIsOpen(next);
    if (!next) {
      setValues(INITIAL_VALUES);
      setErrors({});
      setServerError('');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Create user
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <CreateUserForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            serverError={serverError}
          />

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
