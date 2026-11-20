import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

const pushReset = String.raw`    /\b(?:supabase|npx\s+(?:--yes\s+)?supabase(?:@\S+)?)\s+db\s+(?:push|reset)\b/i,`
const resetOnly = String.raw`    /\b(?:supabase|npx\s+(?:--yes\s+)?supabase(?:@\S+)?)\s+db\s+reset\b/i,`

const blockedOld = `    "npx --yes vercel@latest deploy --prod",
    "supabase db push --linked --yes",
    "supabase migration repair --status reverted 123",`
const blockedNew = `    "npx --yes vercel@latest deploy --prod",
    "supabase db reset --linked",
    "supabase migration repair --status reverted 123",`
const allowedOld = `    "vercel",
    "supabase migration new add_profiles",`
const allowedNew = `    "vercel",
    "supabase db push --linked --yes",
    "supabase migration new add_profiles",`

const cliLines = [
  `      "Shell(supabase:db push*)",\n`,
  `      "Shell(npx:*supabase*db push*)",\n`,
]

const files = {
  policy: [
    '.cursor/hooks/policy.mjs',
    '.cursor/skills/git-safety/payloads/policy.mjs',
  ],
  test: [
    '.cursor/hooks/policy.test.mjs',
    '.cursor/skills/git-safety/payloads/policy.test.mjs',
  ],
  cli: [
    '.cursor/cli.json',
    '.cursor/skills/git-safety/payloads/cli.json',
  ],
}

function read(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

function write(rel, text) {
  writeFileSync(join(root, rel), text)
  console.log(`updated ${rel}`)
}

let failed = false

function fail(message) {
  console.error(message)
  failed = true
}

for (const rel of files.policy) {
  const text = read(rel)
  if (text.includes(resetOnly) && !text.includes(pushReset)) {
    console.log(`already updated ${rel}`)
    continue
  }
  if (!text.includes(pushReset)) {
    fail(`policy pattern not found in ${rel}`)
    continue
  }
  write(rel, text.replace(pushReset, resetOnly))
}

for (const rel of files.test) {
  let text = read(rel)
  if (text.includes(blockedNew) && text.includes(allowedNew)) {
    console.log(`already updated ${rel}`)
    continue
  }
  if (!text.includes(blockedOld) || !text.includes(allowedOld)) {
    fail(`policy test block not found in ${rel}`)
    continue
  }
  text = text.replace(blockedOld, blockedNew).replace(allowedOld, allowedNew)
  write(rel, text)
}

for (const rel of files.cli) {
  let text = read(rel)
  let changed = false
  for (const line of cliLines) {
    if (!text.includes(line)) continue
    text = text.replace(line, '')
    changed = true
  }
  if (!changed) {
    console.log(`already updated ${rel}`)
    continue
  }
  write(rel, text)
}

for (const rel of files.policy) {
  const text = read(rel)
  if (!text.includes(resetOnly) || text.includes(pushReset)) fail(`policy check failed for ${rel}`)
}
for (const rel of files.test) {
  const text = read(rel)
  if (!text.includes(blockedNew) || !text.includes(allowedNew) || text.includes(blockedOld)) {
    fail(`policy test check failed for ${rel}`)
  }
}
for (const rel of files.cli) {
  const text = read(rel)
  if (cliLines.some((line) => text.includes(line))) fail(`cli check failed for ${rel}`)
  if (!text.includes('"Shell(supabase:migration repair*)"')) fail(`migration repair deny missing in ${rel}`)
}

if (failed) process.exit(1)
console.log('supabase db push is allowed for the agent. db reset stays blocked.')
