import type { IncomingMessage, ServerResponse } from 'node:http'
// shortcut: Vercel compiles this file and does not follow the TypeScript import. Keep src in vercel.json, and this pg import, until that builder bundles both.
import 'pg'
import { handleDashboard } from '../src/dashboard/serve.ts'

type NodeResponse = {
  writeHead(code: number, headers?: Record<string, string | number | readonly string[]>): unknown
  end(body?: string | Buffer): unknown
}

function headerList(headers?: Record<string, string | number | readonly string[]>): Headers {
  const list = new Headers()
  for (const [key, value] of Object.entries(headers ?? {})) {
    list.set(key, Array.isArray(value) ? value.join(', ') : String(value))
  }
  return list
}

function fromWeb(request: Request, body: Buffer) {
  const url = new URL(request.url)
  return {
    method: request.method,
    url: `${url.pathname}${url.search}`,
    headers: Object.fromEntries(request.headers.entries()),
    destroyed: false,
    on(event: string, callback: (chunk?: Buffer) => void) {
      if (event === 'data' && body.length > 0) callback(body)
      if (event === 'end') callback()
      return this
    },
    destroy() {
      this.destroyed = true
    },
  }
}

export async function webHandler(request: Request): Promise<Response> {
  const body = Buffer.from(await request.arrayBuffer())
  let status = 200
  let headers = new Headers()
  const chunks: Buffer[] = []
  let resolve: (response: Response) => void = () => {}
  const done = new Promise<Response>((doneResolve) => {
    resolve = doneResolve
  })
  const response: NodeResponse = {
    writeHead(code, next) {
      status = code
      headers = headerList(next)
      return response
    },
    end(chunk) {
      if (chunk) chunks.push(Buffer.from(chunk))
      resolve(new Response(Buffer.concat(chunks), { status, headers }))
      return response
    },
  }
  handleDashboard(fromWeb(request, body) as unknown as IncomingMessage, response as unknown as ServerResponse)
  return done
}

export default function handler(request: IncomingMessage | Request, response?: ServerResponse): void | Promise<Response> {
  if (response && typeof response.writeHead === 'function') {
    handleDashboard(request as IncomingMessage, response)
    return
  }
  return webHandler(request as Request)
}
