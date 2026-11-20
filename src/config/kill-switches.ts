export const KILL_SWITCHES = [
  'AUTOMATION_ENABLED',
  'CONTENT_GENERATION_ENABLED',
  'PUBLISHING_ENABLED',
  'COMMUNITY_REPLY_ENABLED',
  'REVIEW_REQUESTS_ENABLED',
  'REVIEW_REPLIES_ENABLED',
] as const

export type KillSwitchName = (typeof KILL_SWITCHES)[number]

export type KillSwitches = Record<KillSwitchName, boolean>

export function isKillSwitchName(name: string): name is KillSwitchName {
  return (KILL_SWITCHES as readonly string[]).includes(name)
}

/** Map `kill_switch` rows onto the gate input. Missing names stay at the closed default. */
export function killSwitchesFromRows(
  rows: readonly { name: string; enabled: boolean }[],
): KillSwitches {
  const flags: KillSwitches = { ...DEFAULT_KILL_SWITCHES }
  for (const row of rows) {
    if (isKillSwitchName(row.name)) flags[row.name] = row.enabled
  }
  return flags
}

export const DEFAULT_KILL_SWITCHES: KillSwitches = {
  AUTOMATION_ENABLED: false,
  CONTENT_GENERATION_ENABLED: false,
  PUBLISHING_ENABLED: false,
  COMMUNITY_REPLY_ENABLED: false,
  REVIEW_REQUESTS_ENABLED: false,
  REVIEW_REPLIES_ENABLED: false,
}
