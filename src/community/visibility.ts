import { projectConfig } from '../config/project-config.ts'

export const VISIBILITY_STATUSES = ['MATCH', 'MISMATCH', 'MISSING', 'REVIEW_REQUIRED'] as const

export type VisibilityStatus = (typeof VISIBILITY_STATUSES)[number]

const EXPECTED: Record<string, string> = {
  businessName: projectConfig.businessName,
  address: projectConfig.address,
  phone: projectConfig.phone,
  website: projectConfig.website,
  openingHours: projectConfig.openingHours,
  primaryCategory: projectConfig.primaryCategory,
}

export type VisibilityCheck = {
  businessField: string
  expectedValue: string | null
  observedValue: string | null
  status: VisibilityStatus
}

export function checkVisibility(field: string, observed: string | null): VisibilityCheck {
  const expectedValue = EXPECTED[field]
  if (expectedValue === undefined) {
    return { businessField: field, expectedValue: null, observedValue: observed, status: 'REVIEW_REQUIRED' }
  }
  const observedValue = observed?.trim() ? observed.trim() : null
  if (!observedValue) {
    return { businessField: field, expectedValue, observedValue: null, status: 'MISSING' }
  }
  return {
    businessField: field,
    expectedValue,
    observedValue,
    status: observedValue === expectedValue ? 'MATCH' : 'MISMATCH',
  }
}
