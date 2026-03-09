// Password reset page: sends a recovery email via Supabase Auth.
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/login` }
    );

    if (resetError) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold">Email enviado</h1>
        <p className="text-gray-500">
          Se o email estiver associado a uma conta, receberá instruções para
          redefinir a palavra-passe.
        </p>
        <a
          href="/login"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Voltar ao início de sessão
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Recuperar palavra-passe</h1>
        <p className="text-gray-500">
          Introduza o seu email para receber um link de recuperação.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
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
          {isLoading ? 'A enviar...' : 'Enviar link de recuperação'}
        </Button>
      </form>

      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Voltar ao início de sessão
        </a>
      </div>
    </div>
  );
}
