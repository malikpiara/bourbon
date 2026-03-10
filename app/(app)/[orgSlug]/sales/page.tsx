// Sales history page: fetches paginated sales list from Supabase.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchOrganization } from '@/lib/supabase/queries/organization';
import { fetchSalesDocuments } from '@/lib/supabase/queries/sales-documents';
import { SalesHistoryClient } from './client';

export default async function SalesHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { orgSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const supabase = await createClient();
  const org = await fetchOrganization(supabase, orgSlug);
  if (!org) redirect('/login');

  const { data: documents, count } = await fetchSalesDocuments(
    supabase,
    org.id,
    { page }
  );

  return (
    <SalesHistoryClient
      documents={documents}
      totalCount={count}
      currentPage={page}
      orgSlug={orgSlug}
      orgId={org.id}
    />
  );
}
