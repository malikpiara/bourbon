// Edit sale page: fetches an existing sales document and pre-fills the form.
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchOrganization } from '@/lib/supabase/queries/organization';
import { fetchStores } from '@/lib/supabase/queries/stores';
import { fetchSalesDocument } from '@/lib/supabase/queries/sales-documents';
import { migrateFormData } from '@/utils/format/migrateFormData';
import { EditSaleClient } from './client';

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  const supabase = await createClient();

  const org = await fetchOrganization(supabase, orgSlug);
  if (!org) redirect('/login');

  const [document, storeRows] = await Promise.all([
    fetchSalesDocument(supabase, id),
    fetchStores(supabase, org.id),
  ]);

  if (!document) notFound();

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

  const initialData = migrateFormData(
    document.form_data,
    document.form_data_version
  );

  return (
    <EditSaleClient
      stores={stores}
      company={company}
      orgId={org.id}
      storeCodeMap={storeCodeMap}
      initialData={initialData}
      documentId={document.id}
    />
  );
}
