import { VISUAL_TEMPLATES } from '../config/project-config.ts'
import { manualListing } from '../providers/listing-source.ts'

export const SOURCE_PRIORITY = [
  'internal',
  'approved-listing-or-website',
  'mcg-supplied',
  'official-public',
  'human-provided',
] as const

export type SourceKind = (typeof SOURCE_PRIORITY)[number]

export type SourceRecord = {
  kind: SourceKind
  ref: string
}

export type DraftFacts = {
  template: (typeof VISUAL_TEMPLATES)[number]
  title: string
  lines: readonly string[]
  address?: string
  status?: string
  price?: string | null
  features?: readonly string[]
  photoRefs?: readonly string[]
  statistic?: string
  testimonial?: string
  inspectionTime?: string
  agentQuote?: string
  sources: readonly SourceRecord[]
}

const LISTING_TEMPLATES = new Set(['NEW LISTING', 'SOLD', 'OPEN HOME', 'AUCTION'])

function sourced(facts: DraftFacts, ref: string): boolean {
  return facts.sources.some((source) => source.ref === ref)
}

/** Returns MISSING_SOURCE_DATA when a public fact has no source. */
export function sourceFailure(facts: DraftFacts): 'MISSING_SOURCE_DATA' | undefined {
  if (LISTING_TEMPLATES.has(facts.template)) {
    try {
      manualListing(facts)
    } catch {
      return 'MISSING_SOURCE_DATA'
    }
  }
  const spoken = [facts.title, ...facts.lines].join(' ')
  if ((facts.price && !sourced(facts, 'price')) || (facts.statistic && !sourced(facts, 'statistic'))) {
    return 'MISSING_SOURCE_DATA'
  }
  if (/\d/.test(spoken) && !facts.statistic && !facts.price) return 'MISSING_SOURCE_DATA'
  if (facts.testimonial && !sourced(facts, 'testimonial')) return 'MISSING_SOURCE_DATA'
  if (facts.inspectionTime && !sourced(facts, 'inspection')) return 'MISSING_SOURCE_DATA'
  if (facts.agentQuote && !sourced(facts, 'quote')) return 'MISSING_SOURCE_DATA'
  return undefined
}
