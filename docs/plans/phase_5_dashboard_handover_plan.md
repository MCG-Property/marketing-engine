---
plan: phase_5_dashboard_handover
status: accepted
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/plans/phase_4_community_reputation_plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 5: Dashboard, handover, and closure

## 1. Objective

Finish milestone 5 on the current package: a staff dashboard that answers the six operating questions, a manual metrics record, UTM links, a monthly report computed from stored figures, role checks, admin-only diagnostics, and the three handover guides.

This is blueprint milestone 5 (A$940, week 5) plus the week 6 buffer. Week 6 adds no features. After the agent work is verified, the only further plan file is `docs/plans/final_implementation_checklist.md`.

## 2. Relation to project end-state

The end state is phase 0 §2. Staff can see content, approvals, enquiries, reviews, performance, and visibility, approve with Y/N/C, and read a report that does not invent results. Publishing and community replies stay closed unless a kill switch is turned on outside this phase. Operating cost stays inside A$20–60 per month. No new paid service is added.

Milestone 4 was accepted on 2026-11-20. Facebook and Instagram remain the only customer channels. WhatsApp remains Cindy's approval channel for messages and comments. Post decisions stay on the dashboard until iMessage exists.

Production is not declared ready in this phase. Blueprint §30, including the supervised MCG test, is the final checklist, not an agent claim.

## 3. Entry criteria and inherited evidence

| Evidence | Status | What this phase inherits |
|---|---|---|
| Milestone 4 | accepted | Written acceptance on 2026-11-20. Classification, held replies, WhatsApp notices, manual reviews, visibility checks. |
| Dashboard | local | Loopback page at `127.0.0.1:8787` with Content, Approvals, Enquiries, Reviews, Performance, and Visibility. Default HTML hides `token`, `DATABASE_URL`, cron, pg-boss, and `PUBLISHING_ENABLED`. |
| Metrics | zeros | `baselineMetrics` is the zero set for Facebook and Instagram, source `none`. The `metric` table exists and is empty of live rows. |
| Roles | code only | `READ`, `WRITE`, `PUBLISH`, `ADMIN`. `canPublish` allows `PUBLISH` and `ADMIN`. No login provider. |
| Database | hosted | Migrations `20261120025022` and `20261120101138` match local and remote. The dashboard reports `APP_ENV production` and `community store connected`. |
| Switches | closed | Publishing, community reply, review request, and review reply stay false. The worker is not started. |
| Providers | partial | Page token is on the local engine environment. GA4 and Google Business Profile are not connected. The Cindy VPS dashboard is an older tree and has no Page token. |
| Tests | passing | `npm test` 57 passed and `npm run typecheck` passed at milestone 4 acceptance. |

## 4. Scope

- Keep the six staff sections. Staff copy stays in plain language.
- Add an admin diagnostic view that is not linked from the staff page. It shows switch names and on/off state, the last audit result labels, and whether the worker is running. It shows no secret, token, connection string, or customer message body.
- Check a posted role on dashboard actions. The default is `READ`. `WRITE` may record a manual metric, a review draft, and a visibility check. `PUBLISH` and `ADMIN` may use the existing post and reply paths, which still return not-sent while the switches are off.
- Build UTM links from `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`. The campaign value is the content item id. Do not invent a street name or a listing id.
- Accept manual metric figures into the `metric` table when `DATABASE_URL` is set, and into memory when it is not. The source label is `manual`. Blank fields stay zero. Do not call Meta insights or GA4.
- Build the monthly report from stored metrics and stored enquiry counts. The six headings are what happened, what worked, what did not, what generated enquiries, what needs attention, and what to test next. A zero or a missing source is stated. The report does not add prices, sales, inspections, or reviews that are not in the figures.
- Record an alert when a publish attempt fails, an inbox load fails, or the latest metric month is still the empty baseline. Show the alert on the admin view. Send no email while `ALERT_RECIPIENT` is empty.
- Write the staff one-pager, the administrator guide, and the technical runbook.
- After implementation and verification, write `docs/plans/final_implementation_checklist.md` with only the leftover human actions.

## 5. Non-goals

