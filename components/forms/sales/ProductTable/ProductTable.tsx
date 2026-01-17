import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/lib/schema';
import { formatCurrency } from '@/utils/format/currency';
import { EmptyState } from './EmptyState';
import ProductRow from './ProductRow';

export interface ProductTableProps {
  form: UseFormReturn<FormValues>;
}

export function ProductTable({ form }: ProductTableProps) {
  const {
    fields,
    append: fieldArrayAppend,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'tableEntries',
  });

  const handleAppend = () => {
    const newEntry = {
      id: fields.length,
      ref: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    fieldArrayAppend(newEntry);
  };

  const handleRemove = async (index: number) => {
    // First, apply exit animation class to the row
    const rowElement = document.querySelector(
      `[data-row-id="${fields[index].id}"]`
    );
    if (rowElement) {
      rowElement.classList.add('table-row-exit');

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Then remove the row
    remove(index);
  };

  const totalQuantity = fields.reduce((sum, field, index) => {
    const quantity = form.watch(`tableEntries.${index}.quantity`) || 0;
    return sum + quantity;
  }, 0);

  const totalPrice = fields.reduce((sum, field, index) => {
    const quantity = form.watch(`tableEntries.${index}.quantity`) || 0;
    const rawUnitPrice = form.watch(`tableEntries.${index}.unitPrice`) || '0';

    // Replace commas with dots and parse the value
    const unitPrice = parseFloat(rawUnitPrice.toString().replace(',', '.'));

    // If unitPrice is not a valid number, use 0 as a fallback
    const price = isNaN(unitPrice) ? 0 : unitPrice;

    return sum + quantity * price;
  }, 0);

  if (fields.length === 0) {
    return <EmptyState onAddProduct={handleAppend} />;
  }

  return (
    <div className="space-y-4 table-row-enter">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-neutral-800">
                Referência
              </TableHead>
              <TableHead className="w-[100px] text-neutral-800">
                Quantidade
              </TableHead>
              <TableHead className="min-w-[200px] text-neutral-800">
                Designação
              </TableHead>
              <TableHead className="w-[200px] text-neutral-800">
                Preço Unitário
              </TableHead>
              <TableHead className="w-[150px] text-neutral-800">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="before:content-[''] before:block before:h-4">
            {fields.map((field, index) => (
              <ProductRow
                key={field.id}
                field={field}
                index={index}
                form={form}
                handleRemove={handleRemove}
              />
            ))}
            <TableRow className="font-semibold">
              <TableCell colSpan={1} className="text-right">
                Total:
              </TableCell>
              <TableCell className="text-left">{totalQuantity}</TableCell>
              <TableCell></TableCell>
              <TableCell>{formatCurrency(totalPrice)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        onClick={handleAppend}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Adicionar Produto
      </Button>
    </div>
  );
}
