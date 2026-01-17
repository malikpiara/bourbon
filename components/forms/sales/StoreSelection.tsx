'use client';

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

interface StoreSelectionProps {
  form: UseFormReturn<FormValues>;
  onStoreSelect: (value: string) => void;
}

type Store = {
  id: string;
  name: string;
  description: string;
  salesTypes: ('delivery' | 'direct')[];
};

export const stores: Store[] = [
  {
    id: '1',
    name: 'Clássica',
    description: 'A loja original com produtos tradicionais.',
    salesTypes: ['delivery'],
  },
  {
    id: '3',
    name: 'Moderna',
    description: 'Uma loja com designs contemporâneos.',
    salesTypes: ['delivery'],
  },
  {
    id: '6',
    name: 'Iluminação',
    description: 'Especializada em iluminação de qualidade.',
    salesTypes: ['delivery', 'direct'],
  },
];

export const StoreSelection = ({
  form,
  onStoreSelect,
}: StoreSelectionProps) => (
  <div className="space-y-8">
    <h2 className="scroll-m-20 text-4xl font-semibold tracking-tight">
      Selecione a Loja
    </h2>
    <FormField
      control={form.control}
      name="storeId"
      render={({ field }) => (
        <FormItem className="space-y-3 animate-slide-fade">
          {/* <FormLabel>Loja</FormLabel> */}
          <FormControl>
            <RadioGroup
              onValueChange={(value: string) => {
                field.onChange(value);
                onStoreSelect(value);
              }}
              defaultValue={field.value}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {stores.map((store) => (
                <label
                  key={store.id}
                  htmlFor={`store-${store.id}`}
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem
                    value={store.id}
                    className="peer sr-only"
                    id={`store-${store.id}`}
                  />
                  <Store className="mb-3 h-6 w-6" />
                  <h3 className="text-lg font-medium">{store.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {store.description}
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
