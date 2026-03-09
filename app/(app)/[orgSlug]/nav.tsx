// Organization navigation bar with sign-out functionality.
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function OrgNav({
  orgName,
  orgSlug,
}: {
  orgName: string;
  orgSlug: string;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">Bourbn</span>
        <span className="text-sm text-gray-500">{orgName}</span>
        <a
          href={`/${orgSlug}/sales/new`}
          className="text-sm text-gray-700 hover:text-black"
        >
          Nova Venda
        </a>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sair
      </Button>
    </nav>
  );
}
