---
plan: phase_3_approvals_publishing
status: complete
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/plans/phase_2_content_workflow_plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 3: Approvals and publishing

## 1. Objective

Build milestone 3 on the current package: a Y/N/C queue for one draft version, a schedule step, and a publish function that cannot send until the idempotency key is stored, the kill switch is read from rows, and the switch is on.

This is blueprint milestone 3 (A$1,400, week 3). It does not ingest comments, request reviews, or replace the dashboard with the production report.

## 2. Relation to project end-state

The end state is unchanged from phase 0 §2. This phase is the first one allowed to define a send. The send stays closed in the default configuration.

Milestone 2 was accepted on 2026-11-20. A sample draft is acceptable as a draft. It is not a real post. Milestone 3 was accepted on 2026-11-20.

## 3. Entry criteria and inherited evidence

| Evidence | Status | What this phase inherits |
|---|---|---|
| Phase 2 engineering | verified | Draft packages, source gate, SVG examples, dashboard Drafts section. `npm test` 34 passed. `npm run typecheck` exit 0. |
| Milestone 1 | verified | Operator approval on 2026-11-20. |
| Milestone 2 | verified | Accepted 2026-11-20. A sample draft is acceptable as a draft. Samples stay labelled Sample. |
| S0-1 | verified | `publishRun` reserves `publication.idempotency_key` before the adapter. A conflicting key does not call the adapter. |
| S0-2 | verified | `publishRun` loads flags with `killSwitchesFromRows`. It does not take a flags argument. Default rows stay false. |
| Schema | local only | `db/migrations/001_foundation.sql` and `supabase/migrations/20261120025022_foundation.sql` are not applied on the hosted database. |
| Hermes | verified | `marketingprojectlead` may draft. It has no publish credential and must not gain one. |

## 4. Scope

- Submit a non-sample draft from `DRAFT` through `READY_FOR_REVIEW` to `AWAITING_APPROVAL`.
- Render the blueprint approval message and parse `Y`, `N`, and `C` with the existing `parseDecision`.
- Apply `decide` and `revise`. A second `Y` on the same version is a no-op. A `C` with an instruction returns the item to `DRAFT` at the next version and voids the previous `Y`.
- A time moves `APPROVED` to `SCHEDULED`. Cancelling a scheduled item uses `revise`.
- Close S0-1: reserve `publication.idempotency_key` before any adapter call.
- Close S0-2: the send path loads flags with `killSwitchesFromRows`. A caller cannot pass `PUBLISHING_ENABLED: true` around that load.
- Adapters, in order: Buffer, then Meta, then manual. Unconfigured adapters throw and do not open a socket. The manual adapter records a receipt only after the reserve step.
- Show the queue on the existing loopback page. Record an audit event for each decision and publish result.
- Tests for approve, reject, change, revise-then-approve, double approve, post-approval edit, API failure, permission failure, and cancellation.

## 5. Non-goals

- Do not publish a sample, a draft with `MISSING_SOURCE_DATA`, or a generated stand-in for a real property or person.
- Do not call Buffer, Meta, Facebook, or Instagram from this plan, from tests, or from the dashboard.
- Do not set any kill switch to true. Do not start `npm run worker`. Do not apply the remote schema.
- Do not give `marketingprojectlead` a publish token or a path that calls `beginPublish`.
- Do not add a paid inbox, Redis, or a new host. Do not add phase 4 intake.
- Do not generate the phase 4 plan in this phase.

## 6. Current-state audit

Inspected on 2026-11-20, after phase 2:

