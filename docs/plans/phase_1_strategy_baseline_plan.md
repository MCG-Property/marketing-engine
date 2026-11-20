---
plan: phase_1_strategy_baseline
status: complete
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/plans/phase_0_foundations_plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 1: Strategy baseline

## 1. Objective

Fill the milestone 1 baseline on top of the phase 0 package: the business profile, pillars, a sample month calendar, an idea library, an access inventory, a zeroed metrics baseline, and a localhost dashboard skeleton that shows those records.

This is blueprint milestone 1 (A$800, week 1). It does not generate captions, render images, or publish.

## 2. Relation to project end-state

The end state is unchanged from phase 0 §2. This phase is the configuration and staff-facing skeleton those later workflows read.

| Later phase | What this phase must leave behind |
|---|---|
| 2 | Pillars, sample ideas, tone slot, and listing-source mode `manual` |
| 3 | Channel inventory limited to Facebook and Instagram. S0-1 and S0-2 still open. No send path added. |
| 4 | Directory watchlist still starts at Google Business Profile. Approval owners list exists, possibly empty. |
| 5 | The six staff sections exist as a skeleton. Production auth, live metrics, and UTM stay in phase 5. |

MCG written acceptance of this milestone is required before `docs/plans/phase_2_content_workflow_plan.md` is generated.

## 3. Entry criteria and inherited evidence

Phase 0 is complete enough to plan this phase.

- `docs/plans/phase_0_foundations_plan.md` status is `complete`.
- Product manager `PASS`. Engineering `PASS` (`npm test` 18 passed, `npm run typecheck` exit 0, Node v22.14.0).
- Security `CONDITIONAL` and project lead `CONDITIONAL`. S0-1 and S0-2 are low, due before any network send, and are not phase 1 work.
- `DATABASE_URL` was unset. `db/migrations/001_foundation.sql` has not been applied.
- `src/config/project-config.ts` already holds pillars, visual template names, empty profile fields, channels `facebook` and `instagram`, listing mode `manual`, and the A$60 ceiling.
- There is no HTTP server, calendar, idea library, or dashboard.
- UX was skipped in phase 0 because there were no screens. This phase adds one, so UX is required before the page is built.
- Growth remains skipped. Pillars and channels are already fixed by the blueprint. The baseline metrics are zeros, not a new taxonomy.

## 4. Scope

- A typed sample month, December 2026, with planned slots. Every slot is marked sample.
- At least one sample idea for each of the six pillars in `CONTENT_PILLARS`. No prices, no real addresses, no claimed sale results.
- Business profile, tone examples, and approval owners stay empty when MCG has not supplied them. The UI says they are waiting, and does not invent values.
- An access inventory for Facebook, Instagram, Buffer, Meta direct publishing, Google Business Profile, GA4, the model provider, the listing source, the approval transport, the database host, and the dashboard host. None are `connected`.
- A baseline metric row per channel for December 2026 with zeros and source `none`. The page says these are not performance results.
- `docs/decisions/0002-integration-map.md`, matching the inventory.
- An HTML dashboard with the sections Content, Approvals, Enquiries, Reviews, Performance, and Visibility, served only on `127.0.0.1`.

## 5. Non-goals

- No model calls, Buffer, Meta, Google, GA4, or `beginPublish` from the page.
- Do not implement S0-1 or S0-2. Do not add a publisher to "finish" them.
- No login, sessions, or `DASHBOARD_SESSION_SECRET`. Authentication is phase 5.
- No deploy, Vercel project, or Supabase project.
- No new npm dependency. No Redis.
- No real MCG listings, customer names, or brand copy presented as approved.
- Do not generate the phase 2 plan in this phase.
- Do not apply the SQL migration unless a local `DATABASE_URL` is already present. The baseline lives in TypeScript so the missing database does not block the milestone.

## 6. Current-state audit

Inspected after phase 0:

- Config fields needed for the profile and pillars already exist and are empty or blueprint-fixed.
- `manualListing` throws `MISSING_SOURCE_DATA` without an address, status, and photo. Phase 1 does not call it with invented facts.
- Kill switches default to false. `killSwitchesFromRows` is pure and unused by a server.
- `src/queue/jobs.ts` can start `pg-boss` only when called. The dashboard must not import `startWorker` or `createPool`.
- Blueprint §28 still has no `PROJECT_CONFIG` field list. Phase 0's inferred keys remain the set. This phase does not add keys.
- Approval transport is still unnamed. The inventory records it as `unassigned`.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Sample month | provisional | December 2026, fixed, so tests do not depend on the clock. Label it sample. Replace with MCG dates when they arrive. |
| Missing brand inputs | verified | Empty profile, empty tone examples, empty approvers. The screen states that they are waiting. |
| Dashboard stack | provisional | Node `http` on `127.0.0.1` only, HTML from a render function. No framework and no new package. Vercel remains the later host from decision 0001, not this phase. |
| Port | provisional | `8787`. Not configurable to another interface. |
| Baseline numbers | verified | Zeros with source `none`. They are not reach, revenue, or enquiry counts. |
| Database | verified | TypeScript modules are the baseline store. SQL seed waits until a database exists. |
| S0-1 and S0-2 | verified | Still open. This phase must not create a send path that bypasses them. |

