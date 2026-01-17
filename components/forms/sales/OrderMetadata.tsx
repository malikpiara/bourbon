import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { FormValues } from '@/lib/schema';
import { cn } from '@/utils/tailwind';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEnterKeyBlur } from '@/hooks/useEnterKeyBlur';

interface OrderMetadataProps {
  form: UseFormReturn<FormValues>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderMetadata({
  form,
  isOpen,
  onOpenChange,
}: OrderMetadataProps) {
  const handleEnterKey = useEnterKeyBlur();
  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={onOpenChange}
        className="w-full space-y-2 bg-[#F6F3F0] rounded-lg collapsible-transition"
      >
        <CollapsibleTrigger asChild>
          <div className="flex w-full items-center justify-between space-x-4 px-8 py-6 cursor-pointer rounded-lg transition-colors bg-[#F6F3F0]">
            <div className="flex items-center space-x-2">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
              <h4>Rever Detalhes Automatizados</h4>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 px-8 pb-6 collapsible-content-transition">
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Encomenda</FormLabel>
                <FormControl>
                  <Input
                    placeholder="6111"
                    autoComplete="false"
                    {...field}
                    onKeyDown={handleEnterKey}
                  />
                </FormControl>
                <FormDescription>
                  O número da encomenda é gerado automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da encomenda</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[340px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: pt })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
