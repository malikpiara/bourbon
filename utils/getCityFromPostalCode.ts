// Looks up a Portuguese city name from a 7-digit postal code (XXXX-XXX).
// The postal code map (~5.3 MB) is lazy-loaded on first use via dynamic import,
// keeping it out of the initial bundle. Cached after first load.

let postalCodeMap: Record<string, string> | null = null;

async function loadPostalCodeMap(): Promise<Record<string, string>> {
  if (!postalCodeMap) {
    const raw = await import('./postalCodeMap.json');
    postalCodeMap = raw.default as Record<string, string>;
  }
  return postalCodeMap;
}

export async function getCityFromPostalCode(
  postalCode: string
): Promise<string | undefined> {
  // Remove any whitespace
  postalCode = postalCode.replace(/\s/g, '');

  // If the user typed something other than 7 digits, bail out
  if (postalCode.length !== 7) {
    return undefined;
  }

  const map = await loadPostalCodeMap();

  // 1. Extract the first 4 digits for the prefix
  const prefix = postalCode.slice(0, 4);

  // 2. Extract the last 3 digits for the extension
  const extensionRaw = postalCode.slice(4); // e.g. "061"

  // 3. Convert extension to a number, then back to string to remove leading zeros
  const extension = parseInt(extensionRaw, 10).toString(); // "061" → "61"

  // 4. Construct the key
  const key = `${prefix}-${extension}`; // e.g. "3750-61"

  // 5. Lookup in postalCodeMap
  const city = map[key];
  return city ? capitalizeFirstLetter(city) : undefined;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
