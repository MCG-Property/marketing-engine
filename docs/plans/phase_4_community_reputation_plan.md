---
plan: phase_4_community_reputation
status: accepted
created: 2026-11-20
updated: 2026-11-20
owner: lead-agent
source_phase: docs/plans/phase_3_approvals_publishing_plan.md
workstream: docs/workstreams/20261120-mcg-marketing-automation/manifest.md
---

# Phase 4: Community, reputation, and visibility

## 1. Objective

Build milestone 4 on the current package: intake for Facebook and Instagram messages and comments, classification, draft replies, WhatsApp approval, review drafts, and visibility checks.

This is blueprint milestone 4 (A$1,200, week 4). It does not replace the staff dashboard, turn post publishing on, or connect iMessage.

## 2. Relation to project end-state

The end state is unchanged from phase 0 §2. This phase is the first one allowed to draft a reply to a customer message. Sending that reply stays closed unless `COMMUNITY_REPLY_ENABLED` is loaded from kill-switch rows and is true. The default stays false.

Milestone 3 was accepted on 2026-11-20. Post decisions stay on the loopback queue until iMessage is connected. Facebook and Instagram message approvals go through WhatsApp.

## 3. Entry criteria and inherited evidence

| Evidence | Status | What this phase inherits |
|---|---|---|
| Milestone 3 | accepted | Written acceptance on 2026-11-20. Dashboard post queue, Buffer then Meta then manual, memory store, switch off. |
| Message read | local | `loadEnquiries` reads Messenger and Instagram threads with the Page token. `sendEnquiryReply` can post a reply with no classification and no approval. |
| WhatsApp | connected | `marketingprojectlead` holds the Cindy WhatsApp session. It drafts only. It has no Page token. |
| iMessage | absent | Photon is not connected on the Cindy VPS. Post decisions are not moved in this phase. |
| Schema | local only | `enquiry`, `review`, and `visibility_check` exist in `db/migrations/001_foundation.sql`. The hosted database was not migrated. |
| Identity | verified | `projectConfig` holds the canonical name, address, phone, website, hours, and category. The directory watchlist is Google Business Profile. |
| Switches | verified | `COMMUNITY_REPLY_ENABLED`, `REVIEW_REQUESTS_ENABLED`, and `REVIEW_REPLIES_ENABLED` default false. |

## 4. Scope

- Keep one enquiry per external message id. Channels are Messenger, Instagram messages, Facebook comments, and Instagram comments.
- Classify each item as `PROPERTY_ENQUIRY`, `GENERAL_QUESTION`, `SALES_LEAD`, `SUPPORT`, `POSITIVE_COMMENT`, `COMPLAINT`, `REPUTATIONAL_RISK`, `SPAM`, or `UNKNOWN`.
- Treat inbound text as data. A message that says to change a switch, token, or approval is still an enquiry. It does not change those controls.
- Routine classes get a draft reply and wait. `PROPERTY_ENQUIRY` and `SALES_LEAD` are assigned to Cindy McGillivray. `COMPLAINT` and `REPUTATIONAL_RISK` escalate with no public draft. `SPAM` gets no draft.
- Send the pending item to Cindy on the marketing WhatsApp. Her reply is the approval. Hermes may format the notice and must not choose the reply text or call Graph.
- The engine sends the approved text only when the community-reply switch is true. The token stays in the server environment. It is not written into the Hermes profile, `SOUL.md`, or this plan.
- Remove the dashboard's direct "Send reply" path. The page shows the class, the draft, and whether it was sent.
- Accept a manual review and a manual directory observation. Draft a review reply. Do not send it while the review switches are false.
- Compare the canonical identity with an observation and store `MATCH`, `MISMATCH`, `MISSING`, or `REVIEW_REQUIRED`. Do not correct a listing automatically.
- Tests cover every class, escalation, spam, an instruction-shaped message, a held reply while the switch is false, a review draft, and one mismatch.

## 5. Non-goals

- Do not connect Photon or move post Y/N/C to iMessage. That transport is named and waits until a business Apple ID is on Messages.
- Do not set a kill switch to true. Do not start `npm run worker`. Do not apply the hosted schema. Do not turn `PUBLISHING_ENABLED` on.
- Do not give `marketingprojectlead` the Page token or a tool that calls `beginPublish` or the Graph send URL.
- Do not call Google. The five `GOOGLE_*` names stay empty. Monitoring is manual.
- Do not request a review, pick customers by a predicted rating, or gate a review.
- Do not add a paid inbox, Redis, or a new host. Do not generate the phase 5 plan in this phase.

