// Fetches sales documents from Supabase — paginated list and single document.
import type { SupabaseClient } from '@supabase/supabase-js';

const PAGE_SIZE = 20;

export interface SalesDocumentRow {
  id: string;
  order_number: string;
  document_date: string;
  customer_name: string;
  sales_type: 'direct' | 'delivery';
  total_amount: number;
  created_at: string;
}

export interface SalesDocumentDetail {
  id: string;
  order_number: string;
  document_date: string;
  customer_name: string;
  sales_type: 'direct' | 'delivery';
  total_amount: number;
  store_id: string;
  form_data: unknown;
  form_data_version: number;
  created_at: string;
  store_code: string;
}

interface ListOptions {
  page?: number;
  search?: string;
  salesType?: 'direct' | 'delivery';
}

export async function fetchSalesDocuments(
  supabase: SupabaseClient,
  orgId: string,
  options: ListOptions = {}
): Promise<{ data: SalesDocumentRow[]; count: number }> {
  const { page = 1, search, salesType } = options;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('sales_documents')
    .select(
      'id, order_number, document_date, customer_name, sales_type, total_amount, created_at',
      { count: 'exact' }
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('customer_name', `%${search}%`);
  }

  if (salesType) {
    query = query.eq('sales_type', salesType);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    data: (data as SalesDocumentRow[]) ?? [],
    count: count ?? 0,
  };
}

interface DetailRow {
  id: string;
  order_number: string;
  document_date: string;
  customer_name: string;
  sales_type: 'direct' | 'delivery';
  total_amount: number;
  store_id: string;
  form_data: unknown;
  form_data_version: number;
  created_at: string;
  stores: { code: string };
}

export async function fetchSalesDocument(
  supabase: SupabaseClient,
  documentId: string
): Promise<SalesDocumentDetail | null> {
  const { data, error } = await supabase
    .from('sales_documents')
    .select(
      'id, order_number, document_date, customer_name, sales_type, total_amount, store_id, form_data, form_data_version, created_at, stores(code)'
    )
    .eq('id', documentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Supabase join types may be inferred as arrays — cast through unknown
  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    order_number: row.order_number,
    document_date: row.document_date,
    customer_name: row.customer_name,
    sales_type: row.sales_type,
    total_amount: row.total_amount,
    store_id: row.store_id,
    form_data: row.form_data,
    form_data_version: row.form_data_version,
    created_at: row.created_at,
    store_code: row.stores.code,
  };
}
