import { UserRole } from '../db/entities/UserRole';

export interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export function valuesFromUser(user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
}): EditProfileFormValues {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: user.role as keyof typeof UserRole,
  };
}