Risk: a sample idea can be mistaken for a real listing. Every sample title and the page banner include the word `Sample`. Risk: binding a wildcard host would expose the skeleton. The host is the literal `127.0.0.1`.

## 8. Dependencies

- Phase 0 package, tests, and `projectConfig`.
- No new account, secret, or MCG file. The milestone can be demonstrated with the sample set.
- MCG goals, logo, tone, dates, approvers, and account access improve the content of the baseline. They are not required to build it. They are required for MCG to accept the milestone as their real calendar.

## 9. Architecture and affected systems

```text
projectConfig + baseline modules
  → renderDashboard() HTML
  → node:http listen 127.0.0.1:8787
```

The page is a view. It does not write workflow state and does not import publishing, the model provider, or the worker.

Section order:

1. Banner: `Sample baseline. Not live performance.`
2. Profile: blank fields listed as waiting.
3. Content: pillars, December 2026 slots, idea library.
4. Approvals: empty. Copy says approval is not available yet.
5. Enquiries: empty.
6. Reviews: empty.
7. Performance: zero rows, labelled not connected.
8. Visibility: watchlist only, no check results.
9. Access: the inventory, every row not connected.

Use `lang="en"`, one `h1`, and an `h2` per section. Status is text, not colour alone. No control submits a post. Layout is one column. Do not show queue names, tokens, cron, SQL, or environment values.

## 10. Files and paths in scope

Create:

- `src/baseline/calendar.ts`
- `src/baseline/ideas.ts`
- `src/baseline/access.ts`
- `src/baseline/metrics.ts`
- `src/dashboard/render.ts`
- `src/dashboard/serve.ts`
- `test/baseline.test.ts`
- `test/dashboard.test.ts`
- `docs/decisions/0002-integration-map.md`

Update:

- `package.json` script `dashboard` only
- this plan's evidence sections after implementation
- the workstream manifest and `.cursor/STATE.md`

Do not edit the blueprint or the phase 0 source gates (`beginPublish`, kill switches, parsers).

## 11. Supporting documents to create or update

| Path | When |
|---|---|
| `docs/decisions/0002-integration-map.md` | During implementation, from `src/baseline/access.ts` |
| UX notes | The page structure in §9 is the spec. The UX role records that spec in its plan before `render.ts` is written. |
| Role charter and plan files | At the start of implementation, before the dashboard code, for the required roles in §13 |

## 12. Ordered implementation tasks

### Task 1 — Product and UX plans

- Objective: lock the sample rules and the page structure before HTML exists.
- Dependencies: this plan.
- Files: `docs/workstreams/20261120-mcg-marketing-automation/product-manager-subagent/` and `ui-ux-developer-subagent/` for this phase's revision. Do not overwrite phase 0 evidence. Add `phase-1-plan.md` and `phase-1-handoff.md` in each role directory if the phase 0 files must stay intact.
- Notes: product manager confirms sample data is not real MCG content and that milestone acceptance is still a human gate. UX confirms §9, including empty states and the sample banner.
- Validation: both handoffs exist and name §9 as the page contract.
- Completion state: done.

### Task 2 — Baseline records

- Objective: add the calendar, ideas, access inventory, and zero metrics.
- Dependencies: task 1.
- Files: `src/baseline/*.ts`, `test/baseline.test.ts`.
- Notes: ideas reference pillar names from `CONTENT_PILLARS`. Access statuses are `manual`, `missing`, or `unassigned` only. Metrics use `source: "none"`.
- Validation: tests prove six ideas, one per pillar, the word `Sample` on each title, December 2026 slots, no connected system, and zero metrics.
- Completion state: done.

### Task 3 — Integration map

- Objective: publish the same inventory as a decision record.
- Dependencies: task 2.
- Files: `docs/decisions/0002-integration-map.md`, assertion in `test/baseline.test.ts`.
- Notes: each system name in code appears in the document. The document says nothing is connected and lists S0-1 and S0-2 as still open for phase 3.
- Validation: the test reads the markdown and finds every system name.
- Completion state: done.

### Task 4 — Dashboard skeleton

