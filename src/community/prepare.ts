import { parseStaffReply, whatsappNotice, type RoutedEnquiry } from './intake.ts'
import type { Enquiry } from '../dashboard/inbox.ts'

export type StoredEnquiry = {
  suggestedReply: string | null
  status: RoutedEnquiry['status']
}

export type EnquiryDeps = {
  load: (key: string) => Promise<StoredEnquiry | null>
  save: (key: string, item: Enquiry) => Promise<void>
  noticeSent: (key: string) => Promise<boolean>
  markNotice: (key: string) => Promise<void>
  draft: (text: string) => Promise<string | null>
  notify: (text: string) => Promise<'sent' | 'not-sent'>
}

export function enquiryKey(item: Pick<Enquiry, 'channel' | 'externalId' | 'personId'>): string {
  return `${item.channel}:${item.externalId ?? item.personId}`
}

export async function prepareEnquiries(items: readonly Enquiry[], deps: EnquiryDeps): Promise<Enquiry[]> {
  const prepared: Enquiry[] = []
  for (const item of items) {
    const key = enquiryKey(item)
    const saved = await deps.load(key)
    let next = item
    if (saved && (saved.suggestedReply || saved.status !== 'draft')) {
      next = { ...item, suggestedReply: saved.suggestedReply, status: saved.status }
    } else if (item.status === 'draft') {
      const drafted = await deps.draft(item.text)
      if (drafted) next = { ...item, suggestedReply: drafted }
    }
    await deps.save(key, next)
    if (next.status === 'draft' || next.status === 'escalated') {
      if (!(await deps.noticeSent(key))) {
        const result = await deps.notify(whatsappNotice(next))
        if (result === 'sent') await deps.markNotice(key)
      }
    }
    prepared.push(next)
  }
  return prepared
}

export function applyStaffReply(items: readonly Enquiry[], reply: string): { items: Enquiry[]; key: string; item: Enquiry } | null {
  const found = items.map((item, index) => ({ item, index })).reverse().find(({ item }) => item.status === 'draft')
  if (!found) return null
  const decision = parseStaffReply(reply, found.item.suggestedReply)
  const item = {
    ...found.item,
    suggestedReply: decision.text,
    status: decision.decision === 'reject' ? 'ignored' as const : 'draft' as const,
  }
  return {
    key: enquiryKey(item),
    item,
    items: items.map((current, index) => index === found.index ? item : current),
  }
}
