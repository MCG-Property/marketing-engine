import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { routeEnquiry } from '../src/community/intake.ts'
import { loadComments, loadEnquiries, sendEnquiryReply } from '../src/dashboard/inbox.ts'
import { renderDashboard } from '../src/dashboard/render.ts'

const env = { META_PAGE_ID: '109', META_PAGE_ACCESS_TOKEN: 'EAASECRET', META_INSTAGRAM_ACCOUNT_ID: '999' }

test('a page thread shows its class and the default page has no reply form', async () => {
  const text = 'Is the inspection still on?'
  const html = renderDashboard(undefined, undefined, [{
    channel: 'Messenger',
    personId: '555',
    person: 'Alex',
    text,
    externalId: null,
    ...routeEnquiry(text),
  }])
  assert.match(html, /Messenger · Alex/)
  assert.match(html, /PROPERTY_ENQUIRY/)
  assert.match(html, /Held/)
  assert.equal(html.includes('action="/inbox"'), false)
  assert.equal(html.includes('Send reply'), false)
  assert.match(renderDashboard(), /No enquiries yet\./)

  const requests: string[] = []
  const loaded = await loadEnquiries(env, async (input) => {
    const url = String(input instanceof Request ? input.url : input)
    requests.push(url)
    assert.equal(url.includes('EAASECRET'), false)
    assert.equal(url.includes('access_token'), false)
    const platform = new URL(url).searchParams.get('platform')
    const payload = platform === 'messenger'
      ? { data: [{ id: 't1', participants: { data: [{ id: '109', name: 'MCG' }, { id: '555', name: 'Alex' }] }, messages: { data: [{ message: 'Hello' }] } }] }
      : { data: [] }
    return new Response(JSON.stringify(payload))
  })
  assert.deepEqual(loaded, [{
    channel: 'Messenger',
    personId: '555',
    person: 'Alex',
    text: 'Hello',
    externalId: 't1',
    ...routeEnquiry('Hello'),
  }])
  assert.equal(requests.length, 2)
})

test('a reply stays unsent until it is approved and the community switch is on', async () => {
  let called = false
  const blocked = async () => {
    called = true
    return new Response('{}', { status: 200 })
  }
  assert.equal(await sendEnquiryReply({ personId: '555', text: 'Yes' }, env, blocked), 'not-sent')
  assert.equal(await sendEnquiryReply({ personId: '555', text: 'Yes', approved: true }, env, blocked), 'not-sent')
  assert.equal(called, false)

  let body = ''
  const sent = await sendEnquiryReply(
    { personId: '555', text: 'Call the office', approved: true },
    env,
    async (input, init) => {
      const url = String(input instanceof Request ? input.url : input)
      assert.equal(url.includes('EAASECRET'), false)
      assert.equal(url.includes('access_token'), false)
      body = String(init?.body)
      return new Response('{}', { status: 200 })
    },
    [{ name: 'COMMUNITY_REPLY_ENABLED', enabled: true }],
  )
  assert.equal(sent, 'sent')
  assert.equal(JSON.parse(body).message.text, 'Call the office')
})

test('a comment uses the same classes and a Graph error adds no comment', async () => {
  const loaded = await loadComments(env, async (input) => {
    const url = String(input instanceof Request ? input.url : input)
    assert.equal(url.includes('EAASECRET'), false)
    if (url.includes('/feed')) {
      return new Response(JSON.stringify({
        data: [{ comments: { data: [{ id: 'c1', message: 'Thanks, that was wonderful', from: { id: '555', name: 'Alex' } }] } }],
      }))
    }
    return new Response(JSON.stringify({ data: [] }))
  })
  assert.equal(loaded.audit, null)
  assert.equal(loaded.items.length, 1)
  assert.equal(loaded.items[0]?.classification, 'POSITIVE_COMMENT')
  assert.equal(loaded.items[0]?.externalId, 'c1')

  const failed = await loadComments(env, async () => new Response(JSON.stringify({ error: { message: 'EAASECRET broke' } }), { status: 400 }))
  assert.deepEqual(failed.items, [])
  assert.equal(failed.audit, 'Comments could not be loaded.')
  assert.equal(failed.audit.includes('EAA'), false)
})

test('the dashboard source does not send a customer reply', () => {
  const server = readFileSync(new URL('../src/dashboard/serve.ts', import.meta.url), 'utf8')
  assert.equal(server.includes('sendEnquiryReply'), false)
})