- Objective: render and serve the page locally.
- Dependencies: tasks 1 and 2.
- Files: `src/dashboard/render.ts`, `src/dashboard/serve.ts`, `test/dashboard.test.ts`, `package.json`.
- Notes: `renderDashboard()` returns the HTML string. `serve.ts` listens on `127.0.0.1` and port `8787` only when executed. The render module does not listen. The server file is not imported by tests. HTML must include the six `h2` titles, the sample banner, and none of `DATABASE_URL`, `token`, `cron`, or `pg-boss`.
- Validation: `npm test` and `npm run typecheck` pass. A manual `npm run dashboard` check is optional and must be stopped after the page loads on localhost. Do not leave it running.
- Completion state: done.

### Task 5 — Role gates

- Objective: security reviews the server bind and the HTML, then project lead reconciles.
- Dependencies: task 4.
- Files: `security-engineer-subagent/phase-1-handoff.md`, `project-lead-subagent/phase-1-handoff.md`, and an updated owner note only if the lead asks for a new decision.
- Notes: security fails the phase if the socket is not loopback, if the page can call `beginPublish`, or if a secret appears in HTML. Growth stays skipped.
- Validation: security verdict is `PASS` or `CONDITIONAL` with no posting path. Project lead records it.
- Completion state: done.

## 13. Adaptive role and delegation map

This phase is Tier 2 for the change itself: local, reversible, no credentials, no deploy. Security is still required because the phase adds a listening socket. The workstream's overall tier stays high. Do not spawn subagents unless implementation starts and the role must be a separate pass. The lead writes this plan. Implementation creates the phase 1 role files before the dashboard code.

| Role ID | Required or skipped | Reason | Predecessor | Owned paths | Gate evidence | Status |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | Milestone 1 acceptance, sample-versus-real rules, and the human gate before phase 2 | phase 0 PM handoff | phase 1 product plan and handoff | `product-manager-subagent/phase-1-handoff.md` | PASS |
| `ui-ux-developer-subagent` | required | First staff screen: six sections, empty states, sample banner, no technical diagnostics | product phase 1 handoff | phase 1 UX plan; review of `render.ts` | `ui-ux-developer-subagent/phase-1-handoff.md` | PASS |
| `software-engineer-subagent` | required | Baseline modules, HTML, localhost server, tests | UX phase 1 handoff | `src/baseline/`, `src/dashboard/`, `test/baseline.test.ts`, `test/dashboard.test.ts`, `package.json` script | `software-engineer-subagent/phase-1-handoff.md` | PASS |
| `security-engineer-subagent` | required | New socket and rendered business profile. Must confirm loopback, no secrets, no publish control | engineering phase 1 evidence | read-only | `security-engineer-subagent/phase-1-handoff.md` | PASS |
| `growth-marketing-subagent` | skipped | No change to channels, claims, UTM, or experiments. Zeros are not a measurement design. Reassess at phase 5. Assessed by the lead on 2026-11-20. | none | none | manifest skip for this phase | skipped |
| `project-lead-subagent` | required | Reconcile milestone 1 evidence and keep S0-1 and S0-2 visible | security phase 1 handoff | phase 1 project-lead handoff | `project-lead-subagent/phase-1-handoff.md` | CONDITIONAL |

Phase 0 handoffs stay as they are. New files use the `phase-1-` prefix so those verdicts are not rewritten.

## 14. Test and validation matrix

| Requirement | Validation method | Expected evidence | Status |
|---|---|---|---|
| Six pillars each have one sample idea | `test/baseline.test.ts` | titles contain `Sample`; no price field | passed |
| December 2026 calendar exists | baseline test | slots dated in that month and marked sample | passed |
| No system is connected | baseline test and integration map | every status is manual, missing, or unassigned | passed |
| Metrics are not presented as results | dashboard test | source `none` and the not-performance sentence | passed |
| Six staff sections | dashboard test | those `h2` texts, in order | passed |
| HTML has no secrets or ops jargon | dashboard test | absent `DATABASE_URL`, `token`, `cron`, `pg-boss` | passed |
| Server is loopback | source test and curl | host is `127.0.0.1`; page returned, then the process was stopped | passed |
| Phase 0 gates still pass | `npm test` and `npm run typecheck` | 27 passed, typecheck exit 0 | passed |
| MCG accepts milestone 1 | written acceptance | recorded in this plan §20 before phase 2 is planned | not recorded |

## 15. Security, privacy, reliability, accessibility, and performance checks

- Listen on `127.0.0.1` only. Refuse any other host.
- The page does not import `beginPublish`, `startWorker`, or `createPool`.
- Profile values are escaped before they are placed in HTML.
- Sample copy is labelled. No customer message is stored.
- Empty tone and approver lists are honest empty states.
- The page uses headings, text status, and a single column.
- No new paid service. The process is started by hand and stopped after a check.
- S0-1 and S0-2 remain open and out of this phase.

