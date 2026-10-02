"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useState } from "react";
import Link from "@/components/site-link";
import {
  ArrowLeft,
  ArrowUpRight,
  Layers3,
  ExternalLink,
  Info,
} from "lucide-react";
import type { Catalog, Fragrance, Variant } from "@/lib/catalog/types";
import { formatInr } from "@/lib/catalog/query";
import { getComparableOffers } from "@/lib/offers/compare";
import { ScentStage } from "./boutique/scent-stage";
import { ScentArt } from "./scent-art";
export type PerfumeDetailProps = {
  fragrance: Fragrance;
  variants: Variant[];
  catalog: Catalog;
  initialVariantId: string;
};
export function PerfumeDetail({
  fragrance: f,
  variants,
  catalog,
  initialVariantId,
}: PerfumeDetailProps) {
  const hydrated = useHydrated();
  const [variantId, setVariant] = useState(initialVariantId);
  const v = variants.find((x) => x.id === variantId)!;
  const offers = getComparableOffers(v, catalog.offers, new Date());
  const sources = catalog.sources.filter(
    (s) => f.sourceIds.includes(s.id) || v.sourceIds.includes(s.id),
  );
  return (
    <main id="main" className="page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> The collection
      </Link>
      <div className="profile-hero">
        <div className="profile-art">
          <ScentArt color={f.profile.color} />
          <span className="caption">
            Abstract scent study · product photo pending permission
          </span>
        </div>
        <div className="profile-intro">
          <p className="eyebrow">{f.brand} / THE SCENT LIBRARY</p>
          <h1>{f.name}</h1>
          <p className="family-label">{f.profile.family}</p>
          <p className="lead">{f.summary}</p>
          <label className="field-label">
            Exact variant
            <select
              disabled={!hydrated}
              aria-label="Exact variant"
              value={variantId}
              onChange={(e) => {
                setVariant(e.target.value);
                window.history.replaceState(
                  null,
                  "",
                  "?variant=" + e.target.value,
                );
              }}
            >
              {variants.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <div className="identity-line" data-testid="variant-identity">
            <span className={"status-dot " + v.identityStatus} />
            <span>
              {v.edition} · {v.sizeMl ?? "Unknown"}ml ·{" "}
              {v.concentration ?? "Concentration unconfirmed"}
              <br />
              <small>Identity: {v.identityStatus}</small>
            </span>
          </div>
          <div className="profile-actions">
            <Link className="button" href={"/compare?ids=" + v.id}>
              <Layers3 size={17} /> Compare this edition
            </Link>
            <Link href={"/shelf?add=" + f.id} className="button secondary">
              Save to my shelf
            </Link>
          </div>
        </div>
      </div>
      <ScentStage fragrance={f} />
      <div className="detail-columns">
        <section>
          <p className="eyebrow">THE OLFACTORY IDEA</p>
          <h2>What’s in the story?</h2>
          <div className="note-groups">
            {(["opening", "character", "drydown"] as const).map((p, i) => (
              <div key={p}>
                <span className="note-step">0{i + 1}</span>
                <div>
                  <h3>
                    {p === "character"
                      ? "Heart / character"
                      : p[0].toUpperCase() + p.slice(1)}
                  </h3>
                  <p>
                    {f.profile[p].length
                      ? f.profile[p].join(" · ")
                      : "Exact note stages withheld pending verification."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="info-note">
            <Info size={17} /> Notes describe smells, not the chemical
            ingredient list. A verified, market-specific ingredient declaration
            isn’t available here; check the exact box if ingredients matter to
            you.
          </p>
        </section>
        <section className="evidence-panel">
          <p className="eyebrow">BEFORE YOU BLIND BUY</p>
          <h2>The honest details.</h2>
          <dl>
            <div>
              <dt>Longevity & projection</dt>
              <dd>{f.wear.statement}</dd>
            </div>
            <div>
              <dt>Where to start</dt>
              <dd>
                {f.occasions.join(", ")} · An editorial use suggestion, not a
                performance claim.
              </dd>
            </div>
            <div>
              <dt>What to confirm</dt>
              <dd>
                {f.cautions.length
                  ? f.cautions.join(" ")
                  : "Check size, concentration, edition, stock and return terms with the seller."}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="seller-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMPARE WITH CARE</p>
            <h2>Where to look.</h2>
          </div>
          <div className="price-line compact">
            <strong>
              {f.referencePrice.kind === "reference"
                ? formatInr(f.referencePrice.amountInr) + " reference"
                : "Price unconfirmed"}
            </strong>
            <span>User reference, size applicability unconfirmed</span>
          </div>
        </div>
        <div className="offer-notice">
          <Info size={20} />
          <div>
            <strong>
              {offers.cheapestDelivered
                ? "Lowest delivered price in this checked set"
                : "No verified cheapest offer yet"}
            </strong>
            <p>
              {offers.current.length
                ? "Only matching, in-stock observations from the past 24 hours qualify. Unknown shipping prevents a delivered-price winner."
                : "We haven’t recorded current, exact-edition INR offers with delivery costs. These are seller routes, with unconfirmed prices and authorization."}
            </p>
          </div>
        </div>
        {offers.current.length > 0 && (
          <div className="observed-offers">
            {offers.current.map((o) => (
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="observed-offer"
                key={o.id}
              >
                <strong>
                  {catalog.sellers.find((s) => s.id === o.sellerId)?.name ??
                    "Unverified seller"}
                </strong>
                <span>
                  {formatInr(o.amountInr)} bottle ·{" "}
                  {o.shippingInr === null
                    ? "shipping unknown"
                    : formatInr(o.shippingInr) + " shipping"}
                </span>
                <small>
                  In stock when observed · {o.observedAt} · seller authorization
                  must be checked
                </small>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        )}
        {offers.historical.length > 0 && (
          <details className="historical-offers">
            <summary>
              Earlier or unavailable observations ({offers.historical.length})
            </summary>
            <p className="caption">
              Excluded from the current cheapest comparison.
            </p>
            {offers.historical.map((o) => (
              <p key={o.id}>
                {catalog.sellers.find((s) => s.id === o.sellerId)?.name ??
                  "Unverified seller"}{" "}
                · {formatInr(o.amountInr)} · {o.stock} · {o.observedAt}
              </p>
            ))}
          </details>
        )}
        <div className="seller-grid">
          {catalog.sellers.map((s) => (
            <a
              key={s.id}
              className="seller-card"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                <h3>{s.name}</h3>
                <ExternalLink size={17} />
              </div>
              <p>{s.evidence}</p>
              <span>
                Visit seller · check exact variant <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
        <div className="authenticity-note">
          <h3>Authenticity needs evidence.</h3>
          <p>
            Ask the brand about authorized partners. Check seller identity,
            invoice, sealed packaging and return terms. A photo or barcode alone
            can’t certify authenticity. We have no affiliate arrangements.
          </p>
          <a
            href="https://myperfumes.ae/pages/how-to-spot-a-fake"
            target="_blank"
            rel="noopener noreferrer"
          >
            My Perfumes fake-check guide ↗
          </a>{" "}
          ·{" "}
          <a
            href="https://lattafa.com/spot-a-fake/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lattafa guidance ↗
          </a>
        </div>
      </section>
      <section className="source-section">
        <p className="eyebrow">OPEN SOURCES, OPEN QUESTIONS</p>
        <h2>See where it comes from.</h2>
        {sources.map((s) => (
          <div className="source-row" key={s.id}>
            <div>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} <ArrowUpRight size={15} />
              </a>
              <p>
                {s.tier} source · checked {s.checkedAt}
                {s.caveat ? " · " + s.caveat : ""}
              </p>
            </div>
          </div>
        ))}
        <p className="caption">
          Sensory descriptions and trait levels are editorial inferences from
          these sources. We haven’t conducted a first-hand smell or wear test.
          The product photo is available on its original source page.
        </p>
      </section>
    </main>
  );
}
