// PDF view page: fetches a saved sales document and renders its PDF.
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchOrganization } from '@/lib/supabase/queries/organization';
import { fetchSalesDocument } from '@/lib/supabase/queries/sales-documents';
import { PDFViewClient } from './client';

export default async function PDFViewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  const supabase = await createClient();

  const org = await fetchOrganization(supabase, orgSlug);
  if (!org) redirect('/login');

  const document = await fetchSalesDocument(supabase, id);
  if (!document) notFound();

  const company = {
    designacaoSocial: org.designacao_social,
    NIF: org.nif,
  };

  return (
    <PDFViewClient
      formData={document.form_data}
      formDataVersion={document.form_data_version}
      company={company}
      storeCode={document.store_code}
      orderNumber={document.order_number}
      documentId={document.id}
      orgSlug={orgSlug}
    />
  );
}