## 16. Environment-variable registry

No new variables. Phase 0 names stay in `.env.example` and stay empty.

| Variable name | Purpose | Scope/environment | Required by phase | Source/provider | Status |
|---|---|---|---|---|---|
| `DATABASE_URL` | unchanged | server | 0 | local or Supabase | still missing; not required here |
| `DASHBOARD_SESSION_SECRET` | unchanged | server | 5 | generated at deploy | not used |

The listen host and port are constants in `src/dashboard/serve.ts`, not environment overrides.

## 17. Deferred human-action queue

Inherited from phase 0 §17. Nothing in that queue becomes blocking.

| Action | Why agent cannot perform it | Earliest required phase | Blocking now? | Final-checklist destination |
|---|---|---|---|---|
| Supply goals, logo, tone, dates, approvers | Client-owned | 1, for real content | no | yes, if still missing |
| Accept milestone 1 in writing | Contract gate before phase 2 | before phase 2 is planned | no | record of acceptance |
| Accept later milestones | Contract gate | before the next plan | no | record of acceptance |
| Supabase, Vercel, channel, Google, GA4, secrets | Account ownership | 3–5 | no | yes |
| Choose the approval channel | Unspecified | 3 | no | yes |
| Close S0-1 and S0-2 | Engineering work, not a human secret | 3 | no | security re-review |

Do not ask for these while building the sample baseline.

## 18. Rollback and recovery

The phase adds files and one npm script. Rollback is reverting those files. The server holds no data. Stopping the process is the shutdown. Phase 0 gates are untouched, so a revert does not weaken `beginPublish`.

## 19. Acceptance criteria

1. A reviewer can open the localhost page and see the six pillars, the December 2026 sample calendar, the idea library, the zero baseline, and the access inventory.
2. Empty MCG-supplied fields are visibly waiting, not filled with invented brand facts.
3. Every sample title contains `Sample`. No price or live metric is shown as real.
4. The server binds `127.0.0.1` only and the page cannot publish.
5. `docs/decisions/0002-integration-map.md` matches the inventory and records S0-1 and S0-2 as open.
6. `npm test` and `npm run typecheck` pass.
7. Required phase 1 role handoffs exist. Growth remains skipped with the reason in §13.
8. MCG written acceptance is recorded here before anyone generates the phase 2 plan. Absence of that acceptance does not fail the engineering build. It blocks only the next plan.

## 20. Completion evidence

2026-11-20, Node v22.14.0:

- `npm test`: 27 passed, 0 failed, exit 0.
- `npm run typecheck`: exit 0.
- `curl http://127.0.0.1:8787` returned the sample banner, waiting profile fields, December 2026 slots, and the access list. The server was stopped after the check.
- Integration map: `docs/decisions/0002-integration-map.md`.
- Role handoffs: product, UX, engineering, and security `PASS`. Project lead `CONDITIONAL`.
- 2026-11-20: The operator approved milestone 1. The accepted baseline is the marketing page: public profile, reach and leads, Facebook and Instagram, six pillars, no campaign dates, Cindy McGillivray, sample ideas, and zero results. Tone examples and account connections remain open.

## 21. Deviations and follow-ups

- The baseline is TypeScript, not rows in Postgres, because no database URL exists.
- S0-1 and S0-2 are intentionally untouched.
- The sample month is December 2026 until MCG supplies dates.
- 2026-11-20: MCG supplied the logo set, named Cindy for social and branding, and set the goal to reach and leads. There are no campaign dates. The calendar is empty. December 2026 remains only the zero-metric placeholder. Milestone acceptance is still not recorded.
- Phase 0 UX and growth skips are not reused for the screen. UX is required. Growth stays skipped.

## 22. Next Plan Generation Prompt

Read `/AGENTS.md` if it is not already in context, `/instructions/PROJECT_PLANNING.md`, `/instructions/ROLES.md`, the original `docs/plans/phase_0_foundations_plan.md`, this completed phase plan, the active workstream manifest and role handoffs, all completion evidence, current repository state, active blockers, and relevant decisions. Confirm this phase and every required role gate are fully implemented and validated. Confirm MCG written acceptance of milestone 1 is recorded in this plan. If that acceptance is missing, stop and do not generate the next plan. Then generate exactly one exhaustive next phase plan at `docs/plans/phase_2_content_workflow_plan.md`. Derive it from the phase-0 roadmap and verified current state, preserve unresolved requirements including S0-1 and S0-2 for phase 3, include all required plan sections and adaptive role decisions, defer non-blocking human actions to the final phase, and do not implement the next phase until the plan is written.
