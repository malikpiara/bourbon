// Segment-level error boundary. Catches unhandled client-side exceptions
// and shows a friendly recovery UI instead of a raw error screen.
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight">
          Algo correu mal
        </h2>
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <Button onClick={reset} size="lg">
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
