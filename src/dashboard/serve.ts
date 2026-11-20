import { existsSync, readFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { pathToFileURL } from 'node:url'
import { applyReply, memoryStore, type MemoryStore } from '../approval/queue.ts'
import { applyCommunityPost, emptyDesk } from '../community/desk.ts'
import { applyStaffReply, prepareEnquiries } from '../community/prepare.ts'
import { draftWithMarketingModel, latestStaffText, notifyCindy } from '../community/remote.ts'
import {
  loadCommunityDesk,
  loadManualMetrics,
  loadStoredEnquiry,
  loadSwitchRows,
  markNoticeSent,
  markStaffReplyApplied,
  noticeWasSent,
  saveManualMetric,
  saveManualReviewRow,
  saveStoredEnquiry,
  saveVisibilityRow,
  staffReplyApplied,
} from '../community/store.ts'
import { canWrite, postedRole } from '../auth/roles.ts'
import { brandLogoPath } from '../config/brand.ts'
import { createAuditEvent } from '../domain/audit.ts'
import { parseManualMetric } from '../metrics/record.ts'
import { adapterFor } from '../providers/adapters.ts'
import { publishRun } from '../providers/publish-run.ts'
import { loadComments, loadEnquiries } from './inbox.ts'
import { renderAdmin, renderDashboard } from './render.ts'

export const DASHBOARD_HOST = '127.0.0.1'
export const DASHBOARD_PORT = 8787

const dashboardStore = memoryStore()
const desk = emptyDesk()

export async function applyDashboardAction(
  store: MemoryStore,
  fields: { action: string; reply?: string; id?: string },
): Promise<'recorded' | 'not-sent'> {
  if (fields.action === 'decide') {
    applyReply(store, fields.reply ?? '', 'Cindy McGillivray')
    return 'recorded'
  }
  if (fields.action === 'send') {
    try {
      await publishRun({
        store,
        id: fields.id ?? '',
        actorRole: 'PUBLISH',
        adapter: adapterFor({}),
      })
      return 'recorded'
    } catch {
      return 'not-sent'
    }
  }
  throw new Error('unknown action')
}

function note(event: string): void {
  // shortcut: one row per event name. Keep a history when the admin view needs repeated failures.
  if (dashboardStore.audits.some((item) => item.event === event)) return
  dashboardStore.audits.push(createAuditEvent({
    event,
    objectType: 'dashboard',
    objectId: event,
    actor: 'dashboard',
    result: 'failed',
    metadata: {},
  }))
}

function refuse(response: { writeHead: (code: number, headers: Record<string, string>) => void; end: (body?: string) => void }): void {
  response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
  response.end('Not allowed.')
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 4096) {
        request.destroy()
        reject(new Error('form too large'))
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

function repoFile(relative: string): Buffer {
  const local = new URL(`../../${relative}`, import.meta.url)
  if (existsSync(local)) return readFileSync(local)
  return readFileSync(new URL(relative, pathToFileURL(`${process.cwd()}/`)))
}

export function dashboardUrl(request: { url?: string }): URL {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (url.pathname !== '/api' && url.pathname !== '/api/index') return url
  const next = url.searchParams.get('path')
  if (!next || !next.startsWith('/')) return url
  const rebuilt = new URL(next, 'http://127.0.0.1')
  url.searchParams.delete('path')
  for (const [key, value] of url.searchParams) rebuilt.searchParams.append(key, value)
  return rebuilt
}

export function handleDashboard(request: IncomingMessage, response: ServerResponse): void {
    const url = dashboardUrl(request)
    const path = url.pathname
    if (request.method === 'POST' && path === '/approvals') {
      void readBody(request)
        .then((body) => {
          const fields = new URLSearchParams(body)
          return applyDashboardAction(dashboardStore, {
            action: fields.get('action') ?? '',
            reply: fields.get('reply') ?? '',
            id: fields.get('id') ?? '',
          })
        })
        .then((result) => {
          if (result === 'not-sent') note('publish.failed')
          response.writeHead(303, { location: result === 'not-sent' ? '/?notice=not-sent' : '/' })
          response.end()
        })
        .catch(() => {
          response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
          response.end('That reply was not recorded.')
        })
      return
    }
    if (path === '/content/sample-generated-tip.jpg') {
      const body = repoFile('content/examples/sample-generated-tip.jpg')
      response.writeHead(200, { 'content-type': 'image/jpeg' })
      response.end(body)
      return
    }
    const logo = path.startsWith('/brand/') ? brandLogoPath(path.slice('/brand/'.length)) : undefined
    if (logo) {
      const name = logo.slice('/brand/'.length)
      const body = repoFile(`brand/${name}`)
      const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg'
      response.writeHead(200, { 'content-type': type })
      response.end(body)
      return
    }
    if (request.method === 'POST' && path === '/inbox') {
      void readBody(request)
        .then(() => {
          response.writeHead(303, { location: '/?notice=inbox-not-sent' })
          response.end()
        })
        .catch(() => {
          response.writeHead(303, { location: '/?notice=inbox-not-sent' })
          response.end()
        })
      return
    }
    if (request.method === 'POST' && path === '/metrics') {
      void readBody(request)
        .then(async (body) => {
          const fields = new URLSearchParams(body)
          if (!canWrite(postedRole(fields.get('role')))) {
            refuse(response)
            return
          }
          await saveManualMetric(parseManualMetric(fields))
          response.writeHead(303, { location: '/admin' })
          response.end()
        })
        .catch(() => {
          response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
          response.end('That was not recorded.')
        })
      return
    }
    if (request.method === 'POST' && (path === '/reviews' || path === '/visibility')) {
      void readBody(request)
        .then(async (body) => {
          const fields = new URLSearchParams(body)
          if (!canWrite(postedRole(fields.get('role')))) {
            refuse(response)
            return
          }
          applyCommunityPost(path, {
            text: fields.get('text'),
            field: fields.get('field'),
            observed: fields.get('observed'),
          }, desk)
          const review = desk.reviews.at(-1)
          const check = desk.checks.at(-1)
          if (path === '/reviews' && review) await saveManualReviewRow(review)
          if (path === '/visibility' && check) await saveVisibilityRow(check)
          response.writeHead(303, { location: '/' })
          response.end()
        })
        .catch(() => {
          response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
          response.end('That was not recorded.')
        })
      return
    }
    if (request.method === 'GET' && path === '/admin') {
      void loadSwitchRows()
        .then((switches) => {
          response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
          response.end(renderAdmin(dashboardStore.audits, switches))
        })
        .catch(() => {
          response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
          response.end(renderAdmin(dashboardStore.audits, []))
        })
      return
    }
    const notice = url.searchParams.get('notice') ?? undefined
    void Promise.all([loadEnquiries(), loadComments(), loadCommunityDesk().catch(() => desk), loadManualMetrics()])
      .then(async ([enquiries, comments, loaded, metrics]) => {
        if (comments.audit && dashboardStore.audits.at(-1)?.event !== 'community.comments') {
          dashboardStore.audits.push(createAuditEvent({
            event: 'community.comments',
            objectType: 'enquiry',
            objectId: 'comments',
            actor: 'dashboard',
            result: 'failed',
            metadata: { detail: comments.audit },
          }))
        }
        if (loaded.reviews.length > 0 || loaded.checks.length > 0) {
          desk.reviews.splice(0, desk.reviews.length, ...loaded.reviews)
          desk.checks.splice(0, desk.checks.length, ...loaded.checks)
        }
        if (metrics.length === 0) note('metrics.empty')
        let items = await prepareEnquiries([...enquiries, ...comments.items], {
          load: loadStoredEnquiry,
          save: saveStoredEnquiry,
          noticeSent: noticeWasSent,
          markNotice: markNoticeSent,
          draft: draftWithMarketingModel,
          notify: notifyCindy,
        }).catch(() => [...enquiries, ...comments.items])
        const staff = await latestStaffText().catch(() => null)
        if (staff && !(await staffReplyApplied(staff.id))) {
          const applied = applyStaffReply(items, staff.text)
          if (applied) {
            await saveStoredEnquiry(applied.key, applied.item, true)
            await markStaffReplyApplied(staff.id)
            items = applied.items
          }
        }
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        response.end(renderDashboard(dashboardStore, notice, items, desk, metrics))
      })
      .catch(() => {
        note('inbox.failed')
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        response.end(renderDashboard(dashboardStore, notice))
      })
}

export function startDashboard(): void {
  if (DASHBOARD_HOST !== '127.0.0.1') {
    throw new Error('dashboard host must be 127.0.0.1')
  }
  const server = createServer(handleDashboard)
  const appEnv = process.env.APP_ENV
  console.error(appEnv === 'local' || appEnv === 'test' || appEnv === 'production' ? `APP_ENV ${appEnv}` : 'APP_ENV missing')
  server.listen(DASHBOARD_PORT, DASHBOARD_HOST)
}

const entry = process.argv[1]
if (entry && entry.endsWith('serve.ts') && import.meta.url === pathToFileURL(entry).href) {
  startDashboard()
}
