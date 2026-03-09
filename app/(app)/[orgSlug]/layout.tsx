// Authenticated org layout: verifies the user is a member of the org,
// provides navigation, and handles sign-out.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrgNav } from './nav';

interface MembershipRow {
  org_id: string;
  role: string;
  organizations: { id: string; name: string; slug: string };
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify the org exists and the user is a member
  const { data } = await supabase
    .from('organization_members')
    .select('org_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .limit(10);

  const membership = data as MembershipRow[] | null;

  const currentOrg = membership?.find(
    (m) => m.organizations?.slug === orgSlug
  );

  if (!currentOrg) {
    // User is not a member of this org — redirect to their default org
    const defaultOrg = membership?.[0];
    if (defaultOrg?.organizations) {
      redirect(`/${defaultOrg.organizations.slug}/sales/new`);
    }
    redirect('/login');
  }

  const org = currentOrg.organizations;

  return (
    <div className="min-h-screen">
      <OrgNav orgName={org.name} orgSlug={org.slug} />
      <main>{children}</main>
    </div>
  );
}
