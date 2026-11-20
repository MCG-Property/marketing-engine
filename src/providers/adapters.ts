export class AdapterFailure extends Error {
  readonly kind: 'api' | 'permission'

  constructor(kind: 'api' | 'permission') {
    super(kind)
    this.kind = kind
  }
}

export class NotConfigured extends Error {
  constructor() {
    super('NOT_CONFIGURED')
  }
}

export type SendAdapter = {
  name: 'buffer' | 'meta' | 'manual'
  send(input: { idempotencyKey: string }): Promise<{ receipt?: string }>
}

export type ChannelEnv = {
  BUFFER_ACCESS_TOKEN?: string
  BUFFER_ORGANIZATION_ID?: string
  META_PAGE_ID?: string
  META_PAGE_ACCESS_TOKEN?: string
  META_INSTAGRAM_ACCOUNT_ID?: string
}

function bufferReady(env: ChannelEnv): boolean {
  return Boolean(env.BUFFER_ACCESS_TOKEN && env.BUFFER_ORGANIZATION_ID)
}

function metaReady(env: ChannelEnv): boolean {
  return Boolean(env.META_PAGE_ID && env.META_PAGE_ACCESS_TOKEN && env.META_INSTAGRAM_ACCOUNT_ID)
}

function closedAccount(name: 'buffer' | 'meta', ready: boolean): SendAdapter {
  return {
    name,
    async send() {
      if (!ready) throw new NotConfigured()
      // shortcut: a configured account is refused, upgrade when a credentialed send is in scope
      throw new AdapterFailure('api')
    },
  }
}

export function bufferAdapter(env: ChannelEnv): SendAdapter {
  return closedAccount('buffer', bufferReady(env))
}

export function metaAdapter(env: ChannelEnv): SendAdapter {
  return closedAccount('meta', metaReady(env))
}

export function manualAdapter(): SendAdapter {
  return {
    name: 'manual',
    async send({ idempotencyKey }) {
      return { receipt: `manual:${idempotencyKey}` }
    },
  }
}

export function adapterFor(env: ChannelEnv): SendAdapter {
  if (bufferReady(env)) return bufferAdapter(env)
  if (metaReady(env)) return metaAdapter(env)
  return manualAdapter()
}
