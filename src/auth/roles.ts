export const ROLES = ['READ', 'WRITE', 'PUBLISH', 'ADMIN'] as const

export type Role = (typeof ROLES)[number]

export function canPublish(role: Role): boolean {
  return role === 'PUBLISH' || role === 'ADMIN'
}

export function postedRole(value: string | null | undefined): Role {
  if (value === 'READ' || value === 'WRITE' || value === 'PUBLISH' || value === 'ADMIN') return value
  return 'READ'
}

export function canWrite(role: Role): boolean {
  return role === 'WRITE' || role === 'PUBLISH' || role === 'ADMIN'
}
