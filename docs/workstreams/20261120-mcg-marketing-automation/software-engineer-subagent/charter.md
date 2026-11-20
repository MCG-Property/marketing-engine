---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: software-engineer-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:20:00Z
updated_at: 2026-11-20T02:20:00Z
predecessor_handoff: product-manager-subagent/handoff.md
mission: Implement the phase 0 foundation and prove it with tests.
objective: Schema, state machine, gates, provider seams, and names-only env.
scope: paths listed in the phase 0 plan §10
non_goals: network calls, dashboard, generation, deploy
inherited_requirements: R0
inherited_evidence: product-manager handoff PASS
predecessor_handoffs: product-manager-subagent/handoff.md
assumptions: Node 22.14.0 is the local runtime
open_questions: none that block local tests
decisions: text ids, pg-boss not started on import, PUBLISHING only via beginPublish
owned_paths: package.json, tsconfig.json, db/, src/, test/, .env.example, .gitignore
read_only_paths: blueprint
external_system_scope: none
prohibited_actions: secrets, deploys, provider SDKs beyond pg and pg-boss
vertical_responsibilities: implementation and tests
horizontal_checklist: server, data, quality owned
skills: none beyond node test and tsc
tools: npm, node, tsc
mcp_servers: none
availability_checks: node v22.14.0
outputs: source, tests, evidence
acceptance_criteria: phase 0 §19
validation_plan: npm test and npm run typecheck
risks: migration not applied
failure_and_escalation: stop if tests fail
downstream_role: security-engineer-subagent
handoff_conditions: tests and typecheck pass
---

# Role Charter: software-engineer-subagent

## 1. Role objective

### Mission

Build the smallest phase 0 foundation that enforces the blueprint's state machine and publish gate.

## 2. Inherited request and evidence

- Workstream manifest: `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`
- Active plan: `docs/plans/phase_0_foundations_plan.md`
- Predecessor handoff: `product-manager-subagent/handoff.md` (`PASS`)
- Relevant decisions/blockers: `docs/decisions/0001-foundation-stack.md`

## 3. Scope, non-goals, and ownership

- In scope: tasks 1–7 of the phase plan.
- Explicit non-goals: live integrations and UI.
- Owned/write paths: `package.json`, `tsconfig.json`, `db/`, `src/`, `test/`, `.env.example`, `.gitignore`.
- Read-only paths: blueprint.
- External-system scope: none.
- Prohibited actions: secret values and deploys.

## 4. Inherited requirements and vertical responsibilities

R0. Secure defaults, idempotency check, audit helper, and SQL constraints.

## 5. Assumptions, open questions, and clarification decisions

- verified: Node v22.14.0 supports type stripping.
- provisional: Supabase later. Local SQL is the source of truth.
- blocking: none.

## 6. Skills, tools, and evidence sources

`npm test`, `npm run typecheck`. `DATABASE_URL` was checked for presence only and was unset.

## 7. Outputs and storage paths

Repository paths in §3 and this directory.

## 8. Horizontal quality coverage

- Product and user acceptance: inherited.
- UI/UX and accessibility: not applicable.
- Frontend/backend/data/API/integration impact: data and gates owned.
- Security/privacy/compliance/abuse: defaults closed; security reviews.
- Testing/observability/reliability/performance: unit tests owned. No live migration.
- Deployment/rollback/operations: no deploy. Revert the change to roll back.
- Analytics/growth/consent: not applicable.
- Documentation/handoff: stack decision and env names.

## 9. Validation plan and gate criteria

`npm test` and `npm run typecheck` exit 0. Schema test covers table names. Publishing tests cover the closed switch.

## 10. Risks, blockers, and escalation triggers

Unset `DATABASE_URL` leaves migration apply unverified. That is recorded, not hidden.

## 11. Failure handling and recovery

Failed tests are fixed before the handoff. Rollback is reverting these files. No production data.

## 12. Downstream role and handoff conditions

Hand off to security with the diff, commands, and the two known limits: key persistence and kill-switch loading.
