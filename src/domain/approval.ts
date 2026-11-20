import { transition, type ContentStatus } from './content-state.ts'

export type Decision = 'Y' | 'N' | 'C'

export type ContentSnapshot = {
  id: string
  status: ContentStatus
  currentVersion: number
}

export type ApprovalRecord = {
  approvalId: string
  contentId: string
  draftVersion: number
  approver: string
  decision: Decision
  changeInstruction: string | null
  voided: boolean
}

const NEXT: Record<Decision, ContentStatus> = {
  Y: 'APPROVED',
  N: 'REJECTED',
  C: 'REVISION_REQUESTED',
}

export function decide(input: {
  content: ContentSnapshot
  decision: Decision
  approver: string
  changeInstruction?: string
  existing: readonly ApprovalRecord[]
  approvalId: string
}): { content: ContentSnapshot; approval: ApprovalRecord | null } {
  const liveYes = input.existing.find(
    (row) =>
      !row.voided &&
      row.decision === 'Y' &&
      row.draftVersion === input.content.currentVersion &&
      row.contentId === input.content.id,
  )
  if (input.decision === 'Y' && liveYes) {
    return { content: input.content, approval: null }
  }
  if (input.content.status !== 'AWAITING_APPROVAL') {
    throw new Error('decision requires AWAITING_APPROVAL')
  }
  return {
    content: {
      ...input.content,
      status: transition(input.content.status, NEXT[input.decision]),
    },
    approval: {
      approvalId: input.approvalId,
      contentId: input.content.id,
      draftVersion: input.content.currentVersion,
      approver: input.approver,
      decision: input.decision,
      changeInstruction: input.changeInstruction ?? null,
      voided: false,
    },
  }
}

/** A content edit voids the Y for the old version and returns the item to draft. */
export function revise(
  content: ContentSnapshot,
  approvals: readonly ApprovalRecord[],
): { content: ContentSnapshot; approvals: ApprovalRecord[] } {
  if (content.status === 'PUBLISHING') {
    throw new Error('cannot revise while publishing')
  }
  return {
    content: {
      ...content,
      currentVersion: content.currentVersion + 1,
      status: 'DRAFT',
    },
    approvals: approvals.map((row) =>
      row.decision === 'Y' && row.draftVersion === content.currentVersion && !row.voided
        ? { ...row, voided: true }
        : row,
    ),
  }
}
