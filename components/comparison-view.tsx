"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/site-link";
import { Plus, X, ArrowUpRight } from "lucide-react";
import type { Catalog } from "@/lib/catalog/types";
import { formatInr } from "@/lib/catalog/query";
import { ScentArt } from "./scent-art";
import { getComparableOffers } from "@/lib/offers/compare";
export type ComparisonViewProps = {
  catalog: Catalog;
  selectedVariantIds: string[];
};
export function ComparisonView({
  catalog,
  selectedVariantIds,
}: ComparisonViewProps) {
  const hydrated = useHydrated();
  const router = useRouter();
  const [adding, setAdding] = useState("");
  const selected = selectedVariantIds
    .map((id) => catalog.variants.find((v) => v.id === id)!)
    .filter(Boolean);
  const update = (ids: string[]) =>
    router.push("/compare" + (ids.length ? "?ids=" + ids.join(",") : ""));
  return (
    <main id="main" className="page">
      <div className="page-title">
        <p className="eyebrow">A CLOSER LOOK, SIDE BY SIDE</p>
        <h1>Find the difference.</h1>
        <p>
          Compare up to three exact editions. Missing evidence stays missing.
        </p>
      </div>
      <div className="compare-controls">
        <label className="field-label">
          Add an exact variant
          <select
            disabled={!hydrated}
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            aria-label="Add an exact variant"
          >
            <option value="">Choose a scent and edition</option>
            {catalog.variants
              .filter((v) => !selectedVariantIds.includes(v.id))
              .map((v) => (
                <option value={v.id} key={v.id}>
                  {catalog.fragrances.find((f) => f.id === v.fragranceId)?.name}{" "}
                  · {v.label}
                </option>
              ))}
          </select>
        </label>
        <button
          className="button"
          disabled={!adding || selected.length >= 3}
          onClick={() => {
            update([...selectedVariantIds, adding]);
            setAdding("");
          }}
        >
          <Plus size={17} /> Add to compare
        </button>
        <span className="caption">{selected.length} / 3 editions</span>
      </div>
      {!selected.length ? (
        <div className="empty-state">
          <h2>Start with two scents.</h2>
          <p>
            Add a fragrance above to compare its identity, scent and evidence.
          </p>
          <Link href="/" className="text-link">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
        </div>
      ) : (
        <div
          className="comparison-grid"
          style={{
            gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))`,
          }}
        >
          {selected.map((v) => {
            const f = catalog.fragrances.find((f) => f.id === v.fragranceId)!;
            const offers = getComparableOffers(v, catalog.offers, new Date());
            return (
              <article
                className="comparison-product"
                data-testid="comparison-product"
                key={v.id}
              >
                <div className="compare-art">
                  <ScentArt color={f.profile.color} />
                  <button
                    className="remove-button"
                    disabled={!hydrated}
                    aria-label={"Remove " + f.name + " " + v.edition}
                    onClick={() =>
                      update(selectedVariantIds.filter((id) => id !== v.id))
                    }
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="compare-content">
                  <p className="eyebrow">{f.brand}</p>
                  <h2>{f.name}</h2>
                  <p className="variant-label">{v.label}</p>
                  <dl>
                    <div>
                      <dt>Exact edition</dt>
                      <dd>
                        {v.edition}
                        <br />
                        {v.sizeMl}ml ·{" "}
                        {v.concentration ?? "Concentration unconfirmed"}
                        <br />
                        Identity: {v.identityStatus}
                      </dd>
                    </div>
                    <div>
                      <dt>The feeling</dt>
                      <dd>{f.summary}</dd>
                    </div>
                    <div>
                      <dt>Scent direction</dt>
                      <dd>{f.profile.family}</dd>
                    </div>
                    <div>
                      <dt>Reference price</dt>
                      <dd>
                        {f.referencePrice.kind === "reference"
                          ? formatInr(f.referencePrice.amountInr) +
                            " · user reference"
                          : "Unknown"}
                        <small>
                          Not a checked seller offer; size applicability
                          unconfirmed.
                        </small>
                      </dd>
                    </div>
                    <div>
                      <dt>Current delivered offer</dt>
                      <dd>
                        {offers.cheapestDelivered
                          ? formatInr(
                              offers.cheapestDelivered.amountInr +
                                (offers.cheapestDelivered.shippingInr ?? 0),
                            )
                          : "No verified offer"}
                      </dd>
                    </div>
                    <div>
                      <dt>Longevity / projection</dt>
                      <dd>No independent measurements recorded.</dd>
                    </div>
                    <div>
                      <dt>What to check</dt>
                      <dd>
                        {f.cautions.join(" ") ||
                          "Exact SKU, stock, delivery and seller authorization."}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    className="button secondary"
                    href={"/perfumes/" + f.slug + "?variant=" + v.id}
                  >
                    Explore profile <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="info-note">
        This URL shares perfume editions only. Your preferences and personal
        shelf aren’t included.
      </p>
    </main>
  );
}
