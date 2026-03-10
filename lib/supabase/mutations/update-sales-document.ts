// Updates an existing sales document: replaces normalized columns, form_data,
// line items, and payments.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FormValues } from '@/lib/schema';
import { computeTotal, parseUnitPrice } from '@/utils/format/total';

interface UpdateParams {
  supabase: SupabaseClient;
  documentId: string;
  storeId: string;
  userId: string;
  values: FormValues;
}

export async function updateSalesDocument({
  supabase,
  documentId,
  storeId,
  userId,
  values,
}: UpdateParams) {
  const totalAmount = computeTotal(
    values.tableEntries.map((e) => ({
      quantity: e.quantity,
      unitPrice: parseUnitPrice(e.unitPrice),
    }))
  );

  // 1. Update the document row
  const { error: docError } = await supabase
    .from('sales_documents')
    .update({
      store_id: storeId,
      modified_by: userId,
      sales_type: values.salesType,
      document_date: values.date.toISOString().split('T')[0],
      customer_name: values.name,
      customer_nif: values.nif || null,
      customer_phone: values.phoneNumber || null,
      total_amount: totalAmount,
      form_data: values,
      form_data_version: 1,
    })
    .eq('id', documentId);

  if (docError) throw docError;

  // 2. Delete old items, insert new ones
  const { error: delItemsError } = await supabase
    .from('sales_document_items')
    .delete()
    .eq('document_id', documentId);

  if (delItemsError) throw delItemsError;

  const items = values.tableEntries.map((entry, i) => ({
    document_id: documentId,
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

  // 3. Delete old payments, insert new ones (delivery only)
  const { error: delPaymentsError } = await supabase
    .from('sales_document_payments')
    .delete()
    .eq('document_id', documentId);

  if (delPaymentsError) throw delPaymentsError;

  if (values.salesType === 'delivery') {
    const payments: Record<string, unknown>[] = [];

    if (typeof values.firstPayment === 'number' && values.paymentType) {
      payments.push({
        document_id: documentId,
        sort_order: 0,
        amount: values.firstPayment,
        payment_type: values.paymentType,
        payment_date: values.date.toISOString().split('T')[0],
        label: null,
      });
    }

    if (typeof values.secondPayment === 'number') {
      payments.push({
        document_id: documentId,
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

  return { id: documentId };
}
