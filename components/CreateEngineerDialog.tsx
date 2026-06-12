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
import CreateEngineerForm from '@/components/CreateEngineerForm';
import useCreateEngineer from '@/app/libs/createEngineer';
import {
  INITIAL_VALUES,
  type CreateEngineerFormValues,
} from '@/app/libs/createEngineerSchema';

type FieldErrors = Partial<Record<keyof CreateEngineerFormValues, string>>;

function parseFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof CombinedGraphQLErrors)) return null;
  const ext = err.errors[0]?.extensions;
  if (ext?.code !== 'VALIDATION_ERROR') return null;
  return (ext.fields as FieldErrors) ?? null;
}

export default function CreateEngineerDialog(): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] =
    useState<CreateEngineerFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [createEngineer, { loading: isLoading }] = useCreateEngineer();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateEngineerFormValues]) {
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
      await createEngineer({
        variables: {
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || undefined,
            email: values.email || undefined,
            specialization: values.specialization || undefined,
          },
        },
      });
      handleOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      const fieldErrors = parseFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setServerError(
          err instanceof Error ? err.message : 'Failed to create engineer',
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
          Add engineer
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add engineer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <CreateEngineerForm
            values={values}
            errors={errors}
            onChange={handleChange}
            serverError={serverError}
          />

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Add engineer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
