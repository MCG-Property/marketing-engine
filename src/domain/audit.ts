export type AuditEvent = {
  event: string
  objectType: string
  objectId: string
  actor: string
  timestamp: string
  result: string
  metadata: Record<string, string | number | boolean | null>
}

export function createAuditEvent(
  input: Omit<AuditEvent, 'timestamp'> & { timestamp?: string },
): AuditEvent {
  return {
    event: input.event,
    objectType: input.objectType,
    objectId: input.objectId,
    actor: input.actor,
    timestamp: input.timestamp ?? new Date().toISOString(),
    result: input.result,
    metadata: input.metadata,
  }
}
