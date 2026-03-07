// Transforms validated form values (FormValues) into the DocumentData shape
// consumed by the PDF document components.
import { FormValues } from '@/lib/schema';
import { Customer, DocumentData, PaymentInfo } from '@/types/document';
import { PaymentTypeValue } from '@/lib/constants';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  COMPANY_INFO,
  VAT_RATE,
  DATE_FORMAT,
  PAYMENT_TYPES,
} from '@/lib/constants';
import { formatNIF, formatPostalCode } from './form';
import { formatPhoneNumber } from 'react-phone-number-input';

export const formatOrderData = (values: FormValues): DocumentData => {
  try {
    // Validate that we have at least one table entry
    if (!values.tableEntries.length) {
      throw new Error('A encomenda deve ter pelo menos um produto.');
    }

    const orderItems = values.tableEntries.map((entry) => {
      const unitPrice = entry.unitPrice; // Always a number now
      const total = entry.quantity * unitPrice;

      if (isNaN(total)) {
        throw new Error('Erro ao calcular o total do produto.');
      }

      return {
        ref: entry.ref,
        description: entry.description,
        quantity: entry.quantity,
        unitPrice,
        total,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
    if (isNaN(totalAmount)) {
      throw new Error('Erro ao calcular o total da encomenda.');
    }

    const customerData: Customer = {
      name: values.name,
      email: values.email || undefined,
      // Convert empty string or undefined to null for phone
      phone: values.phoneNumber
        ? formatPhoneNumber(values.phoneNumber) || null
        : null,
      nif: values.nif ? formatNIF(values.nif) : undefined,
      address: {
        address1: '',
        address2: '',
        postalCode: '',
        city: '',
        hasElevator: false,
      },
    };

    const payments: PaymentInfo[] = [];

    if (values.salesType === 'delivery') {
      customerData.address = {
        address1: values.address1,
        address2: values.address2 || '',
        postalCode: formatPostalCode(values.postalCode),
        city: values.city,
        hasElevator: values.elevator || false,
      };

      if (
        !values.sameAddress &&
        values.billingAddress1 &&
        values.billingPostalCode &&
        values.billingCity
      ) {
        customerData.billingAddress = {
          address1: values.billingAddress1,
          address2: values.billingAddress2 || '',
          postalCode: formatPostalCode(values.billingPostalCode),
          city: values.billingCity,
          hasElevator: false,
        };
      }

      // Only add payments if we have valid values
      if (
        typeof values.firstPayment === 'number' &&
        values.paymentType &&
        values.date
      ) {
        payments.push({
          amount: values.firstPayment,
          type: values.paymentType,
          date: format(values.date, DATE_FORMAT, { locale: pt }),
          label:
            PAYMENT_TYPES.find((type) => type.value === values.paymentType)
              ?.label || values.paymentType,
        });
      }

      if (typeof values.secondPayment === 'number') {
        payments.push({
          amount: values.secondPayment,
          type: 'delivery',
          date: 'No acto de entrega',
          label: '',
        });
      }
    }

    return {
      company: COMPANY_INFO,
      customer: customerData,
      order: {
        id: values.orderNumber.toString(),
        storeId: `OCT ${values.storeId}`,
        salesType: values.salesType, // Include salesType
        date: format(values.date, DATE_FORMAT, { locale: pt }),
        items: orderItems,
        vat: VAT_RATE,
        totalAmount,
        notes: values.notes || undefined,
        ...(values.salesType === 'delivery' && {
          firstPayment: values.firstPayment,
          secondPayment: values.secondPayment,
          paymentType: values.paymentType as PaymentTypeValue,
          payments, // Add the formatted payments array
        }),
      },
    };
  } catch (error) {
    console.error('Error formatting order data:', error);
    throw error;
  }
};
