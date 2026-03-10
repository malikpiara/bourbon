// Migrates persisted form_data JSONB back to FormValues.
// Each form_data_version maps to a migration function. Currently only v1 exists.
// Future schema changes add a new version branch here rather than altering stored data.
import type { FormValues } from '@/lib/schema';

/**
 * Rehydrates raw form_data from Supabase into a FormValues object the form
 * can use as defaultValues.
 *
 * Key transforms:
 * - `date` (ISO string in JSONB) → Date instance
 * - `tableEntries[].id` — ensures sequential numeric IDs exist
 */
export function migrateFormData(
  formData: unknown,
  version: number
): FormValues {
  if (version === 1) {
    return migrateV1(formData);
  }

  // Unknown version — attempt v1 migration as fallback
  console.warn(`Unknown form_data_version ${version}, falling back to v1`);
  return migrateV1(formData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateV1(raw: any): FormValues {
  return {
    ...raw,
    // JSONB stores dates as ISO strings — convert back to Date
    date: raw.date ? new Date(raw.date) : new Date(),
    // Ensure tableEntries have sequential numeric IDs for useFieldArray
    tableEntries: (raw.tableEntries ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any, index: number) => ({
        ...entry,
        id: typeof entry.id === 'number' ? entry.id : index,
        // unitPrice is already a number in JSONB (Zod transforms before save)
        unitPrice: typeof entry.unitPrice === 'number' ? entry.unitPrice : 0,
      })
    ),
  } as FormValues;
}
