import { UseFormReturn } from 'react-hook-form';
import { ProductTable } from '@/components/forms/sales/ProductTable/ProductTable';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FormValues } from '@/lib/schema';

interface ProductSectionProps {
  form: UseFormReturn<FormValues>;
  className?: string; // Adding className for flexibility in styling
}

const ERROR_MESSAGES = {
  TOO_SMALL: 'Por favor, adicione pelo menos um produto à encomenda.',
  INVALID_FIELDS:
    'Verifique se todos os campos dos produtos estão preenchidos corretamente.',
} as const;

function ProductSection({ form, className }: ProductSectionProps) {
  return (
    <div className={`space-y-8 ${className || ''}`}>
      <h2 className='scroll-m-20 mb-4 text-2xl font-semibold tracking-tight first:mt-0"'>
        Lista de Produtos
      </h2>

      {/* Section for the table with the list of products */}
      <FormField
        control={form.control}
        name="tableEntries"
        render={({ fieldState: { error } }) => (
          <FormItem>
            <FormControl>
              <ProductTable form={form} />
            </FormControl>

            {/* Error handling section */}
            {error && (
              <div className="space-y-2" role="alert" aria-live="polite">
                {error.type === 'too_small' ? (
                  <p className="text-sm font-medium text-destructive">
                    {ERROR_MESSAGES.TOO_SMALL}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-destructive">
                    {ERROR_MESSAGES.INVALID_FIELDS}
                  </p>
                )}
              </div>
            )}
          </FormItem>
        )}
      />

      {/* Notes or Observations Section */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none"
                placeholder="Adicione aqui notas importantes sobre a encomenda..."
                {...field}
              />
            </FormControl>
            <FormDescription>
              Notas importantes que vão ser lidas pela equipa mas que não vão
              para o cliente.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default ProductSection;
