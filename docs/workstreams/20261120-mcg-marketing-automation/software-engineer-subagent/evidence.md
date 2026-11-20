---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: software-engineer-subagent
revision: 1
updated_at: 2026-11-20T02:20:00Z
requirement_id: R0
claim: Foundation tests and typecheck passed.
evidence_state: VERIFIED
method: npm test and tsc
command_or_tool: npm test && npm run typecheck
artifact_or_source: test/*.test.ts
result: 18 passed, tsc exit 0
timestamp: 2026-11-20T02:20:00Z
environment: Node v22.14.0, darwin
limitations: DATABASE_URL unset
follow_up: apply the migration when a database exists
---

# Role Evidence: software-engineer-subagent

## Evidence record

- Requirement ID: R0
- Claim: State machine, approval lock, publish gate, schema contract, and provider seams pass locally.
- Evidence state: `VERIFIED`
- Method: test and typecheck
- Exact command or tool: `npm test && npm run typecheck`
- Artifact, path, source, or stable reference: `test/`
- Sanitized result and exit status: 18 passed, 0 failed, exit 0. `tsc --noEmit` exit 0. `npm install` reported 0 vulnerabilities. Node printed an experimental type-stripping warning.
- Timestamp: 2026-11-20T02:20:00Z
- Environment: Node v22.14.0
- Limitations: none for the unit tests
- Required follow-up: none

## Evidence record

- Requirement ID: R0
- Claim: The migration applies to Postgres.
- Evidence state: `UNVERIFIED`
- Method: environment check
- Exact command or tool: `database_url_set` boolean check
- Artifact, path, source, or stable reference: `db/migrations/001_foundation.sql`
- Sanitized result and exit status: `database_url_set=false`. SQL was not executed.
- Timestamp: 2026-11-20T02:20:00Z
- Environment: local shell
- Limitations: no local or hosted database was configured
- Required follow-up: apply the file when `DATABASE_URL` exists

## Evidence record

- Requirement ID: R0
- Claim: `.env.example` contains names only.
- Evidence state: `VERIFIED`
- Method: line scan
- Exact command or tool: count of lines matching `NAME=value`
- Artifact, path, source, or stable reference: `.env.example`
- Sanitized result and exit status: `filled_env_lines=0`
- Timestamp: 2026-11-20T02:20:00Z
- Environment: local
- Limitations: none
- Required follow-up: none
