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

## Phase 3 plan

- Operator asked for the phase 3 plan while milestone 2 acceptance was still unrecorded. The plan records that. Samples stay unapprovable.
- Wrote `docs/plans/phase_3_approvals_publishing_plan.md`. It closes S0-1 and S0-2 before any adapter call, keeps the kill switch off, and does not call Buffer or Meta.
- Phase 3 was not implemented. The phase 4 plan was not written.

## Generated sample

- Confirmed `marketingprojectlead` has an OpenRouter key. The value was not read.
- Generated one sample property tip with Claude Opus 5.5 and one abstract graphic with Nano Banana 2.1. It is on the local dashboard and is not a listing photograph.

## Agency sample

- Replaced the marketing profile defaults. Text is `openai/gpt-6-luna`. Still images are `minimax/minimax-h3-image`. The brief is `docs/prompts/marketingprojectlead.md`, copied to the profile `SOUL.md`.
- The first graphic was abstract because the prompt banned buildings, type, and logos. The replacement is a black-and-white social tile: tidy living room, headline "Prepare the home.", MCG Property name. The wide logo was rejected by MiniMax because it is wider than 4:1, so the square logo was the reference.
- Caption: "Sample: Before the photographer arrives, clear the benches and put away everyday clutter. Open the curtains to let in the light."
- Milestone 2 acceptance is still not recorded. Nothing was published. The inbound profile and the running gateway were not changed.

## Milestone 2 acceptance

- Operator accepted milestone 2 on 2026-11-20. A sample draft is acceptable as a draft. It is not a live post.
- Office hours are confirmed: Monday to Friday, 9am to 6pm, closed Saturday and Sunday.
- Voice was not supplied. The operator will set it in `/root/.hermes/profiles/marketingprojectlead/SOUL.md`. The repo copy is `docs/prompts/marketingprojectlead.md`.
- Later the same day, the operator edited `docs/prompts/marketingprojectlead.md` and that file was copied to the profile `SOUL.md`. The SHA-256 hashes matched.

## Phase 3 implementation

- Implemented the written phase 3 plan. Queue in `src/approval/`. Reserve and adapters in `src/providers/publish-run.ts` and `src/providers/adapters.ts`.
- `npm test` passed 46. `npm run typecheck` exited 0. No worker, no hosted migration, no Buffer or Meta call.
- Image default on `marketingprojectlead` changed to `x-ai/grok-imagine-image-2.0`. Video stays on that image model so a video call is rejected. The prompt and `SOUL.md` hashes matched after the copy.
- Milestone 3 acceptance is not recorded. Phase 4 was not generated.

## Phase 3 recheck

- Operator asked to finish phase 3 if it was not already done. The plan status is complete and tasks 1–5 are done.
- Re-ran `npm test`: 46 passed. `npm run typecheck` exited 0. No code change. No worker, no hosted migration, no Buffer or Meta call.
- Corrected the state line that still said phase 3 was plan only. Milestone 3 acceptance is still not recorded. Phase 4 was not generated.

## Message inbox

- The loopback dashboard now reads Messenger and Instagram conversations with the Page token in the local env file and can send a reply. Post publishing stays off.
- `npm test` passed 47. `npm run typecheck` exited 0. The token value was not printed.

## Page token lifetime

- Reloaded the local dashboard after the Page token was replaced. Graph reports the token type as PAGE for page `109832611867103`, with no expiry time.
- Messenger returned 13 threads and Instagram returned 1. The dashboard page showed the same counts and no load error. The token value was not printed.
- Post publishing stays off. Milestone 3 acceptance is not recorded.

## WhatsApp and iMessage request

- Operator asked to forward Messenger and Instagram threads to WhatsApp for Cindy, let `marketingprojectlead` read and send those replies, and keep other requests on iMessage.
- On `hermes-droplet-cindy`, the live gateway (pid 558314) already had one WhatsApp target, named Cindy. `marketingprojectlead` had no messaging channel. Photon is not connected.

## VPS move

