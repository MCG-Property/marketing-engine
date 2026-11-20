import { projectConfig } from '../config/project-config.ts'
import type { KillSwitches } from '../config/kill-switches.ts'

export type ManualReview = {
  platform: string
  reviewText: string
  suggestedReply: string
  approvalStatus: 'DRAFT'
  replyStatus: 'HELD'
}

export function recordManualReview(input: { platform: string; text: string }): ManualReview {
  return {
    platform: input.platform,
    reviewText: input.text.slice(0, 2000),
    suggestedReply: `Thank you for reviewing ${projectConfig.businessName}.`,
    approvalStatus: 'DRAFT',
    replyStatus: 'HELD',
  }
}

export function sendReviewReply(input: { approved: boolean; flags: KillSwitches }): void {
  assertReviewReplyAllowed(input)
}

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
