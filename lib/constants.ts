// Centralised business configuration for Hermes.
// All business rules, company info, and store/payment definitions live here.

export const COMPANY_INFO = {
  designacaoSocial: 'Octosólido2, LDA',
  NIF: '513 579 559',
} as const;

export const VAT_RATE = '23%';

export const DATE_FORMAT = "d 'de' MMMM 'de' yyyy";

export const DEFAULT_ORDER_NUMBER = 6111;

export const PAYMENT_TYPES = [
  { value: 'mbway', label: 'MBWay' },
  { value: 'cash', label: 'Numerário' },
  { value: 'card', label: 'Multibanco' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
] as const;

export type PaymentTypeValue = (typeof PAYMENT_TYPES)[number]['value'];

export const MAX_PRODUCT_QUANTITY = 10;

export type StoreConfig = {
  id: string;
  name: string;
  description: string;
  salesTypes: ('delivery' | 'direct')[];
};

export const STORES: StoreConfig[] = [
  {
    id: '1',
    name: 'Clássica',
    description: 'A loja original com produtos tradicionais.',
    salesTypes: ['delivery'],
  },
  {
    id: '3',
    name: 'Moderna',
    description: 'Uma loja com designs contemporâneos.',
    salesTypes: ['delivery'],
  },
  {
    id: '6',
    name: 'Iluminação',
    description: 'Especializada em iluminação de qualidade.',
    salesTypes: ['delivery', 'direct'],
  },
];
