import pg from 'pg'

export const JOB_NAMES = [
  'content.generate',
  'content.publish',
  'community.ingest',
  'review.monitor',
  'visibility.check',
] as const

export type JobName = (typeof JOB_NAMES)[number]

export type Worker = {
  stop: () => Promise<void>
}

/** Opens a pg-boss worker. Not called on import. */
export async function startWorker(databaseUrl: string): Promise<Worker> {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }
  const { PgBoss } = await import('pg-boss')
  const boss = new PgBoss(databaseUrl)
  await boss.start()
  for (const name of JOB_NAMES) {
    await boss.createQueue(name)
  }
  return {
    stop: () => boss.stop(),
  }
}

/** Keeps `pg` as a direct dependency for the migration apply path. */
export function createPool(databaseUrl: string): pg.Pool {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }
  // shortcut: the Supabase pooler certificate fails Node verification. Drop the override when node-pg trusts it.
  const ssl = databaseUrl.includes('supabase.com') ? { rejectUnauthorized: false } : undefined
  return new pg.Pool({ connectionString: databaseUrl, max: 1, ssl })
}
