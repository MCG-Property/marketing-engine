import assert from 'node:assert/strict'
import test from 'node:test'
import { decide, revise, type ContentSnapshot } from '../src/domain/approval.ts'

function waiting(): ContentSnapshot {
  return { id: 'C104', status: 'AWAITING_APPROVAL', currentVersion: 1 }
}

test('Y, N, and C follow the approval edges', () => {
  const yes = decide({
    content: waiting(),
    decision: 'Y',
    approver: 'mcg',
    existing: [],
    approvalId: 'a1',
  })
  assert.equal(yes.content.status, 'APPROVED')
  assert.equal(yes.approval?.draftVersion, 1)

  const no = decide({
    content: waiting(),
    decision: 'N',
    approver: 'mcg',
    existing: [],
    approvalId: 'a2',
  })
  assert.equal(no.content.status, 'REJECTED')

  const change = decide({
    content: waiting(),
    decision: 'C',
    approver: 'mcg',
    changeInstruction: 'shorter',
    existing: [],
    approvalId: 'a3',
  })
  assert.equal(change.content.status, 'REVISION_REQUESTED')
  assert.equal(change.approval?.changeInstruction, 'shorter')
})

test('a second Y for the same version does not create another approval', () => {
  const first = decide({
    content: waiting(),
    decision: 'Y',
    approver: 'mcg',
    existing: [],
    approvalId: 'a1',
  })
  const second = decide({
    content: waiting(),
    decision: 'Y',
    approver: 'mcg',
    existing: [first.approval!],
    approvalId: 'a2',
  })
  assert.equal(second.approval, null)
  assert.equal(second.content.status, 'AWAITING_APPROVAL')
  const again = decide({
    content: first.content,
    decision: 'Y',
    approver: 'mcg',
    existing: [first.approval!],
    approvalId: 'a3',
  })
  assert.equal(again.approval, null)
  assert.equal(again.content.status, 'APPROVED')
})

test('an edit after approval voids that Y and returns to draft', () => {
  const first = decide({
    content: waiting(),
    decision: 'Y',
    approver: 'mcg',
    existing: [],
    approvalId: 'a1',
  })
  const edited = revise(first.content, [first.approval!])
  assert.equal(edited.content.status, 'DRAFT')
  assert.equal(edited.content.currentVersion, 2)
  assert.equal(edited.approvals[0]?.voided, true)
})
