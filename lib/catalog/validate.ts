import type { Catalog } from "./types";
export type ValidationIssue = { code: string; id: string };
export function validateCatalog(c: Catalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (code: string, id: string) => issues.push({ code, id });
  for (const records of [
    c.fragrances,
    c.variants,
    c.sources,
    c.sellers,
    c.offers,
    c.assets,
  ]) {
    const ids = new Set<string>();
    for (const row of records) {
      if (ids.has(row.id)) add("duplicate-id", row.id);
      ids.add(row.id);
    }
  }
  const fids = new Set(c.fragrances.map((f) => f.id)),
    sids = new Set(c.sources.map((s) => s.id)),
    vids = new Set(c.variants.map((v) => v.id)),
    sellerIds = new Set(c.sellers.map((s) => s.id));
  for (const row of [...c.fragrances, ...c.variants])
    for (const id of row.sourceIds)
      if (!sids.has(id)) add("broken-source", row.id);
  for (const v of c.variants) {
    if (!fids.has(v.fragranceId)) add("broken-fragrance", v.id);
    if (v.identityStatus === "confirmed" && (!v.sizeMl || !v.concentration))
      add("incomplete-identity", v.id);
  }
  for (const o of c.offers) {
    if (!vids.has(o.variantId) || !sellerIds.has(o.sellerId))
      add("broken-offer", o.id);
    if (!Number.isFinite(o.amountInr) || o.amountInr < 0)
      add("invalid-price", o.id);
  }
  for (const a of c.assets)
    if (!fids.has(a.fragranceId)) add("broken-asset", a.id);
  return issues;
}
