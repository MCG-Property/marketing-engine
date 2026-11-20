import assert from 'node:assert/strict'
import test from 'node:test'
import { approvalMessage } from '../src/approval/message.ts'
import {
  applyReply,
  cancelScheduled,
  editDraft,
  memoryStore,
  scheduleDraft,
  submitForApproval,
  type ApprovalDraft,
} from '../src/approval/queue.ts'

function draft(overrides: Partial<ApprovalDraft> = {}): ApprovalDraft {
  return {
    id: 'C104',
    status: 'DRAFT',
    currentVersion: 1,
    sample: false,
    template: 'PROPERTY TIP',
    title: 'Prepare the home',
    caption: 'Clear the benches.',
    schedule: null,
    ...overrides,
  }
}

function queue(item = draft()) {
  const store = memoryStore()
  store.items.set(item.id, item)
  return store
}

test('a real draft can be approved and scheduled', () => {
  const store = queue()
  assert.equal(submitForApproval(store, 'C104').status, 'AWAITING_APPROVAL')
  assert.equal(applyReply(store, 'Y', 'Cindy').status, 'APPROVED')
  assert.equal(scheduleDraft(store, 'C104', null).status, 'APPROVED')
  assert.equal(scheduleDraft(store, 'C104', 'Friday 10:00 am').status, 'SCHEDULED')
  assert.match(approvalMessage(store.items.get('C104')!), /MCG CONTENT APPROVAL #C104/)
  assert.match(approvalMessage(store.items.get('C104')!), /Facebook \+ Instagram/)
  assert.match(store.audits.map((event) => event.event).join(' '), /approval/)
})

test('reject, change, and a second approval follow the queue rules', () => {
  const rejected = queue()
  submitForApproval(rejected, 'C104')
  assert.equal(applyReply(rejected, 'N C104', 'Cindy').status, 'REJECTED')

  const changed = queue()
  submitForApproval(changed, 'C104')
  assert.throws(() => applyReply(changed, 'C C104', 'Cindy'), /change needs an instruction/)
  assert.equal(changed.items.get('C104')?.status, 'AWAITING_APPROVAL')
  const revised = applyReply(changed, 'C C104 Make it shorter', 'Cindy')
  assert.equal(revised.status, 'DRAFT')
  assert.equal(revised.currentVersion, 2)
  submitForApproval(changed, 'C104')
  assert.equal(applyReply(changed, 'Y C104', 'Cindy').status, 'APPROVED')

  const doubled = queue()
  submitForApproval(doubled, 'C104')
  applyReply(doubled, 'Y C104', 'Cindy')
  const again = applyReply(doubled, 'Y C104', 'Cindy')
  assert.equal(again.status, 'APPROVED')
  assert.equal(doubled.approvals.filter((row) => row.decision === 'Y').length, 1)
})

test('an edit after approval voids that Y, and cancellation unschedules', () => {
  const store = queue()
  submitForApproval(store, 'C104')
  applyReply(store, 'Y', 'Cindy')
  const edited = editDraft(store, 'C104')
  assert.equal(edited.status, 'DRAFT')
  assert.equal(edited.currentVersion, 2)
  assert.equal(store.approvals[0]?.voided, true)

  const scheduled = queue(draft({ id: 'C105' }))
  submitForApproval(scheduled, 'C105')
  applyReply(scheduled, 'Y', 'Cindy')
  scheduleDraft(scheduled, 'C105', 'Friday 10:00 am')
  const cancelled = cancelScheduled(scheduled, 'C105')
  assert.equal(cancelled.status, 'DRAFT')
  assert.equal(cancelled.currentVersion, 2)
})

test('a sample or a missing source cannot be submitted', () => {
  const sample = queue(draft({ sample: true }))
  assert.throws(() => submitForApproval(sample, 'C104'), /sample cannot be submitted/)
  assert.equal(sample.items.get('C104')?.status, 'DRAFT')
  const missing = queue(draft({ id: 'C106', missing: 'MISSING_SOURCE_DATA' }))
  assert.throws(() => submitForApproval(missing, 'C106'), /sample cannot be submitted/)
})

test('shorthand Y works only when one post is waiting', () => {
  const store = queue()
  store.items.set('C105', draft({ id: 'C105' }))
  submitForApproval(store, 'C104')
  submitForApproval(store, 'C105')
  assert.throws(() => applyReply(store, 'Y', 'Cindy'), /unrecognised/)
  applyReply(store, 'N C105', 'Cindy')
  assert.equal(applyReply(store, 'Y', 'Cindy').id, 'C104')
})
