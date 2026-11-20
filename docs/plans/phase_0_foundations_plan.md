---
plan: phase_0_foundations
status: complete
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 0: Foundations

## 1. Objective

Establish the engineering foundation for EL-MCG-002, the supervised marketing automation system for MCG Property Shoalhaven, without implementing later-milestone product behaviour.

Phase 0 leaves a TypeScript service skeleton, the durable data model, the content state machine, approval-version locking, publish and kill-switch gates, provider boundaries, and a names-only environment registry. Public posting, model calls, channel connections, and the staff dashboard stay in later phases.

## 2. Relation to project end-state

Source blueprint: `docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md`.

End state: MCG staff can plan content, receive a caption plus a visual plus a source record, approve or reject it with Y/N/C, publish only the approved version to Facebook and Instagram, triage supported enquiries, draft review replies for approval, see local-listing mismatches, and read a dashboard that separates activity from enquiries from confirmed outcomes. Operating cost after handover stays about A$20–60 per month. MCG keeps administrative control of its own accounts.

Design rule, in force for every phase: **AI may suggest. Code controls. MCG approves.**

Commercial milestones stay client acceptance stages. They are not extra product scope. Week 6 is buffer only.

| Phase | Plan file | Blueprint stage | Outcome | Depends on |
|---|---|---|---|---|
| 0 | `docs/plans/phase_0_foundations_plan.md` | Engineering foundation. Not a paid milestone. | Schema, state machine, gates, provider seams, tests. No live channels. | None |
| 1 | `docs/plans/phase_1_strategy_baseline_plan.md` | Milestone 1, A$800, week 1 | Pillars, calendar, idea library, business profile, approver config, baseline dataset, dashboard skeleton, integration map. | Phase 0 verified |
| 2 | `docs/plans/phase_2_content_workflow_plan.md` | Milestone 2, A$1,400, week 2 | Drafting assistant, brand and source rules, caption templates, HTML/SVG renderer, asset library, versioning, six representative outputs. | Phase 1 accepted |
| 3 | `docs/plans/phase_3_approvals_publishing_plan.md` | Milestone 3, A$1,400, week 3 | Y/N/C queue, version lock, Buffer-first publisher, Facebook and Instagram, receipts, failure handling, live kill switches. | Phase 2 accepted |
| 4 | `docs/plans/phase_4_community_reputation_plan.md` | Milestone 4, A$1,200, week 4 | Comment and enquiry intake, classification, routing, escalation, review requests and replies, visibility checks. | Phase 3 accepted |
| 5 | `docs/plans/phase_5_dashboard_handover_plan.md` | Milestone 5, A$940, week 5, plus week 6 buffer | Staff dashboard, metrics, UTM, monthly report, roles, alerts, backups, guides, production readiness. Then `docs/plans/final_implementation_checklist.md`. | Phase 4 accepted |

Phase 0 and phase 1 are implemented. The phase 2 plan exists as a draft. Later plan files wait until the previous phase is implemented and verified. MCG written acceptance is the blueprint gate before the next plan. The phase 2 plan was written on an operator instruction while milestone 1 acceptance was still unrecorded. Phase 0 has no client acceptance gate.

### Phase 1 — Strategy baseline

Build the configuration the rest of the system reads: content pillars, monthly calendar, idea library, canonical business profile, brand and tone examples, approval owners, channel inventory, access inventory, and a baseline reporting dataset. Add a dashboard skeleton with the staff sections Content, Approvals, Enquiries, Reviews, Performance, and Visibility. Document the integration map, including which systems are manual until credentials exist.

MCG supplies goals, channel priorities, logo and brand assets, tone examples, campaign dates, approvers, and account access. The phase still ships with explicit empty or sample values where those are missing. Sample listings are labelled sample.

Acceptance: a reviewer can see the agreed pillars, a month calendar, the idea library, the baseline dashboard skeleton, and the integration map. MCG accepts stage 1 before phase 2 is planned.

### Phase 2 — Content workflow

