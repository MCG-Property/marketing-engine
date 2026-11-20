# Dashboard database login

## Symptoms

The dashboard logged `community store connected`, then Postgres code `28P01`.

## Evidence

`npx supabase migration list --linked` on 2026-11-20 shows local and remote `20261120025022` and `20261120101138`.

## Attempts

`npx supabase db push --linked --yes` applied both migrations. The first dashboard restart rejected the password. After the owner corrected `DATABASE_URL`, a restart reported `APP_ENV production` and `community store connected` with no query failure.

## Files

- `supabase/migrations/20261120025022_foundation.sql`
- `supabase/migrations/20261120101138_community_rls.sql`
- `src/community/store.ts`

## Resolution

Verified on 2026-11-20. The first page load took 43 seconds and the second took 12 seconds. Both returned three held replies and no send control. The log has no `community store query failed` line. Milestone 4 is accepted.
