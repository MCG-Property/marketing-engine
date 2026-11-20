export type ApprovalMessage = {
  id: string
  template: string
  title: string
  caption: string
  schedule: string | null
}

export function approvalMessage(item: ApprovalMessage): string {
  return [
    `MCG CONTENT APPROVAL #${item.id}`,
    '',
    'Facebook + Instagram',
    `Schedule: ${item.schedule ?? 'not set'}`,
    '',
    item.template,
    item.title,
    '',
    'Caption:',
    item.caption,
    '',
    'Reply:',
    'Y = Approve',
    'N = Reject',
    'C = Change',
  ].join('\n')
}
