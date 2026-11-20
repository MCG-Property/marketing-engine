import assert from 'node:assert/strict'
import test from 'node:test'
import { canWrite, postedRole } from '../src/auth/roles.ts'
import { renderDashboard } from '../src/dashboard/render.ts'
import { parseManualMetric } from '../src/metrics/record.ts'
import { monthlyReport } from '../src/metrics/report.ts'
import { loadManualMetrics, saveManualMetric } from '../src/community/store.ts'
import { trackingLink } from '../src/metrics/utm.ts'

test('a tracking link uses the content item id', () => {
  const link = trackingLink('https://mcgproperty.com.au/', {
    id: 'C104',
    channel: 'facebook',
    pillar: 'property and market education',
  })
  const url = new URL(link)
  assert.equal(url.searchParams.get('utm_source'), 'facebook')
  assert.equal(url.searchParams.get('utm_medium'), 'social')
  assert.equal(url.searchParams.get('utm_campaign'), 'C104')
  assert.equal(url.searchParams.get('utm_content'), 'property and market education')
  assert.equal(link.includes('example'), false)
  assert.throws(() => trackingLink('https://mcgproperty.com.au/', { id: ' ', channel: 'instagram', pillar: 'x' }))
})

test('each role can or cannot record', () => {
  for (const role of ['READ', null, 'visitor']) assert.equal(canWrite(postedRole(role)), false)
  for (const role of ['WRITE', 'PUBLISH', 'ADMIN']) assert.equal(canWrite(postedRole(role)), true)
})

test('a blank metric stays zero and only the saved channel is manual', async () => {
  const row = parseManualMetric(new URLSearchParams('date=2026-11-01&channel=facebook&posts=2'))
  assert.equal(row.reach, 0)
  assert.equal(row.engagement, 0)
  assert.equal(row.source, 'manual')
  assert.throws(() => parseManualMetric(new URLSearchParams('date=2026-11-01&channel=facebook&posts=1.5')))
  const page = renderDashboard(undefined, undefined, [], { reviews: [], checks: [] }, [row])
  assert.match(page, /<li>Facebook 2026-11-01: posts 2, reach 0, engagement 0\. Source manual\.<\/li>/)
  assert.match(page, /<li>Instagram: no posts or reach yet<\/li>/)
  if (process.env.DATABASE_URL) return
  await saveManualMetric(row)
  const loaded = await loadManualMetrics()
  assert.equal(loaded.find((item) => item.channel === 'facebook' && item.metricDate === '2026-11-01')?.posts, 2)
  assert.equal(loaded.some((item) => item.channel === 'instagram'), false)
})

test('a zero report adds no result and a higher engagement names that channel', () => {
  const zeroes = monthlyReport([], [])
  assert.equal(/\bprice\b|\bsold\b|\$|["“”]/.test(zeroes), false)
  assert.match(zeroes, /WHAT HAPPENED\nFacebook posts 0, reach 0, engagement 0\. Instagram posts 0, reach 0, engagement 0\./)
  assert.match(zeroes, /WHAT WORKED\nno difference/)
  assert.match(zeroes, /WHAT DIDN'T\nno difference/)
  assert.match(zeroes, /WHAT GENERATED ENQUIRIES\nnone recorded/)
  assert.match(zeroes, /WHAT NEEDS ATTENTION\nfigures are not recorded/)
  assert.match(zeroes, /WHAT TO TEST NEXT\n$/)
  const named = monthlyReport([{ channel: 'instagram', posts: 1, reach: 4, engagement: 3 }], [])
  assert.match(named, /WHAT WORKED\nInstagram/)
  assert.match(named, /WHAT DIDN'T\nFacebook/)
})
