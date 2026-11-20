export const CONTENT_PILLARS = [
  'property and market education',
  'listings and property stories',
  'Shoalhaven life',
  'people and trust',
  'community campaigns',
  'home, design and culture',
] as const

export const VISUAL_TEMPLATES = [
  'NEW LISTING',
  'SOLD',
  'OPEN HOME',
  'AUCTION',
  'CUSTOMER REVIEW',
  'MARKET UPDATE',
  'LOCAL SPOTLIGHT',
  'PROPERTY TIP',
  'TEAM PROFILE',
  'COMMUNITY EVENT',
] as const

export type ProjectConfig = {
  businessName: string
  address: string
  phone: string
  website: string
  openingHours: string
  primaryCategory: string
  socialLinks: readonly string[]
  contentPillars: readonly string[]
  toneExamples: readonly string[]
  approvalOwners: readonly string[]
  marketingGoal: string
  channels: readonly ['facebook', 'instagram']
  publishingPreference: 'buffer_then_meta_then_manual'
  listingSourceMode: 'manual' | 'reaxml' | 'website' | 'agentbox'
  directoryWatchlist: readonly string[]
  operatingCostCeilingAudPerMonth: number
}

export const projectConfig: ProjectConfig = {
  businessName: 'MCG Property',
  address: '37-43 Kinghorne Street, Nowra NSW 2541',
  phone: '02 4418 1330',
  website: 'https://mcgproperty.com.au/',
  openingHours: 'Monday to Friday, 9am to 6pm. Closed Saturday and Sunday.',
  primaryCategory: 'Real estate agency',
  socialLinks: [],
  contentPillars: CONTENT_PILLARS,
  toneExamples: [],
  approvalOwners: ['Cindy McGillivray, social media and branding'],
  marketingGoal: 'Increase customer reach and land more leads.',
  channels: ['facebook', 'instagram'],
  publishingPreference: 'buffer_then_meta_then_manual',
  listingSourceMode: 'manual',
  directoryWatchlist: ['Google Business Profile'],
  operatingCostCeilingAudPerMonth: 60,
}
