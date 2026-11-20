import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_KILL_SWITCHES, KILL_SWITCHES, killSwitchesFromRows } from '../src/config/kill-switches.ts'
import { projectConfig } from '../src/config/project-config.ts'

test('kill switches default closed', () => {
  assert.deepEqual(Object.keys(DEFAULT_KILL_SWITCHES), [...KILL_SWITCHES])
  for (const name of KILL_SWITCHES) {
    assert.equal(DEFAULT_KILL_SWITCHES[name], false)
  }
})

test('database rows override a flag without a deploy', () => {
  const flags = killSwitchesFromRows([{ name: 'PUBLISHING_ENABLED', enabled: true }])
  assert.equal(flags.PUBLISHING_ENABLED, true)
  assert.equal(flags.REVIEW_REPLIES_ENABLED, false)
})

test('default channels are Facebook and Instagram', () => {
  assert.deepEqual(projectConfig.channels, ['facebook', 'instagram'])
  assert.equal(projectConfig.listingSourceMode, 'manual')
  assert.equal(projectConfig.operatingCostCeilingAudPerMonth, 60)
})
