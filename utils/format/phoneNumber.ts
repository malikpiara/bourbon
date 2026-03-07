// Formats a phone number for display in PDF documents.
// Expects E.164 format (e.g. "+351962119084") and adds a space after the country code.
// Returns the input as-is if it's not in E.164 format.
export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return '';

  if (phone.startsWith('+')) {
    const countryCodeMatch = phone.match(/^\+(\d+)/);
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : '';
    const restOfNumber = phone.slice(countryCode.length + 1);

    return `+${countryCode} ${restOfNumber}`.trim();
  }

  return phone;
};
