import { KILL_SWITCHES } from '../config/kill-switches.ts'
import { createAuditEvent, type AuditEvent } from '../domain/audit.ts'
import { decide, revise, type ApprovalRecord } from '../domain/approval.ts'
import { transition, type ContentStatus } from '../domain/content-state.ts'
import { parseDecision } from '../providers/messaging.ts'

export type ApprovalDraft = {
  id: string
  status: ContentStatus
  currentVersion: number
  sample: boolean
  missing?: 'MISSING_SOURCE_DATA'
  template: string
  title: string
  caption: string
  schedule: string | null
}

export type PublicationRow = {
  publicationId: string
  contentId: string
  channel: string
  idempotencyKey: string
  status: 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'PUBLISH_UNKNOWN'
  error: string | null
  externalPostId: string | null
}

export type MemoryStore = {
  items: Map<string, ApprovalDraft>
  approvals: ApprovalRecord[]
  publications: PublicationRow[]
  killRows: { name: string; enabled: boolean }[]
  audits: AuditEvent[]
}

export function memoryStore(): MemoryStore {
  return {
    items: new Map(),
    approvals: [],
    publications: [],
    killRows: KILL_SWITCHES.map((name) => ({ name, enabled: false })),
    audits: [],
  }
}

function requireItem(store: MemoryStore, id: string): ApprovalDraft {
  const item = store.items.get(id)
  if (!item) throw new Error('unknown content')
  return item
}

function forItem(store: MemoryStore, id: string): ApprovalRecord[] {
  return store.approvals.filter((row) => row.contentId === id)
}

function replaceApprovals(store: MemoryStore, id: string, next: readonly ApprovalRecord[]): void {
  store.approvals = store.approvals.filter((row) => row.contentId !== id).concat(next)
}

function liveYes(store: MemoryStore, item: ApprovalDraft): boolean {
  return forItem(store, item.id).some(
    (row) => !row.voided && row.decision === 'Y' && row.draftVersion === item.currentVersion,
  )
}

function record(store: MemoryStore, event: string, id: string, result: string, version: number): void {
  store.audits.push(
    createAuditEvent({
      event,
      objectType: 'content_item',
      objectId: id,
      actor: 'dashboard',
      result,
      metadata: { version },
    }),
  )
}

export function submitForApproval(store: MemoryStore, id: string): ApprovalDraft {
  const item = requireItem(store, id)
  if (item.sample || item.missing === 'MISSING_SOURCE_DATA') {
    throw new Error('sample cannot be submitted')
  }
  if (item.status !== 'DRAFT') throw new Error(`cannot submit from ${item.status}`)
  const ready = transition(item.status, 'READY_FOR_REVIEW')
  const next = { ...item, status: transition(ready, 'AWAITING_APPROVAL') }
  store.items.set(id, next)
  record(store, 'approval.submit', id, 'submitted', next.currentVersion)
  return next
}

export function applyReply(store: MemoryStore, text: string, approver: string): ApprovalDraft {
  const pending = [...store.items.values()]
    .filter((item) => item.status === 'AWAITING_APPROVAL' || liveYes(store, item))
    .map((item) => item.id)
  const parsed = parseDecision(text, pending)
  const item = requireItem(store, parsed.contentId)
  if (parsed.decision === 'C' && !parsed.instruction) {
    throw new Error('change needs an instruction')
  }
  const mine = forItem(store, item.id)
  const result = decide({
    content: { id: item.id, status: item.status, currentVersion: item.currentVersion },
    decision: parsed.decision,
    approver,
    changeInstruction: parsed.instruction ?? undefined,
    existing: mine,
    approvalId: `${item.id}:${item.currentVersion}:${parsed.decision}:${mine.length + 1}`,
  })
  if (result.approval) mine.push(result.approval)
  let content = result.content
  if (parsed.decision === 'C' && parsed.instruction) {
    const revised = revise(content, mine)
    content = revised.content
    replaceApprovals(store, item.id, revised.approvals)
  } else {
    replaceApprovals(store, item.id, mine)
  }
  const next = { ...item, status: content.status, currentVersion: content.currentVersion }
  store.items.set(item.id, next)
  record(store, 'approval.decision', item.id, result.approval ? parsed.decision : 'duplicate', next.currentVersion)
  return next
}

export function scheduleDraft(store: MemoryStore, id: string, time: string | null): ApprovalDraft {
  const item = requireItem(store, id)
  if (!time?.trim()) return item
  const next = { ...item, status: transition(item.status, 'SCHEDULED'), schedule: time.trim() }
  store.items.set(id, next)
  record(store, 'approval.schedule', id, 'scheduled', next.currentVersion)
  return next
}

function applyRevise(store: MemoryStore, item: ApprovalDraft, event: string): ApprovalDraft {
  const revised = revise(
    { id: item.id, status: item.status, currentVersion: item.currentVersion },
    forItem(store, item.id),
  )
  replaceApprovals(store, item.id, revised.approvals)
  const next = { ...item, status: revised.content.status, currentVersion: revised.content.currentVersion }
  store.items.set(item.id, next)
  record(store, event, item.id, 'revised', next.currentVersion)
  return next
}

export function cancelScheduled(store: MemoryStore, id: string): ApprovalDraft {
  const item = requireItem(store, id)
  if (item.status !== 'SCHEDULED') throw new Error('cancel applies to a scheduled post')
  return applyRevise(store, item, 'approval.cancel')
}

export function editDraft(store: MemoryStore, id: string): ApprovalDraft {
  return applyRevise(store, requireItem(store, id), 'approval.edit')
}
