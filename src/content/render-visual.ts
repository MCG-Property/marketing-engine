import { escapeHtml } from '../dashboard/escape.ts'
import type { DraftFacts } from './sources.ts'

export function renderVisual(facts: Pick<DraftFacts, 'template' | 'title' | 'lines'>): string {
  const lines = [facts.template, facts.title, ...facts.lines]
    .map((line, index) => {
      const y = 240 + index * 72
      return `<text x="80" y="${y}" fill="#fff" font-family="sans-serif" font-size="42">${escapeHtml(line)}</text>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#000"/><image href="../../brand/logo-wide.jpg" x="80" y="80" width="480" height="78"/>${lines}</svg>`
}
