// Root page: resolves the user's org and redirects to their sales page.
// Unauthenticated users are caught by the proxy and redirected to /login.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface MembershipRow {
  org_id: string;
  is_default: boolean;
  organizations: { slug: string };
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Find the user's default org
  const { data } = await supabase
    .from('organization_members')
    .select('org_id, is_default, organizations(slug)')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .limit(1)
    .single();

  const membership = data as MembershipRow | null;

  if (membership?.organizations?.slug) {
    redirect(`/${membership.organizations.slug}/sales/new`);
  }

  // No org found — this shouldn't happen for properly provisioned users
  redirect('/login');
}
