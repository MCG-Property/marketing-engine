export type ReportRow = { channel: string; posts: number; reach: number; engagement: number }
export type ReportEnquiry = { classification: string; status: string }

function label(channel: string): string {
  if (channel === 'facebook') return 'Facebook'
  if (channel === 'instagram') return 'Instagram'
  return channel
}

function total(rows: readonly ReportRow[], channel: string, key: 'posts' | 'reach' | 'engagement'): number {
  return rows.filter((row) => row.channel === channel).reduce((sum, row) => sum + row[key], 0)
}

export function monthlyReport(rows: readonly ReportRow[], enquiries: readonly ReportEnquiry[]): string {
  const happened = (['facebook', 'instagram'] as const)
    .map((channel) => `${label(channel)} posts ${total(rows, channel, 'posts')}, reach ${total(rows, channel, 'reach')}, engagement ${total(rows, channel, 'engagement')}`)
    .join('. ')
  const facebook = total(rows, 'facebook', 'engagement')
  const instagram = total(rows, 'instagram', 'engagement')
  const worked = facebook === instagram ? 'no difference' : facebook > instagram ? 'Facebook' : 'Instagram'
  const quiet = facebook === instagram ? 'no difference' : facebook > instagram ? 'Instagram' : 'Facebook'
  const counts = new Map<string, number>()
  for (const item of enquiries) counts.set(item.classification, (counts.get(item.classification) ?? 0) + 1)
  const generated = counts.size === 0 ? 'none recorded' : [...counts].map(([name, count]) => `${name} ${count}`).join(', ')
  const attention = enquiries.some((item) => item.status === 'escalated')
    ? 'escalated enquiries'
    : rows.length === 0 ? 'figures are not recorded' : 'nothing recorded'
  return [
    `WHAT HAPPENED\n${happened}.`,
    `WHAT WORKED\n${worked}`,
    `WHAT DIDN'T\n${quiet}`,
    `WHAT GENERATED ENQUIRIES\n${generated}`,
    `WHAT NEEDS ATTENTION\n${attention}`,
    'WHAT TO TEST NEXT\n',
  ].join('\n')
}
