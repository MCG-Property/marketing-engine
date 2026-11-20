import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { applyReply, memoryStore, submitForApproval, type ApprovalDraft } from '../src/approval/queue.ts'
import { idempotencyKey } from '../src/domain/idempotency.ts'
import { AdapterFailure, NotConfigured, adapterFor, bufferAdapter, metaAdapter } from '../src/providers/adapters.ts'
import { publishRun, type Queryable } from '../src/providers/publish-run.ts'

function approvedStore() {
  const store = memoryStore()
  const item: ApprovalDraft = {
    id: 'C104',
    status: 'DRAFT',
    currentVersion: 1,
    sample: false,
    template: 'PROPERTY TIP',
    title: 'Prepare the home',
    caption: 'Clear the benches.',
    schedule: null,
  }
  store.items.set(item.id, item)
  submitForApproval(store, 'C104')
  applyReply(store, 'Y', 'Cindy')
  const row = store.killRows.find((entry) => entry.name === 'PUBLISHING_ENABLED')
  if (!row) throw new Error('missing switch row')
  row.enabled = true
  return store
}

function calls() {
  const sent: string[] = []
  return {
    sent,
    adapter: {
      name: 'manual' as const,
      async send(input: { idempotencyKey: string }) {
        sent.push(input.idempotencyKey)
        return { receipt: `manual:${input.idempotencyKey}` }
      },
    },
  }
}

test('the default rows keep the adapter idle', async () => {
  const store = approvedStore()
  const row = store.killRows.find((entry) => entry.name === 'PUBLISHING_ENABLED')
  if (!row) throw new Error('missing switch row')
  row.enabled = false
  const probe = calls()
  await assert.rejects(publishRun({ store, id: 'C104', actorRole: 'PUBLISH', adapter: probe.adapter }), /PUBLISHING_ENABLED/)
  assert.deepEqual(probe.sent, [])
  assert.equal(store.publications.length, 0)
})

test('a reserved key is not sent twice', async () => {
  const store = approvedStore()
  const probe = calls()
  const key = idempotencyKey('C104', 1, 'publish')
  const first = await publishRun({ store, id: 'C104', actorRole: 'PUBLISH', adapter: probe.adapter })
  const second = await publishRun({ store, id: 'C104', actorRole: 'PUBLISH', adapter: probe.adapter })
  assert.equal(first.status, 'PUBLISHED')
  assert.equal(second.idempotencyKey, key)
  assert.deepEqual(probe.sent, [key])
})

test('a sample is not reserved', async () => {
  const store = approvedStore()
  const item = store.items.get('C104')
  if (!item) throw new Error('missing item')
  item.sample = true
  const probe = calls()
  await assert.rejects(publishRun({ store, id: 'C104', actorRole: 'PUBLISH', adapter: probe.adapter }), /sample cannot be submitted/)
  assert.deepEqual(probe.sent, [])
})

test('api, permission, and unknown results keep the same key', async () => {
  for (const failure of ['api', 'permission'] as const) {
    const store = approvedStore()
    const key = idempotencyKey('C104', 1, 'publish')
    const sent: string[] = []
    const row = await publishRun({
      store,
      id: 'C104',
      actorRole: 'PUBLISH',
      adapter: {
        name: 'manual',
        async send(input) {
          sent.push(input.idempotencyKey)
          throw new AdapterFailure(failure)
        },
      },
    })
    assert.equal(row.status, 'FAILED')
    assert.equal(row.error, failure)
    assert.equal(row.idempotencyKey, key)
    const again = await publishRun({
      store,
      id: 'C104',
      actorRole: 'PUBLISH',
      adapter: {
        name: 'manual',
        async send() {
          sent.push('again')
          return { receipt: 'nope' }
        },
      },
    })
    assert.equal(again, row)
    assert.deepEqual(sent, [key])
  }

  const store = approvedStore()
  const key = idempotencyKey('C104', 1, 'publish')
  const row = await publishRun({
    store,
    id: 'C104',
    actorRole: 'PUBLISH',
    adapter: { name: 'manual', async send() { return {} } },
  })
  assert.equal(row.status, 'PUBLISH_UNKNOWN')
  assert.equal(row.idempotencyKey, key)
  const repeat = await publishRun({
    store,
    id: 'C104',
    actorRole: 'ADMIN',
    adapter: { name: 'manual', async send() { return { receipt: 'second' } } },
  })
  assert.equal(repeat, row)
})

test('a conflicting insert does not call the adapter', async () => {
  const store = approvedStore()
  const key = idempotencyKey('C104', 1, 'publish')
  const sql: string[] = []
  const pool: Queryable = {
    async query(statement) {
      sql.push(statement)
      if (statement.startsWith('insert')) return { rows: [] }
      return {
        rows: [{
          publication_id: 'pub-C104-1',
          content_id: 'C104',
          channel: 'facebook+instagram',
          status: 'PUBLISHED',
          idempotency_key: key,
          error: null,
          external_post_id: 'manual:existing',
        }],
      }
    },
  }
  const sent: string[] = []
  const row = await publishRun({
    store,
    id: 'C104',
    actorRole: 'PUBLISH',
    adapter: {
      name: 'manual',
      async send(input) {
        sent.push(input.idempotencyKey)
        return { receipt: input.idempotencyKey }
      },
    },
    pool,
  })
  assert.equal(row.status, 'PUBLISHED')
  assert.deepEqual(sent, [])
  assert.match(sql[0] ?? '', /on conflict \(idempotency_key\) do nothing/)
  assert.match(sql[1] ?? '', /where idempotency_key/)
})

test('empty channel accounts throw and do not choose a network client', async () => {
  await assert.rejects(bufferAdapter({}).send({ idempotencyKey: 'x' }), NotConfigured)
  await assert.rejects(metaAdapter({}).send({ idempotencyKey: 'x' }), NotConfigured)
  assert.equal(adapterFor({}).name, 'manual')
  assert.equal(adapterFor({ BUFFER_ACCESS_TOKEN: 'present', BUFFER_ORGANIZATION_ID: 'org' }).name, 'buffer')
  const source = readFileSync(new URL('../src/providers/adapters.ts', import.meta.url), 'utf8')
  assert.equal(/fetch|http\.request|net\.connect|undici/.test(source), false)
})
