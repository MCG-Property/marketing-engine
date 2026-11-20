import type { ApprovalDraft, MemoryStore, PublicationRow } from '../approval/queue.ts'
import type { Role } from '../auth/roles.ts'
import { killSwitchesFromRows } from '../config/kill-switches.ts'
import { createAuditEvent } from '../domain/audit.ts'
import type { ApprovalRecord } from '../domain/approval.ts'
import { transition } from '../domain/content-state.ts'
import { idempotencyKey } from '../domain/idempotency.ts'
import { AdapterFailure, NotConfigured, type SendAdapter } from './adapters.ts'
import { beginPublish } from './publishing.ts'

export type Queryable = {
  query(sql: string, params: readonly unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

const INSERT_KEY =
  'insert into publication (publication_id, content_id, channel, status, idempotency_key) values ($1, $2, $3, $4, $5) on conflict (idempotency_key) do nothing returning publication_id'

const SELECT_KEY =
  'select publication_id, content_id, channel, status, idempotency_key, error, external_post_id from publication where idempotency_key = $1'

function matchingYes(store: MemoryStore, item: ApprovalDraft): ApprovalRecord | null {
  return (
    store.approvals.find(
      (row) =>
        row.contentId === item.id &&
        !row.voided &&
        row.decision === 'Y' &&
        row.draftVersion === item.currentVersion,
    ) ?? null
  )
}

function remember(store: MemoryStore, row: PublicationRow): PublicationRow {
  const found = store.publications.find((entry) => entry.idempotencyKey === row.idempotencyKey)
  if (found) return found
  store.publications.push(row)
  return row
}

function fromSql(row: Record<string, unknown>): PublicationRow {
  const status = row.status
  if (status !== 'PUBLISHING' && status !== 'PUBLISHED' && status !== 'FAILED' && status !== 'PUBLISH_UNKNOWN') {
    throw new Error('publication status is unusable')
  }
  return {
    publicationId: String(row.publication_id),
    contentId: String(row.content_id),
    channel: String(row.channel),
    idempotencyKey: String(row.idempotency_key),
    status,
    error: row.error == null ? null : String(row.error),
    externalPostId: row.external_post_id == null ? null : String(row.external_post_id),
  }
}

async function reserve(
  store: MemoryStore,
  row: PublicationRow,
  pool: Queryable | undefined,
): Promise<{ row: PublicationRow; fresh: boolean }> {
  if (pool) {
    const inserted = await pool.query(INSERT_KEY, [
      row.publicationId,
      row.contentId,
      row.channel,
      row.status,
      row.idempotencyKey,
    ])
    if (inserted.rows.length === 0) {
      const found = await pool.query(SELECT_KEY, [row.idempotencyKey])
      const hit = found.rows[0]
      if (!hit) throw new Error('publication key missing after conflict')
      return { row: remember(store, fromSql(hit)), fresh: false }
    }
  }
  const clash = store.publications.find((entry) => entry.idempotencyKey === row.idempotencyKey)
  if (clash) return { row: clash, fresh: false }
  store.publications.push(row)
  return { row, fresh: true }
}

export async function publishRun(input: {
  store: MemoryStore
  id: string
  actorRole: Role
  adapter: SendAdapter
  pool?: Queryable
}): Promise<PublicationRow> {
  const item = input.store.items.get(input.id)
  if (!item) throw new Error('unknown content')
  if (item.sample || item.missing === 'MISSING_SOURCE_DATA') {
    throw new Error('sample cannot be submitted')
  }
  const key = idempotencyKey(item.id, item.currentVersion, 'publish')
  const existing = input.store.publications.find((entry) => entry.idempotencyKey === key)
  if (existing) return existing
  const flags = killSwitchesFromRows(input.store.killRows)
  beginPublish({
    status: item.status,
    currentVersion: item.currentVersion,
    approval: matchingYes(input.store, item),
    idempotencyKey: key,
    usedKeys: new Set(input.store.publications.map((entry) => entry.idempotencyKey)),
    actorRole: input.actorRole,
    flags,
  })
  const reserved = await reserve(
    input.store,
    {
      publicationId: `pub-${item.id}-${item.currentVersion}`,
      contentId: item.id,
      channel: 'facebook+instagram',
      idempotencyKey: key,
      status: 'PUBLISHING',
      error: null,
      externalPostId: null,
    },
    input.pool,
  )
  if (!reserved.fresh) return reserved.row
  item.status = 'PUBLISHING'
  try {
    const result = await input.adapter.send({ idempotencyKey: key })
    if (!result.receipt) {
      reserved.row.status = 'PUBLISH_UNKNOWN'
      item.status = transition('PUBLISHING', 'PUBLISH_UNKNOWN')
    } else {
      reserved.row.status = 'PUBLISHED'
      reserved.row.externalPostId = result.receipt
      item.status = transition('PUBLISHING', 'PUBLISHED')
    }
  } catch (error) {
    reserved.row.status = 'FAILED'
    reserved.row.error =
      error instanceof AdapterFailure ? error.kind : error instanceof NotConfigured ? 'NOT_CONFIGURED' : 'api'
    item.status = transition('PUBLISHING', 'FAILED')
  }
  input.store.audits.push(
    createAuditEvent({
      event: 'publication.result',
      objectType: 'publication',
      objectId: reserved.row.publicationId,
      actor: input.actorRole,
      result: reserved.row.status,
      metadata: { key },
    }),
  )
  return reserved.row
}
