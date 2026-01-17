import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/lib/schema';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Store } from 'lucide-react';

interface SalesTypeSelectionProps {
  form: UseFormReturn<FormValues>;
  onSalesTypeSelect: (type: 'direct' | 'delivery') => void;
  salesTypes: ('direct' | 'delivery')[];
}

export const SalesTypeSelection = ({
  form,
  onSalesTypeSelect,
  salesTypes,
}: SalesTypeSelectionProps) => (
  <div className="space-y-8">
    <h2 className="scroll-m-20 text-4xl font-semibold tracking-tight">
      Escolha o Tipo de Venda
    </h2>
    <FormField
      control={form.control}
      name="salesType"
      render={({ field }) => (
        <FormItem className="space-y-3 animate-slide-fade">
          <FormControl>
            <RadioGroup
              onValueChange={(value: string) => {
                field.onChange(value);
                onSalesTypeSelect(value as 'direct' | 'delivery');
              }}
              defaultValue={field.value || undefined} // Ensure compatibility with RadioGroup
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {salesTypes.map((type) => (
                <label
                  key={type}
                  htmlFor={`sales-type-${type}`}
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem
                    value={type}
                    className="peer sr-only"
                    id={`sales-type-${type}`}
                  />
                  <Store className="mb-3 h-6 w-6" />
                  <h3 className="text-lg font-medium">
                    {type === 'direct' ? 'Venda Direta' : 'Entrega'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type === 'direct'
                      ? 'Venda feita diretamente na loja.'
                      : 'Produtos com entrega incluída.'}
                  </p>
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
