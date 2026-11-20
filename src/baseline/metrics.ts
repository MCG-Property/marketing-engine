import { projectConfig } from '../config/project-config.ts'
import { SAMPLE_MONTH } from './calendar.ts'

export type BaselineMetric = {
  month: typeof SAMPLE_MONTH
  channel: 'facebook' | 'instagram'
  posts: 0
  reach: 0
  impressions: 0
  engagement: 0
  clicks: 0
  source: 'none'
}

export const baselineMetrics: readonly BaselineMetric[] = projectConfig.channels.map((channel) => ({
  month: SAMPLE_MONTH,
  channel,
  posts: 0,
  reach: 0,
  impressions: 0,
  engagement: 0,
  clicks: 0,
  source: 'none',
}))
