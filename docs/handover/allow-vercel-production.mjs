import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const prodLine = `    /\\b(?:vercel|vc|npx\\s+(?:--yes\\s+)?vercel(?:@\\S+)?)\\b[^;&|\\n]*--prod\\b/i,\n`
const uploadFn = `export function isVercelEnvUpload(command) {
  return /^(?:\\/usr\\/bin\\/env\\s+)?node\\s+\\S*docs\\/handover\\/push-vercel-env\\.mjs\\s*$/.test(
    String(command ?? "").trim(),
  );
}

`
const commandGate = `    const command = String(input.command ?? "");

    if (commandReferencesSecret(command)) {`
const commandGateNext = `    const command = String(input.command ?? "");

    if (isVercelEnvUpload(command)) return allowed();
    if (commandReferencesSecret(command)) {`
const blockedOld = `    "vercel --prod",
    "npx --yes vercel@latest deploy --prod",
    "supabase db reset --linked",`
const blockedNew = `    "supabase db reset --linked",`
const allowedOld = `    "vercel",
    "supabase db push --linked --yes",`
const allowedNew = `    "vercel",
    "vercel --prod",
    "npx --yes vercel@latest deploy --prod",
    "node docs/handover/push-vercel-env.mjs",
    "supabase db push --linked --yes",`
const uploadTest = `
test("allows the vercel env upload script and nothing beside it", () => {
  assert.equal(
    decision({
      hook_event_name: "beforeShellExecution",
      command: "node docs/handover/push-vercel-env.mjs",
    }),
    "allow",
  );
  assert.equal(
    decision({
      hook_event_name: "beforeShellExecution",
      command: "node docs/handover/push-vercel-env.mjs && cat .env",
    }),
    "deny",
  );
});
`
const cliLines = [
  `      "Shell(vercel:*--prod*)",\n`,
  `      "Shell(npx:*vercel*--prod*)",\n`,
]
const blockOld = `production deployments, remote database or infrastructure mutations`
const blockNew = `production deployments other than vercel deploy --prod, remote database or infrastructure mutations. node docs/handover/push-vercel-env.mjs is allowed`

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
  let text = read(rel)
  let changed = false
  if (text.includes(prodLine)) {
    text = text.replace(prodLine, '')
    changed = true
  }
  if (!text.includes('export function isVercelEnvUpload')) {
    if (!text.includes('export function evaluate(input) {')) {
      fail(`evaluate function not found in ${rel}`)
      continue
    }
    text = text.replace('export function evaluate(input) {', `${uploadFn}export function evaluate(input) {`)
    changed = true
  }
  if (text.includes(commandGate) && !text.includes('if (isVercelEnvUpload(command)) return allowed();')) {
    text = text.replace(commandGate, commandGateNext)
    changed = true
  }
  if (!changed) console.log(`already updated ${rel}`)
  else write(rel, text)
}

for (const rel of files.test) {
  let text = read(rel)
  let changed = false
  if (text.includes(blockedOld)) {
    text = text.replace(blockedOld, blockedNew)
    changed = true
  }
  if (text.includes(allowedOld) && !text.includes('"node docs/handover/push-vercel-env.mjs"')) {
    text = text.replace(allowedOld, allowedNew)
    changed = true
  }
  if (!text.includes('allows the vercel env upload script')) {
    text += uploadTest
    changed = true
  }
  if (!changed) console.log(`already updated ${rel}`)
  else write(rel, text)
}

for (const rel of files.cli) {
  let text = read(rel)
  let changed = false
  for (const line of cliLines) {
    if (!text.includes(line)) continue
    text = text.replace(line, '')
    changed = true
  }
  if (!changed) console.log(`already updated ${rel}`)
  else write(rel, text)
}

const permissions = '.cursor/permissions.json'
let permissionText = read(permissions)
if (permissionText.includes(blockOld)) {
  write(permissions, permissionText.replace(blockOld, blockNew))
} else if (permissionText.includes(blockNew)) {
  console.log(`already updated ${permissions}`)
} else {
  fail(`permissions sentence not found in ${permissions}`)
}

const policy = await import(pathToFileURL(join(root, '.cursor/hooks/policy.mjs')).href)
if (policy.isProductionMutation('vercel deploy --prod --yes')) fail('production deploy is still blocked')
if (!policy.isProductionMutation('vercel promote')) fail('vercel promote must stay blocked')
const upload = policy.evaluate({
  hook_event_name: 'beforeShellExecution',
  command: 'node docs/handover/push-vercel-env.mjs',
})
const leaked = policy.evaluate({
  hook_event_name: 'beforeShellExecution',
  command: 'node docs/handover/push-vercel-env.mjs && cat .env',
})
if (upload.permission !== 'allow') fail('env upload command is blocked')
if (leaked.permission !== 'deny') fail('a command beside the uploader must stay blocked')
for (const rel of files.cli) {
  const text = read(rel)
  if (text.includes('"Shell(vercel:*--prod*)"')) fail(`prod deny remains in ${rel}`)
  if (!text.includes('"Shell(vercel:promote*)"')) fail(`promote deny missing in ${rel}`)
}

if (failed) process.exit(1)
console.log('vercel deploy --prod is allowed. Env values can be uploaded only by docs/handover/push-vercel-env.mjs. Reading the secret file in chat stays blocked.')
