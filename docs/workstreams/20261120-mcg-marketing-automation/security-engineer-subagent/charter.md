---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: security-engineer-subagent
status: complete
revision: 1
created_at: 2026-11-20T02:25:00Z
updated_at: 2026-11-20T02:25:00Z
predecessor_handoff: software-engineer-subagent/handoff.md
mission: Check the publish gate, secrets, and trust boundaries.
objective: Verdict on phase 0 controls.
scope: src, db, .env.example, package.json
non_goals: fixing code, penetration testing, production
inherited_requirements: R0
inherited_evidence: engineering handoff
predecessor_handoffs: software-engineer-subagent/handoff.md
assumptions: no network service is exposed
open_questions: none
decisions: none accepted for the owner
owned_paths: read-only
read_only_paths: src, db, test, .env.example, package-lock.json
external_system_scope: none
prohibited_actions: edits, exploits, secret disclosure
vertical_responsibilities: threat review of the foundation
horizontal_checklist: identity, secrets, abuse
skills: none
tools: file inspection and the engineering test result
mcp_servers: none
availability_checks: files present
outputs: findings in the handoff
acceptance_criteria: no open high or critical finding
validation_plan: read the gate and the tests
risks: same-session review
failure_and_escalation: BLOCKED on high or critical
downstream_role: project-lead-subagent
handoff_conditions: CONDITIONAL if only named low gaps remain
---

# Role Charter: security-engineer-subagent

## 1. Role objective

### Mission

Determine whether phase 0 can publish, leak a secret, or treat inbound text as instructions.

## 2. Inherited request and evidence

- Workstream manifest: `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`
- Active plan: `docs/plans/phase_0_foundations_plan.md`
- Predecessor handoff: `software-engineer-subagent/handoff.md`
- Relevant decisions/blockers: stack decision 0001

## 3. Scope, non-goals, and ownership

- In scope: authorisation argument, publish gate, parser, SQL constraints, env file, dependencies.
- Explicit non-goals: code changes and live attacks.
- Owned/write paths: read-only. The lead materializes this directory.
- Read-only paths: `src/`, `db/`, `test/`, `.env.example`.
- External-system scope: none.
- Prohibited actions: implementing fixes or waiving high findings.

## 4. Inherited requirements and vertical responsibilities

R0 controls: closed kill switches, one-version approval, untrusted inbound text, no credentials in git.

## 5. Assumptions, open questions, and clarification decisions

- verified: there is no HTTP server in this phase.
- provisional: none that change the verdict.
- blocking: none.

## 6. Skills, tools, and evidence sources

Source inspection plus the already executed `npm test` and `npm install` audit. No extra scanner was available in the repo.

## 7. Outputs and storage paths

This directory.

## 8. Horizontal quality coverage

- Product and user acceptance: reviewed.
- UI/UX and accessibility: not applicable.
- Frontend/backend/data/API/integration impact: reviewed.
- Security/privacy/compliance/abuse: owned.
- Testing/observability/reliability/performance: reviewed via tests.
- Deployment/rollback/operations: no deploy.
- Analytics/growth/consent: not applicable.
- Documentation/handoff: owned for findings.

## 9. Validation plan and gate criteria

PASS only with no open high or critical issue. CONDITIONAL if low gaps have an owner and do not enable posting now.

## 10. Risks, blockers, and escalation triggers

A publish path that ignores the kill switch is a high finding and blocks the gate.

## 11. Failure handling and recovery

BLOCKED returns to engineering. This review found no such path.

## 12. Downstream role and handoff conditions

`project-lead-subagent` may proceed. Phase 3 may not send a post until the named conditions are implemented.
