import { CONTENT_PILLARS } from '../config/project-config.ts'

export type Idea = {
  id: string
  pillar: (typeof CONTENT_PILLARS)[number]
  title: string
  channels: readonly ['facebook', 'instagram']
  sample: true
}

export const ideas: readonly Idea[] = CONTENT_PILLARS.map((pillar, index) => ({
  id: `sample-idea-${index + 1}`,
  pillar,
  title: `Sample ${pillar}`,
  channels: ['facebook', 'instagram'],
  sample: true,
}))
