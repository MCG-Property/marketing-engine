import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { escapeHtml, renderDashboard } from '../src/dashboard/render.ts'

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
  assert.match(html, /Sample listing — NEW LISTING/)
  assert.match(html, /Sample team profile — TEAM PROFILE/)
  assert.match(html, /src="\/brand\/logo-wide\.jpg"/)
  assert.match(html, /Approval is not open yet\./)
  assert.match(html, /No enquiries yet\./)
  assert.match(html, /No reviews yet\./)
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
    'Results',
  ])
})

test('rendered page has no secrets or operations jargon', () => {
  for (const word of ['DATABASE_URL', 'token', 'cron', 'pg-boss']) {
    assert.equal(html.includes(word), false, word)
  }
})

test('worker entry starts the queue process and does not publish', () => {
  const worker = readFileSync(new URL('../src/queue/serve.ts', import.meta.url), 'utf8')
  assert.match(worker, /startWorker/)
  assert.equal(worker.includes('beginPublish'), false)
})

test('server source is loopback and the page module does not publish', () => {
  const server = readFileSync(new URL('../src/dashboard/serve.ts', import.meta.url), 'utf8')
  const view = readFileSync(new URL('../src/dashboard/render.ts', import.meta.url), 'utf8')
  assert.match(server, /127\.0\.0\.1/)
  assert.equal(server.includes('0.0.0.0'), false)
  assert.match(server, /server\.listen\(DASHBOARD_PORT, DASHBOARD_HOST\)/)
  for (const name of ['beginPublish', 'startWorker', 'createPool']) {
    assert.equal(view.includes(name), false, name)
    assert.equal(server.includes(name), false, name)
  }
})
