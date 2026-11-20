export type ManualMetric = {
  metricDate: string
  channel: 'facebook' | 'instagram'
  posts: number
  reach: number
  impressions: number
  engagement: number
  clicks: number
  enquiries: number
  reviews: number
  reviewRequests: number
  websiteSessions: number
  trackedConversions: number
  source: 'manual'
}

function wholeNumber(raw: string | null): number {
  if (raw == null || raw.trim() === '') return 0
  if (!/^\d{1,9}$/.test(raw.trim())) throw new Error('bad metric')
  return Number(raw)
}

export function parseManualMetric(fields: { get(name: string): string | null }): ManualMetric {
  const channel = fields.get('channel')
  if (channel !== 'facebook' && channel !== 'instagram') throw new Error('bad channel')
  const metricDate = fields.get('date') ?? ''
  const parsed = new Date(`${metricDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== metricDate) throw new Error('bad date')
  return {
    metricDate,
    channel,
    posts: wholeNumber(fields.get('posts')),
    reach: wholeNumber(fields.get('reach')),
    impressions: wholeNumber(fields.get('impressions')),
    engagement: wholeNumber(fields.get('engagement')),
    clicks: wholeNumber(fields.get('clicks')),
    enquiries: wholeNumber(fields.get('enquiries')),
    reviews: wholeNumber(fields.get('reviews')),
    reviewRequests: wholeNumber(fields.get('review_requests')),
    websiteSessions: wholeNumber(fields.get('website_sessions')),
    trackedConversions: wholeNumber(fields.get('tracked_conversions')),
    source: 'manual',
  }
}
