---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: security-engineer-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:25:00Z
updated_at: 2026-11-20T02:25:00Z
entry_criteria: engineering handoff
ordered_tasks: assets, gate, secrets, parser, dependencies
dependencies: engineering evidence
files_and_systems: src/providers/publishing.ts, messaging.ts, model.ts, db migration, .env.example
ownership_and_concurrency: read-only
requirement_coverage: R0
horizontal_checklist: charter §8
tool_and_modality_plan: inspection
risk_controls: no exploits
rollback_or_recovery: not applicable
validation_steps: read tests and source
expected_evidence: findings with severity
outputs_and_paths: handoff.md
gate_criteria: ROLES.md security verdicts
downstream_handoff: project-lead-subagent
deviations: review ran in the same session as the implementation
plan_change_log: none
---

# Role Plan: security-engineer-subagent

## 1. Entry criteria and inherited evidence

Engineering `PASS`, with migration apply `UNVERIFIED`.

## 2. Scope, non-goals, and requirement coverage

| Requirement ID | Planned disposition | Expected evidence |
|---|---|---|
| R0 | review controls | handoff findings |

## 3. Dependencies

The source and the test run.

## 4. Files, interfaces, data, and external systems

`beginPublish`, `parseDecision`, `parseStructured`, `kill_switch`, `approval_one_live_yes`, `.env.example`, `package-lock.json`.

## 5. Ownership and concurrency

Read-only.

## 6. Ordered tasks

1. Confirm there is no listener or outbound client in the import path.
2. Confirm publish fails closed.
3. Confirm the parser rejects free text.
4. Confirm no secret values were committed.
5. Record findings.

## 7. Tool and modality plan

File inspection. npm audit result already produced by install: 0 vulnerabilities. No separate scanner.

## 8. Horizontal full-stack checklist

| Area | Disposition | Rationale |
|---|---|---|
| Product value | reviewed | |
| Experience | not_applicable | |
| Client | not_applicable | |
| Server and APIs | reviewed | Library only |
| Data | reviewed | Constraints in SQL |
| Identity and access | owned | Role is a caller argument |
| Integrations | reviewed | No live boundary yet |
| Security and privacy | owned | This gate |
| Reliability | reviewed | Idempotency gap |
| Quality | reviewed | Tests exist |
| Performance and cost | not_applicable | |
| Observability | reviewed | Audit helper stores caller metadata |
| Measurement and growth | not_applicable | |
| Delivery | reviewed | Not deployed |
| Documentation and operations | reviewed | |
| Ethics and communications | reviewed | No posting |

## 9. Risk controls, rollback, and recovery

No tests were run against a live service. Nothing to roll back from this role.

## 10. Validation steps and expected evidence

Findings in the handoff, each with a path.

## 11. Outputs and storage paths

This directory.

## 12. Gate criteria and downstream handoff

CONDITIONAL is allowed only for the named low items.

## 13. Deviations and plan change log

The lead materialized this review in the same session. It is not a second process.
