// Centralised business configuration for Hermes.
// All business rules, company info, and store/payment definitions live here.

// COMPANY_INFO and STORES have been moved to Supabase (organizations + stores tables).
// DEFAULT_ORDER_NUMBER replaced by generateOrderNumber() in utils/generateOrderNumber.ts.

export const VAT_RATE = '23%';

export const DATE_FORMAT = "d 'de' MMMM 'de' yyyy";

export const PAYMENT_TYPES = [
  { value: 'mbway', label: 'MBWay' },
  { value: 'cash', label: 'Numerário' },
  { value: 'card', label: 'Multibanco' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
] as const;

export type PaymentTypeValue = (typeof PAYMENT_TYPES)[number]['value'];

export const MAX_PRODUCT_QUANTITY = 10;
