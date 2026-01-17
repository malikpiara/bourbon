import { InputWithError } from '@/components/ui/input-with-error';
import { TableRow, TableCell } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { capitalizeWithPreserve } from '@/utils/format/capitalise';
import { cleanSpaces } from '@/utils/format';

// We define the expected shape of our props
interface ProductRowProps {
  field: {
    id: number;
    ref: string;
    quantity: number;
    unitPrice: number;
    description: string;
  };
  index: number;
  form: UseFormReturn<FormValues>;
  handleRemove: (index: number) => void;
}

export default function ProductRow({
  field,
  index,
  form,
  handleRemove,
}: ProductRowProps) {
  // Each row represents a product entry in our table
  return (
    <TableRow
      key={field.id}
      data-row-id={field.id}
      className="group table-row-enter"
    >
      {/* Reference Field */}
      <TableCell className="p-2">
        <Controller
          name={`tableEntries.${index}.ref` as const}
          control={form.control}
          rules={{ required: 'Required' }}
          render={({ field: inputField, fieldState: { error } }) => (
            <InputWithError
              {...inputField}
              placeholder="Referência"
              error={error?.message}
              onBlur={(e) => {
                const cleanValue = cleanSpaces(e.target.value);
                const formattedValue = capitalizeWithPreserve(cleanValue);
                inputField.onChange(formattedValue);
                inputField.onBlur();
              }}
            />
          )}
        />
      </TableCell>

      {/* Quantity Field with Select Component */}
      <TableCell className="p-2">
        <Controller
          name={`tableEntries.${index}.quantity` as const}
          control={form.control}
          rules={{
            required: 'Required',
            min: { value: 1, message: 'Min 1' },
          }}
          render={({ field: inputField, fieldState: { error } }) => (
            <div>
              <Select
                onValueChange={(value) => inputField.onChange(Number(value))}
                defaultValue={inputField.value.toString()}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Quantidade" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && (
                <p className="text-xs text-red-700 mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </TableCell>

      {/* Description Field */}
      <TableCell className="p-2">
        <Controller
          name={`tableEntries.${index}.description` as const}
          control={form.control}
          rules={{ required: 'Required' }}
          render={({ field: inputField, fieldState: { error } }) => (
            <InputWithError
              {...inputField}
              placeholder="Designação"
              error={error?.message}
              onBlur={(e) => {
                const cleanValue = cleanSpaces(e.target.value);
                const formattedValue = capitalizeWithPreserve(cleanValue);
                inputField.onChange(formattedValue);
                inputField.onBlur();
              }}
            />
          )}
        />
      </TableCell>

      {/* Unit Price Field with Special Handling */}
      <TableCell className="p-2">
        <Controller
          name={`tableEntries.${index}.unitPrice` as const}
          control={form.control}
          rules={{
            required: 'Required',
            min: { value: 0, message: 'Min 0' },
          }}
          render={({ field: inputField, fieldState: { error } }) => (
            <InputWithError
              {...inputField}
              type="text"
              placeholder="Preço"
              value={inputField.value || ''}
              error={error?.message}
              onChange={(e) => {
                // Store the raw input - schema will handle conversion
                inputField.onChange(e.target.value);
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (!value) {
                  e.target.value = '0,00';
                  inputField.onChange('0,00');
                }
                inputField.onBlur();
              }}
            />
          )}
        />
      </TableCell>

      {/* Delete Button with Confirmation Dialog */}
      <TableCell className="p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="group-hover:opacity-80 transition-opacity text-muted-foreground font-medium"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser anulada. Isto eliminará permanentemente
                este item da tabela.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleRemove(index)}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
