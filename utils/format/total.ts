// Centralized total computation. Handles both raw form values (string | number)
// and normalized order data (number). Avoids duplicating total logic across
// PaymentSection, ProductTable, orderData, and PDF components.

/**
 * Parses a unit price that may be a string with comma-decimal notation
 * (e.g. "12,50") or a number. Returns 0 for invalid/empty values.
 */
export function parseUnitPrice(value: string | number): number {
  if (typeof value === 'string') {
    return parseFloat(value.replace(',', '.')) || 0;
  }
  return value || 0;
}

/**
 * Computes the aggregate price from an array of items with quantity and unitPrice.
 * Works with both raw form entries (unitPrice as string) and normalized order items
 * (unitPrice as number).
 */
export function computeTotal(
  items: ReadonlyArray<{ quantity: number; unitPrice: string | number }>
): number {
  return items.reduce(
    (sum, item) => sum + (item.quantity || 0) * parseUnitPrice(item.unitPrice),
    0
  );
}