Implement generation from approved sources only, in this priority: MCG internal or property data, approved listing feed or MCG website, MCG-supplied facts, official public sources, then human-provided information. Missing facts set `MISSING_SOURCE_DATA` and stay in `DRAFT`. Never invent prices, features, listing status, sale outcomes, inspection times, review text, statistics, testimonials, or agent quotes.

Listing posts use authorised photography. Generated images are allowed only for abstract, educational, generic community, or decorative graphics that cannot be mistaken for a real property. `ListingSourceAdapter` supports manual records first. Agentbox, REAXML, and the MCG website are optional adapters. Completion does not wait on Agentbox.

Ship reusable HTML/SVG templates rendered to 1080×1080 or the channel size: New Listing, Sold, Open Home, Auction, Customer Review, Market Update, Local Spotlight, Property Tip, Team Profile, Community Event. Financial, tax, or legal claims require a source and human approval.

Acceptance: choosing an idea returns a caption, a visual, a channel recommendation, and a source record, ready for approval. Required examples: listing, sold or review, market update, local feature, educational post, team post, plus a short-video script, a carousel outline, and a reusable brief.

### Phase 3 — Approvals and publishing

Messaging approval uses the blueprint format. `Y`, `N`, and `C` apply to one content id. Shorthand without an id is valid only when one approval is pending. A second `Y` does not publish twice. Any change to copy, image, schedule, or facts invalidates that approval and returns the item through `DRAFT`.

Publishing order: Buffer API if it can schedule both channels and preserve the approval record; direct Meta Page publishing where Buffer cannot; manual or native fallback where no suitable API exists. Facebook and Instagram are the only channels. `PUBLISHING_ENABLED=false` stops outgoing posts without a deploy. Unknown publish results become `PUBLISH_UNKNOWN` and are reconciled, not blindly retried.

Acceptance path: `IDEA → DRAFT → message approval → Y → SCHEDULED → PUBLISHED → dashboard receipt`, plus the blueprint's reject, change, double-approve, post-approval edit, API failure, permission failure, and cancellation cases.

### Phase 4 — Community, reputation, and visibility

Ingest supported Facebook and Instagram comments and messages. Classify as property enquiry, general question, sales lead, support, positive comment, complaint, reputational risk, spam, or unknown. Routine items get a draft reply that still needs approval. Sales and property enquiries route to a named staff member. Complaints and reputational items escalate to a human with no autonomous public reply. Spam gets no model reply. Inbound text is untrusted data and cannot change instructions, credentials, approvals, tools, or publishing.

Review requests run only after an MCG-approved customer milestone. No review gating and no requests selected by a predicted positive rating. Replies are drafted, then approved, then sent. Google Business Profile API is used when Google has approved the Cloud project and MCG has authorised it. Otherwise the same internal workflow is fed by manual monitoring.

Visibility compares one canonical identity (name, address, phone, website, hours, category, social links) with Google Business Profile and the directories named in phase 1. Results are `MATCH`, `MISMATCH`, `MISSING`, or `REVIEW_REQUIRED`. Automatic correction runs only with an authorised API, MCG permission, and in-scope change. Otherwise create a correction task.

Acceptance: the required scenarios are observable, including complaint escalation, a drafted review reply, and a listing mismatch on the dashboard.

### Phase 5 — Dashboard, handover, and closure

Replace the skeleton with the production staff dashboard. Ingest metrics. Generate UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) and keep internal campaign ids. The monthly report answers what happened, what worked, what did not, what generated enquiries, what needs attention, and what to test next. The model receives computed metrics only. Staff never see queues, tokens, cron jobs, API payloads, or database records. Those stay on an admin diagnostic view.

Ship settings, the READ / WRITE / PUBLISH / ADMIN separation, error notifications, backup and recovery, the staff one-pager, the administrator guide, and the technical runbook. Week 6 inside this phase is only for delayed third-party approvals, permission problems, production observation, in-scope fixes, and client scheduling. Missing APIs use the manual fallback.

After agent-executable work is verified, write `docs/plans/final_implementation_checklist.md` containing only leftover human account, credential, DNS, billing, and production-acceptance actions.

