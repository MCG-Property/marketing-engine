import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const linked = JSON.parse(readFileSync(join(root, '.vercel/project.json'), 'utf8'))
if (linked.projectId !== 'prj_dJDzTbfbLaA2yPNscmk8AsG0nLVM') {
  console.error('This checkout is not linked to the marketing-engine Vercel project.')
  process.exit(1)
}

const entries = []
for (const line of readFileSync(join(root, '.env'), 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const body = trimmed.startsWith('export ') ? trimmed.slice(7) : trimmed
  const eq = body.indexOf('=')
  if (eq <= 0) continue
  const key = body.slice(0, eq).trim()
  let value = body.slice(eq + 1)
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || value === '') continue
  entries.push([key, value])
}

let failed = false
for (const [key, value] of entries) {
  const result = spawnSync(
    'vercel',
    ['env', 'add', key, 'production', '--force', '--sensitive', '--scope', 'cam-douglas-projects'],
    { cwd: root, input: value, encoding: 'utf8' },
  )
  if (result.status === 0) {
    console.log(`set ${key}`)
    continue
  }
  failed = true
  console.error(`failed ${key}`)
  const detail = `${result.stderr ?? ''}${result.stdout ?? ''}`.split(value).join('[redacted]').trim()
  if (detail) console.error(detail.slice(0, 400))
}

if (failed) process.exit(1)
console.log(`set ${entries.length} production variables`)
