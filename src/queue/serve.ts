import { startWorker } from './jobs.ts'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const worker = await startWorker(databaseUrl)
console.log('worker started')

async function shutdown() {
  await worker.stop()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown()
})
process.on('SIGTERM', () => {
  void shutdown()
})