Definition of done is blueprint §35. Production is not declared ready until blueprint §30 is true, including a supervised MCG production test.

### Out of scope for the whole project

Additional social channels, paid-ad management, ad spend, photo or video shoots, influencer fees, broad directory syndication, a new CRM, website redevelopment, payments, appointment-platform replacement, custom mobile apps, and integrations outside the accepted scope. Expansions are written variations. No new recurring service that would push the A$20–60 monthly target without approval.

Conflict order: safety and client control, accepted scope, reliability, staff simplicity, low ongoing cost, automation depth, developer convenience.

## 3. Entry criteria and inherited evidence

- Preflight on 2026-11-20 returned `READY`. Bootstrap was not required.
- The repository has the agent control plane and this blueprint. It has no `package.json`, application source, product tests, or linked app host.
- Node on this machine is v22.14.0.
- No active plan or workstream existed before this document.
- Strategy rediscovery was not run. The blueprint is already the product and architecture contract.

## 4. Scope

Phase 0 implements only:

- a Node 22 TypeScript package and `node --test` harness;
- SQL migrations for the blueprint's logical records;
- the content state machine and one-version approval lock;
- runtime kill switches defaulting to a safe publishing-off state;
- role names READ, WRITE, PUBLISH, ADMIN as a code-level check, not a live identity provider;
- interfaces for the model, publishing, listing, messaging, and review providers;
- idempotency and audit helpers;
- a Postgres-backed job seam compatible with `pg-boss`, without a production worker host;
- `PROJECT_CONFIG` keys the later phases read;
- `.env.example` names and `docs/decisions/0001-foundation-stack.md`.

## 5. Non-goals

- Do not call Buffer, Meta, Google, GA4, email, or a model provider.
- Do not build the dashboard UI, content calendar, caption generator, image renderer, or enquiry classifier.
- Do not store secret values, sample tokens, or real customer records.
- Do not add Redis or another paid service.
- Do not wait on Agentbox, Google API approval, or MCG brand files.
- Do not write phase 1–5 plan files in this phase.
- Do not deploy.

## 6. Current-state audit

Inspected on 2026-11-20:

- Product source is the blueprint only. `docs/decisions/` is empty. `docs/plans/` contained the generic index.
- There is no application, migration, test suite, or `.env.example`.
- Vercel and Supabase skills exist under `.cursor/skills/` for later hosting. Neither is configured for this product.
- Blueprint §28 says to record project configuration and then stops at "Maintain these in PROJECT_CONFIG." The key list below is inferred from milestones 1 and §§13–14. It is a provisional closure of that gap.
- The blueprint names no approval transport (SMS, email, WhatsApp, or another inbox). Phase 3 must adapt to whatever MCG already uses. Phase 0 only defines the messaging interface.
- The blueprint prefers `pg-boss` on PostgreSQL and a lightweight authenticated dashboard. It does not name the host. An always-on worker and a serverless dashboard can diverge. The decision record in task 1 resolves that before any deploy. Phase 0 code stays host-neutral.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Product contract | verified | The blueprint overrides ad-hoc scope. Payments and the 4–6 week target are client facts, not engineering estimates. |
| Database | provisional | PostgreSQL, SQL migrations in `db/migrations/`. Supabase is the preferred host when an account exists, because the linked-migration skill is already in the repo and the cost target is low. Local files must apply without Supabase. |
| App package | provisional | One Node 22 TypeScript package. Node's test runner. `typescript` is a devDependency for `tsc --noEmit`. Runtime dependencies in this phase are limited to `pg` and `pg-boss`. |
| Worker | provisional | Job handlers are plain functions. `pg-boss` is the queue when `DATABASE_URL` is present. Tests of the state machine do not need a database. Production process hosting is decided in `docs/decisions/0001-foundation-stack.md` before deploy, and must stay inside the operating-cost target. |
| Dashboard host | provisional | Not built in phase 0. Preferred later host is Vercel for the web app only, recorded in the same decision. |
| Publishing | provisional | Adapter interface now. Buffer, then Meta, then manual, decided with evidence in phase 3. |
| Listing source | verified | Manual approved records are enough to finish. No Agentbox dependency. |
| Approval transport | provisional | Interface methods `sendApprovalRequest` and `parseDecision`. No vendor SDK in phase 0. |
| Model output | verified | Programmatic model calls return validated structured data. The model never receives publishing credentials and never writes workflow state. |
| Kill switches | verified | Runtime flags, so publishing can stop without a deploy. Defaults: `PUBLISHING_ENABLED`, `COMMUNITY_REPLY_ENABLED`, `REVIEW_REQUESTS_ENABLED`, and `REVIEW_REPLIES_ENABLED` are false. `AUTOMATION_ENABLED` and `CONTENT_GENERATION_ENABLED` are false until the phase that uses them turns them on in a non-production config. |
| Client gate | verified | Phases 2–5 are not planned until MCG has accepted the previous milestone. |

