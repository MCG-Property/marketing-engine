import { captionFrom } from './captions.ts'
import { renderVisual } from './render-visual.ts'
import { sourceFailure, type DraftFacts, type SourceRecord } from './sources.ts'

export type DraftPackage = {
  ideaId: string
  title: string
  template: DraftFacts['template']
  status: 'DRAFT'
  version: 1
  caption: string
  visualSvg: string
  channels: readonly ['facebook', 'instagram']
  sources: readonly SourceRecord[]
  sample: true
  missing?: 'MISSING_SOURCE_DATA'
  file: string
}

export function draftFromIdea(input: { ideaId: string; file: string; facts: DraftFacts }): DraftPackage {
  const base = {
    ideaId: input.ideaId,
    title: input.facts.title,
    template: input.facts.template,
    status: 'DRAFT' as const,
    version: 1 as const,
    channels: ['facebook', 'instagram'] as const,
    sources: input.facts.sources,
    sample: true as const,
    file: input.file,
  }
  if (sourceFailure(input.facts)) {
    return { ...base, caption: '', visualSvg: '', missing: 'MISSING_SOURCE_DATA' }
  }
  return {
    ...base,
    caption: captionFrom(input.facts),
    visualSvg: renderVisual(input.facts),
  }
}
