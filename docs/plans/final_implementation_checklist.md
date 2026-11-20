---
document: final_implementation_checklist
status: open
created: 2026-11-20
updated: 2026-11-20
---

# Final Implementation Checklist

Milestone 5 was accepted on 2026-11-20. Production is not ready. The Vercel project is `cam-douglas-projects/marketing-engine`, protected by Vercel login. The agent deploy was blocked by the repo policy. The retainer is declined. GA4 and Google reviews wait on details from MCG. Alerts stay on the admin page. Switches stay off.

## 1. Outstanding defects or unverified items

| Item | Impact | Evidence/status | Required action | Owner |
|---|---|---|---|---|
| No hosted login | The dashboard shows customer messages, and the role field is not a login. | Owner chose Microsoft Azure. The Vercel host returned 404 and was left undeployed. | Add Azure login, then deploy. | Owner |
| Cindy VPS is the previous tree and has no Page token | That machine cannot show the current inbox. | The public host is the Vercel project, not the VPS. | No VPS deploy unless the owner changes the host. | Owner |
| GA4 is not connected | Website sessions stay blank unless typed in. | Owner will return to this. `GA4_PROPERTY_ID` is empty. | Connect it when wanted. | Owner |
| Google reviews | Review intake stays manual. | Waiting for the MCG account details. | Connect Google after those details arrive. | Owner |
| Switches are off | Posts and customer replies are not sent. | Owner kept them off on 2026-11-20. | Leave them off. | Owner |
| Alerts | Failures show on the admin page. | Owner kept that until alerts become in-app notifications. `ALERT_RECIPIENT` stays empty. | No email alerts. | Owner |
| Supervised MCG test has not been run | Production cannot be declared. | No test record. | Walk the staff page with MCG. | Owner |
| A live WhatsApp approval has not been observed | A stored reply should attach to the latest routine draft. The reader had no WhatsApp reply at the last check. | Phase 4 note. | Cindy replies in her own chat, then reload the page. | Owner |

## 2. Environment variables still required

Names only.

| Variable name | Provider/source | Destination/environment | Why required | Value supplied? | Validation after supply |
|---|---|---|---|---|---|
| `DATABASE_URL` | Supabase session pooler | Local dashboard | Stored rows | Yes, locally | Page load did not log a query failure |
| `APP_ENV` | Operator | Local dashboard | `production` | Yes, locally | Process log |
| `META_PAGE_ID` | Meta | Local dashboard | Inbox | Yes, locally | Page returned enquiries |
| `META_PAGE_ACCESS_TOKEN` | Meta | Local dashboard and, later, the VPS | Inbox | Local only | VPS still has no token |
| `META_INSTAGRAM_ACCOUNT_ID` | Meta | Local dashboard | Own-id filter | Yes, locally | Not rechecked this pass |
| `GA4_PROPERTY_ID` | GA4 | Dashboard | Website sessions | No | Leave empty until connected |
| `DASHBOARD_SESSION_SECRET` | Operator | Hosted dashboard | Login | No | Required only before a public host |
| `ALERT_RECIPIENT` | Operator | Alerts | Email | No | Empty means the admin page only |

## 3. Human-only actions

| Action | Platform | Reason agent cannot perform | Exact completion evidence |
|---|---|---|---|
| Confirm project backups | Supabase `frisxbknytwpgaqizthl` | Provider console | Backup listed in the project |
| Choose Microsoft Azure login, then deploy | `marketing-engine-bice-gamma.vercel.app` | The current page would be public without a login | A person can open the page only after signing in |
| Supervised production test | With MCG | Blueprint §30 | MCG can use the six sections without a developer |
| Optional Engine Labs retainer | Commercial | Owner declined on 2026-11-20 | A later written yes, if it changes |

## 4. Smoke tests after those actions

- [ ] Staff page still shows Content, Approvals, Enquiries, Reviews, Visibility, and Performance.
- [ ] A READ save is refused. A WRITE save records a manual figure and leaves the other channel at zero.
- [ ] A post send stays unsent while publishing is off.
- [ ] A customer reply stays unsent while the community switch is off.
- [ ] The admin page shows the switch that was changed, and no token or database URL.
- [ ] MCG completes the supervised test.

## 5. Evidence that the other planned work is complete

`npm test` passed 62 tests and `npm run typecheck` passed on 2026-11-20. The restarted local dashboard logged `APP_ENV production` and `community store connected`, with no query failure. The staff page returned 200 with the six operating sections, the monthly report, no admin link, and no send control. The admin page returned 200 with the worker stopped and publishing off. A READ save returned 403. Guides: `docs/handover/staff-guide.md`, `docs/handover/administrator-guide.md`, `docs/handover/technical-runbook.md`.
