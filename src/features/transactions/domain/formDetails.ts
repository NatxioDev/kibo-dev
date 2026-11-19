export function hasExtraDetails(fields: {
  paymentMethodId?: string | null;
  merchant?: string | null;
  description?: string | null;
}): boolean {
  return Boolean(
    fields.paymentMethodId || fields.merchant?.trim() || fields.description?.trim(),
  );
}
