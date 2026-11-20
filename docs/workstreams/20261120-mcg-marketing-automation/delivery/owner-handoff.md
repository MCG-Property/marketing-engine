---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
status: awaiting-owner-decision
revision: 1
created_at: 2026-11-20T02:30:00Z
updated_at: 2026-11-20T02:30:00Z
---

# Owner Handoff: MCG Property marketing automation

## 1. Decision requested

No decision is required to keep this foundation. Phase 1 is not started.

The recorded choices, if you want to answer, are:

- `APPROVE` — accept the local foundation and the two phase 3 conditions
- `REQUEST_CHANGES` — name what must change before any next plan
- `DO_NOT_PROCEED` — stop the build

This handoff does not select one.

## 2. Delivered outcome

Phase 0 is a local TypeScript package: the content state machine, one-version approvals, a publish function that fails closed, provider interfaces, and the SQL migration. `npm test` passed 18 tests. `npm run typecheck` passed. Nothing was deployed and no channel was contacted.

## 3. Scope and requirement traceability

| ID | Result |
|---|---|
| R0 foundation | implemented and tested; SQL not applied |
| R1–R5 | still only described in phase 0 §2 |

## 4. Role and stage-gate summary

| Role | Routing | Verdict |
|---|---|---|
| product-manager-subagent | required | `PASS` |
| ui-ux-developer-subagent | skipped, no screens | skipped |
| software-engineer-subagent | required | `PASS` |
| security-engineer-subagent | required | `CONDITIONAL` |
| growth-marketing-subagent | skipped, no measurement change | skipped |
| project-lead-subagent | required | `CONDITIONAL` |

Handoffs are under `docs/workstreams/20261120-mcg-marketing-automation/`.

## 5. Verification evidence

- `npm test` — 18 passed, 0 failed, exit 0, Node v22.14.0
- `npm run typecheck` — exit 0
- `npm install` audit — 0 vulnerabilities
- `.env.example` — no values
- `DATABASE_URL` unset — migration not applied

## 6. Changed paths and external changes

Application files under `src/`, `test/`, `db/migrations/001_foundation.sql`, `package.json`, `package-lock.json`, `tsconfig.json`, `.env.example`, `.gitignore`, and `docs/decisions/0001-foundation-stack.md`. npm contacted the registry to install `pg` and `pg-boss`. No hosting project was created.

## 7. Integrated security and production status

Implemented and locally verified. Not ready for production. Not deployed. Not owner-approved.

Security conditions, both low, both due before any real send:

- S0-1: persist `publication.idempotency_key` before a network publish
- S0-2: load `kill_switch` through `killSwitchesFromRows` on that path

## 8. Residual risks and accepted limitations

- The security review was done in the same session as the code. It is disclosed, not treated as a separate reviewer.
- Role names are arguments. They are not login.
- Worker host and approval transport are still undecided.
- These limits are not accepted as permission to post.

## 9. Rollback, recovery, and operational ownership

The change is local and uncommitted unless you commit it. Rollback is reverting this working tree. No production data exists. Engine Labs remains the builder. MCG account ownership is unchanged.

## 10. Environment variables and credentials still required

Names only, all missing: `DATABASE_URL`, `APP_ENV`, `MODEL_PROVIDER`, `MODEL_API_KEY`, `BUFFER_ACCESS_TOKEN`, `BUFFER_ORGANIZATION_ID`, `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `META_INSTAGRAM_ACCOUNT_ID`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID`, `GOOGLE_BUSINESS_PROFILE_LOCATION_ID`, `GA4_PROPERTY_ID`, `DASHBOARD_SESSION_SECRET`, `ALERT_RECIPIENT`.

None of these are needed to keep phase 0.

## 11. Human-only or production actions

None now. Supabase, Vercel, channel logins, and MCG milestone acceptance stay on the phase 0 deferred list.

## 12. Owner response

Unselected.