Risks: a serverless-only host cannot run `pg-boss` reliably; Buffer's API may fail the approval-receipt requirement and force direct Meta; Google API approval may never arrive; MCG brand inputs can delay milestone 1 acceptance without blocking this phase. Each has a fallback already in the blueprint (manual channel, manual Google monitoring, sample config).

## 8. Dependencies

- Phase 0 depends on Node 22 and, for a live migration apply, a local Postgres the agent can reach. Absence of local Postgres limits migration evidence to static SQL checks. It does not stop the state-machine tests.
- Later phases depend on this schema and these gates remaining the single write path.
- External accounts and secrets are listed in §17 and are not dependencies of phase 0.

## 9. Architecture and affected systems

```text
approved sources
  → content records + state machine
  → approval row bound to one version
  → publishing provider (blocked unless APPROVED or SCHEDULED, kill switch on, and idempotency key unused)
  → publication receipt
  → metrics / enquiries / reviews / visibility (tables only in this phase)
  → audit event on every transition
```

Provider modules accept already-authorised commands from workflow code. They do not read inbound customer text as instructions. Workflow code is the only writer of `status`.

No external system is contacted in this phase.

## 10. Files and paths in scope

Create:

- `package.json`, `tsconfig.json`, `.env.example`
- `db/migrations/001_foundation.sql`
- `src/config/kill-switches.ts`
- `src/config/project-config.ts`
- `src/domain/content-state.ts`
- `src/domain/approval.ts`
- `src/domain/audit.ts`
- `src/domain/idempotency.ts`
- `src/auth/roles.ts`
- `src/providers/model.ts`
- `src/providers/publishing.ts`
- `src/providers/listing-source.ts`
- `src/providers/messaging.ts`
- `src/providers/reviews.ts`
- `src/queue/jobs.ts`
- `test/content-state.test.ts`
- `test/approval.test.ts`
- `test/kill-switches.test.ts`
- `test/publishing-gate.test.ts`
- `test/schema-contract.test.ts`
- `docs/decisions/0001-foundation-stack.md`

Update after implementation: this plan's evidence sections, `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`, `.cursor/STATE.md`, and the continuation log.

Do not edit the blueprint.

## 11. Supporting documents to create or update

| Path | When |
|---|---|
| `docs/decisions/0001-foundation-stack.md` | During phase 0 task 1. Postgres in-repo SQL, Supabase as preferred host, Vercel as preferred later web host, `pg-boss` as the queue, worker hosting still undecided if it would add a paid service. |
| `docs/plans/phase_0_foundations_plan.md` | Evidence filled in when implementation finishes. |
| `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` | Gate status updated as roles run. |
| `.env.example` | Names and one-line purpose comments. No values that are secrets. |
| Role `charter.md` and `plan.md` | At the start of implementation, before code, for each required role in §13. |

## 12. Ordered implementation tasks

### Task 1 — Stack decision

- Objective: record the host and queue decision so later code does not invent a second stack.
- Dependencies: none.
- Files: `docs/decisions/0001-foundation-stack.md`.
- Notes: state Postgres SQL in `db/migrations/`, Supabase as the preferred hosted database when the project exists, no Redis, `pg-boss` only against that Postgres, web app deferred, and worker hosting unresolved until a zero-new-cost option is confirmed. Name the rejected option of adding Redis.
- Validation: the file exists, names no secret values, and matches §7.
- Completion state: done.

