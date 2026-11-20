---
plan: phase_2_content_workflow
status: complete
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/plans/phase_1_strategy_baseline_plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 2: Content workflow

## 1. Objective

Build milestone 2 on the current package: a drafting function that turns one idea plus supplied facts into a caption, a 1080×1080 SVG, a Facebook and Instagram recommendation, and a source record. Ship brand and source rules, caption templates, the ten named visual templates, an asset library, version 1 drafts, and the representative examples the blueprint requires.

This is blueprint milestone 2 (A$1,400, week 2). It does not approve, schedule, or publish.

## 2. Relation to project end-state

The end state is unchanged from phase 0 §2. This phase leaves drafts that phase 3 can approve. It does not send them.

| Later phase | What this phase must leave behind |
|---|---|
| 3 | Draft packages at status `DRAFT`, version 1, with source records. S0-1 and S0-2 still open. No send path. |
| 4 | No enquiry or review ingestion. A customer-review template exists, but it does not send a reply. |
| 5 | The marketing dashboard can show draft previews. Production auth and live metrics stay in phase 5. |

MCG written acceptance of milestone 1 is not recorded. This plan exists because the operator instructed it on 2026-11-20. That instruction does not record milestone acceptance. Milestone 2 acceptance is still required before the phase 3 plan.

## 3. Entry criteria and inherited evidence

Phase 1 is implemented. Milestone 1 client acceptance is not.

- `docs/plans/phase_1_strategy_baseline_plan.md` status is `complete` for the engineering build.
- `npm test` passed 29 tests and `npm run typecheck` passed after the marketing-page change.
- The dashboard at `127.0.0.1:8787` shows the logo, public business details, pillars, ongoing schedule, and empty results. It does not show the engineering inventory.
- Brand files are `brand/logo-wide.jpg`, `brand/logo-lockup.jpg`, `brand/logo-square.png`, `brand/logo-tall.png`, and `brand/logo-profile.jpg`. Colours in use are black and white.
- Profile facts in `src/config/project-config.ts`: MCG Property, 37-43 Kinghorne Street, Nowra NSW 2541, 02 4418 1330, `https://mcgproperty.com.au/`, weekday hours, real estate agency. Cindy McGillivray is the social and branding owner. Tone examples are empty.
- `manualListing` already throws `MISSING_SOURCE_DATA` without an address, status, and photo reference. `parseStructured` validates caller-supplied payloads. `revise` voids an approval when a draft changes. `beginPublish` is the only path to `PUBLISHING`.
- `CONTENT_GENERATION_ENABLED` defaults to false. This phase may run drafting from a direct function call. It must not start a network model call, and it must not turn publishing on.
- The remote migration is not applied. The worker process is not running. Neither is required to draft local examples.
- S0-1 and S0-2 stay open until phase 3.

## 4. Scope

- Source priority and a forbidden-claim check, matching blueprint §9.
- Caption templates for the six representative posts, plus a short-video script, a carousel outline, and a reusable brief.
- SVG templates for every name in `VISUAL_TEMPLATES`, rendered as 1080×1080 documents that embed the wide logo.
- An asset library: the existing `brand/` logos, plus generated SVG drafts under `content/examples/`.
- `draftFromIdea` returns caption, SVG, channels `facebook` and `instagram`, sources, status `DRAFT`, and version `1`.
- A drafts block on the marketing dashboard. It shows the example titles and the sample label. It does not show file paths, tokens, or queue names.
- Tests that a missing listing photo or a missing price refuses the factual caption and stays `DRAFT` with `MISSING_SOURCE_DATA`.

## 5. Non-goals

- No model provider call and no new npm dependency. `MODEL_API_KEY` stays unused.
- No raster PNG, browser, or image binary. SVG is the visual asset.
- No invented prices, statistics, testimonials, inspection times, or agent quotes.
- No real listing photograph. Listing examples use a labelled sample graphic, or they stay in draft for missing photography.
- No approval message, Buffer, Meta, Google, or `beginPublish`.
- Do not implement S0-1 or S0-2.
- Do not apply the remote migration and do not start the worker.
- Do not generate the phase 3 plan in this phase.
- Do not add channels beyond Facebook and Instagram.
- Do not treat public website testimonials as approved review copy.

