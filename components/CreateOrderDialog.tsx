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
import CreateOrderForm from '@/components/CreateOrderForm';
import useCreateOrder from '@/app/libs/createOrder';
import { formatTime } from '@/app/orders/format';
import {
  INITIAL_VALUES,
  type CreateOrderFormValues,
} from '@/app/libs/createOrderSchema';

type FieldErrors = Partial<Record<keyof CreateOrderFormValues, string>>;

interface EngineerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  engineers: EngineerOption[];
}

function parseFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof CombinedGraphQLErrors)) return null;
  const ext = err.errors[0]?.extensions;
  if (ext?.code !== 'VALIDATION_ERROR') return null;
  return (ext.fields as FieldErrors) ?? null;
}

export default function CreateOrderDialog({
  engineers,
}: Props): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<CreateOrderFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [createOrder, { loading: isLoading }] = useCreateOrder();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateOrderFormValues]) {
      setErrors((prev: FieldErrors) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectChange(
    name: keyof CreateOrderFormValues,
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
      await createOrder({
        variables: {
          data: {
            type: values.type,
            status: values.status,
            scheduledDate: values.scheduledDate || undefined,
            timeWindowStart: values.timeWindowStart
              ? formatTime(values.timeWindowStart)
              : undefined,
            timeWindowEnd: values.timeWindowEnd
              ? formatTime(values.timeWindowEnd)
              : undefined,
            notes: values.notes || undefined,
            engineerId: values.engineerId || undefined,
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
          err instanceof Error ? err.message : 'Failed to create order',
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
          Create order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <CreateOrderForm
            values={values}
            errors={errors}
            engineers={engineers}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            serverError={serverError}
          />

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
