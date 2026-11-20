---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: software-engineer-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:20:00Z
updated_at: 2026-11-20T02:20:00Z
entry_criteria: PM PASS and phase 0 tasks
ordered_tasks: decision, package, schema, domain, gates, providers, config
dependencies: Node 22
files_and_systems: src, db, test, package.json
ownership_and_concurrency: sole writer of those paths
requirement_coverage: R0
horizontal_checklist: charter §8
tool_and_modality_plan: npm test, tsc
risk_controls: defaults closed, no network
rollback_or_recovery: revert the uncommitted change
validation_steps: npm test, npm run typecheck
expected_evidence: 18 passing tests
outputs_and_paths: src/, db/, test/
gate_criteria: phase 0 §19 except live migration
downstream_handoff: security-engineer-subagent
deviations: role plan file written in the same session as the code; the phase 0 plan was the prior specification
plan_change_log: added approval_one_live_yes and killSwitchesFromRows after the first green run
---

# Role Plan: software-engineer-subagent

## 1. Entry criteria and inherited evidence

PM handoff `PASS`. Phase 0 tasks 1–7.

## 2. Scope, non-goals, and requirement coverage

| Requirement ID | Planned disposition | Expected evidence |
|---|---|---|
| R0 | implement | `npm test` |

## 3. Dependencies

Node 22.14.0. No database URL.

## 4. Files, interfaces, data, and external systems

`src/domain`, `src/providers`, `src/config`, `src/auth`, `src/queue`, `db/migrations/001_foundation.sql`. No external calls.

## 5. Ownership and concurrency

This role writes the paths above. Security is read-only.

## 6. Ordered tasks

Follow phase 0 tasks 1–7. `npm test` and `npm run typecheck` are the checks. Rollback is reverting the files. No deploy.

## 7. Tool and modality plan

Local npm. No MCP.

## 8. Horizontal full-stack checklist

| Area | Disposition | Rationale |
|---|---|---|
| Product value | reviewed | Inherited |
| Experience | not_applicable | No UI |
| Client | not_applicable | No UI |
| Server and APIs | owned | Gates and parsers |
| Data | owned | SQL migration |
| Identity and access | owned | Role check only |
| Integrations | owned | Interfaces, no I/O |
| Security and privacy | reviewed | Defaults; security gate owns the verdict |
| Reliability | owned | Idempotency check and unique indexes |
| Quality | owned | 18 tests and tsc |
| Performance and cost | owned | No new paid service |
| Observability | owned | `createAuditEvent` |
| Measurement and growth | not_applicable | |
| Delivery | reviewed | Env names only |
| Documentation and operations | owned | Decision 0001 |
| Ethics and communications | not_applicable | No public output |

## 9. Risk controls, rollback, and recovery

Publishing defaults off. `beginPublish` is the only path into `PUBLISHING`.

## 10. Validation steps and expected evidence

`npm test` and `npm run typecheck`.

## 11. Outputs and storage paths

Source tree listed in the charter.

## 12. Gate criteria and downstream handoff

Pass the commands, then security reviews.

## 13. Deviations and plan change log

The role plan file was saved with the implementation. The specification used while coding was phase 0. After the first green run, `approval_one_live_yes` and `killSwitchesFromRows` were added and tests were rerun.
