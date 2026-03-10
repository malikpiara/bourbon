import { FormValues } from '../schema';
import { mockData } from './mockData';
import { UseFormReturn } from 'react-hook-form';

// Create test form values that match the form schema.
// storeId is set dynamically based on available stores.
export const createTestFormValues = (storeId: string): FormValues => ({
  name: mockData.customer.name,
  storeId,
  salesType: 'delivery',
  notes: '',
  orderNumber: mockData.order.id,
  date: new Date(),
  email: mockData.customer.email || '',
  phoneNumber: mockData.customer.phone?.startsWith('+')
    ? mockData.customer.phone
    : `+${mockData.customer.phone}`,
  nif: (mockData.customer.nif || '000000000')
    .replace(/\D/g, '')
    .slice(0, 9)
    .padStart(9, '0'),
  address1: mockData.customer.address.address1,
  address2: mockData.customer.address.address2 || '',
  postalCode: mockData.customer.address.postalCode
    .replace(/\D/g, '')
    .slice(0, 7)
    .padStart(7, '0'),
  city: mockData.customer.address.city,
  elevator: mockData.customer.address.hasElevator,
  sameAddress: true,
  billingAddress1: '',
  billingAddress2: '',
  billingPostalCode: '',
  billingCity: '',
  tableEntries: mockData.order.items.map((item, index) => ({
    id: index + 1,
    ref: item.ref,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
});

// Helper function to fill form with test data
export const fillFormWithTestData = (
  form: UseFormReturn<FormValues>,
  storeId?: string
) => {
  form.reset(createTestFormValues(storeId || ''), {
    keepDirty: false,
    keepValues: false,
  });
};
