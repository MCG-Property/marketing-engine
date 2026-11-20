---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
title: MCG Property marketing automation
source_request: docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md
status: active
risk_tier: high
created_at: 2026-11-20T02:00:00Z
updated_at: 2026-11-20T11:02:00Z
revision: 10
owner: user-operator
active_role: none
current_gate: phase-5-accepted
---

# Workstream Manifest: MCG Property marketing automation

## 1. Objective and requested outcome

Turn the EL-MCG-002 blueprint into a sequential build. Milestones 1 through 5 are accepted. Publishing and community replies stay off. The public dashboard waits for Microsoft login.

## 2. Source request and project context

The user asked for planned stages under `docs/plans/`, following `.cursor/BOOTSTRAP.md`. The product contract is `docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md`. `/launch-pipeline` was not invoked. Strategy rediscovery was not run because that blueprint already exists.

## 3. Scope and non-goals

Scope now: phase 5 is implemented in the local dashboard. Phase 0 through phase 4 code remain as built.

Non-goals now: deploys, live provider calls beyond the existing inbox read, turning a switch on, and secret values. Whole-project exclusions stay in phase 0 §2.

## 4. Risk classification

- Impacted domains: content workflow, publishing credentials, enquiry and review text, staff dashboard, local listings.
- Product/user impact: the finished system publishes public posts and drafts customer replies. This revision only adds plans.
- Data, privacy, identity, or compliance impact: later phases handle customer messages, reviews, and account tokens. No personal data is stored in this revision.
- Security/abuse exposure: high once publishing and inbound messages exist. Phase 0 is where the publish gate and AI isolation boundary are specified.
- Production/infrastructure impact: a draft-only Hermes profile and a working-tree copy exist on the Cindy VPS. Nothing is published.
- Reversibility: this revision is documentation and can be reverted. Later production publishing is not freely reversible.
- Release significance: no release.
- Selected tier and evidence: Tier 3 (high) for the workstream, because authorisation, secrets, and public posting are in the product even though this revision does not deploy. Evidence is blueprint §§18–20 and §§23–25.

## 5. Role routing matrix

Roles below ran for phase 0. The lead materialized the role files in this session. UX and growth stayed skipped.

| Role ID | Required or skipped | Reason/evidence | Predecessor | Owned paths | Status | Handoff |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | Contractual scope, acceptance, and milestone gates. Blueprint §§1, 21–27, 34–35. | none | plan and stack decision, review only | complete | `product-manager-subagent/handoff.md` verdict PASS |
| `ui-ux-developer-subagent` | skipped | No screens in phase 0. Dashboard IA is blueprint §§15–16 and belongs to phases 1 and 5. Assessed by the lead on 2026-11-20. | none | none | skipped | none |
| `software-engineer-subagent` | required | Phase 0 creates the package, schema, and gates. | product-manager handoff | `package.json`, `tsconfig.json`, `db/`, `src/`, `test/`, `.env.example` | complete | `software-engineer-subagent/handoff.md` verdict PASS |
| `security-engineer-subagent` | required | Tier 3 authz, secrets, audit, and publish boundary. Blueprint §18. | software-engineer evidence | read-only review of engineer paths | complete | `security-engineer-subagent/handoff.md` verdict CONDITIONAL |
| `growth-marketing-subagent` | skipped | Phase 0 does not change channels, claims, UTMs, or experiments. Blueprint §§8 and 17 already fix them. Reassess at phase 5. Assessed by the lead on 2026-11-20. | none | none | skipped | none |
| `project-lead-subagent` | required | Tier 3 owner handoff before the phase 1 plan. | security handoff | `delivery/owner-handoff.md` | complete | `project-lead-subagent/handoff.md` verdict CONDITIONAL |

## 6. Requirement traceability

| Requirement ID | Requirement | Source | Owner role | Acceptance evidence | Status |
|---|---|---|---|---|---|
| R0 | Foundation schema, state machine, approval lock, kill switches, provider seams | Blueprint §§4–7, 18–20 | `software-engineer-subagent` | `npm test` 18 passed; migration not applied | conditional |
| R1 | Strategy baseline and MCG stage 1 acceptance | Blueprint §21 | `product-manager-subagent` | phase 1 acceptance, not yet planned as a file | mapped |
| R2 | Content workflow and source rules | Blueprint §§8–11, 22 | `software-engineer-subagent` | phase 2 | mapped |
| R3 | Approvals and Facebook/Instagram publishing | Blueprint §§7, 23 | `software-engineer-subagent` | phase 3 | mapped |
| R4 | Community, reviews, visibility | Blueprint §§12–14, 24 | `software-engineer-subagent` | milestone 4 accepted 2026-11-20 | accepted |
| R5 | Dashboard, reporting, handover, week 6 buffer | Blueprint §§15–17, 25–26, 30–32, 35 | `project-lead-subagent` | phase 5 and final checklist | mapped |

