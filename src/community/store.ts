import { DEFAULT_KILL_SWITCHES, killSwitchesFromRows } from '../config/kill-switches.ts'
import type { ManualMetric } from '../metrics/record.ts'
import { createPool } from '../queue/jobs.ts'
import type { CommunityDesk } from './desk.ts'
import type { Enquiry } from '../dashboard/inbox.ts'
import type { StoredEnquiry } from './prepare.ts'
import type { ManualReview } from '../providers/reviews.ts'
import { checkVisibility, type VisibilityCheck } from './visibility.ts'

type Sql = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>
}

const memory = new Map<string, StoredEnquiry>()
const noticed = new Set<string>()
const metrics: ManualMetric[] = []
let pool: Sql | null | undefined

function database(): Sql | null {
  if (pool !== undefined) return pool
  const url = process.env.DATABASE_URL
  pool = url ? createPool(url) : null
  console.error(pool ? 'community store connected' : 'community store unavailable')
  return pool
}

async function query(sql: Sql, text: string, values: unknown[]) {
  try {
    return await sql.query(text, values)
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unknown'
    console.error('community store query failed', code)
    return null
  }
}

export function enquiryRecord(key: string, item: Enquiry): StoredEnquiry {
  return { suggestedReply: item.suggestedReply, status: item.status }
}

export async function loadStoredEnquiry(key: string): Promise<StoredEnquiry | null> {
  const cached = memory.get(key)
  const sql = database()
  if (!sql) return cached ?? null
  const found = await query(sql, 'select suggested_reply, status from enquiry where external_message_id = $1', [key])
  if (!found) return cached ?? null
  const row = found.rows[0]
  if (!row) return cached ?? null
  const stored = {
    suggestedReply: typeof row.suggested_reply === 'string' ? row.suggested_reply : null,
    status: row.status === 'escalated' || row.status === 'ignored' ? row.status : 'draft',
  } satisfies StoredEnquiry
  memory.set(key, stored)
  return stored
}

export async function saveStoredEnquiry(key: string, item: Enquiry, overwriteReply = false): Promise<void> {
  const stored = enquiryRecord(key, item)
  memory.set(key, stored)
  const sql = database()
  if (!sql) return
  await query(
    sql,
    `insert into enquiry
      (id, channel, external_message_id, sender_reference, message, classification, assigned_to, suggested_reply, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (channel, external_message_id) where external_message_id is not null
     do update set
       message = excluded.message,
       classification = excluded.classification,
       assigned_to = excluded.assigned_to,
       suggested_reply = case when $10::boolean then excluded.suggested_reply else coalesce(enquiry.suggested_reply, excluded.suggested_reply) end,
       status = excluded.status`,
    [key, item.channel, key, item.person, item.text, item.classification, item.assignedTo, item.suggestedReply, item.status, overwriteReply],
  )
}

export async function noticeWasSent(key: string): Promise<boolean> {
  if (noticed.has(key)) return true
  const sql = database()
  if (!sql) return false
  const found = await query(sql, `select 1 from audit_event where event = 'community.notice' and object_id = $1 limit 1`, [key])
  if (!found) return false
  if (found.rows.length === 0) return false
  noticed.add(key)
  return true
}

export async function markNoticeSent(key: string): Promise<void> {
  noticed.add(key)
  const sql = database()
  if (!sql) return
  await query(
    sql,
    `insert into audit_event (id, event, object_type, object_id, actor, timestamp, result, metadata)
     values ($1, 'community.notice', 'enquiry', $2, 'dashboard', now(), 'sent', '{}'::jsonb)
     on conflict (id) do nothing`,
    [`notice:${key}`, key],
  )
}

const appliedStaff = new Set<string>()

export async function staffReplyApplied(id: string): Promise<boolean> {
  if (appliedStaff.has(id)) return true
  const sql = database()
  if (!sql) return false
  const found = await query(sql, 'select 1 from audit_event where id = $1', [`staff:${id}`])
  if (!found || found.rows.length === 0) return false
  appliedStaff.add(id)
  return true
}

export async function markStaffReplyApplied(id: string): Promise<void> {
  appliedStaff.add(id)
  const sql = database()
  if (!sql) return
  await query(
    sql,
    `insert into audit_event (id, event, object_type, object_id, actor, timestamp, result, metadata)
     values ($1, 'community.staff', 'enquiry', $2, 'cindy', now(), 'recorded', '{}'::jsonb)
     on conflict (id) do nothing`,
    [`staff:${id}`, id],
  )
}

export async function saveManualReviewRow(review: ManualReview): Promise<void> {
  const sql = database()
  if (!sql) return
  const id = `review:${review.reviewText.slice(0, 80)}`
  await query(
    sql,
    `insert into review
      (id, platform, review_text, received_at, suggested_reply, approval_status, reply_status)
     values ($1,$2,$3, now(), $4, $5, $6)
     on conflict (id) do nothing`,
    [id, review.platform, review.reviewText, review.suggestedReply, review.approvalStatus, review.replyStatus],
  )
}

