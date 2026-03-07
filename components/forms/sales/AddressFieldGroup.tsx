// Reusable address field group (address1, address2, postalCode, city).
// Used for both delivery and billing addresses in CustomerSection.
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { FormValues } from '@/lib/schema';
import { useEnterKeyBlur } from '@/hooks/useEnterKeyBlur';
import { createFormattedBlurHandler } from '@/utils/format';
import { getCityFromPostalCode } from '@/utils/getCityFromPostalCode';

type AddressFieldNames = {
  address1: 'address1' | 'billingAddress1';
  address2: 'address2' | 'billingAddress2';
  postalCode: 'postalCode' | 'billingPostalCode';
  city: 'city' | 'billingCity';
};

interface AddressFieldGroupProps {
  form: UseFormReturn<FormValues>;
  fields: AddressFieldNames;
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

export function AddressFieldGroup({ form, fields }: AddressFieldGroupProps) {
  const handleEnterKey = useEnterKeyBlur();

  return (
    <>
      {/* Address Line 1 */}
      <FormField
        control={form.control}
        name={fields.address1}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Linha de morada 1</FormLabel>
            <FormControl>
              <Input
                placeholder="Nome e número da rua"
                autoComplete="new-password"
                {...field}
                onKeyDown={handleEnterKey}
                onBlur={createFormattedBlurHandler(field)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Line 2 */}
      <FormField
        control={form.control}
        name={fields.address2}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Linha de morada 2</FormLabel>
            <FormControl>
              <Input
                placeholder="Apartamento, bloco, edificio, andar, etc."
                autoComplete="new-password"
                {...field}
                onKeyDown={handleEnterKey}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Postal Code + City row */}
      <div className="flex gap-14">
        <FormField
          control={form.control}
          name={fields.postalCode}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={7}
                  {...field}
                  onKeyDown={handleOTPKeyDown}
                  onBlur={(e) => {
                    const postalCode = e.target.value.replace(/\s/g, '');
                    field.onChange(postalCode);
                    const city = getCityFromPostalCode(postalCode);
                    if (city) {
                      form.setValue(fields.city, city);
                    }
                    field.onBlur();
                  }}
                >
                  <InputOTPGroup>
                    {[...Array(4)].map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {[...Array(3)].map((_, index) => (
                      <InputOTPSlot key={index + 4} index={index + 4} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={fields.city}
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  {...field}
                  onKeyDown={handleEnterKey}
                  onBlur={createFormattedBlurHandler(field)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