## 6. Current-state audit

Inspected 2026-11-20 after the marketing dashboard change:

- Ideas in `src/baseline/ideas.ts` are six sample titles, one per pillar. They have no facts, prices, or photo references.
- `src/baseline/calendar.ts` is an empty campaign list. Marketing is ongoing.
- `VISUAL_TEMPLATES` names the ten blueprint templates. Nothing renders them.
- `src/providers/model.ts` only parses a payload the caller already holds. `src/providers/listing-source.ts` accepts a manual record and rejects an incomplete one.
- Content status can move `IDEA` to `DRAFT` through `transition`. `PUBLISHING` is not on that map.
- The dashboard renderer does not import `beginPublish`, `startWorker`, or `createPool`.
- Tone examples are empty. Captions cannot imitate a voice MCG has not supplied.
- Hours were taken from public listings that match each other. They were not printed on the contact page fetched from `mcgproperty.com.au`.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Milestone 1 acceptance | open | Not recorded. The operator asked for this plan anyway. Implementation may proceed. The phase 3 plan may not, until milestone 2 is accepted and this phase is verified. |
| Generator | verified | Deterministic templates in this repository. A model may be added only after `MODEL_API_KEY` exists, and only behind `parseStructured`. |
| Visual file | verified | One SVG document, `width="1080" height="1080"`, black `#000` and white `#fff`, wide logo referenced from `brand/logo-wide.jpg`. No new package. |
| Listing photography | verified | A listing caption that states property facts requires `photoRefs`. The sample graphic is titled `Sample` and is not a photograph of a house. |
| Missing facts | verified | Throw or return `MISSING_SOURCE_DATA` and status `DRAFT`. Do not fill the gap with a plausible sentence. |
| Voice | provisional | Plain factual sentences. No tone examples until MCG supplies them. |
| Versioning | verified | New drafts are version 1. A later edit uses the existing `revise` path when an approval exists. This phase does not create approvals. |
| Dashboard | verified | Add a Drafts section to the current marketing page. Keep the engineering inventory off the page. |
| Database | verified | Example drafts live in TypeScript and SVG files. SQL rows wait until a database apply is allowed. |

Risk: a sample caption can be mistaken for a live listing. Every example title and caption contains `Sample`. Risk: a market update invents a statistic. Templates have no numeric claim unless the source record includes that number. Risk: SVG text injection. Template values pass through the existing `escapeHtml` before they enter the markup.

## 8. Dependencies

- Phase 0 gates and phase 1 config, ideas, and dashboard.
- Brand files already in `brand/`.
- No new account, secret, or paid service.
- MCG tone examples would change the voice. They are not required to ship plain sample drafts.
- A real listing photo from MCG would replace the sample graphic. It is not required for the labelled sample.

## 9. Architecture and affected systems

```text
idea + supplied facts
  → source check
  → caption template
  → SVG template
  → draft package (DRAFT, version 1)
  → content/examples/*.svg
  → dashboard Drafts section
```

`draftFromIdea` does not import `beginPublish`, `startWorker`, or a network client.

Representative set, all `sample: true`:

| Example | Template | Facts used | Must not include |
|---|---|---|---|
| Listing | `NEW LISTING` | Sample address label, status `sample`, sample graphic | A real price or a house photograph |
| Sold or review | `CUSTOMER REVIEW` | The words `Sample review` and no customer name | A copied testimonial |
| Market update | `MARKET UPDATE` | No number | Any statistic, percentage, or price |
| Local feature | `LOCAL SPOTLIGHT` | Shoalhaven, no venue claim | A named business, event date, or offer |
| Education | `PROPERTY TIP` | General preparation advice | Tax, legal, or finance instruction |
| Team | `TEAM PROFILE` | Cindy McGillivray, social and branding | A biography or quote she has not supplied |

Also produce three text-only records, with no SVG required: a short-video script, a carousel outline of three frames, and a reusable brief. Each is marked sample and cites its sources.

Channel recommendation for every package is Facebook and Instagram.

## 10. Files and paths in scope

Create:

- `src/content/sources.ts`
- `src/content/captions.ts`
- `src/content/render-visual.ts`
- `src/content/draft.ts`
- `src/content/examples.ts`
- `content/examples/` SVG and text outputs
- `test/content.test.ts`

Update:

- `src/dashboard/render.ts` and `test/dashboard.test.ts`
- `package.json` with one script that writes the examples
- this plan's evidence sections after implementation
- the workstream manifest and `.cursor/STATE.md`

Do not edit `beginPublish`, kill-switch defaults, or the approval parser except to call `revise` if a test needs the existing function.

## 11. Supporting documents to create or update

| Path | When |
|---|---|
| `docs/decisions/0002-integration-map.md` | Only if a system status changes. Drafting locally does not connect a provider. |
| Role plans | At implementation start, `phase-2-plan.md` and `phase-2-handoff.md` in each required role directory. Do not overwrite phase 0 or phase 1 files. |

## 12. Ordered implementation tasks

### Task 1 — Product and UX plans

- Objective: lock the sample-draft rules and the Drafts section before captions are written.
- Dependencies: this plan.
- Files: `product-manager-subagent/phase-2-plan.md`, `product-manager-subagent/phase-2-handoff.md`, `ui-ux-developer-subagent/phase-2-plan.md`, `ui-ux-developer-subagent/phase-2-handoff.md`.
- Notes: product manager records that milestone 1 acceptance is still missing and that these outputs are samples. UX specifies the Drafts section under Content: example title, template name, and the word `Sample`. No prices, no source dumps, no technical status words.
- Validation: both handoffs name this plan §9 as the draft contract.
- Completion state: done.

### Task 2 — Source rules

- Objective: reject fabricated facts before a caption is built.
- Dependencies: task 1.
- Files: `src/content/sources.ts`, `test/content.test.ts`.
- Notes: priority order is internal data, approved listing or website, MCG-supplied facts, official public sources, then human-provided information. A listing fact set uses `manualListing`. A price, statistic, testimonial, inspection time, or agent quote without a matching source field fails with `MISSING_SOURCE_DATA`.
- Validation: tests cover a complete sample listing, a listing without a photo, and a market sentence that contains a digit.
- Completion state: done.

### Task 3 — Captions, visuals, and drafts

- Objective: return one draft package for one idea.
- Dependencies: task 2.
- Files: `src/content/captions.ts`, `src/content/render-visual.ts`, `src/content/draft.ts`, `test/content.test.ts`.
- Notes: captions are template strings. The SVG uses the ten template names, 1080 by 1080, black and white, and `brand/logo-wide.jpg`. Text nodes are escaped. `draftFromIdea` sets status `DRAFT` and version `1`. It does not call `transition` into `PUBLISHING`.
- Validation: snapshot-style assertions on the caption and on `width="1080"` plus the template name. A changed caption on an approved item is covered by the existing `revise` test, not a new approval flow.
- Completion state: done.

### Task 4 — Representative outputs

- Objective: write the six visual examples and the three text examples.
- Dependencies: task 3.
- Files: `src/content/examples.ts`, `content/examples/`, `package.json`.
- Notes: the script writes files only. It does not listen and does not read `.env`. Each visual filename includes `sample`. The video script, carousel outline, and brief are `.md` or `.txt` in the same directory.
- Validation: the test reads the generated files and finds `Sample` in each. Running the script twice overwrites the same paths.
- Completion state: done.

### Task 5 — Dashboard drafts

- Objective: show the examples on the marketing page.
- Dependencies: task 4.
- Files: `src/dashboard/render.ts`, `test/dashboard.test.ts`.
- Notes: add the drafts inside Content or as a Drafts heading after Content. Keep Business, Approvals, Enquiries, Reviews, and Results. Do not restore Access or Visibility. Do not render SVG source in the page. The page remains loopback-only.
- Validation: `npm test`, `npm run typecheck`, and one load of `http://127.0.0.1:8787/` that shows the six sample titles. Stop the extra check server if it is not the one the operator is already using. Do not leave a second listener on the port.
- Completion state: done.

### Task 6 — Role gates

