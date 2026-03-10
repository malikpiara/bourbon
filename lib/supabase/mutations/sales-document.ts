// Inserts a new sales document with its line items and payments into Supabase.
// Uses individual inserts wrapped in application logic (document first, then children).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FormValues } from '@/lib/schema';
import { generateOrderNumber } from '@/utils/generateOrderNumber';
import { computeTotal, parseUnitPrice } from '@/utils/format/total';

interface InsertParams {
  supabase: SupabaseClient;
  orgId: string;
  storeId: string; // UUID from stores table
  userId: string;
  values: FormValues;
}

export async function insertSalesDocument({
  supabase,
  orgId,
  storeId,
  userId,
  values,
}: InsertParams) {
  const orderNumber = generateOrderNumber();
  const totalAmount = computeTotal(
    values.tableEntries.map((e) => ({
      quantity: e.quantity,
      unitPrice: parseUnitPrice(e.unitPrice),
    }))
  );

  // 1. Insert the document
  const { data: doc, error: docError } = await supabase
    .from('sales_documents')
    .insert({
      org_id: orgId,
      store_id: storeId,
      created_by: userId,
      sales_type: values.salesType,
      order_number: orderNumber,
      document_date: values.date.toISOString().split('T')[0],
      customer_name: values.name,
      customer_nif: values.nif || null,
      customer_phone: values.phoneNumber || null,
      total_amount: totalAmount,
      form_data: values,
      form_data_version: 1,
    })
    .select('id')
    .single();

  if (docError) throw docError;

  // 2. Insert line items
  const items = values.tableEntries.map((entry, i) => ({
    document_id: doc.id,
    sort_order: i,
    ref: entry.ref || '',
    description: entry.description,
    quantity: entry.quantity,
    unit_price: parseUnitPrice(entry.unitPrice),
    total: entry.quantity * parseUnitPrice(entry.unitPrice),
  }));

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('sales_document_items')
      .insert(items);

    if (itemsError) throw itemsError;
  }

  // 3. Insert payments (delivery only)
  if (values.salesType === 'delivery') {
    const payments: Record<string, unknown>[] = [];

    if (typeof values.firstPayment === 'number' && values.paymentType) {
      payments.push({
        document_id: doc.id,
        sort_order: 0,
        amount: values.firstPayment,
        payment_type: values.paymentType,
        payment_date: values.date.toISOString().split('T')[0],
        label: null,
      });
    }

    if (typeof values.secondPayment === 'number') {
      payments.push({
        document_id: doc.id,
        sort_order: 1,
        amount: values.secondPayment,
        payment_type: 'delivery',
        payment_date: 'No acto de entrega',
        label: null,
      });
    }

    if (payments.length > 0) {
      const { error: paymentsError } = await supabase
        .from('sales_document_payments')
        .insert(payments);

      if (paymentsError) throw paymentsError;
    }
  }

  return { id: doc.id, orderNumber };
}
