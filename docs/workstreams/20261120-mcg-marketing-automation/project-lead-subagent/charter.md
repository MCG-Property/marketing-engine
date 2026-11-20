---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: project-lead-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:30:00Z
updated_at: 2026-11-20T02:30:00Z
predecessor_handoff: security-engineer-subagent/handoff.md
mission: Reconcile phase 0 evidence and hand the result to the owner.
objective: One owner handoff that matches the tests and the security verdict.
scope: workstream artifacts and the phase 0 diff
non_goals: code changes and the phase 1 plan
inherited_requirements: R0
inherited_evidence: PM PASS, engineering PASS, security CONDITIONAL
predecessor_handoffs: security-engineer-subagent/handoff.md
assumptions: test output in the engineering evidence is the run that just happened
open_questions: none for the owner today
decisions: do not treat phase 0 as production
owned_paths: read-only; lead materializes delivery/owner-handoff.md
read_only_paths: all phase 0 artifacts
external_system_scope: none
prohibited_actions: overriding security, inventing a database apply
vertical_responsibilities: traceability and readiness
horizontal_checklist: delivery and documentation
skills: none
tools: file inspection
mcp_servers: none
availability_checks: handoffs exist
outputs: delivery/owner-handoff.md
acceptance_criteria: ROLES.md project-lead gate
validation_plan: trace R0 to tests and findings
risks: same-session gates
failure_and_escalation: BLOCKED if a high finding was waived
downstream_role: owner
handoff_conditions: CONDITIONAL copied from security
---

# Role Charter: project-lead-subagent

## 1. Role objective

### Mission

Check that the phase 0 claims match the test run and the security verdict, then write the owner handoff.

## 2. Inherited request and evidence

- Workstream manifest: `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`
- Active plan: `docs/plans/phase_0_foundations_plan.md`
- Predecessor handoff: security `CONDITIONAL`
- Relevant decisions/blockers: S0-1, S0-2, unverified migration

## 3. Scope, non-goals, and ownership

- In scope: reconciliation and owner handoff.
- Explicit non-goals: fixes and the next phase file.
- Owned/write paths: read-only role. Lead writes `delivery/owner-handoff.md`.
- Read-only paths: the workstream and the phase diff.
- External-system scope: none.
- Prohibited actions: waiving S0-1 or S0-2.

## 4. Inherited requirements and vertical responsibilities

R0 is implemented with the limits security named. R1–R5 are not started.

## 5. Assumptions, open questions, and clarification decisions

- verified: 18 tests passed and typecheck passed.
- provisional: none.
- blocking: none for keeping the foundation.

## 6. Skills, tools, and evidence sources

The role evidence files. No new commands.

## 7. Outputs and storage paths

`docs/workstreams/20261120-mcg-marketing-automation/delivery/owner-handoff.md`

## 8. Horizontal quality coverage

- Product and user acceptance: reviewed.
- UI/UX and accessibility: not applicable.
- Frontend/backend/data/API/integration impact: reviewed.
- Security/privacy/compliance/abuse: reviewed; verdict kept.
- Testing/observability/reliability/performance: reviewed.
- Deployment/rollback/operations: owned; not deployed.
- Analytics/growth/consent: not applicable.
- Documentation/handoff: owned.

## 9. Validation plan and gate criteria

Every required role has a verdict. Skips still match the phase. Security conditions stay visible.

## 10. Risks, blockers, and escalation triggers

Do not mark production ready.

## 11. Failure handling and recovery

Rollback of phase 0 is reverting the uncommitted tree. No hosted resource was created.

## 12. Downstream role and handoff conditions

The owner receives the handoff. No owner choice is selected by this role.
