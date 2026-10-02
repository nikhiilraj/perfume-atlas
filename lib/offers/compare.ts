import type { Offer, Variant } from "../catalog/types";
export type OfferComparison = {
  current: Offer[];
  historical: Offer[];
  cheapestDelivered: Offer | null;
};
export function getComparableOffers(
  v: Variant,
  offers: readonly Offer[],
  now: Date,
): OfferComparison {
  if (v.identityStatus !== "confirmed")
    return { current: [], historical: [], cheapestDelivered: null };
  const exact = offers.filter(
    (o) =>
      o.variantId === v.id &&
      o.sizeMl === v.sizeMl &&
      o.concentration === v.concentration &&
      o.edition === v.edition &&
      o.condition === v.condition &&
      Number.isFinite(o.amountInr) &&
      o.amountInr >= 0 &&
      (o.shippingInr === null ||
        (Number.isFinite(o.shippingInr) && o.shippingInr >= 0)),
  );
  const current = exact
    .filter((o) => {
      const age = now.getTime() - Date.parse(o.observedAt);
      return o.stock === "in-stock" && age >= 0 && age <= 24 * 60 * 60 * 1000;
    })
    .sort(
      (a, b) =>
        a.amountInr +
        (a.shippingInr ?? 0) -
        (b.amountInr + (b.shippingInr ?? 0)),
    );
  return {
    current,
    historical: exact.filter((o) => !current.includes(o)),
    cheapestDelivered:
      current.length && current.every((o) => o.shippingInr !== null)
        ? current[0]
        : null,
  };
}
