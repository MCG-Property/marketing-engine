export function parseStructured<T>(payload: unknown, validate: (value: unknown) => T): T {
  return validate(payload)
}
