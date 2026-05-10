/** Formats a raw card number as four groups of four digits for display. */
export function formatMemberCardNumber(cardNumber?: string | null): string {
  if (!cardNumber) {
    return "---- ---- ---- ----";
  }
  const digits = cardNumber.replace(/\D/g, "").slice(0, 16);
  if (digits.length === 0) {
    return "---- ---- ---- ----";
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
