export const BRAND_LOGOS = [
  'logo-wide.jpg',
  'logo-lockup.jpg',
  'logo-square.png',
  'logo-tall.png',
  'logo-profile.jpg',
] as const

export type BrandLogo = (typeof BRAND_LOGOS)[number]

/** Public path for a stored logo. Rejects any other name. */
export function brandLogoPath(name: string): `/brand/${BrandLogo}` | undefined {
  if (!(BRAND_LOGOS as readonly string[]).includes(name)) return undefined
  return `/brand/${name as BrandLogo}`
}