## 6. Current-state audit

Inspected on 2026-11-20, after milestone 3 acceptance:

- `src/dashboard/inbox.ts` loads 15 Messenger threads and 15 Instagram threads and can `POST /{page-id}/messages` as `RESPONSE`. The dashboard form calls that function directly.
- The Page token is on this Mac. The Cindy VPS dashboard is running and has no secret file, so it lists no enquiries. Copying that file was blocked by the safety check.
- WhatsApp for `marketingprojectlead` is connected in self-chat mode. The profile send list has no discovered chat yet. The default profile's WhatsApp is disabled. The system gateway unit is disabled. The user gateway service is the live one.
- `enquiry.classification` already allows the nine classes. `review` and `visibility_check` already exist. No TypeScript module writes them.
- `projectConfig.approvalOwners` names Cindy McGillivray. `directoryWatchlist` is Google Business Profile only.
- Post approval remains `parseDecision` on the loopback page. Samples still cannot be approved.

## 7. Assumptions, constraints, risks, and decisions

| Item | Status | Choice |
|---|---|---|
| Message approval | accepted | WhatsApp, through `marketingprojectlead`, is the approval channel for Facebook and Instagram messages and comments. |
| Post approval | accepted | iMessage, once Photon is connected. This phase leaves the loopback post queue in place. |
| Classifier | accepted | Rules in code decide the class. Routine drafts use `openai/gpt-6-luna` through the marketing profile. Cindy approves before any customer reply. |
| Reply send | accepted | `COMMUNITY_REPLY_ENABLED` is read from kill-switch rows. Default false holds the approved text. |
| Reviews and Google | accepted | Manual records. No Google call while the `GOOGLE_*` names are empty. Review switches stay false. |
| Visibility | accepted | Compare `projectConfig` with a supplied observation. No automatic correction. |
| Token | accepted | The Page token stays in the engine environment. Hermes does not receive it. |
| Store | accepted | Hosted migrations `20261120025022` and `20261120101138` are applied. The dashboard writes with `DATABASE_URL` and `APP_ENV=production`. |

Risk: the 24-hour Messenger response window can close before Cindy replies. The send then fails and the item stays unsent. WhatsApp notices go to Cindy's own logged-in chat. A reply stored by the gateway is applied to the latest routine draft. The customer send stays off.

## 8. Dependencies

- Phase 3 queue and `parseDecision` for posts. Message approval is a separate parser. It must not approve a post.
- Existing `enquiry`, `review`, and `visibility_check` columns. No new hosted migration.
- The Page token and `META_PAGE_ID` on the machine that runs the dashboard. Their absence returns an empty inbox, as it does now.
- WhatsApp remains on `marketingprojectlead`. This phase does not move that session again.

## 9. Architecture and affected systems

```text
Messenger, Instagram message, or comment
  → enquiry row, one external id
  → class
  → draft, escalate, or ignore
  → WhatsApp notice
  → Cindy's reply
  → hold while COMMUNITY_REPLY_ENABLED is false
  → Graph send of that text only

manual review → draft reply → hold
manual observation → visibility_check
```

Facebook and Instagram remain the only customer channels. WhatsApp and, later, iMessage are staff channels.

## 10. Files and systems affected

- `src/dashboard/inbox.ts` and `src/dashboard/serve.ts`: stop the direct send. Load class, draft, and hold state.
- `src/dashboard/render.ts`: show class and draft. Remove the open reply form.
- New `src/community/` for classify, route, WhatsApp notice text, and the reply parser.
- `src/config/kill-switches.ts`: read the three community switches the same way publishing reads rows. Do not change the defaults.
- `test/inbox.test.ts` and new community tests.
- Dashboard on the Cindy VPS after the code is deployed. Do not restart the Hermes gateway unless a WhatsApp send target is missing and the existing bridge cannot discover it.
- Do not edit `inboundengineprojectlead` or put secrets in `docs/prompts/marketingprojectlead.md`.

## 11. Supporting documents to create or update

| Path | When |
|---|---|
| `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` | When implementation starts. Point the active plan here. |
| Role handoffs under that workstream | During implementation, one file per required role. |
| `.cursor/STATE.md` | At the start and end of implementation. |

