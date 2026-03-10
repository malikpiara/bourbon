// Fetches stores for an organization from Supabase.
import type { SupabaseClient } from '@supabase/supabase-js';

export interface StoreRow {
  id: string;
  name: string;
  code: string;
  allowed_sales_types: string[];
  sort_order: number;
}

export async function fetchStores(
  supabase: SupabaseClient,
  orgId: string
): Promise<StoreRow[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, code, allowed_sales_types, sort_order')
    .eq('org_id', orgId)
    .order('sort_order');

  if (error) throw error;
  return (data as StoreRow[]) ?? [];
}
