// New sale page: fetches stores and org from Supabase, passes to SalesForm.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchStores } from '@/lib/supabase/queries/stores';
import { fetchOrganization } from '@/lib/supabase/queries/organization';
import { NewSaleClient } from './client';

export default async function NewSalePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();

  const org = await fetchOrganization(supabase, orgSlug);
  if (!org) redirect('/login');

  const storeRows = await fetchStores(supabase, org.id);

  // Map DB rows → props for the SalesForm
  const stores = storeRows.map((s) => ({
    id: s.id,
    name: s.name,
    salesTypes: s.allowed_sales_types as ('delivery' | 'direct')[],
  }));

  const storeCodeMap: Record<string, string> = {};
  for (const s of storeRows) {
    storeCodeMap[s.id] = s.code;
  }

  const company = {
    designacaoSocial: org.designacao_social,
    NIF: org.nif,
  };

  return (
    <NewSaleClient
      stores={stores}
      company={company}
      orgId={org.id}
      storeCodeMap={storeCodeMap}
    />
  );
}
