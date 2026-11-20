# Implementation plans

Plans are generated and executed sequentially.

1. `phase_0_foundations_plan.md` maps the full project and implements foundations.
2. Each later phase plan is generated only after the prior phase is complete and verified.
3. `final_implementation_checklist.md` is created after all planned agent-executable work is complete.

Each substantive plan links its `docs/workstreams/<task-id>/manifest.md`, records every canonical role as required or skipped, and closes only after required role gates have evidence-backed verdicts.

Canonical process: `/instructions/PROJECT_PLANNING.md` and `/instructions/ROLES.md`.

## EL-MCG-002

Source: `docs/blueprints/MCG_Property_Marketing_Automation_Technical_Implementation_Plan.md`.

Workstream: `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`.

| Phase | File | Blueprint stage | Status |
|---|---|---|---|
| 0 | `phase_0_foundations_plan.md` | Engineering foundation | Implemented. Security gate is conditional. |
| 1 | `phase_1_strategy_baseline_plan.md` | Milestone 1 | Implemented. MCG acceptance not recorded. |
| 2 | `phase_2_content_workflow_plan.md` | Milestone 2 | Implemented. Milestone 2 acceptance is not recorded. |
| 3 | `phase_3_approvals_publishing_plan.md` | Milestone 3 | Not generated. |
| 4 | `phase_4_community_reputation_plan.md` | Milestone 4 | Not generated. |
| 5 | `phase_5_dashboard_handover_plan.md` | Milestone 5 and week 6 buffer | Not generated. Writes `final_implementation_checklist.md` when it closes. |

The stage definitions live in phase 0 §2. Later files are created one at a time after the previous phase is verified.
