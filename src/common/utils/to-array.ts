export function toArray<T>(
  value: T | T[] | undefined | null | '',
): T[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

export function toBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}
