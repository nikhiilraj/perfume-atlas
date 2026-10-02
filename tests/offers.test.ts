import { describe, it, expect } from "vitest";
import { getComparableOffers } from "@/lib/offers/compare";
import { makeOffer, makeVariant } from "./fixtures";
const now = new Date("2026-10-02T12:00:00Z");
describe("exact offer comparison", () => {
  it("excludes decants, size/concentration/edition mismatch, stale and unavailable observations", () => {
    const offers = [
      makeOffer({ id: "ok" }),
      makeOffer({
        id: "decant",
        sizeMl: 10,
        condition: "decant",
        amountInr: 100,
      }),
      makeOffer({ id: "edition", edition: "LE" }),
      makeOffer({ id: "concentration", concentration: "Extrait" }),
      makeOffer({ id: "old", observedAt: "2026-09-30T00:00:00Z" }),
      makeOffer({ id: "stock", stock: "out-of-stock" }),
      makeOffer({ id: "future", observedAt: "2026-10-03T00:00:00Z" }),
    ];
    expect(
      getComparableOffers(makeVariant(), offers, now).current.map((o) => o.id),
    ).toEqual(["ok"]);
  });
  it("does not claim delivered cheapest with unknown shipping", () => {
    expect(
      getComparableOffers(
        makeVariant(),
        [makeOffer({ shippingInr: null })],
        now,
      ).cheapestDelivered,
    ).toBeNull();
  });
  it("withholds a cheapest label if a competing shipping amount is unknown", () => {
    expect(
      getComparableOffers(
        makeVariant(),
        [makeOffer(), makeOffer({ id: "unknown", shippingInr: null })],
        now,
      ).cheapestDelivered,
    ).toBeNull();
  });
  it("does not compare unresolved product identities", () => {
    expect(
      getComparableOffers(
        makeVariant({ identityStatus: "conflicted" }),
        [makeOffer()],
        now,
      ).current,
    ).toEqual([]);
  });
});
