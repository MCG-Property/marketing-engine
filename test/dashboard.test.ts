import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { memoryStore, submitForApproval, type ApprovalDraft } from '../src/approval/queue.ts'
import { escapeHtml, renderAdmin, renderDashboard } from '../src/dashboard/render.ts'
import { applyDashboardAction, dashboardUrl } from '../src/dashboard/serve.ts'
import { webHandler } from '../api/index.ts'

const html = renderDashboard()

test('escapes profile text', () => {
  assert.equal(escapeHtml(`<b>"&`), '&lt;b&gt;&quot;&amp;')
})

test('dashboard shows the marketing page and hides the engineering inventory', () => {
  assert.match(html, /Preview\. These are not live results\./)
  assert.match(html, /37-43 Kinghorne Street, Nowra NSW 2541/)
  assert.match(html, /02 4418 1330/)
  assert.match(html, /mcgproperty\.com\.au/)
  assert.match(html, /Monday to Friday, 9am to 6pm/)
  assert.match(html, /Real estate agency/)
  assert.match(html, /Cindy McGillivray, social media and branding/)
  assert.match(html, /Increase customer reach and land more leads/)
  assert.match(html, /No campaign dates\. Marketing is ongoing\./)
  assert.match(html, /Sample property tip — PROPERTY TIP/)
  assert.match(html, /Before the photographer arrives, clear the benches/)
  assert.match(html, /src="\/content\/sample-generated-tip\.jpg"/)
  assert.match(html, /Sample graphic\. This is not a photograph of a property\./)
  assert.match(html, /Sample listing — NEW LISTING/)
  assert.match(html, /Sample team profile — TEAM PROFILE/)
  assert.match(html, /src="\/brand\/logo-wide\.jpg"/)
  assert.match(html, /No posts are waiting for approval\./)
  assert.equal(html.includes('Y = Approve'), false)
  assert.match(html, /No enquiries yet\./)
  assert.match(html, /No reviews yet\./)
  assert.match(html, /No visibility checks yet\./)
  assert.equal(html.includes('Send reply'), false)
  assert.equal(html.includes('action="/inbox"'), false)
  assert.match(html, /not connected, so these are not results/)
  assert.equal(html.includes('Waiting for MCG'), false)
  assert.equal(html.includes('database host'), false)
  assert.equal(html.includes('unassigned'), false)
  const headings = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1])
  assert.deepEqual(headings, [
    'Business',
    'Content',
    'Drafts',
    'Approvals',
    'Enquiries',
    'Reviews',
    'Visibility',
    'Performance',
  ])
})

test('rendered page has no secrets or operations jargon', () => {
  for (const word of ['DATABASE_URL', 'token', 'cron', 'pg-boss', 'PUBLISHING_ENABLED']) {
    assert.equal(html.includes(word), false, word)
  }
  assert.equal(html.includes('/admin'), false)
  assert.equal(html.includes('inbox.failed'), false)
})

test('admin view keeps alerts and switches off the staff page', () => {
  const admin = renderAdmin(
    [{ event: 'inbox.failed', timestamp: '2026-11-20T00:00:00.000Z' }],
    [{ name: 'PUBLISHING_ENABLED', enabled: false }],
  )
  assert.match(admin, /inbox.failed/)
  assert.match(admin, /PUBLISHING_ENABLED: off/)
  assert.match(admin, /Worker stopped/)
  assert.equal(html.includes('inbox.failed'), false)
})

test('a real draft can be answered and a send does not go out', async () => {
  const store = memoryStore()
  const item: ApprovalDraft = {
    id: 'C104',
    status: 'DRAFT',
    currentVersion: 1,
    sample: false,
    template: 'PROPERTY TIP',
    title: 'Prepare the home',
    caption: 'Clear the benches.',
    schedule: null,
  }
  store.items.set(item.id, item)
  submitForApproval(store, 'C104')
  const queued = renderDashboard(store)
  assert.match(queued, /MCG CONTENT APPROVAL #C104/)
  assert.match(queued, /Y = Approve/)
  assert.match(queued, /Facebook \+ Instagram/)
  assert.equal(queued.includes('PUBLISHING_ENABLED'), false)
  assert.equal(await applyDashboardAction(store, { action: 'decide', reply: 'Y C104' }), 'recorded')
  assert.equal(store.items.get('C104')?.status, 'APPROVED')
  assert.equal(await applyDashboardAction(store, { action: 'send', id: 'C104' }), 'not-sent')
  assert.equal(store.publications.length, 0)
})

test('worker entry starts the queue process and does not publish', () => {
  const worker = readFileSync(new URL('../src/queue/serve.ts', import.meta.url), 'utf8')
  assert.match(worker, /startWorker/)
  assert.equal(worker.includes('beginPublish'), false)
})

test('the hosted handler returns the staff page', async () => {
  const response = await webHandler(new Request('http://127.0.0.1/?notice=not-sent'))
  const html = await response.text()
  assert.equal(response.status, 200)
  assert.match(html, /<h2>Performance<\/h2>/)
  assert.equal(html.includes('/admin'), false)
})

test('a hosted rewrite keeps the visitor path', () => {
  const url = dashboardUrl({ url: '/api?path=/admin&notice=not-sent' })
  assert.equal(url.pathname, '/admin')
  assert.equal(url.searchParams.get('notice'), 'not-sent')
  assert.equal(url.searchParams.get('path'), null)
})

test('server source is loopback and the page module does not publish', () => {
  const server = readFileSync(new URL('../src/dashboard/serve.ts', import.meta.url), 'utf8')
  const view = readFileSync(new URL('../src/dashboard/render.ts', import.meta.url), 'utf8')
  assert.match(server, /127\.0\.0\.1/)
  assert.equal(server.includes('0.0.0.0'), false)
  assert.match(server, /server\.listen\(DASHBOARD_PORT, DASHBOARD_HOST\)/)
  assert.match(server, /canWrite\(postedRole/)
  assert.match(server, /path === '\/admin'/)
  assert.match(server, /path === '\/metrics'/)
  const api = readFileSync(new URL('../api/index.ts', import.meta.url), 'utf8')
  const hosted = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
  assert.match(api, /handleDashboard/)
  assert.equal(hosted.includes('/api?path=/:path*'), true)
  assert.equal(hosted.includes('{src,brand,content/examples}/**'), true)
  for (const name of ['beginPublish', 'startWorker', 'createPool']) {
    assert.equal(view.includes(name), false, name)
    assert.equal(server.includes(name), false, name)
  }
})