### Task 2 — Package and test harness

- Objective: make `npm test` run `node --test` on `test/**/*.test.ts` under Node 22, and `npm run typecheck` run `tsc --noEmit`.
- Dependencies: task 1.
- Files: `package.json`, `tsconfig.json`.
- Notes: `typescript` devDependency only. Do not add a web framework, Redis client, or model SDK.
- Validation: `npm test` exits 0 with the tests from later tasks; `npm run typecheck` exits 0.
- Completion state: done.

### Task 3 — Foundation schema

- Objective: create the logical records from blueprint §5.
- Dependencies: task 2.
- Files: `db/migrations/001_foundation.sql`, `test/schema-contract.test.ts`.
- Notes: tables `content_item`, `approval`, `publication`, `enquiry`, `review`, `visibility_check`, `metric`, `audit_event`. `content_item.status` allows only `IDEA`, `DRAFT`, `READY_FOR_REVIEW`, `AWAITING_APPROVAL`, `REJECTED`, `REVISION_REQUESTED`, `APPROVED`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `FAILED`, `PUBLISH_UNKNOWN`. Unique `(channel, external_post_id)` where the external id is present. Unique `(platform, external_review_id)` and unique enquiry `(channel, external_message_id)` where present. Audit columns are `event`, `object_type`, `object_id`, `actor`, `timestamp`, `result`, `metadata`.
- Validation: the contract test asserts those table and status names are in the migration. If `DATABASE_URL` points at a local database, apply the migration and record the command. If it does not, record that apply as unverified.
- Completion state: done.

### Task 4 — State machine and approval lock

- Objective: make illegal transitions and stale approvals impossible in code.
- Dependencies: task 3.
- Files: `src/domain/content-state.ts`, `src/domain/approval.ts`, `test/content-state.test.ts`, `test/approval.test.ts`.
- Notes: allowed edges are the blueprint §6 diagram, plus `PUBLISHING → FAILED` and `PUBLISHING → PUBLISH_UNKNOWN`. `Y` binds `approval.draft_version` to `content_item.current_version`. A later version change marks that approval void. A second `Y` for the same version is a no-op, not a second publish.
- Validation: tests cover the happy path, reject, change-request, double approve, and edit-after-approve.
- Completion state: done.

### Task 5 — Kill switches, roles, audit, idempotency

- Objective: put the safety gates in one place later phases must call.
- Dependencies: task 4.
- Files: `src/config/kill-switches.ts`, `src/auth/roles.ts`, `src/domain/audit.ts`, `src/domain/idempotency.ts`, `test/kill-switches.test.ts`.
- Notes: flags are `AUTOMATION_ENABLED`, `CONTENT_GENERATION_ENABLED`, `PUBLISHING_ENABLED`, `COMMUNITY_REPLY_ENABLED`, `REVIEW_REQUESTS_ENABLED`, `REVIEW_REPLIES_ENABLED`. Defaults are false. Roles are exactly READ, WRITE, PUBLISH, ADMIN. Idempotency keys are deterministic from object id, version, and action.
- Validation: tests prove the defaults and that a false `PUBLISHING_ENABLED` fails a publish attempt closed.
- Completion state: done.

### Task 6 — Provider and job boundaries

- Objective: freeze the seams without live integrations.
- Dependencies: task 5.
- Files: `src/providers/*.ts`, `src/queue/jobs.ts`, `test/publishing-gate.test.ts`.
- Notes: `publish` throws unless status is `APPROVED` or `SCHEDULED`, the approval version matches, the idempotency key is unused, the actor role is PUBLISH or ADMIN, and `PUBLISHING_ENABLED` is true. Model functions accept a schema validator and return typed data; they have no publish method. Listing source has a manual adapter that refuses empty required facts. Messaging exports parse of `Y <id>`, `N <id>`, `C <id> <text>`, and shorthand Y/N/C only when the caller passes a single pending id. Job registration lists handler names and does not start a worker at import.
- Validation: publishing-gate tests cover disabled switch, wrong state, stale version, duplicate key, and insufficient role. `npm test` and `npm run typecheck` pass.
- Completion state: done.

