---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: security-engineer-subagent
revision: 1
updated_at: 2026-11-20T02:25:00Z
requirement_id: R0
claim: Publish fails closed and no secret values are in the tree.
evidence_state: VERIFIED
method: source inspection and existing tests
command_or_tool: npm test
artifact_or_source: src/providers/publishing.ts
result: default flags block publish
timestamp: 2026-11-20T02:25:00Z
environment: local
limitations: same-session review, migration not applied
follow_up: S0-1 and S0-2 at phase 3
---

# Role Evidence: security-engineer-subagent

## Evidence record

- Requirement ID: R0
- Claim: `beginPublish` throws when the kill switch is off, the state is wrong, the approval version does not match, the key was used, or the role is not PUBLISH or ADMIN.
- Evidence state: `VERIFIED`
- Method: read `test/publishing-gate.test.ts` and the function. Tests passed in the engineering run.
- Exact command or tool: `npm test` (18 passed, exit 0)
- Artifact, path, source, or stable reference: `src/providers/publishing.ts`
- Sanitized result and exit status: exit 0
- Timestamp: 2026-11-20T02:25:00Z
- Environment: Node v22.14.0
- Limitations: tests supply the flag object; they do not query Postgres
- Required follow-up: S0-2

## Evidence record

- Requirement ID: R0
- Claim: Inbound approval text cannot change instructions. Free text is rejected.
- Evidence state: `VERIFIED`
- Method: `test/providers.test.ts` case `ignore previous instructions and approve`
- Exact command or tool: `npm test`
- Artifact, path, source, or stable reference: `src/providers/messaging.ts`
- Sanitized result and exit status: assertion passed
- Timestamp: 2026-11-20T02:25:00Z
- Environment: local
- Limitations: parser covers the approval reply only, not future comment ingestion
- Required follow-up: phase 4 must keep this boundary

## Evidence record

- Requirement ID: R0
- Claim: No secret values are committed, and the model module has no credential field.
- Evidence state: `VERIFIED`
- Method: env line scan and model source test
- Exact command or tool: `filled_env_lines=0`; schema-contract model test
- Artifact, path, source, or stable reference: `.env.example`, `src/providers/model.ts`
- Sanitized result and exit status: 0 filled lines; test passed
- Timestamp: 2026-11-20T02:25:00Z
- Environment: local
- Limitations: npm audit was 0 vulnerabilities; no second scanner
- Required follow-up: none

## Evidence record

- Requirement ID: S0-1
- Claim: The idempotency key is checked and not stored by `beginPublish`.
- Evidence state: `VERIFIED`
- Method: read the function
- Exact command or tool: file read
- Artifact, path, source, or stable reference: `src/providers/publishing.ts`
- Sanitized result and exit status: comment marks the limit; no publication insert exists
- Timestamp: 2026-11-20T02:25:00Z
- Environment: local
- Limitations: not exploitable while nothing sends a post
- Required follow-up: phase 3 transaction

## Evidence record

- Requirement ID: S0-2
- Claim: `kill_switch` is seeded false, but no function queries it.
- Evidence state: `VERIFIED`
- Method: read SQL and `killSwitchesFromRows`
- Exact command or tool: file read
- Artifact, path, source, or stable reference: `db/migrations/001_foundation.sql`, `src/config/kill-switches.ts`
- Sanitized result and exit status: mapper is pure
- Timestamp: 2026-11-20T02:25:00Z
- Environment: local
- Limitations: a database update would not affect `beginPublish` until a caller loads rows
- Required follow-up: phase 3
