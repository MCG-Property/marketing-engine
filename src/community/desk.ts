import { recordManualReview, type ManualReview } from '../providers/reviews.ts'
import { checkVisibility, type VisibilityCheck } from './visibility.ts'

export type CommunityDesk = {
  reviews: ManualReview[]
  checks: VisibilityCheck[]
}

export function emptyDesk(): CommunityDesk {
  return { reviews: [], checks: [] }
}

export function applyCommunityPost(
  path: string,
  fields: { text?: string | null; field?: string | null; observed?: string | null },
  desk: CommunityDesk,
): void {
  if (path === '/reviews') {
    const text = fields.text?.trim() ?? ''
    if (text) desk.reviews.push(recordManualReview({ platform: 'manual', text }))
    return
  }
  if (path === '/visibility') {
    desk.checks.push(checkVisibility(fields.field ?? '', fields.observed ?? null))
  }
}