- Do not turn a kill switch on. Do not start `npm run worker`. Do not deploy to Vercel or the Cindy VPS. Do not declare production ready.
- Do not add a login provider, OAuth, or a public signup. Loopback stays the staff surface until the final checklist decides hosting.
- Do not call GA4, Google Business Profile, Buffer, or the Graph insights API. Missing numbers stay manual.
- Do not give the marketing profile a Page token, a database URL, or a tool that publishes.
- Do not connect iMessage or Photon.
- Do not add a paid inbox, Redis, a backup vendor, or an email service.
- Do not use week 6 to add scope. It is only the buffer named in blueprint §26.

## 6. Current-state audit

Inspected on 2026-11-20, after milestone 4 acceptance:

- `src/dashboard/render.ts` already renders the six staff sections, approval Y/N/C, held enquiries, review drafts, and visibility checks. Performance renders `baselineMetrics` zeros.
- `src/dashboard/serve.ts` is loopback only. It logs `APP_ENV` when the value is `local`, `test`, or `production`. Customer reply send is not wired. Post send still goes through the closed publish gate.
- `src/auth/roles.ts` has no `canWrite` and the dashboard does not read a role from the request.
- `src/community/store.ts` writes enquiries, notices, reviews, and visibility checks. It does not write `metric`.
- GA4 is listed as missing in `src/baseline/access.ts`. `GA4_PROPERTY_ID`, `DASHBOARD_SESSION_SECRET`, and `ALERT_RECIPIENT` are empty names in `.env.example`.
- Supabase CLI 2.53.6 has no SQL query command. Row checks stay in application tests or the dashboard log.
- The hosted project is `mcg-marketing-engine` (`frisxbknytwpgaqizthl`). Backups are the provider's project backups. No second backup product is connected.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Staff surface | accepted | The current six sections remain the staff page. |
| Admin surface | accepted | A separate view shows diagnostics. It is not linked from the staff page and it contains no secrets. |
| Authentication | accepted | A posted role on loopback, default `READ`. A hosted login is a final-checklist item before any non-loopback deployment. |
| Metrics | accepted | Manual entry only. Source `manual`. Zeros stay zeros. |
| Report | accepted | Deterministic text from stored figures. A model may rephrase only those figures, and only when a later task passes them as data. |
| UTM | accepted | Four parameters. Campaign id is the content item id. |
| Alerts | accepted | Admin view only while `ALERT_RECIPIENT` is empty. |
| Switches | accepted | Display only. This phase does not add a control that turns one on. |
| Hosting | accepted | No deploy in this phase. Vercel remains the named later host. |
| Growth | accepted | Required for the measurement rules. No acquisition experiment and no new channel. |

Risk: a manual metric can still be typed wrong. The page shows the source label `manual` beside the figures. Risk: the second dashboard load after a restart is the proof that stored rows were reused. A failed write logs `community store query failed` and a code. Risk: blueprint §30 dashboard authentication is not met by the loopback role field. The checklist keeps that open.

## 8. Dependencies

- Phase 4 store and the hosted `metric` table.
- `baselineMetrics` for the empty state.
- `canPublish` for the publish role. Write and read checks are added beside it.
- The marketing profile stays the draft model. The report does not require a model call.
- Supabase project backups for the runbook. No new backup job.

## 9. Architecture and affected systems

```text
staff page
  → six sections, plain language
  → role READ by default

manual figures
  → metric row, source manual
  → monthly report, six headings

content item id
  → UTM link

failures
  → alert row
  → admin view

admin view
  → switches, audit labels, worker stopped
```

The staff page and the admin view read the same records. Only the admin view shows operational labels. Publishing and reply send stay on the existing closed gates.

## 10. Files and paths in scope

- `src/dashboard/render.ts` and `src/dashboard/serve.ts`: staff page, admin view, role field, manual metric form, report.
- `src/auth/roles.ts`: read and write checks beside `canPublish`.
- New `src/metrics/` for the manual row, the UTM string, and the report text.
- `src/community/store.ts` or a sibling in `src/metrics/` for the metric insert. `serve.ts` must not gain the string `createPool`.
- `test/dashboard.test.ts` and a new metrics test.
- `docs/handover/staff-guide.md`, `docs/handover/administrator-guide.md`, `docs/handover/technical-runbook.md`.
- `docs/plans/final_implementation_checklist.md` only after the tasks below are verified.
- Do not edit the marketing profile, `docs/prompts/marketingprojectlead.md`, or `.env`.

