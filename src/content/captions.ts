import type { DraftFacts } from './sources.ts'

export function captionFrom(facts: Pick<DraftFacts, 'title' | 'lines'>): string {
  return [facts.title, ...facts.lines].join(' ')
}
