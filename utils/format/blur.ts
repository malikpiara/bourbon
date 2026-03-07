// Factory for onBlur handlers that normalise text input.
// Applies cleanSpaces (collapse whitespace) then capitalizeWithPreserve
// (smart capitalisation that keeps acronyms and Portuguese prepositions).
import { cleanSpaces } from './trim';
import { capitalizeWithPreserve } from './capitalise';

type FieldRef = {
  onChange: (value: string) => void;
  onBlur: () => void;
};

/**
 * Returns an onBlur handler that formats the input value and commits it
 * back to the form field. Used for name, address, and product text fields.
 */
export function createFormattedBlurHandler(field: FieldRef) {
  return (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = capitalizeWithPreserve(cleanSpaces(e.target.value));
    field.onChange(formatted);
    field.onBlur();
  };
}
