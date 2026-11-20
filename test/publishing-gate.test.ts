import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_KILL_SWITCHES } from '../src/config/kill-switches.ts'
import type { ApprovalRecord } from '../src/domain/approval.ts'
import { idempotencyKey } from '../src/domain/idempotency.ts'
import { beginPublish, type PublishCommand } from '../src/providers/publishing.ts'

function command(overrides: Partial<PublishCommand> = {}): PublishCommand {
  return {
    status: 'APPROVED',
    currentVersion: 1,
    approval: approval(),
    idempotencyKey: idempotencyKey('C104', 1, 'publish'),
    usedKeys: new Set(),
    actorRole: 'PUBLISH',
    flags: { ...DEFAULT_KILL_SWITCHES, PUBLISHING_ENABLED: true },
    ...overrides,
  }
}

function approval(overrides: Partial<ApprovalRecord> = {}): ApprovalRecord {
  return {
    approvalId: 'a1',
    contentId: 'C104',
    draftVersion: 1,
    approver: 'mcg',
    decision: 'Y',
    changeInstruction: null,
    voided: false,
    ...overrides,
  }
}

test('publishing is blocked when the kill switch is off', () => {
  assert.throws(() => beginPublish(command({ flags: DEFAULT_KILL_SWITCHES })), /PUBLISHING_ENABLED/)
})

test('publishing rejects the wrong state, a stale version, a duplicate, and a weak role', () => {
  assert.throws(() => beginPublish(command({ status: 'DRAFT' })), /cannot publish from DRAFT/)
  assert.throws(
    () => beginPublish(command({ approval: approval({ draftVersion: 0 }) })),
    /approval does not match/,
  )
  assert.throws(
    () => beginPublish(command({ usedKeys: new Set([idempotencyKey('C104', 1, 'publish')]) })),
    /duplicate publish/,
  )
  assert.throws(() => beginPublish(command({ actorRole: 'WRITE' })), /role cannot publish/)
  assert.throws(() => beginPublish(command({ approval: approval({ voided: true }) })), /approval does not match/)
})

test('an enabled switch and a matching Y enter PUBLISHING', () => {
  assert.equal(beginPublish(command()), 'PUBLISHING')
  assert.equal(beginPublish(command({ status: 'SCHEDULED', actorRole: 'ADMIN' })), 'PUBLISHING')
})
