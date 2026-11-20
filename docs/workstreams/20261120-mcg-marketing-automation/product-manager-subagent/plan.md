---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: product-manager-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:20:00Z
updated_at: 2026-11-20T02:20:00Z
entry_criteria: Phase 0 plan and blueprint present.
ordered_tasks: compare scope, record the gate
dependencies: none
files_and_systems: blueprint, phase 0 plan, stack decision
ownership_and_concurrency: read-only
requirement_coverage: R0
horizontal_checklist: see section 8
tool_and_modality_plan: file inspection
risk_controls: no new scope
rollback_or_recovery: revert the doc if the gate is wrong
validation_steps: section 10
expected_evidence: this plan and evidence.md
outputs_and_paths: product-manager-subagent/
gate_criteria: scope matches the blueprint
downstream_handoff: software-engineer-subagent
deviations: none
plan_change_log: none
---

# Role Plan: product-manager-subagent

## 1. Entry criteria and inherited evidence

Blueprint and `docs/plans/phase_0_foundations_plan.md` are the contract. No predecessor handoff.

## 2. Scope, non-goals, and requirement coverage

| Requirement ID | Planned disposition | Expected evidence |
|---|---|---|
| R0 | Accept the foundation scope | evidence.md |
| R1–R5 | Remain later phases | phase 0 §2 |

## 3. Dependencies

None.

## 4. Files, interfaces, data, and external systems

Read the blueprint, the phase plan, and `docs/decisions/0001-foundation-stack.md`. No external systems.

## 5. Ownership and concurrency

Read-only. The lead materializes these files.

## 6. Ordered tasks

1. Check phase 0 non-goals against blueprint §§34–36.
2. Check the milestone map against §§21–26.
3. Record PASS or BLOCKED.

No tools beyond file reads. Rollback is deleting an incorrect verdict before downstream use.

## 7. Tool and modality plan

Text inspection. No browser, MCP, or analytics.

## 8. Horizontal full-stack checklist

| Area | Disposition | Rationale |
|---|---|---|
| Product value | owned | Scope and acceptance |
| Experience | not_applicable | No UI in phase 0 |
| Client | not_applicable | No client app |
| Server and APIs | reviewed | Seams only |
| Data | reviewed | Records match §5 |
| Identity and access | reviewed | Role names only |
| Integrations | reviewed | No live calls |
| Security and privacy | reviewed | Publish stays human-gated |
| Reliability | reviewed | Idempotency is required |
| Quality | reviewed | Engineering owns tests |
| Performance and cost | reviewed | No new paid service |
| Observability | reviewed | Audit event shape only |
| Measurement and growth | not_applicable | Unchanged |
| Delivery | reviewed | No deploy |
| Documentation and operations | owned | Plan remains the contract |
| Ethics and communications | reviewed | No public claims added |

## 9. Risk controls, rollback, and recovery

Reject any scope that posts, spends, or adds channels.

## 10. Validation steps and expected evidence

Inspection recorded in `evidence.md`.

## 11. Outputs and storage paths

This directory.

## 12. Gate criteria and downstream handoff

PASS hands R0 to engineering unchanged.

## 13. Deviations and plan change log

None.
