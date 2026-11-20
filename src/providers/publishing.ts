import { canPublish, type Role } from '../auth/roles.ts'
import type { KillSwitches } from '../config/kill-switches.ts'
import type { ApprovalRecord } from '../domain/approval.ts'
import type { ContentStatus } from '../domain/content-state.ts'

export type PublishCommand = {
  status: ContentStatus
  currentVersion: number
  approval: ApprovalRecord | null
  idempotencyKey: string
  usedKeys: ReadonlySet<string>
  actorRole: Role
  flags: KillSwitches
}

export function beginPublish(command: PublishCommand): 'PUBLISHING' {
  if (!command.flags.PUBLISHING_ENABLED) {
    throw new Error('PUBLISHING_ENABLED is false')
  }
  if (command.status !== 'APPROVED' && command.status !== 'SCHEDULED') {
    throw new Error(`cannot publish from ${command.status}`)
  }
  const approval = command.approval
  if (
    !approval ||
    approval.voided ||
    approval.decision !== 'Y' ||
    approval.draftVersion !== command.currentVersion
  ) {
    throw new Error('approval does not match this version')
  }
  if (command.usedKeys.has(command.idempotencyKey)) {
    throw new Error('duplicate publish')
  }
  if (!canPublish(command.actorRole)) {
    throw new Error('role cannot publish')
  }
  return 'PUBLISHING'
}
