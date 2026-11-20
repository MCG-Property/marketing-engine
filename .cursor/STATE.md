# STATE.md

## Current Objective

- Build EL-MCG-002, the supervised MCG Property Shoalhaven marketing automation system, one verified phase at a time.

## Current Status

- Phase 2 drafts are implemented locally. Milestone 1 is approved. Milestone 2 acceptance is not recorded. A draft-only Hermes profile exists on the Cindy VPS. Not deployed.

## Project Phase

- Phase 2 content workflow. Engineering complete. Next plan is blocked on written milestone 2 acceptance.

## Active Plan

- `docs/plans/phase_2_content_workflow_plan.md`

## Active Workstream

- `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`

## Active Role and Gate

- Project lead `CONDITIONAL`. Gate is `phase-2-conditional`. S0-1 and S0-2 stay open until phase 3.

## Predecessor Handoff

- `docs/workstreams/20261120-mcg-marketing-automation/project-lead-subagent/handoff.md`

## Pending Remediation

- None recorded.

## Owner Decision

- None.

## Active Instructions

- `/instructions/PROJECT_PLANNING.md`
- `/instructions/ROLES.md` (sections 1–3 and the phase 0 role matrix)

## Active Items

- Record MCG milestone 1 acceptance before writing the phase 2 plan.
- Keep S0-1 and S0-2 for phase 3, before any network publish.

## Files in Active Use

- `docs/plans/phase_2_content_workflow_plan.md`
- `docs/decisions/0003-hermes-draft-profile.md`
- `src/dashboard/`
- `docs/workstreams/20261120-mcg-marketing-automation/manifest.md`

## Open Blockers

- Remote schema apply is blocked by the repository hook. `supabase/migrations/20261120025022_foundation.sql` is local only. The worker process was not started.

## Attempts Performed

- Preflight reported materialization required. Bootstrap completed after linking `scripts/configuration.test.mjs` from the launch-pipeline skill.
- The prior local history could not be pushed: its commits do not use the required anonymous git identity, and the pre-push hook rejects that history.
- 2026-11-20 product planning: preflight returned `READY` and `bootstrap_required: false`. Bootstrap was not run again.
- 2026-11-20 phase 0 implementation: `npm test` 18 passed, `npm run typecheck` exit 0. `DATABASE_URL` unset, so the migration was not applied.
- 2026-11-20 env split: writing `.env` was rejected by the fail-closed secret-file policy. `.env.example` was left unchanged so the only on-disk copy was not deleted. No secret values were copied into this file.
- 2026-11-20 Supabase link: CLI can see `mcg-marketing-engine` (`frisxbknytwpgaqizthl`). Repo link stores the session pooler host in `supabase/.temp/pooler-url` with no password. A second attempt to write `.env` was rejected. No secret values were copied into this file.
- 2026-11-20 migration apply: local Supabase config and `supabase/migrations/20261120025022_foundation.sql` were created from `db/migrations/001_foundation.sql`. `supabase db push --linked` was rejected by the fail-closed remote-mutation hook. The worker entry is `npm run worker` (local process, A$0). It was not started. `npm test` 28 passed. `npm run typecheck` exit 0. Phase 1 was already implemented and was not rebuilt.

## Decisions and Assumptions

- `origin` is `https://github.com/MCG-Property/marketing-engine.git`. The previous `origin` (`https://github.com/cam-douglas/agent-instructions.git`) is kept as `template`.
- The published history starts with one anonymous initial commit of the current workspace. The template repository was not rewritten or pushed.
- The blueprint is the product contract. `/launch-pipeline` was not invoked. `STRATEGY.md` was not activated.
- Later phase plan files are not written until the previous phase is implemented and verified. The full stage sequence is section 2 of the phase 0 plan.
- Stack for phase 0: Postgres SQL in `db/migrations/001_foundation.sql`, `pg` and `pg-boss`, no Redis. `beginPublish` is the only path to `PUBLISHING`.
- Worker host: a local Node process on the existing Supabase database. No new paid service. Incremental cost A$0.
- Hermes governor: `marketingprojectlead` on `hermes-droplet-cindy`. See `docs/decisions/0003-hermes-draft-profile.md`.
- S0-1 and S0-2 are open low conditions. They block sending, not the existence of the foundation.

## Current Working State

- Phase 0 through phase 2 code, plans, and role handoffs are committed on `main`. Not deployed.

## Next Actions

- Do not treat the remote schema as applied. The hook blocked the push.
- Do not generate the phase 3 plan until milestone 2 acceptance is recorded.
- The Hermes profile `marketingprojectlead` can draft only. It has no OpenRouter key of its own yet, and it must not publish.

## Last Updated

- 2026-11-20 — Hermes profile `marketingprojectlead` created on `hermes-droplet-cindy`. Text model `anthropic/claude-opus-5.5`. Image model `google/gemini-nano-banana-2.1`. No model call. Milestone 2 acceptance not recorded.