- `decide` requires `AWAITING_APPROVAL`. A live `Y` for the same version returns the item unchanged. `revise` increments the version, voids that `Y`, and sets `DRAFT`, and it refuses `PUBLISHING`.
- `transition` cannot enter `PUBLISHING`. `SCHEDULED` has no outward edge. Cancellation has to go through `revise`, which does not use `transition`.
- `beginPublish` accepts `APPROVED` or `SCHEDULED`, a matching unvoided `Y`, an unused key, role `PUBLISH` or `ADMIN`, and `PUBLISHING_ENABLED`. The key check is an in-memory set.
- `parseDecision` accepts `Y C104` and a bare `Y` only when one id is pending.
- The page says approval is not open yet. Drafts are samples.
- `content.publish` is a queue name. The worker creates queues and does not publish.
- Buffer and Meta names are empty in `.env.example`. Nothing in `src/` reads them.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Client gate | verified | Milestone 2 accepted 2026-11-20. Samples are acceptable drafts. They are not approvable posts. |
| Approval surface | accepted | The loopback dashboard is the phase 3 post queue. Hermes may format a message and must not choose `Y`, `N`, or `C`. On 2026-11-20 the operator named the later transports: WhatsApp for Facebook and Instagram message approvals, and iMessage for post decisions once that channel is connected. |
| Schedule | verified | No campaign calendar. Each item has its own optional time. No time means it stays `APPROVED` and is not sent. |
| Send gate | verified | Keep `beginPublish`. Add a reserve step in front of it. Default switch stays false. |
| Adapter | accepted | Code order is Buffer, Meta, manual. With no credentials, only the manual adapter can record a receipt, and only in a test or an explicit staff action. The switch stays off. |
| Samples | verified | `sample: true` or `MISSING_SOURCE_DATA` cannot be submitted for approval. |
| Persistence | accepted | Functions take a store argument. Tests use a memory store with the same unique-key rule as `publication_idempotency_uq`. SQL runs only when a pool is passed. The dashboard does not open a pool. |
| Cost | verified | No new service. OpenRouter spend is not part of this phase. |

Risk: a future worker plus a true switch would send. This phase does not start the worker and does not flip the switch. Risk: Buffer cannot preserve the approval record. The manual receipt remains the fallback, as the blueprint allows.

## 8. Dependencies

- Phase 2 draft package and source gate.
- Existing tables `content_item`, `approval`, `publication`, `audit_event`, and `kill_switch`. No new migration unless a task proves a column is missing. Do not push SQL to the hosted database in this phase.
- Human Buffer or Meta credentials stay in §17. Their absence does not block the manual and failure tests.

## 9. Architecture and affected systems

```text
non-sample draft
  → READY_FOR_REVIEW → AWAITING_APPROVAL
  → dashboard message
  → Y / N / C
  → APPROVED, then SCHEDULED when a time is set
  → reserve publication.idempotency_key
  → beginPublish
  → adapter (Buffer, else Meta, else manual)
  → PUBLISHED, FAILED, or PUBLISH_UNKNOWN
  → audit event and dashboard receipt
```

`PUBLISH_UNKNOWN` is reconciled by the stored key. It is not a reason to call the adapter again with a new key. `FAILED` stays failed until a person revises or retries with the same key.

The dashboard and Hermes do not import the adapter. The adapter does not read inbound text.

## 10. Files and paths in scope

Create:

- `src/approval/queue.ts`
- `src/approval/message.ts`
- `src/providers/publish-run.ts`
- `src/providers/adapters.ts`
- `test/approval-queue.test.ts`
- `test/publish-run.test.ts`

Update:

- `src/dashboard/render.ts` and `test/dashboard.test.ts`
- `src/providers/publishing.ts` only to remove the S0-1 shortcut comment after the reserve step exists
- phase 3 role files under `docs/workstreams/20261120-mcg-marketing-automation/`
- this plan's §20 when implementation finishes

Do not edit `inboundengineprojectlead`. Do not put tokens in the Hermes profile.

## 11. Supporting documents to create or update

| Document | When |
|---|---|
| Role plans | At implementation start, `phase-3-plan.md` and `phase-3-handoff.md` in each required role directory. Do not overwrite phase 0, 1, or 2 files. |
| `docs/decisions/0002-integration-map.md` | When an adapter is selected for a real account. Until then it still says nothing is connected. |

## 12. Ordered implementation tasks