### Task 7 — Project config and environment names

- Objective: give phase 1 a typed config and register every known variable name.
- Dependencies: task 6.
- Files: `src/config/project-config.ts`, `.env.example`.
- Notes: config keys are business name, address, phone, website, opening hours, primary category, social links, content pillars, content types, tone examples, approval owners, channels (`facebook`, `instagram`), publishing preference, listing source mode, directory watchlist, and operating-cost ceiling. Defaults are empty or the blueprint's pillar and template names. Channels default to Facebook and Instagram only. `.env.example` lists §16 names with blank values.
- Validation: a test or typecheck proves the default channels and that publishing flags default off. `git grep` of the diff shows no secret-looking assigned values.
- Completion state: done.

### Task 8 — Role gates and evidence

- Objective: run the required roles in §13 and record verdicts before calling phase 0 complete.
- Dependencies: tasks 1–7.
- Files: `docs/workstreams/20261120-mcg-marketing-automation/<role-id>/`.
- Notes: product manager first, then software engineer, then security, then project lead. Do not start code before the engineer charter and plan exist. Security reviews the implemented gates. Project lead writes `delivery/owner-handoff.md`.
- Validation: each required role has charter, plan, evidence, and handoff. Skipped roles stay skipped only if their §13 reason is still true.
- Completion state: done.

## 13. Adaptive role and delegation map

Phase 0 is Tier 3: it defines authorisation, secret handling, and the publish boundary even though it does not deploy. The lead does not spawn subagents until implementation of this plan starts. `/launch-pipeline` was not invoked.

| Role ID | Required or skipped | Reason | Predecessor | Owned paths | Gate evidence | Status |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | Scope, non-goals, milestone gates, and acceptance criteria are contractual. | none | review of this plan and `docs/decisions/0001-foundation-stack.md` | `docs/workstreams/20261120-mcg-marketing-automation/product-manager-subagent/` | PASS |
| `ui-ux-developer-subagent` | skipped | Phase 0 has no screens. Staff information architecture is already in blueprint §§15–16 and is built in phases 1 and 5. | none | none | manifest skip row | skipped |
| `software-engineer-subagent` | required | Schema, state machine, gates, and tests are source work. | product-manager handoff | `package.json`, `tsconfig.json`, `db/`, `src/`, `test/`, `.env.example` | `docs/workstreams/20261120-mcg-marketing-automation/software-engineer-subagent/` | PASS |
| `security-engineer-subagent` | required | Roles, secrets, audit, AI isolation, and the publish gate are in this phase. | software-engineer evidence | read-only review of those paths | `docs/workstreams/20261120-mcg-marketing-automation/security-engineer-subagent/` | CONDITIONAL |
| `growth-marketing-subagent` | skipped | Phase 0 does not change channels, claims, UTM taxonomy, or experiments. Those stay as written in the blueprint until phases 1 and 5. | none | none | manifest skip row | skipped |
| `project-lead-subagent` | required | Tier 3 foundation needs a reconciled owner handoff before phase 1 is planned. | security handoff | `docs/workstreams/20261120-mcg-marketing-automation/delivery/owner-handoff.md` | that handoff | CONDITIONAL |

No subagents are delegated for writing this plan. During implementation, the software engineer is the only writer of `src/`, `db/`, `test/`, and `.env.example`. The lead writes shared plans, state, and memory.

## 14. Test and validation matrix

| Requirement | Validation method | Expected evidence | Status |
|---|---|---|---|
| Status graph matches blueprint §6 | `npm test` state tests | 18 passed, including illegal edges and the publish gate | passed |
| Approval binds one version | approval tests | second Y is a no-op; edit voids the Y | passed |
| Publishing default off | kill-switch and publishing-gate tests | `PUBLISHING_ENABLED` false blocks publish | passed |
| Schema contains §5 records | schema contract test | table, status, and unique-index names present in SQL | passed |
| Migration applies | local database | `DATABASE_URL` unset. Apply not run. | unverified |
| Types | `npm run typecheck` | exit 0 | passed |
| No secrets | `.env.example` inspection | 0 filled values | passed |
| Provider isolation | model source test and publishing-gate tests | model file has no publish or credential field | passed |

