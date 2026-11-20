import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { brandLogoPath } from '../config/brand.ts'
import { renderDashboard } from './render.ts'

export const DASHBOARD_HOST = '127.0.0.1'
export const DASHBOARD_PORT = 8787

export function startDashboard(): void {
  if (DASHBOARD_HOST !== '127.0.0.1') {
    throw new Error('dashboard host must be 127.0.0.1')
  }
  const server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    const logo = path.startsWith('/brand/') ? brandLogoPath(path.slice('/brand/'.length)) : undefined
    if (logo) {
      const name = logo.slice('/brand/'.length)
      const body = readFileSync(new URL(`../../brand/${name}`, import.meta.url))
      const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg'
      response.writeHead(200, { 'content-type': type })
      response.end(body)
      return
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(renderDashboard())
  })
  server.listen(DASHBOARD_PORT, DASHBOARD_HOST)
}

const entry = process.argv[1]
if (entry && import.meta.url === pathToFileURL(entry).href) {
  startDashboard()
}
