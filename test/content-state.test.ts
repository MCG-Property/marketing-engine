import assert from 'node:assert/strict'
import test from 'node:test'
import { CONTENT_STATUSES, transition, type ContentStatus } from '../src/domain/content-state.ts'
import { beginPublish } from '../src/providers/publishing.ts'
import { DEFAULT_KILL_SWITCHES } from '../src/config/kill-switches.ts'
import type { ApprovalRecord } from '../src/domain/approval.ts'

const happy = [
  ['IDEA', 'DRAFT'],
  ['DRAFT', 'READY_FOR_REVIEW'],
  ['READY_FOR_REVIEW', 'AWAITING_APPROVAL'],
  ['AWAITING_APPROVAL', 'APPROVED'],
  ['APPROVED', 'SCHEDULED'],
  ['PUBLISHING', 'PUBLISHED'],
] as const

test('happy path reaches PUBLISHED only through the publish gate', () => {
  let status: ContentStatus = 'IDEA'
  for (const [from, to] of happy) {
    if (from === 'PUBLISHING') {
      assert.throws(() => transition('SCHEDULED', 'PUBLISHING'), /illegal transition/)
      status = beginPublish({
        status: 'SCHEDULED',
        currentVersion: 1,
        approval: approval(),
        idempotencyKey: 'item:1:publish',
        usedKeys: new Set(),
        actorRole: 'PUBLISH',
        flags: { ...DEFAULT_KILL_SWITCHES, PUBLISHING_ENABLED: true },
      })
      assert.equal(status, 'PUBLISHING')
    }
    status = transition(from === 'PUBLISHING' ? status : from, to)
  }
  assert.equal(status, 'PUBLISHED')
  assert.equal(CONTENT_STATUSES.length, 12)
})

test('illegal edges fail', () => {
  assert.throws(() => transition('IDEA', 'PUBLISHED'), /illegal transition IDEA -> PUBLISHED/)
  assert.throws(() => transition('APPROVED', 'PUBLISHING'), /illegal transition/)
})

function approval(): ApprovalRecord {
  return {
    approvalId: 'a1',
    contentId: 'item',
    draftVersion: 1,
    approver: 'mcg',
    decision: 'Y',
    changeInstruction: null,
    voided: false,
  }
}
