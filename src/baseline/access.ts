export const ACCESS_STATUSES = ['manual', 'missing', 'unassigned'] as const

export type AccessStatus = (typeof ACCESS_STATUSES)[number]

export type AccessSystem = {
  name: string
  status: AccessStatus
  note: string
}

export const accessInventory: readonly AccessSystem[] = [
  { name: 'Facebook', status: 'manual', note: 'Not connected.' },
  { name: 'Instagram', status: 'manual', note: 'Not connected.' },
  { name: 'Buffer', status: 'missing', note: 'Not selected.' },
  { name: 'Meta direct publishing', status: 'missing', note: 'Fallback only. Not connected.' },
  { name: 'Google Business Profile', status: 'manual', note: 'Manual until access exists.' },
  { name: 'GA4', status: 'missing', note: 'Not connected.' },
  { name: 'model provider', status: 'missing', note: 'Not connected.' },
  { name: 'listing source', status: 'manual', note: 'Manual records only.' },
  { name: 'approval transport', status: 'unassigned', note: 'Channel not chosen.' },
  { name: 'database host', status: 'unassigned', note: 'No hosted database.' },
  { name: 'dashboard host', status: 'manual', note: 'Local process only. Not deployed.' },
]