- Objective: security reviews the source gate and the rendered page, then project lead reconciles.
- Dependencies: task 5.
- Files: `security-engineer-subagent/phase-2-handoff.md`, `project-lead-subagent/phase-2-handoff.md`.
- Notes: security fails the phase if a draft can enter `PUBLISHING`, if a forbidden claim is emitted without a source, or if the page shows a secret. Growth stays skipped. Project lead records that milestone 2 acceptance is still a human gate.
- Validation: security verdict is `PASS` or `CONDITIONAL` with no posting path.
- Completion state: done.

## 13. Adaptive role and delegation map

This phase is Tier 2 for the change itself: local files, no credentials, no deploy. Security is required because the new text can fabricate public claims and the page changes. The workstream tier stays high. Do not spawn subagents unless implementation starts and a role must be a separate pass.

| Role ID | Required or skipped | Reason | Predecessor | Owned paths | Gate evidence | Status |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | Sample-versus-real rules and the milestone 2 acceptance gate | phase 1 PM handoff | phase 2 product plan and handoff | `product-manager-subagent/phase-2-handoff.md` | PASS |
| `ui-ux-developer-subagent` | required | Drafts must stay readable on the marketing page | product phase 2 handoff | phase 2 UX plan; review of `render.ts` | `ui-ux-developer-subagent/phase-2-handoff.md` | PASS |
| `software-engineer-subagent` | required | Templates, SVG, examples, tests | UX phase 2 handoff | `src/content/`, `content/examples/`, dashboard drafts, tests | `software-engineer-subagent/phase-2-handoff.md` | PASS |
| `security-engineer-subagent` | required | Source gate, no publish path, no secrets in SVG or HTML | engineering phase 2 evidence | read-only | `security-engineer-subagent/phase-2-handoff.md` | PASS |
| `growth-marketing-subagent` | skipped | Channels, offer, and claim boundaries stay the blueprint rules. No new campaign and no numeric claim. Reassess if a model or a statistic is added. Assessed by the lead on 2026-11-20. | none | none | manifest skip for this phase | skipped |
| `project-lead-subagent` | required | Reconcile milestone 2 evidence and keep S0-1 and S0-2 visible | security phase 2 handoff | phase 2 project-lead handoff | `project-lead-subagent/phase-2-handoff.md` | CONDITIONAL |

Phase 0 and phase 1 handoffs stay as they are.

## 14. Test and validation matrix

| Requirement | Validation method | Expected evidence | Status |
|---|---|---|---|
| Missing listing photo or price does not become a factual caption | content test | `MISSING_SOURCE_DATA`, status `DRAFT` | passed |
| Market update has no invented number | content test | caption and SVG text contain no digit claim | passed |
| Six visual examples and three text examples exist | content test and files under `content/examples/` | each contains `Sample` | passed |
| SVG is 1080 square and uses a known template | content test | `width="1080"` and a `VISUAL_TEMPLATES` name | passed |
| Package recommends only Facebook and Instagram | content test | those two channels | passed |
| Dashboard shows drafts and hides the inventory | dashboard test and one localhost load | six sample titles; no `database host` | passed in tests; localhost reload follows the restart |
| Phase 0 and 1 gates still pass | `npm test` and `npm run typecheck` | 34 passed, typecheck exit 0 | passed |
| MCG accepts milestone 2 | written acceptance | recorded in §20 before phase 3 is planned | not recorded |

## 15. Security, privacy, reliability, accessibility, and performance checks

- Drafting has no network call and no credential read.
- Public website testimonials are not copied into examples.
- Sample graphics are not presented as listing photography.
- SVG and HTML escape text. The logo path comes from `brandLogoPath`.
- The page keeps `lang="en"`, headings, and text status. The new section uses the same column.
- No new paid service and no new dependency.
- S0-1 and S0-2 remain open. `CONTENT_GENERATION_ENABLED` stays false for any future worker. Direct example generation is an explicit script, not a background job.
- The listener stays on `127.0.0.1`.

## 16. Environment-variable registry

No new variables. No values belong in this plan.

