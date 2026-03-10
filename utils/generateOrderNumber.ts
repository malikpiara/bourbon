// Generates a non-sequential, human-readable order number.
// Format: YYMM-XXXX (e.g. "2603-7K2M").
// Collision is handled by the UNIQUE(org_id, order_number) constraint — caller should retry.

const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O/1/I/L to avoid confusion

function randomSuffix(length = 4): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join('');
}

export function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yy}${mm}-${randomSuffix()}`;
}
