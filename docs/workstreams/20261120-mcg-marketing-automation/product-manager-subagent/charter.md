---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: product-manager-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:20:00Z
updated_at: 2026-11-20T02:20:00Z
predecessor_handoff: none
mission: Keep phase 0 inside the EL-MCG-002 contract.
objective: Confirm the foundation does not invent product scope.
scope: Phase 0 acceptance, non-goals, and milestone order.
non_goals: Implementation, visual design, publishing, and later milestone behaviour.
inherited_requirements: R0
inherited_evidence: docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md
predecessor_handoffs: none
assumptions: Blueprint payments and week targets are client facts.
open_questions: Approval transport. Worker host.
decisions: Manual listings are enough. Facebook and Instagram only.
owned_paths: read-only
read_only_paths: blueprint, phase 0 plan, stack decision
external_system_scope: none
prohibited_actions: code edits, deploys, secret values
vertical_responsibilities: scope, acceptance, non-goals, sequencing
horizontal_checklist: product value owned; experience not applicable in this phase
skills: none
tools: file read
mcp_servers: none
availability_checks: blueprint and plan files exist
outputs: this directory
acceptance_criteria: R0 stays foundation-only and later milestones stay mapped
validation_plan: compare phase 0 scope with blueprint §§1, 4–7, 18–20, 34
risks: inferred PROJECT_CONFIG keys
failure_and_escalation: block if phase 0 implements posting or new channels
downstream_role: software-engineer-subagent
handoff_conditions: PASS only if no product scope was added
---

# Role Charter: product-manager-subagent

## 1. Role objective

### Mission

Confirm phase 0 implements the foundation the blueprint already specifies, and does not pull later milestone behaviour forward.

## 2. Inherited request and evidence

- Workstream manifest: `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`
- Active plan: `docs/plans/phase_0_foundations_plan.md`
- Predecessor handoff: none
- Relevant decisions/blockers: `docs/decisions/0001-foundation-stack.md`. No blockers.

## 3. Scope, non-goals, and ownership

- In scope: user, problem, phase 0 outcome, non-goals, acceptance.
- Explicit non-goals: screens, generation, publishing, enquiries, reviews, deploy.
- Owned/write paths or `read-only`: read-only.
- Read-only paths: blueprint and phase 0 plan.
- External-system scope: none.
- Prohibited actions: implementation and production changes.

## 4. Inherited requirements and vertical responsibilities

R0 is the only requirement in this phase. R1–R5 stay mapped and unbuilt. Primary user is MCG staff. The problem is supervised marketing operations. The phase 0 outcome is a gate that cannot publish.

## 5. Assumptions, open questions, and clarification decisions

- verified: the blueprint is the contract.
- provisional: `PROJECT_CONFIG` keys inferred from a blank §28.
- provisional: approval transport is unnamed. Not blocking for phase 0.
- blocking: none.

## 6. Skills, tools, and evidence sources

File inspection only. No MCP calls. No analytics baseline exists, so no metric values are invented.

## 7. Outputs and storage paths

`docs/workstreams/20261120-mcg-marketing-automation/product-manager-subagent/`

## 8. Horizontal quality coverage

- Product and user acceptance: owned.
- UI/UX and accessibility: not applicable; no screens.
- Frontend/backend/data/API/integration impact: reviewed as scope boundaries only.
- Security/privacy/compliance/abuse: reviewed; humans still approve public output.
- Testing/observability/reliability/performance: delegated to engineering.
- Deployment/rollback/operations: no deploy.
- Analytics/growth/consent: unchanged.
- Documentation/handoff: this gate.

## 9. Validation plan and gate criteria

Pass when phase 0 scope matches the plan's non-goals and the milestone map still matches blueprint §§21–26.

## 10. Risks, blockers, and escalation triggers

Escalate if implementation adds a channel, a paid service, or autonomous posting.

## 11. Failure handling and recovery

A failed gate returns to the lead before engineering continues. This review happened against the written plan and the finished diff.

## 12. Downstream role and handoff conditions

Hand off to `software-engineer-subagent`. Do not reinterpret channels, approval rules, or the cost ceiling.