## 7. Dependency and gate order

1. Phase 0 plan.
2. Product manager PASS, engineer PASS, security CONDITIONAL, project lead CONDITIONAL.
3. Phase 0 is locally verified. S0-1 and S0-2 remain before any send.
4. Generate `docs/plans/phase_1_strategy_baseline_plan.md` only when the owner asks and the phase 0 prompt is run. Do not send posts before S0-1 and S0-2.
5. Phases 2–5 follow the same loop. MCG written acceptance of milestone N is required before the plan for milestone N+1 is generated.
6. Phase 5 writes `docs/plans/final_implementation_checklist.md`.

UX and growth stay out of the phase 0 chain. Later phases reassess them.

Phase 4 growth-marketing-subagent is skipped. Review ethics and channel limits are already fixed in phase 0 §2, and this phase adds no experiment.

## 8. Path and external-system ownership

| Path or system | Writer | Read-only reviewers | Allowed operation | Ownership window |
|---|---|---|---|---|
| `docs/plans/phase_0_foundations_plan.md` | lead | product manager, project lead | create and later fill evidence | now until phase 0 closes |
| `docs/plans/README.md` | lead | project lead | index the phase map | this revision |
| `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` | lead | all roles | status updates | whole workstream |
| `.cursor/STATE.md` and `.cursor/memory/` | lead | none | state and continuation | this revision and later gates |
| `src/`, `db/`, `test/`, `.env.example` | software engineer | security | created in phase 0 | this revision |
| Blueprint | none | all | read | do not edit |
| Buffer, Meta, Google, model provider, Supabase, Vercel | none | none | no calls | not open |

## 9. Tool and MCP constraints

No external MCP writes. No deploys. Vercel and Supabase skills apply only after a later phase selects that host and an account exists. Do not print secret values.

## 10. Decisions, clarifications, and provisional assumptions

- verified: blueprint is the product contract; later phase files wait until the prior phase is verified.
- verified: manual listing data is enough; Agentbox is optional.
- provisional: Postgres plus in-repo SQL, Supabase when an account exists, `pg-boss`, no Redis. Worker host and approval transport are undecided. Impact if wrong: phase 3 or 5 swaps one adapter, not the state machine.
- provisional: `PROJECT_CONFIG` keys listed in the phase 0 plan close the blank blueprint §28. Impact if wrong: rename config fields before phase 1 data is entered.

## 11. Active blockers and remediation loops

| Finding or requirement | Owner | Status | Invalidated gates | Recheck requirement |
|---|---|---|---|---|
| S0-1 idempotency key not stored by `beginPublish` | software engineer in phase 3 | closed in `publishRun` | none | a conflicting key must not call the adapter |
| S0-2 `kill_switch` rows are not loaded | software engineer in phase 3 | closed in `publishRun` | none | default rows keep the switch off |
| SQL migration apply | software engineer when `DATABASE_URL` exists | unverified | none | apply `db/migrations/001_foundation.sql` |

## 12. Artifact and evidence index

- Active plan: `docs/plans/phase_4_community_reputation_plan.md`
- Phase 0 plan: `docs/plans/phase_0_foundations_plan.md`
- Blueprint: `docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md`
- Decision: `docs/decisions/0001-foundation-stack.md`
- Role handoffs: product manager PASS, engineer PASS, security CONDITIONAL, project lead CONDITIONAL
- Owner handoff: `delivery/owner-handoff.md`
- Tests: `npm test` 18 passed; `npm run typecheck` exit 0; migration not applied

## 13. Residual risks and human actions

S0-1 and S0-2 are low and due before any send. Approval transport, worker host, and MCG brand inputs stay non-blocking. Human actions remain in phase 0 §17. No secret values are stored here.

## 14. Owner decisions and approvals

Owner handoff is written and unselected. No approval is inferred.

## 15. Closure

- Final verdict: conditional. Local foundation is verified. It is not production and not closed.
- Owner handoff: `delivery/owner-handoff.md`
- Closure evidence: 18 tests, typecheck, security conditions.
- Remaining manual actions: see phase 0 §17. They are not due now.
