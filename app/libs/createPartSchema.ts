export interface CreatePartFormValues {
  name: string;
  sku: string;
  unit: string;
  description: string;
}

export const INITIAL_VALUES: CreatePartFormValues = {
  name: '',
  sku: '',
  unit: 'pcs',
  description: '',
};