### Task 1 — Product and UX plans

- Objective: lock what can be approved and how the queue looks.
- Dependencies: this plan.
- Files: `product-manager-subagent/phase-3-plan.md`, `product-manager-subagent/phase-3-handoff.md`, `ui-ux-developer-subagent/phase-3-plan.md`, `ui-ux-developer-subagent/phase-3-handoff.md`.
- Notes: samples and missing-source drafts stay in Drafts and have no Y/N/C control. A real item shows the blueprint message: id, Facebook and Instagram, schedule, template, title, caption, and the Y/N/C replies. The page must not show tokens, SQL, or kill-switch names.
- Validation: both handoffs name this plan §9.
- Completion state: done.

### Task 2 — Queue

- Objective: move one non-sample draft through decision and revision.
- Dependencies: task 1.
- Files: `src/approval/queue.ts`, `src/approval/message.ts`, `test/approval-queue.test.ts`.
- Notes: submit walks `DRAFT` to `READY_FOR_REVIEW` to `AWAITING_APPROVAL` with `transition`. Reject `sample` and `MISSING_SOURCE_DATA`. `C` without an instruction does not revise. Cancel on `SCHEDULED` calls `revise`. Shorthand `Y` works only when one id is awaiting.
- Validation: the blueprint cases for approve, reject, change, revise-then-approve, double approve, post-approval edit, and cancellation.
- Completion state: done.

### Task 3 — Reserve and send

- Objective: close S0-1 and S0-2 before an adapter runs.
- Dependencies: task 2.
- Files: `src/providers/publish-run.ts`, `src/providers/adapters.ts`, `test/publish-run.test.ts`.
- Notes: load flags from rows. Insert the key `${id}:${version}:publish` with status `PUBLISHING` before the adapter. A unique collision returns the existing row and does not call the adapter. Buffer is first, then Meta, then manual. Buffer and Meta throw `NOT_CONFIGURED` when their names are empty. The manual adapter writes a receipt and does not use the network. API and permission failures set `FAILED` once. A missing receipt sets `PUBLISH_UNKNOWN` and does not mint a new key.
- Validation: switch off, duplicate key, API failure, permission failure, and unknown result. Assert the adapter mock is not called when the switch is off or the key already exists.
- Completion state: done.

### Task 4 — Dashboard queue

- Objective: let a person decide on the loopback page.
- Dependencies: task 3.
- Files: `src/dashboard/render.ts`, `src/dashboard/serve.ts`, `test/dashboard.test.ts`.
- Notes: replace "Approval is not open yet" with the queue. Keep the page on `127.0.0.1`. A decision post calls the queue, not `publish-run`. Sending stays a separate explicit action and still no-ops while the switch is false. Do not import `beginPublish` into `render.ts`.
- Validation: `npm test`, `npm run typecheck`, and one load of `http://127.0.0.1:8787/` showing a sample still unapprovable. Do not leave a second listener on port 8787.
- Completion state: done.

### Task 5 — Role gates

- Objective: security reviews the send path, then project lead reconciles.
- Dependencies: task 4.
- Files: `security-engineer-subagent/phase-3-handoff.md`, `project-lead-subagent/phase-3-handoff.md`.
- Notes: security fails the phase if a sample can be reserved, if the adapter runs before the key insert, if flags are not loaded from rows, or if the page shows a secret. Hermes remains unable to publish. Growth stays skipped.
- Validation: security verdict is `PASS` or `CONDITIONAL` with no live send.
- Completion state: done.

## 13. Adaptive role and delegation map

This phase is Tier 3: it builds the public send path even though the switch stays off. Do not spawn subagents unless implementation starts and a role must be a separate pass.

