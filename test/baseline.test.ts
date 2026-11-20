import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { accessInventory } from '../src/baseline/access.ts'
import { calendar, SAMPLE_MONTH } from '../src/baseline/calendar.ts'
import { brandLogoPath } from '../src/config/brand.ts'
import { ideas } from '../src/baseline/ideas.ts'
import { baselineMetrics } from '../src/baseline/metrics.ts'
import { CONTENT_PILLARS } from '../src/config/project-config.ts'

test('each pillar has one sample idea and no price', () => {
  assert.equal(ideas.length, CONTENT_PILLARS.length)
  for (const pillar of CONTENT_PILLARS) {
    const idea = ideas.find((item) => item.pillar === pillar)
    assert.ok(idea)
    assert.match(idea.title, /Sample/)
    assert.equal(idea.sample, true)
    assert.equal('price' in idea, false)
  }
})

test('there is no campaign calendar', () => {
  assert.equal(calendar.length, 0)
})

test('logo paths stay inside the brand set', () => {
  assert.equal(brandLogoPath('logo-wide.jpg'), '/brand/logo-wide.jpg')
  assert.equal(brandLogoPath('../.env'), undefined)
  assert.equal(brandLogoPath('logo-wide.jpg/../../.env'), undefined)
})

test('no access system is connected', () => {
  const names = [
    'Facebook',
    'Instagram',
    'Buffer',
    'Meta direct publishing',
    'Google Business Profile',
    'GA4',
    'model provider',
    'listing source',
    'approval transport',
    'database host',
    'dashboard host',
  ]
  assert.deepEqual(
    accessInventory.map((row) => row.name),
    names,
  )
  for (const row of accessInventory) {
    assert.equal(['manual', 'missing', 'unassigned'].includes(row.status), true)
  }
})

test('baseline metrics are zeros from no source', () => {
  assert.deepEqual(
    baselineMetrics.map((row) => row.channel),
    ['facebook', 'instagram'],
  )
  for (const row of baselineMetrics) {
    assert.equal(row.month, SAMPLE_MONTH)
    assert.equal(row.posts, 0)
    assert.equal(row.reach, 0)
    assert.equal(row.source, 'none')
  }
})

test('integration map names every system and the open publish conditions', () => {
  const map = readFileSync(new URL('../docs/decisions/0002-integration-map.md', import.meta.url), 'utf8')
  for (const row of accessInventory) {
    assert.match(map, new RegExp(row.name.replaceAll(' ', '\\s+')))
  }
  assert.match(map, /S0-1/)
  assert.match(map, /S0-2/)
})
