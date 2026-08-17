export function toInputValue(value?: string | number | null) {
  return value == null ? '' : String(value);
}

export function optionalTextFromInput(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function requiredTextFromInput(value: string) {
  return value.trim();
}

export function optionalNumberFromInput(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  return Number(value);
}

export function requiredNumberFromInput(value: string) {
  return Number(value);
}

export function optionalIdFromInput(value: string) {
  return value ? Number(value) : undefined;
}

export function requiredIdFromInput(value: string) {
  return Number(value);
}

export function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}