| Role ID | Required or skipped | Reason | Predecessor | Owned paths | Gate evidence | Status |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | Sample posts must not become approvable | phase 2 PM handoff | phase 3 product plan and handoff | `product-manager-subagent/phase-3-handoff.md` | PASS |
| `ui-ux-developer-subagent` | required | The approval message is a new staff interaction | product phase 3 handoff | phase 3 UX plan; review of `render.ts` | `ui-ux-developer-subagent/phase-3-handoff.md` | PASS |
| `software-engineer-subagent` | required | Queue, reserve, adapters, tests | UX phase 3 handoff | `src/approval/`, `src/providers/publish-run.ts`, `src/providers/adapters.ts`, dashboard queue, tests | `software-engineer-subagent/phase-3-handoff.md` | PASS |
| `security-engineer-subagent` | required | S0-1, S0-2, no sample send, no secrets on the page | engineering phase 3 evidence | read-only | `security-engineer-subagent/phase-3-handoff.md` | PASS |
| `growth-marketing-subagent` | skipped | No new channel, offer, or numeric claim. Facebook and Instagram stay the only channels. Reassess if a result metric is shown as real. Assessed by the lead on 2026-11-20. | none | none | manifest skip for this phase | skipped |
| `project-lead-subagent` | required | Reconcile milestone 3 evidence | security phase 3 handoff | phase 3 project-lead handoff | `project-lead-subagent/phase-3-handoff.md` | CONDITIONAL |

Phase 0, 1, and 2 handoffs stay as they are.

## 14. Test and validation matrix

| Requirement | Validation method | Expected evidence | Status |
|---|---|---|---|
| Approve, reject, change, revise then approve | queue test | statuses match `decide` and `revise` | passed |
| Second `Y` does not publish twice | queue test plus publish test | no second adapter call | passed |
| Edit after `Y` voids the approval | queue test | version increments, `Y` voided, status `DRAFT` | passed |
| Sample or missing source cannot be submitted | queue test | rejection before `AWAITING_APPROVAL` | passed |
| S0-1 reserve before adapter | publish test | duplicate key does not call the adapter | passed |
| S0-2 flags come from rows | publish test | default rows keep the switch off | passed |
| API failure, permission failure, unknown result | publish test | `FAILED` or `PUBLISH_UNKNOWN`, same key | passed |
| Cancellation | queue test | `revise` from `SCHEDULED` returns `DRAFT` | passed |
| Page stays loopback and hides secrets | dashboard test and one local load | no token, no switch name, sample has no Y control | passed |

## 15. Security, privacy, reliability, accessibility, and performance checks

- The reserve insert and the status change to `PUBLISHING` happen before the adapter, in one store operation.
- Default `kill_switch` rows stay false. The dashboard has no control that sets them true.
- Buffer and Meta clients are not constructed when their env names are empty.
- Approval text is escaped. Inbound reply text is a decision, not an instruction to the model.
- A duplicate `Y` and a duplicate key are no-ops, not retries.
- The page remains a short loopback form. No new font or image pipeline.
- Hermes is outside the send path.

## 16. Environment-variable registry

Names only. No new names.

| Variable name | Purpose | Scope | Required by phase | Source | Status |
|---|---|---|---|---|---|
| `BUFFER_ACCESS_TOKEN` | Buffer send, if selected | server only | 3, live send only | Buffer | empty |
| `BUFFER_ORGANIZATION_ID` | Buffer organisation | server only | 3, live send only | Buffer | empty |
| `META_PAGE_ID` | Facebook Page, if Buffer cannot | server only | 3, live send only | Meta | empty |
| `META_PAGE_ACCESS_TOKEN` | Page publish | server only | 3, live send only | Meta | empty |
| `META_INSTAGRAM_ACCOUNT_ID` | Instagram account | server only | 3, live send only | Meta | empty |
| `DATABASE_URL` | Optional store | server only | not required for the memory tests | Supabase | unset in this plan |

## 17. Deferred human-action queue

