export const CONTENT_STATUSES = [
  'IDEA',
  'DRAFT',
  'READY_FOR_REVIEW',
  'AWAITING_APPROVAL',
  'REJECTED',
  'REVISION_REQUESTED',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISHED',
  'FAILED',
  'PUBLISH_UNKNOWN',
] as const

export type ContentStatus = (typeof CONTENT_STATUSES)[number]

const EDGES: Record<ContentStatus, readonly ContentStatus[]> = {
  IDEA: ['DRAFT'],
  DRAFT: ['READY_FOR_REVIEW'],
  READY_FOR_REVIEW: ['AWAITING_APPROVAL'],
  AWAITING_APPROVAL: ['REJECTED', 'REVISION_REQUESTED', 'APPROVED'],
  REJECTED: [],
  REVISION_REQUESTED: ['DRAFT'],
  APPROVED: ['SCHEDULED'],
  // PUBLISHING is entered only by beginPublish after the gate.
  SCHEDULED: [],
  PUBLISHING: ['PUBLISHED', 'FAILED', 'PUBLISH_UNKNOWN'],
  PUBLISHED: [],
  FAILED: [],
  PUBLISH_UNKNOWN: [],
}

export function transition(from: ContentStatus, to: ContentStatus): ContentStatus {
  if (!EDGES[from].includes(to)) {
    throw new Error(`illegal transition ${from} -> ${to}`)
  }
  return to
}
