// Customer data form section: name, email, phone, NIF, plus delivery/billing
// address groups. Renders different fields based on salesType (direct vs delivery).
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { FormValues } from '@/lib/schema';
import { useEnterKeyBlur } from '@/hooks/useEnterKeyBlur';
import { createFormattedBlurHandler } from '@/utils/format';
import { PhoneInput } from '@/components/ui/phone-input';
import { AddressFieldGroup } from './AddressFieldGroup';

interface CustomerSectionProps {
  form: UseFormReturn<FormValues>;
  className?: string;
}

const handleOTPKeyDown = (event: React.KeyboardEvent) => {
  if (
    !/^[0-9]$/.test(event.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
      event.key
    )
  ) {
    event.preventDefault();
  }
};

export function CustomerSection({ form, className }: CustomerSectionProps) {
  const handleEnterKey = useEnterKeyBlur();
  const salesType = form.watch('salesType');
  const isDelivery = salesType === 'delivery';
  const sameAddress = form.watch('sameAddress');

  return (
    <div className={`space-y-8 ${className || ''}`}>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Dados do Cliente
      </h2>

      {/* Basic Customer Information - Always Shown */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input
                autoComplete="false"
                {...field}
                onKeyDown={handleEnterKey}
                onBlur={createFormattedBlurHandler(field)}
              />
            </FormControl>
            <FormDescription>
              Escreva o primeiro e último nome, ou o nome da empresa.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email do cliente{!isDelivery && ' (opcional)'}
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                autoComplete="new-password"
                {...field}
                onKeyDown={handleEnterKey}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Para envio da fatura e outras comunicações.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Telefone do cliente{!isDelivery && ' (opcional)'}
            </FormLabel>
            <FormControl>
              <PhoneInput
                type="tel"
                autoComplete="new-password"
                defaultCountry="PT"
                countries={[
                  'PT', // Portugal
                  'ES', // Spain
                  'FR', // France
                  'DE', // Germany
                  'IT', // Italy
                  'MZ', // Mozambique
                  'AO', // Angola
                  'BR', // Brazil
                  'CV', // Cape Verde
                  'GB', // United Kingdom
                  'NL', // Netherlands
                  'BE', // Belgium
                  'GW', // Guinea-Bissau
                  'ST', // São Tomé and Príncipe
                  'US', // United States
                  'CH', // Switzerland
                  'SE', // Sweden
                  'DK', // Denmark
                  'NO', // Norway
                ]}
                {...field}
                onKeyDown={handleEnterKey}
              />
            </FormControl>
            {isDelivery && (
              <FormDescription>
                Pode ser usado para auxiliar a entrega.
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nif"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Número de contribuinte{!isDelivery && ' (opcional)'}
            </FormLabel>
            <FormControl>
              <InputOTP maxLength={9} {...field} onKeyDown={handleOTPKeyDown}>
                <InputOTPGroup>
                  {[...Array(9)].map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Delivery Address Section - Only shown for delivery orders */}
      {isDelivery && (
        <>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Morada de Entrega
          </h2>

          <AddressFieldGroup
            form={form}
            fields={{
              address1: 'address1',
              address2: 'address2',
              postalCode: 'postalCode',
              city: 'city',
            }}
          />

          <FormField
            control={form.control}
            name="elevator"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Há elevador</FormLabel>
                  <FormDescription>
                    Se o elevador não estiver operacional, por favor deixe a
                    caixa vazia.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </>
      )}

      {/* Billing Address Section */}
      {isDelivery && (
        <FormField
          control={form.control}
          name="sameAddress"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    if (checked) {
                      // Clear billing fields when "sameAddress" is checked
                      form.setValue('billingAddress1', '');
                      form.setValue('billingAddress2', '');
                      form.setValue('billingPostalCode', '');
                      form.setValue('billingCity', '');
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  A morada de faturação é a mesma que a morada de entrega
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Optional Billing Address - Shown for direct sales or when sameAddress is false */}
      {(!isDelivery || !sameAddress) && (
        <div className="space-y-8 animate-slide-fade">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Morada de Faturação{!isDelivery && ' (opcional)'}
          </h3>

          <AddressFieldGroup
            form={form}
            fields={{
              address1: 'billingAddress1',
              address2: 'billingAddress2',
              postalCode: 'billingPostalCode',
              city: 'billingCity',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CustomerSection;
