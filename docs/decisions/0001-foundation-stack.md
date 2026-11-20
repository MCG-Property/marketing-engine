# 0001 — Foundation stack

Date: 2026-11-20
Status: accepted for phase 0

## Decision

- One Node 22 TypeScript package in this repository.
- Durable state is PostgreSQL, defined by SQL in `db/migrations/`.
- Supabase is the preferred hosted Postgres when an account exists. The SQL must also apply to local Postgres.
- The queue is `pg-boss` on that same Postgres. Redis is rejected.
- `pg` and `pg-boss` are the only runtime dependencies in phase 0.
- The staff web app is not part of phase 0. The preferred later host is Vercel for the web process only.
- The worker is a local Node process against the existing Supabase Postgres. It adds no host and no paid service. The incremental cost is A$0, inside the A$20–60 monthly cap.
- Publishing, model, listing, messaging, and review providers are interfaces. No vendor SDK is added.

## Consequences

Job handlers are registered by name and are not started on import. `npm run worker` starts the local process. It creates queues only. It does not publish.
