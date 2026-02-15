import { isPossiblePhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

// Payment type schema. If you change this, you need to change the value in document.ts
const paymentTypeSchema = z.enum([
  'mbway',
  'cash',
  'card',
  'transfer',
  'cheque',
]);

// Table Entries Schema
export const tableEntrySchema = z.object({
  id: z.number(),
  ref: z.string().min(3, 'A referência deve ter pelo menos 3 caracteres.'),
  description: z
    .string()
    .min(4, 'O nome do produto deve ter pelo menos 4 caracteres.'),
  quantity: z.number().min(1, 'A quantidade deve ser pelo menos 1.'),
  unitPrice: z
    .union([
      z.string().transform((str) => parseFloat(str.replace(',', '.')) || 0),
      z.number(),
    ])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((value) => value >= 0, {
      message: 'O preço não pode ser negativo.',
    }),
});

// Shared Fields Schema
const sharedFields = {
  tableEntries: z.array(tableEntrySchema).min(1, {
    message: 'A encomenda deve ter pelo menos um produto.',
  }),
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  storeId: z.string().nonempty('Por favor selecione uma loja.'),
  orderNumber: z.coerce
    .number()
    .min(4, 'O número da encomenda deve ter pelo menos 4 caracteres.'),
  date: z.date().refine((d) => !isNaN(d.getTime()), {
    message: 'Data inválida.',
  }),
  nif: z
    .union([
      // Doing an union so we don't throw an error message if users click accidently there.
      z
        .string()
        .length(9, { message: 'O número de contribuinte tem 9 caracteres.' })
        .regex(/^\d+$/, { message: 'Apenas números são permitidos.' }),
      z.string().length(0), // If length is 0, don't throw a message.
    ])
    .optional(),
  notes: z.string().optional(), // Notes are shared across both sales types
};

// Billing Address Fields Schema
const billingAddressFields = {
  billingAddress1: z.string().optional(),
  billingAddress2: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
};

// Direct Sales Schema
const directSalesSchema = z.object({
  ...sharedFields,
  salesType: z.literal('direct'),
  email: z
    .union([
      z.string().email('Email inválido'),
      z.literal(''), // Allow empty strings explicitly
      z.null(), // Allow null values
    ])
    .optional(), // Allow undefined values
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || isPossiblePhoneNumber(val), {
      message: 'Número de telefone inválido',
    }),
  ...billingAddressFields,
});

// Delivery Sales Schema
const deliverySchema = z.object({
  ...sharedFields,
  salesType: z.literal('delivery'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'), // Required for delivery
  phoneNumber: z
    .string()
    .min(1, 'O número de telefone é obrigatório')
    .refine((val) => isPossiblePhoneNumber(val), {
      message: 'Número de telefone inválido',
    }),
  address1: z.string().min(5, 'A morada deve ter pelo menos 5 caracteres.'),
  address2: z.string().optional(),
  postalCode: z
    .string()
    .length(7, 'O código postal deve ter 7 caracteres.')
    .regex(/^\d+$/, 'Apenas números são permitidos.'),
  city: z.string().min(5, 'A cidade deve ter pelo menos 5 caracteres.'),
  elevator: z.boolean().default(false),
  sameAddress: z.boolean().default(true),
  firstPayment: z
    .union([
      z.string().transform((val) => parseFloat(val.replace(',', '.')) || 0),
      z.number(),
    ])
    .refine((value) => value >= 0, {
      message: 'O pagamento não pode ser negativo.',
    })
    .optional(),
  secondPayment: z
    .union([
      z.string().transform((val) => parseFloat(val.replace(',', '.')) || 0),
      z.number(),
    ])
    .refine((value) => value >= 0, {
      message: 'O pagamento não pode ser negativo.',
    })
    .optional(),
  paymentType: paymentTypeSchema.optional(),
  ...billingAddressFields,
});

// Combined Schema Using Discriminated Union
export const formSchema = z.discriminatedUnion('salesType', [
  directSalesSchema,
  deliverySchema,
]);

export type TableEntry = z.infer<typeof tableEntrySchema>;
export type FormValues = z.infer<typeof formSchema>;
