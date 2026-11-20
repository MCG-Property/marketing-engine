import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { exampleDrafts, exampleTexts } from './examples.ts'

export function writeExamples(dir = new URL('../../content/examples/', import.meta.url)): void {
  mkdirSync(dir, { recursive: true })
  for (const draft of exampleDrafts) {
    writeFileSync(new URL(draft.file, dir), draft.visualSvg)
  }
  for (const text of exampleTexts) {
    writeFileSync(new URL(text.name, dir), text.body)
  }
}

const entry = process.argv[1]
if (entry && import.meta.url === pathToFileURL(entry).href) {
  writeExamples()
}