## 11. Supporting documents to create or update

| Path | Change |
|---|---|
| `docs/handover/staff-guide.md` | One page: approve, request a change, read enquiries, reviews, the report, and visibility. |
| `docs/handover/administrator-guide.md` | Roles, switches, channels, and the rule that switches stay off until a person changes them outside the staff page. |
| `docs/handover/technical-runbook.md` | Architecture, environment names, local start, credential locations by name, Supabase backups, failed-login code `28P01`, and incident steps. |
| `docs/plans/final_implementation_checklist.md` | Created in the closing task. |
| `docs/plans/README.md` | Status line for this plan. |
| `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` | Active plan and gate. |

## 12. Ordered implementation tasks

### 1. Staff and admin views

- Objective: keep the staff page free of operational jargon and add the admin view.
- Dependencies: none.
- Files: `src/dashboard/render.ts`, `src/dashboard/serve.ts`, `test/dashboard.test.ts`.
- Notes: staff headings stay Content, Approvals, Enquiries, Reviews, Performance, and Visibility. The admin view is served at `/admin` and is omitted from the staff navigation. Admin text may name a switch and an audit event. It must not render a token, a URL with a password, or a customer message.
- Validation: the staff HTML fixture still rejects `token`, `DATABASE_URL`, cron, pg-boss, and `PUBLISHING_ENABLED`. `/admin` is absent from that fixture.
- Completion state: done.

### 2. Role checks

- Objective: default every posted action to `READ` and reject actions that role cannot perform.
- Dependencies: task 1.
- Files: `src/auth/roles.ts`, `src/dashboard/serve.ts`, tests.
- Notes: the role arrives in the posted form. A missing role is `READ`. `READ` cannot save a metric, a review, or a visibility check. `WRITE` can. The existing publish and reply paths still return not-sent for every role while the switches are off.
- Validation: a test posts each role and checks the allowed action. Inbound enquiry text still cannot change a switch.
- Completion state: done.

### 3. UTM links

- Objective: build a tracking URL from the content item id and the channel.
- Dependencies: none.
- Files: `src/metrics/utm.ts`, test.
- Notes: `utm_source` is `facebook` or `instagram`. `utm_medium` is `social`. `utm_campaign` is the content item id. `utm_content` is the content pillar. The website base is `projectConfig.website`. No example street address.
- Validation: a test locks the four parameters and rejects an empty item id.
- Completion state: done.

### 4. Manual metrics

- Objective: store posted figures without inventing the ones left blank.
- Dependencies: tasks 1 and 2.
- Files: `src/metrics/record.ts`, store helper, dashboard form on the admin view.
- Notes: columns match `metric`. Source is `manual`. A blank number is zero. The staff Performance section reads the latest stored month and shows the source. When no row exists, it keeps `baselineMetrics`.
- Validation: a test saves one month, reloads the zeros for the other channel, and checks the staff page says `manual` only beside the saved row.
- Completion state: done.

### 5. Monthly report

- Objective: render the six headings from stored figures and enquiry counts.
- Dependencies: task 4.
- Files: `src/metrics/report.ts`, staff Performance section.
- Notes: what worked is the channel with the higher engagement, or "no difference" when both are zero. What generated enquiries is the stored enquiry count by class, not a guessed cause. What to test next is a blank line for the operator, not a model suggestion, unless a later explicit call passes only the computed lines as data.
- Validation: a test with all zeros contains no price, no sold result, and no review quotation. A test with one non-zero engagement names that channel.
- Completion state: done.

### 6. Alerts

- Objective: record failed publish, failed inbox load, and an empty metric month where the page was opened after the month started.
- Dependencies: tasks 1 and 4.
- Files: alert helper, admin view, existing audit event.
- Notes: the alert text is the event name and the time. No provider payload. No email when `ALERT_RECIPIENT` is empty.
- Validation: a failed inbox audit appears on the admin view and not on the staff page.
- Completion state: done.

### 7. Guides and backup note

