# 2026-11-20 continuation

## Repository start

- Published this workspace to the empty private repository `https://github.com/MCG-Property/marketing-engine.git`.
- Renamed the previous `origin` (`cam-douglas/agent-instructions`) to `template` and set `origin` to `MCG-Property/marketing-engine`.
- Pushed a new root commit. The template history stayed local and on the template remote because those commits do not use the anonymous git identity required by the pre-push hook.
- Bootstrap initially failed because `scripts/configuration.test.mjs` was not linked from the launch-pipeline skill. Added that link and re-ran bootstrap successfully.

## Phase 0 plan

- Preflight was `READY`; bootstrap was not run again.
- Wrote `docs/plans/phase_0_foundations_plan.md` and `docs/workstreams/20261120-mcg-marketing-automation/manifest.md` from the EL-MCG-002 blueprint.
- Mapped phases 0–5 in that plan. Later phase files were not written in the planning step.
- Planning step added no application code and no secret values.

## Phase 0 implementation

- Added the Node 22 package, `db/migrations/001_foundation.sql`, domain gates, provider seams, and tests.
- `npm test` passed 18 tests. `npm run typecheck` passed. `DATABASE_URL` was unset, so the migration was not applied.
- Security verdict is conditional: persist the idempotency key and load `kill_switch` before any real send.
- The phase 1 plan was not written in the implementation step.

## Phase 1 plan

- Wrote `docs/plans/phase_1_strategy_baseline_plan.md` from the phase 0 roadmap and the current package.
- Phase 1 is the milestone 1 baseline and a localhost dashboard skeleton. It does not publish and does not close S0-1 or S0-2.
- The planning step did not implement phase 1.

## Phase 1 implementation

- Added `src/baseline/`, `src/dashboard/`, `docs/decisions/0002-integration-map.md`, and the `dashboard` script.
- `npm test` passed 27 tests. `npm run typecheck` passed.
- `curl http://127.0.0.1:8787` returned the sample page. The server was stopped.
- Project lead is conditional until MCG milestone 1 acceptance is recorded. The phase 2 plan was not written.

## Env split

- A Supabase project URL, publishable key, and database password were present in `.env.example`. `DATABASE_URL` and `APP_ENV` were empty.
- Writing `.env` was rejected by the fail-closed secret-file policy. `.env.example` was not cleared, because that would have removed the only on-disk copy.
- No migration was applied. No secret values were written into plans, state, or this log.

## Supabase link

- CLI login can see `mcg-marketing-engine` (`frisxbknytwpgaqizthl`), region Seoul.
- `supabase link` is present. `supabase/.temp/pooler-url` has the session pooler host and no password.
- Writing `.env` was rejected again. `.env.example` still holds the filled values. Migration was not applied.

## Migration and worker

- Added `supabase/config.toml` and `supabase/migrations/20261120025022_foundation.sql`, a copy of `db/migrations/001_foundation.sql`.
- `supabase db push --linked` was rejected by the fail-closed remote-mutation hook. The remote schema was not changed.
- Worker decision: local Node process, no new host, incremental cost A$0. Entry is `src/queue/serve.ts`. The process was not started.
- Phase 1 was already implemented. `npm test` passed 28. `npm run typecheck` passed. Phase 2 was not generated.
- `.env.example` values for the database URL and app environment are empty.

## Brand baseline

- Stored five MCG logos in `brand/`. Business name is MCG Property. Cindy owns social media and branding. Goal is to increase reach and land leads. No campaign dates; marketing is ongoing.
- Dashboard shows those facts and the wide logo. Milestone 1 acceptance is still not recorded.

## Phase 2 plan

- Wrote `docs/plans/phase_2_content_workflow_plan.md` on an operator instruction. Milestone 1 written acceptance is still not recorded.
- The plan uses local caption and SVG templates, six sample visuals, and three text examples. It does not call a model, publish, or add a dependency.
- No application code was added in the planning step.

## Phase 2 implementation

- Operator approved milestone 1, then phase 2 was built.
- Added template drafts, 1080 SVG examples, and a Drafts section on the marketing page.
- `npm test` passed 34. `npm run typecheck` passed.
- Milestone 2 acceptance is not recorded. The phase 3 plan was not written.

## Hermes profile

- Created `marketingprojectlead` on `hermes-droplet-cindy`. `inboundengineprojectlead` was left as it was. The gateway is serving the new profile.
- Text model is `anthropic/claude-opus-5.5`. Still images use `google/gemini-nano-banana-2.1` only when a real photograph is missing. That model does not output video or GIF.
- The working tree was copied to `/root/marketing-engine`. GitHub deploy keys on the host cannot read the private repo, so it is not a git clone.
- No model call was made. The profile does not inherit the root OpenRouter credential. No cron was added. Publishing stays off.
