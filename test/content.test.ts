import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { draftFromIdea } from '../src/content/draft.ts'
import { exampleDrafts, exampleTexts } from '../src/content/examples.ts'
import { writeExamples } from '../src/content/write-examples.ts'

test('a complete sample listing drafts a caption and a square visual', () => {
  const draft = exampleDrafts.find((item) => item.ideaId === 'sample-listing')
  assert.ok(draft)
  assert.equal(draft.status, 'DRAFT')
  assert.equal(draft.version, 1)
  assert.equal(draft.missing, undefined)
  assert.match(draft.caption, /Sample/)
  assert.equal(draft.caption.includes('$'), false)
  assert.match(draft.visualSvg, /width="1080"/)
  assert.match(draft.visualSvg, /NEW LISTING/)
  assert.deepEqual(draft.channels, ['facebook', 'instagram'])
})

test('a listing without a photo stays a draft with no factual caption', () => {
  const draft = draftFromIdea({
    ideaId: 'missing-photo',
    file: 'missing-photo.svg',
    facts: {
      template: 'NEW LISTING',
      title: 'Sample listing',
      lines: ['Price 500000'],
      address: 'Sample address',
      status: 'sample',
      price: '500000',
      sources: [],
    },
  })
  assert.equal(draft.status, 'DRAFT')
  assert.equal(draft.missing, 'MISSING_SOURCE_DATA')
  assert.equal(draft.caption, '')
})

test('a market sentence with a digit is not drafted', () => {
  const draft = draftFromIdea({
    ideaId: 'bad-market',
    file: 'bad-market.svg',
    facts: {
      template: 'MARKET UPDATE',
      title: 'Sample market update',
      lines: ['Prices rose 10 percent'],
      sources: [{ kind: 'mcg-supplied', ref: 'bad-market' }],
    },
  })
  assert.equal(draft.missing, 'MISSING_SOURCE_DATA')
  assert.equal(draft.caption, '')
  const market = exampleDrafts.find((item) => item.template === 'MARKET UPDATE')
  assert.ok(market)
  assert.equal(/\d/.test(market.caption), false)
  const texts = [...market.visualSvg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((match) => match[1] ?? '')
  for (const text of texts) assert.equal(/\d/.test(text), false)
})

test('example files are labelled sample', () => {
  writeExamples()
  const dir = new URL('../content/examples/', import.meta.url)
  const names = readdirSync(dir).map(String)
  const expected = [
    ...exampleDrafts.map((draft) => draft.file),
    ...exampleTexts.map((text) => text.name),
  ]
  for (const name of expected) {
    assert.equal(names.includes(name), true, name)
    assert.match(readFileSync(new URL(name, dir), 'utf8'), /Sample/)
  }
})

test('drafting does not publish', () => {
  const source = readFileSync(new URL('../src/content/draft.ts', import.meta.url), 'utf8')
  assert.equal(source.includes('beginPublish'), false)
})
