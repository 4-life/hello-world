export interface CreateClientFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const INITIAL_VALUES: CreateClientFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
};