No new decision file. The channel choices are in phase 3 §20 and in §7 here.

## 12. Ordered implementation tasks

1. **Hold the live reply.** `sendEnquiryReply` returns `not-sent` unless the caller passes a stored approval and the community-reply switch is true. The dashboard form no longer posts a customer reply. Update `test/inbox.test.ts`.
2. **Classify.** One function maps text to the nine classes. Cover a property question, a general question, a sales lead, support, praise, a complaint, a reputational threat, spam, and an empty or unclear message. A line that tells the agent to enable a switch classifies as `UNKNOWN` and changes nothing.
3. **Route.** Assign property and sales items to Cindy McGillivray. Complaints and reputational items get status `escalated` and no `suggested_reply`. Spam gets no reply. The other routine classes get one short draft that uses only the customer's words and the public business facts.
4. **WhatsApp approval.** Build the notice text: class, channel, and draft. Parse Cindy's WhatsApp reply as approve, reject, or replace. Approve stores her text. The engine does not send while the switch is false. The Hermes profile is not given a Graph call.
5. **Comments.** Read Page and Instagram comments with the same token and the same classify path. A Graph error becomes an empty comment list and an audit line. Do not invent comments.
6. **Reviews.** Accept one manual review record. Store a draft reply. `REVIEW_REQUESTS_ENABLED` and `REVIEW_REPLIES_ENABLED` stay false, so nothing is sent and no request is created.
7. **Visibility.** Accept one observation per field. Compare it with `projectConfig`. Write `MATCH`, `MISMATCH`, `MISSING`, or `REVIEW_REQUIRED`. Show the rows on the dashboard. Do not call Google and do not write back to a directory.
8. **Evidence.** `npm test` and `npm run typecheck`. Required role handoffs. Do not start the worker or apply the hosted migration.

## 13. Adaptive role matrix

| Role | Required | Why | Reads | Writes | Gate |
|---|---|---|---|---|---|
| `product-manager-subagent` | yes | Classes, escalation, and what Cindy must approve | phase 0 §2 and this plan | `product-manager-subagent/phase-4-handoff.md` | before engineering |
| `ui-ux-developer-subagent` | yes | Dashboard rows for class, draft, hold, and mismatch | product handoff | `ui-ux-developer-subagent/phase-4-handoff.md` | before engineering |
| `software-engineer-subagent` | yes | Implementation and tests | both handoffs | `software-engineer-subagent/phase-4-handoff.md` | before security |
| `security-engineer-subagent` | yes | Untrusted inbound text, token boundary, switches default false | engineering evidence | `security-engineer-subagent/phase-4-handoff.md` | before project lead |
| `growth-marketing-subagent` | no | Review ethics and channel limits are already fixed in phase 0 §2. This phase adds no experiment. | — | skip reason in the manifest | — |
| `project-lead-subagent` | yes | Reconcile gates and milestone 4 readiness | security handoff | `project-lead-subagent/phase-4-handoff.md` | owner handoff |

The same workstream id stays. Do not spawn the roles while this plan is only being written.

## 14. Tests and validation

| Case | Evidence |
|---|---|
| Each of the nine classes | unit test |
| Instruction-shaped inbound text | class `UNKNOWN`, switches unchanged |
| Complaint and reputational risk | no suggested reply |
| Spam | no suggested reply |
| Routine draft | stored, not sent |
| Switch false after WhatsApp approval | `not-sent` |
| Switch true | one Graph send of the approved text, token not in the URL |
| Review draft | stored, reply switches false |
| Visibility mismatch | dashboard text contains `MISMATCH` |
| Default page | still contains no secret and no live customer send |

`npm test` and `npm run typecheck` are the checks. A live WhatsApp notice is not required for the tests. A fake sender stands in for Hermes.

## 15. Security, privacy, and reliability

- Inbound message text is data. It is not appended to a system prompt as an instruction.
- The Page token is read from the environment and sent only as a bearer header. Errors are stripped of `EAA` strings, as `inbox.ts` already does.
- Hermes formats the WhatsApp notice. The send to Graph stays in the engine.
- Customer message text is not written into plans, state, or the continuation log.
- A failed Graph call does not retry with a different body. The item stays unsent.
- Community and review switches default false. Publishing stays false.

## 16. Environment variables

Names only. No values.

