export interface CreateEngineerFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialization: string;
}

export const INITIAL_VALUES: CreateEngineerFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  specialization: '',
};
