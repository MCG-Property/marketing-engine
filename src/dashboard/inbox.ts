import { killSwitchesFromRows } from '../config/kill-switches.ts'
import { routeEnquiry, type RoutedEnquiry } from '../community/intake.ts'

export type Enquiry = {
  channel: string
  personId: string
  person: string
  text: string
  externalId: string | null
} & RoutedEnquiry

type GraphList<T> = { data?: T[] }
type GraphPerson = { id?: string; name?: string }
type GraphMessage = { message?: string; from?: GraphPerson }
type GraphThread = {
  id?: string
  participants?: GraphList<GraphPerson>
  messages?: GraphList<GraphMessage>
}
type GraphComment = { id?: string; message?: string; text?: string; from?: GraphPerson; username?: string }
type GraphPost = { comments?: GraphList<GraphComment> }
type GraphPayload = { data?: GraphThread[]; error?: { message?: string } }
type GraphPosts = { data?: GraphPost[]; error?: { message?: string } }

const VERSION = 'v22.0'

function clean(value: string | undefined): string {
  return (value ?? '').replace(/EAA[A-Za-z0-9]+/g, '').slice(0, 240)
}

function customerEnquiry(
  channel: string,
  personId: string,
  person: string,
  text: string,
  externalId: string | null,
): Enquiry {
  return { channel, personId, person, text, externalId, ...routeEnquiry(text) }
}

function failed(channel: string, text: string): Enquiry {
  return {
    channel,
    personId: '',
    person: channel,
    text,
    externalId: null,
    classification: 'UNKNOWN',
    status: 'ignored',
    suggestedReply: null,
    assignedTo: null,
  }
}

function threads(payload: GraphPayload, channel: string, ownIds: Set<string>): Enquiry[] {
  if (payload.error) {
    return [failed(channel, clean(payload.error.message) || 'Messages could not be loaded.')]
  }
  return (payload.data ?? []).flatMap((thread) => {
    const people = thread.participants?.data ?? []
    const person = people.find((item) => item.id && !ownIds.has(item.id))
    const latest = thread.messages?.data?.[0]
    if (!person?.id) return []
    return [customerEnquiry(channel, person.id, person.name || person.id, latest?.message || 'Attachment', thread.id ?? null)]
  })
}

function commentEnquiries(payload: GraphPosts, channel: string): Enquiry[] {
  if (payload.error) return []
  return (payload.data ?? []).flatMap((post) =>
    (post.comments?.data ?? []).flatMap((comment) => {
      const text = comment.message || comment.text
      if (!text) return []
      const id = comment.from?.id || ''
      const person = comment.from?.name || comment.username || channel
      return [customerEnquiry(channel, /^\d+$/.test(id) ? id : '', person, text, comment.id ?? null)]
    }),
  )
}

async function graphGet(
  url: URL,
  token: string,
  fetchImpl: typeof fetch,
): Promise<GraphPosts> {
  const response = await fetchImpl(url, { headers: { authorization: `Bearer ${token}` } })
  const payload = await response.json() as GraphPosts
  if (!response.ok || payload.error) return { error: { message: 'Comments could not be loaded.' } }
  return payload
}

export async function loadEnquiries(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<Enquiry[]> {
  const pageId = env.META_PAGE_ID
  const token = env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !token) return []
  const ownIds = new Set([pageId, env.META_INSTAGRAM_ACCOUNT_ID].filter((id): id is string => Boolean(id)))
  const loaded: Enquiry[] = []
  for (const platform of ['messenger', 'instagram'] as const) {
    const url = new URL(`https://graph.facebook.com/${VERSION}/${pageId}/conversations`)
    url.searchParams.set('platform', platform)
    url.searchParams.set('fields', 'participants,messages.limit(1){message,from}')
    url.searchParams.set('limit', '15')
    try {
      const response = await fetchImpl(url, { headers: { authorization: `Bearer ${token}` } })
      const payload = await response.json() as GraphPayload
      loaded.push(...threads(payload, platform === 'messenger' ? 'Messenger' : 'Instagram', ownIds))
    } catch {
      loaded.push(failed(platform, 'Messages could not be loaded.'))
    }
  }
  return loaded
}

export async function loadComments(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<{ items: Enquiry[]; audit: string | null }> {
  const pageId = env.META_PAGE_ID
  const token = env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !token) return { items: [], audit: null }
  const calls: { url: URL; channel: string }[] = []
  const feed = new URL(`https://graph.facebook.com/${VERSION}/${pageId}/feed`)
  feed.searchParams.set('fields', 'comments.limit(5){id,message,from}')
  feed.searchParams.set('limit', '5')
  calls.push({ url: feed, channel: 'Facebook comment' })
  if (env.META_INSTAGRAM_ACCOUNT_ID) {
    const media = new URL(`https://graph.facebook.com/${VERSION}/${env.META_INSTAGRAM_ACCOUNT_ID}/media`)
    media.searchParams.set('fields', 'comments.limit(5){id,text,username}')
    media.searchParams.set('limit', '5')
    calls.push({ url: media, channel: 'Instagram comment' })
  }
  const items: Enquiry[] = []
  let failed = false
  for (const call of calls) {
    try {
      const payload = await graphGet(call.url, token, fetchImpl)
      if (payload.error) {
        failed = true
        continue
      }
      items.push(...commentEnquiries(payload, call.channel))
    } catch {
      failed = true
    }
  }
  return { items, audit: failed ? 'Comments could not be loaded.' : null }
}

export async function sendEnquiryReply(
  input: { personId: string; text: string; approved?: boolean },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
  rows: readonly { name: string; enabled: boolean }[] = [],
): Promise<'sent' | 'not-sent'> {
  const flags = killSwitchesFromRows(rows)
  const text = input.text.trim().slice(0, 2000)
  if (!input.approved || !flags.COMMUNITY_REPLY_ENABLED) return 'not-sent'
  const pageId = env.META_PAGE_ID
  const token = env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !token || !text || !/^\d+$/.test(input.personId)) return 'not-sent'
  const response = await fetchImpl(`https://graph.facebook.com/${VERSION}/${pageId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: input.personId },
      message: { text },
      messaging_type: 'RESPONSE',
    }),
  })
  return response.ok ? 'sent' : 'not-sent'
}
