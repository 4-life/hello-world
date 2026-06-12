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
import CreateInvoiceForm from '@/components/CreateInvoiceForm';
import useCreateInvoice from '@/app/libs/createInvoice';
import {
  INITIAL_VALUES,
  type CreateInvoiceFormValues,
} from '@/app/libs/createInvoiceSchema';

type FieldErrors = Partial<Record<keyof CreateInvoiceFormValues, string>>;

interface ClientOption {
  id: string;
  name: string;
}

interface OrderOption {
  id: string;
  orderNumber: number;
}

interface Props {
  clients: ClientOption[];
  orders: OrderOption[];
}

function parseFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof CombinedGraphQLErrors)) return null;
  const ext = err.errors[0]?.extensions;
  if (ext?.code !== 'VALIDATION_ERROR') return null;
  return (ext.fields as FieldErrors) ?? null;
}

export default function CreateInvoiceDialog({
  clients,
  orders,
}: Props): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<CreateInvoiceFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [createInvoice, { loading: isLoading }] = useCreateInvoice();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateInvoiceFormValues]) {
      setErrors((prev: FieldErrors) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectChange(
    name: keyof CreateInvoiceFormValues,
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
      await createInvoice({
        variables: {
          data: {
            clientId: values.clientId,
            orderId: values.orderId || undefined,
            amount: Number(values.amount),
            paymentStatus: values.paymentStatus,
            issuedDate: values.issuedDate,
            dueDate: values.dueDate || undefined,
            notes: values.notes || undefined,
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
          err instanceof Error ? err.message : 'Failed to create invoice',
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
          Create invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <CreateInvoiceForm
            values={values}
            errors={errors}
            clients={clients}
            orders={orders}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            serverError={serverError}
          />

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