| Variable name | Purpose | Scope/environment | Required by phase | Source/provider | Status |
|---|---|---|---|---|---|
| `MODEL_PROVIDER` | Reserved for a later model adapter | server | 2, only if a model is added | model provider | unused |
| `MODEL_API_KEY` | Reserved credential | server secret | 2, only if a model is added | model provider | missing |
| `DATABASE_URL` | Unchanged | server | 0 | Supabase | not used by drafts |
| `CONTENT_GENERATION_ENABLED` | Kill switch, not an environment variable | database row | 2 | code default false | stays false |

The example script must not require `.env`.

## 17. Deferred human-action queue

| Action | Why agent cannot perform it | Earliest required phase | Blocking now? | Final-checklist destination |
|---|---|---|---|---|
| Accept milestone 1 in writing | Client gate, already missed before this plan | before phase 2 was planned | no, operator instructed this plan | record of acceptance |
| Accept milestone 2 in writing | Contract gate before phase 3 | before phase 3 is planned | no | record of acceptance |
| Supply tone examples | Voice MCG has not written | 2, for non-sample voice | no | yes, if still missing |
| Supply a real listing photo and facts | Authorised photography | 2, for a non-sample listing | no | yes |
| Confirm weekday hours if the office differs | Public listings agree; the contact page did not print hours | 1 | no | yes, if wrong |
| Connect Facebook, Instagram, Buffer, or a model | Account ownership | 3 or later | no | yes |
| Close S0-1 and S0-2 | Engineering work on the send path | 3 | no | security re-review |

Do not ask for these while building the sample drafts.

## 18. Rollback and recovery

The phase adds `src/content/`, `content/examples/`, one npm script, and a dashboard section. Rollback is deleting those files and restoring `render.ts`. No approval row and no publication row is created. Phase 0 gates stay in place.

## 19. Acceptance criteria

1. Selecting a sample idea returns a caption, an SVG, Facebook and Instagram, and a source record, at status `DRAFT` and version 1.
2. A missing photo or an unsourced price, statistic, testimonial, or quote does not appear as a finished fact.
3. The six visual examples and the video script, carousel outline, and brief exist and are labelled `Sample`.
4. The marketing page shows those drafts and still hides the engineering inventory.
5. `npm test` and `npm run typecheck` pass.
6. Required phase 2 role handoffs exist. Growth remains skipped with the reason in §13.
7. No publish path is added.
8. MCG written acceptance of milestone 2 is recorded here before anyone generates the phase 3 plan. Absence of that acceptance does not fail the engineering build. It blocks only the next plan.

## 20. Completion evidence

2026-11-20:

- Operator approved milestone 1 before implementation.
- `npm test`: 34 passed, 0 failed.
- `npm run typecheck`: exit 0.
- Example files written under `content/examples/`. Each contains `Sample`.
- Role handoffs: product, UX, engineering, and security `PASS`. Project lead `CONDITIONAL` until milestone 2 is accepted.
- MCG written acceptance of milestone 2 is not recorded. Do not generate the phase 3 plan until it is.

## 21. Deviations and follow-ups

- Milestone 1 acceptance is still missing. This plan was not held for it.
- The visual asset is SVG, not a raster image, so no renderer package is added.
- The drafting assistant is templates, not a model call.
- Remote schema apply and the worker remain outside this phase.
- S0-1 and S0-2 are unchanged.

## 22. Next Plan Generation Prompt

Read `/AGENTS.md` if it is not already in context, `/instructions/PROJECT_PLANNING.md`, `/instructions/ROLES.md`, the original `docs/plans/phase_0_foundations_plan.md`, this completed phase plan, the active workstream manifest and role handoffs, all completion evidence, current repository state, active blockers, and relevant decisions. Confirm this phase and every required role gate are fully implemented and validated. Confirm MCG written acceptance of milestone 2 is recorded in this plan. If that acceptance is missing, stop and do not generate the next plan. Then generate exactly one exhaustive next phase plan at `docs/plans/phase_3_approvals_publishing_plan.md`. Derive it from the phase-0 roadmap and verified current state, preserve unresolved requirements including S0-1 and S0-2, include all required plan sections and adaptive role decisions, defer non-blocking human actions to the final phase, and do not implement the next phase until the plan is written.
