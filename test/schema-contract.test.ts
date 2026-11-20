import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { CONTENT_STATUSES } from '../src/domain/content-state.ts'
import { KILL_SWITCHES } from '../src/config/kill-switches.ts'

const sql = readFileSync(new URL('../db/migrations/001_foundation.sql', import.meta.url), 'utf8')

const tables = [
  'content_item',
  'approval',
  'publication',
  'enquiry',
  'review',
  'visibility_check',
  'metric',
  'audit_event',
  'kill_switch',
]

test('migration names the foundation tables, statuses, and closed kill switches', () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`create table ${table}\\b`))
  }
  for (const status of CONTENT_STATUSES) {
    assert.match(sql, new RegExp(`'${status}'`))
  }
  for (const name of KILL_SWITCHES) {
    assert.match(sql, new RegExp(`\\('${name}', false\\)`))
  }
  assert.match(sql, /approval_one_live_yes/)
  assert.match(sql, /publication \(channel, external_post_id\)/)
  assert.match(sql, /enquiry \(channel, external_message_id\)/)
  assert.match(sql, /review \(platform, external_review_id\)/)
})

test('model provider source has no publish path and no credential field', () => {
  const source = readFileSync(new URL('../src/providers/model.ts', import.meta.url), 'utf8')
  assert.equal(/publish|credential|api[_-]?key|token|secret/i.test(source), false)
})