| Name | Purpose | Phase |
|---|---|---|
| `META_PAGE_ID` | Page whose messages and comments are read | 4, already used by the inbox |
| `META_PAGE_ACCESS_TOKEN` | Page token for read and, when the switch is on, reply | 4 |
| `META_INSTAGRAM_ACCOUNT_ID` | Own Instagram id, excluded from the customer list | 4 |
| `GOOGLE_OAUTH_CLIENT_ID` | Unused while monitoring is manual | 4, stay empty |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Unused | 4, stay empty |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Unused | 4, stay empty |
| `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID` | Unused | 4, stay empty |
| `GOOGLE_BUSINESS_PROFILE_LOCATION_ID` | Unused | 4, stay empty |

The VPS dashboard does not have the Meta values yet. Implementation on that machine waits until the operator places the existing secret file there.

## 17. Deferred human actions

| Action | Blocking this phase? | Where it goes |
|---|---|---|
| Place the Meta secret file on the Cindy VPS | no for local tests, yes before a live VPS inbox | operator |
| Connect Photon for post decisions | no | a later phase after iMessage exists |
| Approve Google Business Profile API access, or keep manual monitoring | no | manual monitoring is the choice now |
| Accept milestone 4 in writing | yes, before phase 5 | §20 of this plan |

## 18. Rollback

Revert `src/community/` and restore the previous inbox send only if the new hold path cannot load threads. `COMMUNITY_REPLY_ENABLED` stays false either way, so a partial deploy does not send a new approved reply. The current direct reply form is removed, which is the safe direction. WhatsApp session files are not moved again.

## 19. Acceptance criteria

1. A new message or comment becomes one enquiry and one of the nine classes.
2. Complaints and reputational items escalate with no public draft. Spam gets no draft.
3. A routine item gets a draft and a WhatsApp approval notice. Cindy's reply is the only approval.
4. The reply is not sent while `COMMUNITY_REPLY_ENABLED` is false.
5. Inbound text cannot change a switch, a token, or a post approval.
6. A manual review can store a draft and cannot send it.
7. A mismatched observation is visible on the dashboard. Nothing is written back to Google.
8. The dashboard no longer has a form that sends a customer reply by itself.
9. `npm test` and `npm run typecheck` pass. The worker is not started and the hosted schema is not applied.
10. Milestone 4 written acceptance is recorded in §20 before the phase 5 plan is generated.

## 20. Completion evidence

Accepted on 2026-11-20. `npm test` 57 passed. `npm run typecheck` exit 0. Routine replies are drafted by `openai/gpt-6-luna` on the marketing profile. Cindy's WhatsApp is the approval channel. Customer replies stay held while `COMMUNITY_REPLY_ENABLED` is false. Hosted migrations `20261120025022` and `20261120101138` match local and remote. The dashboard reports `APP_ENV production`, connects to the database, and a second page load reuses the stored rows with no query failure. The phase 5 plan was not generated.

## 21. Deviations and follow-ups

- The dashboard already sends a customer reply. Task 1 closes that before any new intake work.
- Post approval on iMessage is accepted and not built here.
- The VPS copy of the engine has no Page token, so live intake there is a human step in §17.
- WhatsApp notices go to the marketing profile home channel, which is Cindy's logged-in WhatsApp. Tests use a fake sender.
- Support matches a business-hours or contact question. A passing mention of a phone does not draft a reply.
- A gateway-stored WhatsApp reply is applied to the latest routine draft. No such reply is stored yet. The running dashboard is the previous process, so this reader starts after the next dashboard start.

## 22. Next Plan Generation Prompt

Read `/AGENTS.md` if it is not already in context, `/instructions/PROJECT_PLANNING.md`, `/instructions/ROLES.md`, the original `docs/plans/phase_0_foundations_plan.md`, this completed phase plan, the active workstream manifest and role handoffs, all completion evidence, current repository state, active blockers, and relevant decisions. Confirm this phase and every required role gate are fully implemented and validated. Confirm MCG written acceptance of milestone 4 is recorded in this plan. If that acceptance is missing, stop and do not generate the next plan. Then generate exactly one exhaustive next phase plan at `docs/plans/phase_5_dashboard_handover_plan.md`. Derive it from the phase-0 roadmap and verified current state, preserve unresolved requirements, include all required plan sections and adaptive role decisions, defer non-blocking human actions to the final phase, and do not implement the next phase until the plan is written.
