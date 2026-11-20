---
schema_version: 1
task_id: 20261120-mcg-marketing-automation
role_id: ui-ux-developer-subagent
phase: 1
status: complete
revision: 1
created_at: 2026-11-20T03:15:00Z
updated_at: 2026-11-20T03:15:00Z
---

# Phase 1 UX plan

## Page contract

`docs/plans/phase_1_strategy_baseline_plan.md` §9 is the spec.

## Structure

- `lang="en"`, one `h1`, one column, system font.
- Banner text exactly: `Sample baseline. Not live performance.`
- `h2` order: Profile, Content, Approvals, Enquiries, Reviews, Performance, Visibility, Access.
- Empty profile, tone, and approvers say `Waiting for MCG`.
- Approvals say `Approval is not available yet.`
- Enquiries and reviews say they are empty.
- Performance says the figures are not performance results.
- Visibility lists the watchlist and says there are no check results.
- Access shows each system name and a text status.
- No colour-only status. No publish button. No queues, tokens, cron, SQL, or environment values.

## Check

After render, the HTML test must find that banner, that heading order, and the waiting and empty copy.