- Objective: leave the three handover documents and name the backup.
- Dependencies: tasks 1–6 so the guides match the page.
- Files: `docs/handover/staff-guide.md`, `docs/handover/administrator-guide.md`, `docs/handover/technical-runbook.md`.
- Notes: the runbook says backups are the Supabase project backups for `frisxbknytwpgaqizthl`. It does not include a command that drops or resets the database. Restore is an owner action.
- Validation: the three files exist and name no secret value.
- Completion state: done.

### 8. Verification and the final checklist

- Objective: prove the phase, then write only the leftover human actions.
- Dependencies: tasks 1–7.
- Files: tests, `docs/plans/final_implementation_checklist.md`, this plan's §20.
- Notes: run `npm test` and `npm run typecheck`. Do not start the worker, deploy, or turn a switch on. The checklist lists the VPS secret file, a hosted login before any public dashboard, GA4 if wanted, the supervised MCG test, and the switch changes. It does not retell the build.
- Validation: checklist exists and this plan's §20 records the test results.
- Completion state: done.

## 13. Adaptive role and delegation map

Implementation uses the existing workstream `20261120-mcg-marketing-automation`. Do not spawn a role until implementation starts. No role may turn a switch on or deploy.

| Role ID | Required or skipped | Reason | Predecessor | Owned paths | Gate evidence | Status |
|---|---|---|---|---|---|---|
| `product-manager-subagent` | required | The report headings and the staff questions are the acceptance. | phase 4 handoff | this plan's scope and acceptance | `product-manager-subagent/phase-5-handoff.md` | PASS |
| `ui-ux-developer-subagent` | required | Staff and admin views must stay distinct. | product | `src/dashboard/render.ts` | `ui-ux-developer-subagent/phase-5-handoff.md` | PASS |
| `software-engineer-subagent` | required | Metrics, UTM, report, roles, and tests. | UX | `src/metrics/`, `src/auth/roles.ts`, `src/dashboard/` | `software-engineer-subagent/phase-5-handoff.md` | PASS |
| `security-engineer-subagent` | required | Role default, secret-free HTML, closed switches. | engineering | review of the diff | `security-engineer-subagent/phase-5-handoff.md` | PASS |
| `growth-marketing-subagent` | required | Measurement labels and UTM. No experiment. | product | report and UTM rules | `growth-marketing-subagent/phase-5-handoff.md` | PASS |
| `project-lead-subagent` | required | Reconcile gates and leave the checklist. | security and growth | checklist and §20 | `project-lead-subagent/phase-5-handoff.md` | PASS |

## 14. Test and validation matrix

| Requirement | Validation method | Expected evidence | Status |
|---|---|---|---|
| Staff page has six sections and no operational jargon | `test/dashboard.test.ts` | Headings present. Forbidden words absent. | passed |
| Admin view is separate | request `/admin` in test | Staff HTML does not link to it. | passed |
| `READ` cannot save | role test | POST is refused. | passed |
| UTM uses the item id | unit test | Four parameters, no invented address. | passed |
| Blank metrics stay zero | unit test | Source `manual` only on a saved row. | passed |
| Report does not invent | unit test | Zeros produce no price or sale. | passed |
| Alert stays off the staff page | render test | Staff HTML has no alert text. | passed |
| Switches stay off | existing kill-switch test | Defaults false. | passed |
| Typecheck | `npm run typecheck` | exit 0 | passed |

## 15. Security, privacy, reliability, accessibility, and performance checks

- The staff page keeps the current escaping and the forbidden-word test.
- The admin view uses the same escaping. A failed provider payload is not copied into the alert.
- Enquiry text remains data. It cannot set a role, a switch, or a metric.
- The role field is a loopback control, not an authentication system. Do not expose the dashboard beyond localhost in this phase.
- Metric and report queries reuse the existing single-connection pool. No new worker and no new network client.
- The report and guides stay readable without a mouse-only control. Forms keep labels.
- One extra page load is enough to prove a stored metric. Do not add a polling loop.

## 16. Environment-variable registry

Names only. No values.