- Moved the WhatsApp session onto `marketingprojectlead` and disabled it on the default profile. The gateway is the user service, because the old system unit crash-looped on a stale Python. The system unit is disabled. Marketing WhatsApp state is connected. Inbound is still served.
- Cloned the project to `/root/marketing-engine` from commit `7f08286`, then copied the current working tree. `marketing-dashboard.service` is active on `127.0.0.1:8787`. A push to `vps` (`hermes-droplet-cindy:/root/marketing-engine.git`) deploys `main` only when that commit contains `src/dashboard/inbox.ts`.
- The secret file was not copied. The safety check blocked it. The dashboard shows no enquiries. Publishing stays off.

## Milestone 3 and phase 4 plan

- Operator accepted the dashboard post queue, Buffer then Meta then manual with the switch off, and the memory store.
- WhatsApp is the approval channel for Facebook and Instagram messages. Post decisions wait for iMessage.
- Wrote `docs/plans/phase_4_community_reputation_plan.md`. Phase 4 was not implemented. Phase 5 was not generated.

## Phase 4 implementation

- Held customer replies unless a stored approval is passed and the community-reply row is on. Removed the dashboard reply form.
- Added classification, routing, WhatsApp notice text, comment reads, a manual review draft, and visibility checks. Switches stay off.
- `npm test` 55 passed. `npm run typecheck` exit 0. The worker was not started. The hosted schema was not applied. Milestone 4 is not accepted. Phase 5 was not generated.
- The WhatsApp notice is on the loopback page. No chat id is known, so Hermes was not called. The VPS tree was not updated and still has no Page token.

## Milestone 4 follow-up

- Routine drafts now use `openai/gpt-6-luna` on the marketing profile. Cindy's reply is still required before a customer send, and the community switch stays off.
- The marketing WhatsApp home channel is Cindy's logged-in account. A setup note and the current routine drafts were sent there.
- Supabase storage code and an RLS migration are in the repo. The linked database push was blocked by the repository hook, so nothing was written to the hosted database. Milestone 4 is not accepted.

## Owner schema command

- `supabase db push --linked --yes` applied `20261120025022` and `20261120101138`. Local and remote versions match. The dashboard still needs `DATABASE_URL`.
- The owner command is `npx supabase db push --linked --yes` from the repo, then `DATABASE_URL` in `.env` using the session pooler URI. Restart the dashboard after that. The first load writes the rows and sends the current drafts to WhatsApp once more.
- A gateway-stored WhatsApp reply now attaches to the latest routine draft. The reader returned no reply. `npm test` 57 passed. `npm run typecheck` exit 0.

## Milestone 4 accepted

- The corrected database URL connects. The dashboard reports `APP_ENV production` and `community store connected`, with no query failure across two page loads. Three replies stay held. Milestone 4 is accepted. The phase 5 plan was not generated.

## Phase 5 plan

- Wrote `docs/plans/phase_5_dashboard_handover_plan.md`. It is not implemented. Publishing stays off. The final checklist is not written yet.

## Phase 5 built

- Implemented the staff Performance report, the admin view, manual metrics, UTM links, and role checks. `npm test` passed 62 tests and typecheck passed. A restarted dashboard logged `APP_ENV production` and `community store connected`. The staff page returned 200, the admin page showed publishing off, and a READ save returned 403. The checklist is `docs/plans/final_implementation_checklist.md`.

## Milestone 5 accepted

- Accepted on 2026-11-20. Switches stay off. Alerts stay on the admin page until they are in-app notifications. Login will be Microsoft Azure. The Vercel project `cam-douglas-projects/marketing-engine` is protected by Vercel login. Its production deploy is empty, so the public address returns 404. The agent was blocked from deploying. The retainer was declined. GA4 and Google reviews wait on MCG details.

## Vercel dashboard

- Vercel Authentication is set to all deployments. Anonymous requests to https://marketing-engine-bice-gamma.vercel.app redirect to Vercel login. After login, the staff page and admin page return 200. Admin shows the worker stopped and publishing off. Publishing stays off. Production is not ready.
