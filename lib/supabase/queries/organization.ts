// Fetches organization details from Supabase.
import type { SupabaseClient } from '@supabase/supabase-js';

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  designacao_social: string;
  nif: string;
}

export async function fetchOrganization(
  supabase: SupabaseClient,
  slug: string
): Promise<OrgRow | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, designacao_social, nif')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as OrgRow;
}
