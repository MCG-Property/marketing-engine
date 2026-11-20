export const ROLES = ['READ', 'WRITE', 'PUBLISH', 'ADMIN'] as const

export type Role = (typeof ROLES)[number]

export function canPublish(role: Role): boolean {
  return role === 'PUBLISH' || role === 'ADMIN'
}