| Action | Why the agent cannot do it | Earliest phase | Blocking now? | Destination |
|---|---|---|---|---|
| Accept milestone 2 in writing | Client gate | before treating samples as real | no | recorded in the phase 2 plan on 2026-11-20 |
| Accept milestone 3 in writing | Client gate | before phase 4 is planned | no | recorded in §20 on 2026-11-20 |
| Create Buffer or Meta credentials | Account owner | live send | no | final checklist |
| Apply the hosted migration | Remote mutation hook | when the operator asks and the hook allows | no | final checklist |
| Put an OpenRouter key on `marketingprojectlead` | Profile credential, not a publish secret | drafting | no | not this phase |

## 18. Rollback and recovery

Rollback is deleting `src/approval/`, `src/providers/publish-run.ts`, and `src/providers/adapters.ts`, and restoring the dashboard approval sentence. No hosted row is written by this plan. `PUBLISHING_ENABLED` stays false, so a partial deploy still cannot send. A `PUBLISH_UNKNOWN` item is reconciled from its stored key and is not posted again under a new key.

## 19. Acceptance criteria

1. A non-sample item can move `DRAFT` → `AWAITING_APPROVAL` → `Y` → `APPROVED` → `SCHEDULED`.
2. Reject, change, double approve, edit-after-approve, and cancellation match §14.
3. A sample cannot enter the queue or the reserve step.
4. The adapter is not called unless the key was reserved and the loaded switch is on.
5. API failure, permission failure, and an unknown result do not retry with a new key.
6. The loopback page shows the queue and still labels samples as samples.
7. `npm test` and `npm run typecheck` pass.
8. Required phase 3 role handoffs exist. Growth remains skipped with the reason in §13.
9. No live Buffer or Meta call, no worker start, and no remote migration.
10. MCG written acceptance of milestone 3 is recorded in §20 before anyone generates the phase 4 plan.

## 20. Completion evidence

2026-11-20:

- `npm test`: 46 passed, 0 failed.
- `npm run typecheck`: exit 0.
- Queue, reserve, and adapters are local. Buffer and Meta are not called. The worker was not started. The hosted schema was not applied.
- Role handoffs: product, UX, engineering, and security `PASS`. Growth skipped. Project lead was `CONDITIONAL` on milestone 3 acceptance. That acceptance is now recorded.
- MCG written acceptance of milestone 3 was recorded on 2026-11-20. The operator accepted the dashboard post queue, the Buffer then Meta then manual order with the switch off, and the memory store. WhatsApp is the approval channel for Facebook and Instagram messages. Post decisions move to iMessage once that channel is connected. Hermes still must not choose `Y`, `N`, or `C`.

## 21. Deviations and follow-ups

- This plan was written on an operator instruction while milestone 2 acceptance was still unrecorded. Acceptance was recorded later the same day. A sample draft is acceptable as a draft and is not an approvable post.
- The phase 3 post queue remains the loopback page. Message approvals are WhatsApp. Post decisions are iMessage once Photon is connected.
- After this plan was written, the dashboard gained a Messenger and Instagram read path and a direct reply form. Post publishing stayed closed. Phase 4 closes the direct reply so a customer message is not sent before WhatsApp approval.
- Live Facebook and Instagram connections wait on credentials. The code path is the adapter order in §7.
- Hosted SQL stays unapplied.
- Phase 4 is not planned by this document.

## 22. Next Plan Generation Prompt

Read `/AGENTS.md` if it is not already in context, `/instructions/PROJECT_PLANNING.md`, `/instructions/ROLES.md`, the original `docs/plans/phase_0_foundations_plan.md`, this completed phase plan, the active workstream manifest and role handoffs, all completion evidence, current repository state, active blockers, and relevant decisions. Confirm this phase and every required role gate are fully implemented and validated. Confirm MCG written acceptance of milestone 3 is recorded in this plan. If that acceptance is missing, stop and do not generate the next plan. Then generate exactly one exhaustive next phase plan at `docs/plans/phase_4_community_reputation_plan.md`. Derive it from the phase-0 roadmap and verified current state, preserve unresolved requirements, include all required plan sections and adaptive role decisions, defer non-blocking human actions to the final phase, and do not implement the next phase until the plan is written.
