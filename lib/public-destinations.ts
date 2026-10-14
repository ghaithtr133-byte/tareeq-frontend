/**
 * The Lead-approved initial destination names. This temporary seed is isolated
 * until the Backend publishes a documented destination-content contract.
 */
export const approvedDestinations = [
  { slug: "romania", name: "رومانيا" },
  { slug: "turkey", name: "تركيا" },
  { slug: "poland", name: "بولندا" },
] as const;

export function getApprovedDestination(slug: string) {
  return approvedDestinations.find((destination) => destination.slug === slug);
}
