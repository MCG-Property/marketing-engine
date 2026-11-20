import { draftFromIdea, type DraftPackage } from './draft.ts'
import type { DraftFacts } from './sources.ts'

function sample(input: {
  ideaId: string
  file: string
  template: DraftFacts['template']
  title: string
  lines: readonly string[]
  address?: string
  status?: string
  photoRefs?: readonly string[]
}): DraftPackage {
  return draftFromIdea({
    ideaId: input.ideaId,
    file: input.file,
    facts: {
      template: input.template,
      title: input.title,
      lines: input.lines,
      address: input.address,
      status: input.status,
      photoRefs: input.photoRefs,
      sources: [{ kind: 'mcg-supplied', ref: input.ideaId }],
    },
  })
}

export const exampleDrafts: readonly DraftPackage[] = [
  sample({
    ideaId: 'sample-listing',
    file: 'sample-listing.svg',
    template: 'NEW LISTING',
    title: 'Sample listing',
    lines: ['Status sample. This is not a house photograph.'],
    address: 'Sample address',
    status: 'sample',
    photoRefs: ['sample-graphic'],
  }),
  sample({
    ideaId: 'sample-review',
    file: 'sample-review.svg',
    template: 'CUSTOMER REVIEW',
    title: 'Sample review',
    lines: ['This is not a customer testimonial.'],
  }),
  sample({
    ideaId: 'sample-market',
    file: 'sample-market-update.svg',
    template: 'MARKET UPDATE',
    title: 'Sample market update',
    lines: ['Shoalhaven homes. No figure is included.'],
  }),
  sample({
    ideaId: 'sample-local',
    file: 'sample-local-feature.svg',
    template: 'LOCAL SPOTLIGHT',
    title: 'Sample local feature',
    lines: ['Shoalhaven. No venue or event is named.'],
  }),
  sample({
    ideaId: 'sample-education',
    file: 'sample-education.svg',
    template: 'PROPERTY TIP',
    title: 'Sample property tip',
    lines: ['Prepare the property before photographs.'],
  }),
  sample({
    ideaId: 'sample-team',
    file: 'sample-team.svg',
    template: 'TEAM PROFILE',
    title: 'Sample team profile',
    lines: ['Cindy McGillivray, social media and branding.'],
  }),
]

export const exampleTexts: readonly { name: string; body: string }[] = [
  {
    name: 'sample-video-script.txt',
    body: 'Sample video script. Show the MCG Property logo, then the pillar, then the caption. No price and no statistic.',
  },
  {
    name: 'sample-carousel.txt',
    body: 'Sample carousel. Frame one: logo. Frame two: pillar. Frame three: caption. No price and no statistic.',
  },
  {
    name: 'sample-brief.txt',
    body: 'Sample brief. Goal: increase reach and land leads. Channels: Facebook and Instagram. Facts must come from a source record.',
  },
]
