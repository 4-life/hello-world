export interface CreateOrderFormValues {
  type: string;
  status: string;
  scheduledDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  engineerId: string;
  notes: string;
}

export const INITIAL_VALUES: CreateOrderFormValues = {
  type: 'INSTALLATION',
  status: 'NEW',
  scheduledDate: '',
  timeWindowStart: '',
  timeWindowEnd: '',
  engineerId: '',
  notes: '',
};
