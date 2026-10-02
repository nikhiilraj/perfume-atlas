"use client";
import { useState } from "react";
import Link from "@/components/site-link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Info,
  RefreshCcw,
} from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Catalog, TraitId } from "@/lib/catalog/types";
import {
  defaultPreferences,
  type Preferences,
  type RecommendationResult,
} from "@/lib/recommendations/types";
import { rankCandidates } from "@/lib/recommendations/baseline";
import { parseRecommendationResponse } from "@/lib/recommendations/response";
import { explainRecommendation } from "@/lib/recommendations/explain";
import { formatInr } from "@/lib/catalog/query";
import { ScentArt } from "./scent-art";
export function DiscoveryFlow({ catalog }: { catalog: Catalog }) {
  const hydrated = useHydrated();
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));
  const toggle = (key: "desiredTraitIds" | "excludedTraitIds", t: TraitId) =>
    setPrefs((p) => ({
      ...p,
      [key]: p[key].includes(t)
        ? p[key].filter((x) => x !== t)
        : [...p[key], t],
      [key === "desiredTraitIds" ? "excludedTraitIds" : "desiredTraitIds"]: p[
        key === "desiredTraitIds" ? "excludedTraitIds" : "desiredTraitIds"
      ].filter((x) => x !== t),
    }));
  const build = async () => {
    setBusy(true);
    setError("");
    const p = { ...prefs, maxBudgetInr: budget ? Number(budget) : null };
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw Error("Unavailable");
      setResult(parseRecommendationResponse(await response.json(), catalog, p));
    } catch {
      setResult(rankCandidates(catalog, p));
    } finally {
      setBusy(false);
    }
  };
  if (result)
    return (
      <main id="main" className="page">
        <div className="page-title">
          <p className="eyebrow">A STARTING POINT FOR YOUR NOSE</p>
          <h1>Your sampling shortlist.</h1>
          <p>
            {result.method === "jev"
              ? "Jev-assisted matching"
              : "Rules-based matching"}{" "}
            · Constraints stay fixed. The real test is on your skin.
          </p>
        </div>
        <div className="results-toolbar">
          <span>
            {result.candidates.length} scents · {result.exclusions.length}{" "}
            editions excluded by identity, dislikes or price evidence
          </span>
          <button className="button secondary" onClick={() => setResult(null)}>
            <RefreshCcw size={16} /> Edit my answers
          </button>
        </div>
        {!result.candidates.length ? (
          <div className="empty-state">
            <h2>No scents meet these constraints.</h2>
            <p>
              Try changing your budget, price evidence mode or dislikes. We
              won’t relax them automatically.
            </p>
          </div>
        ) : (
          <div className="recommendation-grid">
            {result.candidates.map((r, i) => {
              const f = catalog.fragrances.find((f) => f.id === r.fragranceId)!;
              const v = catalog.variants.find((v) => v.id === r.variantId)!;
              const explanation = explainRecommendation(r, catalog);
              return (
                <article
                  className="recommendation-card"
                  data-testid="recommendation-card"
                  key={r.variantId}
                >
                  <div className="recommendation-art">
                    <ScentArt color={f.profile.color} />
                    <span>
                      0{i + 1} / {i === 0 ? "START HERE" : "ALSO EXPLORE"}
                    </span>
                  </div>
                  <div className="recommendation-copy">
                    <p className="eyebrow">{f.brand}</p>
                    <h2>{f.name}</h2>
                    <p className="variant-label">{v.label}</p>
                    <ul className="fit-reasons">
                      {explanation.reasons.map((x) => (
                        <li key={x}>
                          <Check size={16} />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="recommendation-caveat">
                      <Info size={16} />
                      <p>{explanation.caveat}</p>
                    </div>
                    <div className="budget-evidence">
                      {r.budgetEvidence === "reference" &&
                      f.referencePrice.kind === "reference"
                        ? formatInr(f.referencePrice.amountInr) +
                          " · reference only"
                        : r.budgetEvidence === "observed"
                          ? "Budget evidence: observed delivered offer"
                          : "Price unknown · no budget fit established"}
                    </div>
                    <Link
                      className="button"
                      href={"/perfumes/" + f.slug + "?variant=" + v.id}
                    >
                      Explore profile <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <aside className="guide-callout">
          <span className="large-star">✳</span>
          <div>
            <h2>Take a sample, take your time.</h2>
            <p>
              Try one scent per wrist, wear it in your usual weather, and check
              back after the opening fades. Keep your impressions in your
              private browser shelf.
            </p>
          </div>
          <Link href="/shelf" className="button secondary">
            My shelf <ArrowUpRight size={17} />
          </Link>
        </aside>
      </main>
    );
  return (
    <main id="main" className="page">
      <div className="page-title">
        <p className="eyebrow">A LITTLE GUIDANCE, A LOT LESS GUESSWORK</p>
        <h1>Let’s find your direction.</h1>
        <p>
          A short consultation. A thoughtful shortlist. No promise that you’ll
          love a blind buy.
        </p>
      </div>
      <form
        className="consultation"
        onSubmit={(e) => {
          e.preventDefault();
          void build();
        }}
      >
        <div className="consultation-main">
          <fieldset>
            <legend>
              <span>01</span> Where will you wear it?
            </legend>
            <div className="form-grid">
              <label className="field-label">
                Occasion
                <select
                  disabled={!hydrated}
                  value={prefs.occasion}
                  onChange={(e) =>
                    set("occasion", e.target.value as Preferences["occasion"])
                  }
                >
                  <option value="daily">Everyday</option>
                  <option value="casual">Casual / weekends</option>
                  <option value="evening">Evenings</option>
                  <option value="special">Special occasions</option>
                </select>
              </label>
              <label className="field-label">
                Setting
                <select
                  disabled={!hydrated}
                  value={prefs.setting}
                  onChange={(e) =>
                    set("setting", e.target.value as Preferences["setting"])
                  }
                >
                  <option value="shared">Office / shared spaces</option>
                  <option value="private">My own space</option>
                  <option value="outdoors">Outdoors</option>
                </select>
              </label>
              <label className="field-label">
                Usual weather
                <select
                  disabled={!hydrated}
                  value={prefs.climate}
                  onChange={(e) =>
                    set("climate", e.target.value as Preferences["climate"])
                  }
                >
                  <option value="hot">Hot / humid</option>
                  <option value="mild">Mild / mixed</option>
                  <option value="cool">Cool / air-conditioned</option>
                </select>
              </label>
              <label className="field-label">
                Scent direction
                <select
                  disabled={!hydrated}
                  value={prefs.presence}
                  onChange={(e) =>
                    set("presence", e.target.value as Preferences["presence"])
                  }
                >
                  <option value="soft">Soft / understated</option>
                  <option value="balanced">Balanced</option>
                  <option value="bold">Rich / expressive</option>
                </select>
              </label>
            </div>
            <p className="caption">
              These are editorial scent directions, not measured projection
              levels.
            </p>
          </fieldset>
          <fieldset>
            <legend>
              <span>02</span> What do you gravitate toward?
            </legend>
            <p>
              Select a few scent directions. It’s fine to be new to perfume.
            </p>
            <div className="choice-chips">
              {(
                [
                  "fresh",
                  "sweet",
                  "woody",
                  "spicy",
                  "tropical",
                  "tea",
                  "creamy",
                  "floral",
                ] as TraitId[]
              ).map((t) => (
                <button
                  disabled={!hydrated}
                  key={t}
                  type="button"
                  aria-pressed={prefs.desiredTraitIds.includes(t)}
                  onClick={() => toggle("desiredTraitIds", t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="field-label">
              A perfume I already like
              <select
                disabled={!hydrated}
                value={prefs.likedProductIds[0] ?? ""}
                onChange={(e) =>
                  set("likedProductIds", e.target.value ? [e.target.value] : [])
                }
              >
                <option value="">I’m starting fresh</option>
                {catalog.fragrances.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          <fieldset>
            <legend>
              <span>03</span> Anything you want to avoid?
            </legend>
            <p>
              Selected dislikes are hard exclusions, even when other preferences
              match.
            </p>
            <div className="choice-chips avoid">
              {(
                [
                  "sweet",
                  "smoky",
                  "leathery",
                  "spicy",
                  "floral",
                  "tropical",
                ] as TraitId[]
              ).map((t) => (
                <button
                  disabled={!hydrated}
                  key={t}
                  type="button"
                  aria-pressed={prefs.excludedTraitIds.includes(t)}
                  onClick={() => toggle("excludedTraitIds", t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <aside className="consultation-side">
          <p className="eyebrow">A BUDGET YOU CONTROL</p>
          <h2>Keep it comfortable.</h2>
          <label className="field-label">
            Maximum reference budget (INR)
            <input
              disabled={!hydrated}
              type="number"
              min="1"
              max="100000"
              step="1"
              inputMode="numeric"
              placeholder="No ceiling"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <label className="field-label">
            Price evidence
            <select
              disabled={!hydrated}
              value={prefs.budgetMode}
              onChange={(e) =>
                set("budgetMode", e.target.value as Preferences["budgetMode"])
              }
            >
              <option value="reference-ok">
                Allow clearly labeled reference prices
              </option>
              <option value="observed-only">
                Only checked delivered offers
              </option>
            </select>
          </label>
          <p>
            Reference amounts came from the initial collection brief. They
            aren’t current seller prices. There are no checked delivered offers
            yet.
          </p>
          <p>
            Unknown prices can’t establish a budget match. Unresolved identities
            are excluded from the shortlist.
          </p>
          <button className="button" type="submit" disabled={!hydrated || busy}>
            {busy ? "Finding your direction…" : "Build my shortlist"}
            <ArrowRight size={18} />
          </button>
          {error && <p role="alert">{error}</p>}
          <span className="caption">
            Your answers aren’t stored or included in a share link.
          </span>
        </aside>
      </form>
    </main>
  );
}
