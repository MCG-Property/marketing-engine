import { CONTENT_PILLARS } from '../config/project-config.ts'

export const SAMPLE_MONTH = '2026-12'

/** MCG set no campaign dates. Marketing is ongoing. The month above is only the zero-metric placeholder. */

export type CalendarSlot = {
  date: string
  pillar: (typeof CONTENT_PILLARS)[number]
  title: string
  sample: true
}

export const calendar: readonly CalendarSlot[] = []
