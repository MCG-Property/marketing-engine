import type { Decision } from '../domain/approval.ts'

export type ParsedDecision = {
  decision: Decision
  contentId: string
  instruction: string | null
}

const WITH_ID = /^(Y|N|C)\s+(\S+)(?:\s+([\s\S]+))?$/i
const SHORTHAND = /^(Y|N|C)$/i

export function parseDecision(text: string, pendingIds: readonly string[]): ParsedDecision {
  const trimmed = text.trim()
  const withId = WITH_ID.exec(trimmed)
  if (withId) {
    const word = withId[1]
    const contentId = withId[2]
    if (!word || !contentId || !pendingIds.includes(contentId)) {
      throw new Error('unknown approval id')
    }
    const instruction = withId[3]?.trim() || null
    return { decision: word.toUpperCase() as Decision, contentId, instruction }
  }
  const shorthand = SHORTHAND.exec(trimmed)
  const word = shorthand?.[1]
  const only = pendingIds.length === 1 ? pendingIds[0] : undefined
  if (word && only) {
    return { decision: word.toUpperCase() as Decision, contentId: only, instruction: null }
  }
  throw new Error('unrecognised approval reply')
}
