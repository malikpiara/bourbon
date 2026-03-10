// Login page: email + password authentication.
// Portuguese copy for the target user demographic (non-tech-savvy staff).
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MembershipRow {
  org_id: string;
  organizations: { slug: string };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email ou palavra-passe incorretos.');
      setIsLoading(false);
      return;
    }

    // After login, resolve the user's org and redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Erro ao obter dados do utilizador.');
      setIsLoading(false);
      return;
    }

    // Try default org first, fallback to any org
    const { data } = await supabase
      .from('organization_members')
      .select('org_id, organizations(slug)')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    const membership = data as MembershipRow | null;

    if (membership?.organizations?.slug) {
      router.push(`/${membership.organizations.slug}/sales/new`);
    } else {
      setError('Nenhuma organização associada a esta conta.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Bourbn</h1>
        <p className="text-gray-500">Inicie sessão para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-base">
            Palavra-passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-12 text-base"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isLoading}
        >
          {isLoading ? 'A entrar...' : 'Entrar'}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/reset-password"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Esqueceu a palavra-passe?
        </Link>
      </div>
    </div>
  );
}
