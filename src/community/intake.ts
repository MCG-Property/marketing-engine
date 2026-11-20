import { projectConfig } from '../config/project-config.ts'

export const CLASSIFICATIONS = [
  'PROPERTY_ENQUIRY',
  'GENERAL_QUESTION',
  'SALES_LEAD',
  'SUPPORT',
  'POSITIVE_COMMENT',
  'COMPLAINT',
  'REPUTATIONAL_RISK',
  'SPAM',
  'UNKNOWN',
] as const

export type Classification = (typeof CLASSIFICATIONS)[number]

const RULES: readonly [Classification, RegExp][] = [
  ['UNKNOWN', /kill switch|publishing_enabled|community_reply|ignore previous|system prompt|enable the switch|access token/i],
  ['SPAM', /crypto|viagra|buy followers|airdrop|seo service/i],
  ['REPUTATIONAL_RISK', /scam|fraud|lawyer|\bsue\b|disgrace|report you/i],
  ['COMPLAINT', /complaint|unhappy|terrible|refund|disappointed|worst/i],
  ['SALES_LEAD', /appraisal|valuation|sell my|list my|home worth/i],
  ['PROPERTY_ENQUIRY', /inspection|bedroom|listing|open home|for sale|for rent|\brent\b|\bproperty\b/i],
  ['SUPPORT', /opening hours|what time|where are you|phone number|your address|are you open|when are you open/i],
  ['POSITIVE_COMMENT', /\bthank|\bgreat\b|\blove\b|excellent|wonderful/i],
  ['GENERAL_QUESTION', /question|wondering|can you|could you/i],
]

export type RoutedEnquiry = {
  classification: Classification
  status: 'draft' | 'escalated' | 'ignored'
  suggestedReply: string | null
  assignedTo: string | null
}

export function classify(text: string): Classification {
  const value = text.trim()
  if (!value) return 'UNKNOWN'
  for (const [name, pattern] of RULES) {
    if (pattern.test(value)) return name
  }
  return 'UNKNOWN'
}

function draftFor(text: string): string {
  const words = text.replace(/\s+/g, ' ').trim().slice(0, 120)
  return `${words} — ${projectConfig.businessName}, ${projectConfig.phone}, ${projectConfig.openingHours}`
}

export function routeEnquiry(text: string): RoutedEnquiry {
  const classification = classify(text)
  if (classification === 'COMPLAINT' || classification === 'REPUTATIONAL_RISK') {
    return { classification, status: 'escalated', suggestedReply: null, assignedTo: 'Cindy McGillivray' }
  }
  if (classification === 'SPAM' || classification === 'UNKNOWN') {
    return { classification, status: 'ignored', suggestedReply: null, assignedTo: null }
  }
  const assignedTo = classification === 'PROPERTY_ENQUIRY' || classification === 'SALES_LEAD'
    ? 'Cindy McGillivray'
    : null
  return { classification, status: 'draft', suggestedReply: draftFor(text), assignedTo }
}

export function whatsappNotice(input: {
  channel: string
  classification: string
  suggestedReply: string | null
}): string {
  return `${input.channel} ${input.classification}. ${input.suggestedReply ?? 'No reply.'}`
}

export type StaffReply = {
  decision: 'approve' | 'reject' | 'replace'
  text: string | null
}

export function parseStaffReply(reply: string, draft: string | null): StaffReply {
  const trimmed = reply.trim()
  if (/^(y|yes|approve)$/i.test(trimmed)) return { decision: 'approve', text: draft }
  if (/^(n|no|reject)$/i.test(trimmed)) return { decision: 'reject', text: null }
  if (!trimmed) return { decision: 'reject', text: null }
  return { decision: 'replace', text: trimmed.slice(0, 2000) }
}

// Tests pass a sender. The dashboard sends through the marketing profile home channel.
export async function deliverNotice(
  notice: string,
  send: (text: string) => Promise<'sent' | 'not-sent'>,
): Promise<'sent' | 'not-sent'> {
  return send(notice)
}
