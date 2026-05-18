export function collectRequiredFieldErrors(
  fields: Array<[string, string | number | null | undefined]>,
  message: string
): Record<string, string> {
  return fields.reduce<Record<string, string>>((errors, [field, value]) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      errors[field] = message;
    }

    return errors;
  }, {});
}
