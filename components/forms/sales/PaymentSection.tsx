import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/lib/schema';
import { formatCurrency } from '@/utils/format/currency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PaymentSectionProps {
  form: UseFormReturn<FormValues>;
}

const PAYMENT_TYPES = [
  { value: 'mbway', label: 'MBWay' },
  { value: 'cash', label: 'Numerário' },
  { value: 'card', label: 'Multibanco' },
  { value: 'transfer', label: 'Transferência' },
] as const;

export function PaymentSection({ form }: PaymentSectionProps) {
  const fields = form.watch('tableEntries');
  const orderDate = form.watch('date');

  // First, let's create a type helper for the pre-transformation unitPrice
  type UnitPrice = string | number;

  // Calculate total with proper type annotations
  const total = fields.reduce((sum, field) => {
    const quantity = field.quantity || 0;
    const rawPrice = field.unitPrice as UnitPrice; // Help TypeScript understand the type

    const numericPrice =
      typeof rawPrice === 'string'
        ? parseFloat(rawPrice.replace(',', '.')) || 0
        : rawPrice || 0;

    return sum + quantity * numericPrice;
  }, 0);

  const [sliderValue, setSliderValue] = useState(50);

  // Initialize payments
  useEffect(() => {
    const currentFirstPayment = form.getValues('firstPayment');
    const currentSecondPayment = form.getValues('secondPayment');
    if (!currentFirstPayment && !currentSecondPayment) {
      const halfTotal = total / 2;
      form.setValue('firstPayment', halfTotal);
      form.setValue('secondPayment', halfTotal);
    }
  }, [total, form]);

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    setSliderValue(percentage);

    const firstAmount = total * (percentage / 100);
    const secondAmount = total * ((100 - percentage) / 100);

    form.setValue('firstPayment', firstAmount);
    form.setValue('secondPayment', secondAmount);
  };

  const handlePaymentChange = (payment: string, isFirst: boolean) => {
    const value = parseFloat(payment.replace(',', '.')) || 0;
    if (isFirst) {
      form.setValue('firstPayment', value);
      form.setValue('secondPayment', total - value);
      setSliderValue((value / total) * 100);
    } else {
      form.setValue('secondPayment', value);
      form.setValue('firstPayment', total - value);
      setSliderValue(((total - value) / total) * 100);
    }
  };

  const firstPayment = form.watch('firstPayment') || 0;
  const secondPayment = form.watch('secondPayment') || 0;
  const paymentsMatchTotal =
    Math.abs(firstPayment + secondPayment - total) < 0.01;

  return (
    <Card className="w-full animate-slide-fade">
      <CardHeader>
        <CardTitle>Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Total Amount Display */}
          <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
            <span className="font-semibold">Valor Total:</span>
            <span className="font-semibold text-lg">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Payment Split Slider */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">
              Distribuição dos Pagamentos
            </Label>
            <div className="pt-4">
              <Slider
                value={[sliderValue]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className="mb-6 cursor-grab"
              />
              <div className="flex justify-between text-primary">
                <span>{sliderValue}%</span>
                <span>{100 - sliderValue}%</span>
              </div>
            </div>
          </div>

          {/* First Payment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">
                  Pagamento no acto de venda
                </h3>
                <div className="text-sm text-muted-foreground">
                  {format(orderDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}
                </div>
              </div>
              <Input
                type="text"
                className="w-32 text-right"
                value={formatCurrency(firstPayment).replace('€', '')}
                onChange={(e) => handlePaymentChange(e.target.value, true)}
              />
            </div>
            <Select
              // @ts-expect-error: Temporary suppression of TypeScript error due to discriminated union type mismatch.
              value={form.watch('paymentType') as FormValues['paymentType']}
              // @ts-expect-error: Temporary suppression of TypeScript error. Will refactor to properly handle type narrowing.
              onValueChange={(value: FormValues['paymentType']) =>
                form.setValue('paymentType', value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o Método de Pagamento" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second Payment */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">
                Pagamento no acto de entrega
              </h3>
            </div>
            <Input
              type="text"
              className="w-32 text-right"
              value={formatCurrency(secondPayment).replace('€', '')}
              onChange={(e) => handlePaymentChange(e.target.value, false)}
            />
          </div>

          {/* Warning if payments don't match total */}
          {!paymentsMatchTotal && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A soma dos pagamentos (
                {formatCurrency(firstPayment + secondPayment)}) não coincide com
                o valor total ({formatCurrency(total)})
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
