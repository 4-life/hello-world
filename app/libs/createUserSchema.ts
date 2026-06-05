import { UserRole } from '../db/entities/UserRole';

export interface CreateUserFormValues {
  login: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const INITIAL_VALUES: CreateUserFormValues = {
  login: '',
  email: '',
  password: '',
  role: 'USER' satisfies keyof typeof UserRole,
  firstName: '',
  lastName: '',
  phone: '',
};