## 15. Security, privacy, reliability, accessibility, and performance checks

- Secrets stay in environment or the host secret store. Phase 0 commits names only.
- Inbound content is not interpreted as instructions. The messaging parser accepts only Y/N/C patterns.
- The model interface cannot publish and cannot see credentials.
- Publish is idempotent. Unknown results use `PUBLISH_UNKNOWN`.
- Audit rows are append-only at the application layer in this phase. Database permission hardening is revisited before production in phase 5.
- No staff UI in this phase, so accessibility checks wait for phase 1.
- No network calls, so there is no performance budget yet. The renderer and model calls in later phases must keep the monthly cost inside A$20–60 excluding optional support.

## 16. Environment-variable registry

Never put values in this plan, in git, or in logs. Runtime flags in §7 are config, not secrets, and must be changeable without a deploy.

| Variable name | Purpose | Scope/environment | Required by phase | Source/provider | Status |
|---|---|---|---|---|---|
| `DATABASE_URL` | Postgres connection | local and hosted server | 0 | local Postgres or Supabase | name only |
| `APP_ENV` | `local`, `test`, or `production` | all | 0 | deploy config | name only |
| `MODEL_PROVIDER` | Selects the configured model adapter | server | 2 | existing provider | reserved |
| `MODEL_API_KEY` | Model provider credential | server secret | 2 | model provider | missing |
| `BUFFER_ACCESS_TOKEN` | Buffer GraphQL credential, only if Buffer is selected | server secret | 3 | Buffer | missing |
| `BUFFER_ORGANIZATION_ID` | Buffer organisation scope | server | 3 | Buffer | missing |
| `META_PAGE_ID` | Facebook Page id, only if direct Meta publishing is required | server | 3 | Meta | missing |
| `META_PAGE_ACCESS_TOKEN` | Page access token | server secret | 3 | Meta | missing |
| `META_INSTAGRAM_ACCOUNT_ID` | Instagram professional account id | server | 3 | Meta | missing |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client, only if the Business Profile API is approved | server | 4 | Google Cloud | missing |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth secret | server secret | 4 | Google Cloud | missing |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | MCG-authorised refresh token | server secret | 4 | Google OAuth consent | missing |
| `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID` | Business Profile account | server | 4 | Google | missing |
| `GOOGLE_BUSINESS_PROFILE_LOCATION_ID` | Business Profile location | server | 4 | Google | missing |
| `GA4_PROPERTY_ID` | Website attribution property | server | 5 | GA4 | missing |
| `DASHBOARD_SESSION_SECRET` | Dashboard session signing | server secret | 5 | generated at deploy | missing |
| `ALERT_RECIPIENT` | Admin alert destination | server config | 5 | MCG or Engine Labs mailbox | missing |

`LISTING_SOURCE` is a project-config value (`manual`, `reaxml`, `website`, or `agentbox`), not a secret. Agentbox credentials are intentionally absent.

## 17. Deferred human-action queue

| Action | Why agent cannot perform it | Earliest required phase | Blocking now? | Final-checklist destination |
|---|---|---|---|---|
| Supply marketing goals, channel priorities, logo, tone examples, campaign dates, and approvers | Client-owned inputs | 1 | no | yes, if still missing at closure |
| Accept milestone 1 in writing | Contractual client gate | before phase 2 is planned | no | record of acceptance |
| Accept milestones 2–5 in writing | Contractual client gate | before the next phase is planned | no | record of acceptance |
| Create or link a Supabase project | Account ownership | 0 apply, or phase 5 deploy | no | yes |
| Create or link a Vercel project | Account ownership | 5, or phase 1 if the skeleton is hosted | no | yes |
| Choose the approval messaging channel MCG already uses | Unspecified in the blueprint; wrong choice changes the phase 3 adapter | 3 | no | yes |
| Connect Facebook and Instagram, via Buffer or Meta | Client account admin | 3 | no | yes |
| Approve Google Cloud access for Business Profile, or confirm manual monitoring | Google and client authorisation | 4 | no | yes |
| Connect GA4 | Client analytics admin | 5 | no | yes |
| Set secret values in the host | Secret handling | the phase that first calls that provider | no | yes |
| Supervised production test | Blueprint §30 requires MCG | 5 | no | yes |
| Optional Engine Labs support retainer | Commercial choice | after handover | no | yes |

