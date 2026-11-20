export type ListingFacts = {
  address: string
  status: string
  price: string | null
  features: readonly string[]
  photoRefs: readonly string[]
}

export function manualListing(facts: {
  address?: string
  status?: string
  price?: string | null
  features?: readonly string[]
  photoRefs?: readonly string[]
}): ListingFacts {
  if (!facts.address || !facts.status || !facts.photoRefs?.length) {
    throw new Error('MISSING_SOURCE_DATA')
  }
  return {
    address: facts.address,
    status: facts.status,
    price: facts.price ?? null,
    features: facts.features ?? [],
    photoRefs: facts.photoRefs,
  }
}