| Variable name | Purpose | Scope/environment | Required by phase | Source/provider | Status |
|---|---|---|---|---|---|
| `APP_ENV` | `local`, `test`, or `production` | dashboard process | 5, already set locally | operator | present locally as `production` |
| `DATABASE_URL` | metric and report rows | dashboard process | 5, already used | Supabase session pooler | present locally |
| `GA4_PROPERTY_ID` | website sessions, unused while empty | dashboard | 5 | GA4, optional | empty, stay empty |
| `DASHBOARD_SESSION_SECRET` | unused while loopback has no login | hosted dashboard | 5 checklist | operator, later | empty |
| `ALERT_RECIPIENT` | email target, unused while empty | alerts | 5 | operator | empty, stay empty |
| `META_PAGE_ID` | inbox, already used locally | dashboard | inherited | Meta | present locally |
| `META_PAGE_ACCESS_TOKEN` | inbox, already used locally | dashboard | inherited | Meta | present locally, never printed |
| `META_INSTAGRAM_ACCOUNT_ID` | own-id filter | dashboard | inherited | Meta | present locally |

## 17. Deferred human-action queue

| Action | Why agent cannot perform it | Earliest required phase | Blocking now? | Final-checklist destination |
|---|---|---|---|---|
| Place the Page token file on the Cindy VPS | Secret file | before a VPS inbox | no | yes |
| Choose a hosted login before any public dashboard | No identity provider is in scope | before deploy | no | yes |
| Turn a kill switch on for the supervised test | Owner decision | supervised test | no | yes |
| Supervised MCG production test | Blueprint §30 | after checklist | no | yes |
| Connect GA4 | Account access | optional | no | yes |
| Confirm Supabase backups in the project dashboard | Provider console | handover | no | yes |
| Connect Photon | No business Apple ID | later | no | no, remains out of this phase |

## 18. Rollback and recovery

Revert `src/metrics/` and the dashboard additions. The phase 4 enquiry path stays. Manual metric rows can remain in `metric`; they are labelled `manual` and are not used by publishing. Do not run `supabase db reset`. A bad report is a display change, not a data migration.

## 19. Acceptance criteria

1. A staff member can open one page and see content, approvals, enquiries, reviews, performance, and visibility.
2. The staff page does not show queues, tokens, cron jobs, API payloads, or database records.
3. An admin view shows switch state and alert labels without secrets.
4. `READ` cannot save. `WRITE` can save a manual metric. Publish and reply stays not-sent while the switches are off.
5. A UTM link carries the four parameters and the content item id.
6. A blank metric stays zero and is not described as a result.
7. The monthly report uses the six headings and does not add a figure that was not stored.
8. The three handover guides exist and name no secret.
9. `npm test` and `npm run typecheck` pass. The worker is not started and no switch is turned on.
10. `docs/plans/final_implementation_checklist.md` lists only the remaining human actions. Production is not marked ready.

## 20. Completion evidence

Implemented on 2026-11-20. `npm test` passed 62 tests and `npm run typecheck` passed. The local dashboard was restarted and logged `APP_ENV production` and `community store connected`, with no query failure. The staff page returned 200 with Performance in place of the old Results heading, the monthly report, no admin link, and no customer send control. The admin page returned 200 with the worker stopped and publishing off. A READ save returned 403.

Accepted on 2026-11-20. The owner kept the switches off, kept alerts on the admin page, chose Microsoft Azure for the later login, and named `marketing-engine-bice-gamma.vercel.app` as the host. That host returned 404. The dashboard was not deployed because it shows customer messages and the role field is not a login. Production is not ready. The open list is `docs/plans/final_implementation_checklist.md`.

## 21. Deviations and follow-ups

- The phase 0 roadmap asked this file to be written only after milestone 4 acceptance. That acceptance is recorded in the phase 4 plan §20.
- Hosted login, GA4, the VPS secret file, and the supervised test are checklist items. They are not built here.
- The growth role is required for measurement labels and is not an acquisition experiment.
- iMessage remains unconnected. Post approval stays on the dashboard.

## 22. Final checklist instruction

This is the last implementation phase. Do not generate a phase 6 plan.

After tasks 1–8 are implemented and the required role gates pass, write `docs/plans/final_implementation_checklist.md` from `.cursor/templates/final-implementation-checklist-template.md`. Include only unverified defects, missing environment names, owner account actions, the hosted-login decision, the supervised MCG test, and the smoke checks that follow those actions. Do not retell completed phases. Do not declare production ready unless blueprint §30 is true, including the supervised test.
