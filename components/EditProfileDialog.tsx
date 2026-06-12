'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PencilIcon } from 'lucide-react';
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
import EditProfileForm from '@/components/EditProfileForm';
import useUpdateProfile from '@/app/libs/updateProfile';
import {
  valuesFromUser,
  type EditProfileFormValues,
} from '@/app/libs/editProfileSchema';

type FieldErrors = Partial<Record<keyof EditProfileFormValues, string>>;

interface Props {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
}

function parseFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof CombinedGraphQLErrors)) return null;
  const ext = err.errors[0]?.extensions;
  if (ext?.code !== 'VALIDATION_ERROR') return null;
  return (ext.fields as FieldErrors) ?? null;
}

export default function EditProfileDialog({
  userId,
  firstName,
  lastName,
  email,
  phone,
  role,
}: Props): React.JSX.Element | null {
  const router = useRouter();
  const { data: session } = useSession();

  const sessionUser = session?.user as
    | { userId?: string; role?: string }
    | undefined;
  const isOwner = sessionUser?.userId === userId;
  const isAdmin = sessionUser?.role === 'admin';
  const isManager = sessionUser?.role === 'manager';
  const canEdit = isOwner || isAdmin || isManager;
  const canEditRole = !isOwner && (isAdmin || isManager);

  const initialValues = valuesFromUser({
    firstName,
    lastName,
    email,
    phone,
    role,
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<EditProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [updateProfile, { loading: isLoading }] = useUpdateProfile();

  if (!canEdit) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EditProfileFormValues]) {
      setErrors((prev: FieldErrors) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectChange(
    name: keyof EditProfileFormValues,
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
      await updateProfile({
        variables: {
          data: {
            id: userId,
            firstName: values.firstName || undefined,
            lastName: values.lastName || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            ...(canEditRole ? { role: values.role } : {}),
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
          err instanceof Error ? err.message : 'Failed to update profile',
        );
      }
    }
  }

  function handleOpenChange(next: boolean): void {
    setIsOpen(next);
    if (!next) {
      setValues(initialValues);
      setErrors({});
      setServerError('');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PencilIcon />
          Edit profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <EditProfileForm
            values={values}
            errors={errors}
            canEditRole={canEditRole}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            serverError={serverError}
          />

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