export async function saveVisibilityRow(check: VisibilityCheck): Promise<void> {
  const sql = database()
  if (!sql) return
  const id = `visibility:${check.businessField}:${check.observedValue ?? ''}:${check.status}`
  await query(
    sql,
    `insert into visibility_check
      (id, platform, business_field, expected_value, observed_value, status, checked_at)
     values ($1, 'manual', $2, $3, $4, $5, now())
     on conflict (id) do nothing`,
    [id, check.businessField, check.expectedValue, check.observedValue, check.status],
  )
}

export async function loadCommunityDesk(): Promise<CommunityDesk> {
  const sql = database()
  if (!sql) return { reviews: [], checks: [] }
  const reviews = await query(sql, `select review_text, suggested_reply from review order by received_at desc nulls last limit 20`, [])
  const checks = await query(sql, `select business_field, observed_value, status from visibility_check order by checked_at desc limit 20`, [])
  if (!reviews || !checks) return { reviews: [], checks: [] }
  const seen = new Set<string>()
  return {
    reviews: reviews.rows.flatMap((row) => {
      const text = typeof row.review_text === 'string' ? row.review_text : ''
      const suggestedReply = typeof row.suggested_reply === 'string' ? row.suggested_reply : ''
      if (!text || !suggestedReply) return []
      return [{
        platform: 'manual',
        reviewText: text,
        suggestedReply,
        approvalStatus: 'DRAFT' as const,
        replyStatus: 'HELD' as const,
      }]
    }),
    checks: checks.rows.flatMap((row) => {
      const field = typeof row.business_field === 'string' ? row.business_field : ''
      if (!field || seen.has(field)) return []
      seen.add(field)
      const observed = typeof row.observed_value === 'string' ? row.observed_value : null
      const check = checkVisibility(field, observed)
      return [{ ...check, status: row.status === 'MATCH' || row.status === 'MISMATCH' || row.status === 'MISSING' || row.status === 'REVIEW_REQUIRED' ? row.status : check.status }]
    }),
  }
}

function metricNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(number) ? number : 0
}

function metricDate(value: unknown): string {
  if (value instanceof Date) {
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${value.getFullYear()}-${month}-${day}`
  }
  return typeof value === 'string' ? value.slice(0, 10) : ''
}

export async function saveManualMetric(row: ManualMetric): Promise<void> {
  const index = metrics.findIndex((item) => item.metricDate === row.metricDate && item.channel === row.channel)
  if (index >= 0) metrics[index] = row
  else metrics.push(row)
  const sql = database()
  if (!sql) return
  await query(
    sql,
    `insert into metric (
      metric_date, channel, posts, reach, impressions, engagement, clicks,
      enquiries, reviews, review_requests, website_sessions, tracked_conversions
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    on conflict (metric_date, channel) do update set
      posts = excluded.posts,
      reach = excluded.reach,
      impressions = excluded.impressions,
      engagement = excluded.engagement,
      clicks = excluded.clicks,
      enquiries = excluded.enquiries,
      reviews = excluded.reviews,
      review_requests = excluded.review_requests,
      website_sessions = excluded.website_sessions,
      tracked_conversions = excluded.tracked_conversions`,
    [
      row.metricDate, row.channel, row.posts, row.reach, row.impressions, row.engagement, row.clicks,
      row.enquiries, row.reviews, row.reviewRequests, row.websiteSessions, row.trackedConversions,
    ],
  )
}

export async function loadManualMetrics(): Promise<ManualMetric[]> {
  const sql = database()
  if (!sql) return [...metrics]
  const found = await query(
    sql,
    `select metric_date, channel, posts, reach, impressions, engagement, clicks, enquiries, reviews,
            review_requests, website_sessions, tracked_conversions
     from metric order by metric_date desc`,
    [],
  )
  if (!found) return [...metrics]
  const rows = found.rows.flatMap((row): ManualMetric[] => {
    const channel = row.channel === 'facebook' || row.channel === 'instagram' ? row.channel : null
    const date = metricDate(row.metric_date)
    if (!channel || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
    return [{
      metricDate: date,
      channel,
      posts: metricNumber(row.posts),
      reach: metricNumber(row.reach),
      impressions: metricNumber(row.impressions),
      engagement: metricNumber(row.engagement),
      clicks: metricNumber(row.clicks),
      enquiries: metricNumber(row.enquiries),
      reviews: metricNumber(row.reviews),
      reviewRequests: metricNumber(row.review_requests),
      websiteSessions: metricNumber(row.website_sessions),
      trackedConversions: metricNumber(row.tracked_conversions),
      source: 'manual',
    }]
  })
  metrics.splice(0, metrics.length, ...rows)
  return [...metrics]
}

export async function loadSwitchRows(): Promise<{ name: string; enabled: boolean }[]> {
  const defaults = Object.entries(DEFAULT_KILL_SWITCHES).map(([name, enabled]) => ({ name, enabled }))
  const sql = database()
  if (!sql) return defaults
  const found = await query(sql, 'select name, enabled from kill_switch', [])
  if (!found) return defaults
  const flags = killSwitchesFromRows(found.rows.flatMap((row) => {
    if (typeof row.name !== 'string' || typeof row.enabled !== 'boolean') return []
    return [{ name: row.name, enabled: row.enabled }]
  }))
  return Object.entries(flags).map(([name, enabled]) => ({ name, enabled }))
}
