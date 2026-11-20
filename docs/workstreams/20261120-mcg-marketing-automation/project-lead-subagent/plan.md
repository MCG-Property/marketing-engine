---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: project-lead-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:30:00Z
updated_at: 2026-11-20T02:30:00Z
entry_criteria: security handoff
ordered_tasks: trace R0, confirm skips, write owner handoff
dependencies: all prior handoffs
files_and_systems: workstream and phase 0 plan
ownership_and_concurrency: read-only
requirement_coverage: R0
horizontal_checklist: charter §8
tool_and_modality_plan: inspection
risk_controls: keep CONDITIONAL
rollback_or_recovery: revert uncommitted phase 0
validation_steps: traceability table
expected_evidence: owner handoff
outputs_and_paths: delivery/owner-handoff.md
gate_criteria: no waived high finding
downstream_handoff: owner
deviations: none
plan_change_log: none
---

# Role Plan: project-lead-subagent

## 1. Entry criteria and inherited evidence

PM `PASS`, engineering `PASS`, security `CONDITIONAL`.

## 2. Scope, non-goals, and requirement coverage

| Requirement ID | Planned disposition | Expected evidence |
|---|---|---|
| R0 | reconcile | owner handoff |
| R1–R5 | still mapped only | phase 0 §2 |

## 3. Dependencies

The three prior handoffs.

## 4. Files, interfaces, data, and external systems

Workstream directory and `docs/plans/phase_0_foundations_plan.md`.

## 5. Ownership and concurrency

No source edits.

## 6. Ordered tasks

1. Confirm skip reasons for UX and growth still hold.
2. Confirm S0-1 and S0-2 are in the owner handoff.
3. Confirm the phase 1 file was not created.

## 7. Tool and modality plan

File inspection only.

## 8. Horizontal full-stack checklist

| Area | Disposition | Rationale |
|---|---|---|
| Product value | reviewed | PM PASS |
| Experience | not_applicable | UX skipped |
| Client | not_applicable | |
| Server and APIs | reviewed | |
| Data | reviewed | migration unverified |
| Identity and access | reviewed | security note |
| Integrations | reviewed | none live |
| Security and privacy | reviewed | CONDITIONAL kept |
| Reliability | reviewed | S0-1 |
| Quality | reviewed | 18 tests |
| Performance and cost | reviewed | no new service |
| Observability | reviewed | audit helper only |
| Measurement and growth | not_applicable | growth skipped |
| Delivery | owned | not deployed |
| Documentation and operations | owned | this handoff |
| Ethics and communications | reviewed | no public output |

## 9. Risk controls, rollback, and recovery

State stays "not production".

## 10. Validation steps and expected evidence

Owner handoff lists commands, findings, and env names.

## 11. Outputs and storage paths

`delivery/owner-handoff.md` and this directory.

## 12. Gate criteria and downstream handoff

CONDITIONAL, matching security.

## 13. Deviations and plan change log

None.