Do not ask for these during phase 0.

## 18. Rollback and recovery

Phase 0 is local and unreleased. Rollback is reverting the phase 0 commit. The migration is the first schema, so a failed local apply is dropped with the local database, not patched in place. No production data exists. Kill-switch defaults leave publishing off if a later phase is deployed early by mistake.

## 19. Acceptance criteria

Phase 0 is complete when all of the following are true:

1. Tasks 1–8 are done and §14 rows that can run locally have passed.
2. `content_item` cannot be published except through the gate in task 6.
3. Approval version locking matches blueprint §6 and §7.
4. Kill switches default closed for publishing, community reply, review requests, and review replies.
5. `.env.example` and this registry contain names only.
6. `docs/decisions/0001-foundation-stack.md` exists and does not add Redis or a new paid service.
7. Required role handoffs exist, skipped roles still have their reasons, and the project-lead owner handoff is present.
8. No Buffer, Meta, Google, or model call was added.
9. This plan's §20 records commands and any unverified database apply.

## 20. Completion evidence

Planning evidence, 2026-11-20:

- Preflight status `READY`, `bootstrap_required: false`.
- Repository audit: control plane present, application absent, blueprint present.
- This plan and `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` written.

Implementation evidence, 2026-11-20, Node v22.14.0:

- `npm test`: 18 passed, 0 failed. Exit 0. Node printed an experimental type-stripping warning.
- `npm run typecheck`: exit 0.
- `npm install` audit: 0 vulnerabilities.
- `DATABASE_URL` was unset, so `db/migrations/001_foundation.sql` was not applied.
- `.env.example` has 0 filled values.
- Role handoffs are linked from the workstream manifest. Security and project lead are `CONDITIONAL` on the phase 3 persistence rules in §21. No high or critical finding.

## 21. Deviations and follow-ups

- Later phase files are intentionally absent. The roadmap in §2 is the series.
- Blueprint §28 does not list `PROJECT_CONFIG` fields. Task 7 uses the keys inferred in §7.
- `PUBLISHING` cannot be entered through `transition`. Only `beginPublish` returns it, and only after the gate.
- `shortcut`: `beginPublish` checks the idempotency key and does not store it. Phase 3 must insert `publication.idempotency_key` before any network call.
- Kill-switch changes without a deploy are the `kill_switch` rows. Callers must pass `killSwitchesFromRows` into the gate. No database reader is wired yet.
- Migration apply is unverified until a Postgres URL exists.
- UX and growth stay skipped. Phase 1 reassesses UX. Phase 5 reassesses growth.
- Role plan files were written in the same session as the code. The executable plan before coding was this phase 0 document.

## 22. Next Plan Generation Prompt

Read `/AGENTS.md` if it is not already in context, `/instructions/PROJECT_PLANNING.md`, `/instructions/ROLES.md`, the original `docs/plans/phase_0_foundations_plan.md`, this completed phase plan, the active workstream manifest and role handoffs, all completion evidence, current repository state, active blockers, and relevant decisions. Confirm this phase and every required role gate are fully implemented and validated. Then generate exactly one exhaustive next phase plan at `docs/plans/phase_1_strategy_baseline_plan.md`. Derive it from the phase-0 roadmap and verified current state, preserve unresolved requirements, include all required plan sections and adaptive role decisions, defer non-blocking human actions to the final phase, and do not implement the next phase until the plan is written.
