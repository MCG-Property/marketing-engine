export function idempotencyKey(objectId: string, version: number, action: string): string {
  return `${objectId}:${version}:${action}`
}
