export function trackingLink(
  website: string,
  item: { id: string; channel: 'facebook' | 'instagram'; pillar: string },
): string {
  const id = item.id.trim()
  if (id === '') throw new Error('content item id required')
  const url = new URL(website)
  url.searchParams.set('utm_source', item.channel)
  url.searchParams.set('utm_medium', 'social')
  url.searchParams.set('utm_campaign', id)
  url.searchParams.set('utm_content', item.pillar)
  return url.toString()
}
