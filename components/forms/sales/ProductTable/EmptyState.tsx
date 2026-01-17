import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageOpen, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onAddProduct: () => void;
}

export function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <PackageOpen
          strokeWidth={1.2}
          color="#4B0021"
          className="h-12 w-12 text-muted-foreground mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">
          Ainda não foram adicionados produtos
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece por adicionar o seu primeiro produto.
        </p>
        <Button
          size="lg"
          onClick={onAddProduct}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-6 w-6" />
          Adicionar Produto
        </Button>
      </CardContent>
    </Card>
  );
}
