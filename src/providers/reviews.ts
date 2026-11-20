import type { KillSwitches } from '../config/kill-switches.ts'

export function assertReviewReplyAllowed(input: {
  approved: boolean
  flags: KillSwitches
}): void {
  if (!input.flags.REVIEW_REPLIES_ENABLED) {
    throw new Error('REVIEW_REPLIES_ENABLED is false')
  }
  if (!input.approved) {
    throw new Error('review reply requires approval')
  }
}
