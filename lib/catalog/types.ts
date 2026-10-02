export type TraitId =
  | "fresh"
  | "sweet"
  | "woody"
  | "spicy"
  | "smoky"
  | "creamy"
  | "tropical"
  | "green"
  | "floral"
  | "leathery"
  | "tea";
export type ScentProfile = {
  family: string;
  color: string;
  traits: Partial<Record<TraitId, number>>;
  opening: string[];
  character: string[];
  drydown: string[];
  phases: [string, string, string];
};
export type SourceClaim = {
  id: string;
  url: string;
  title: string;
  tier: "producer" | "brand-facing" | "retailer";
  checkedAt: string;
  caveat?: string;
};
export type ReferencePrice = {
  kind: "reference";
  amountInr: number;
  source: "user";
  sizeConfirmed: boolean;
};
export type PriceState =
  | ReferencePrice
  | { kind: "unknown" }
  | { kind: "observed"; amountInr: number; offerId: string };
export type WearReport = { evidence: "not-measured"; statement: string };
export type Fragrance = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  summary: string;
  mood: string;
  profile: ScentProfile;
  sourceIds: string[];
  cautions: string[];
  wear: WearReport;
  occasions: string[];
  settings: string[];
  presence: "soft" | "balanced" | "bold";
  referencePrice: PriceState;
};
export type Variant = {
  id: string;
  fragranceId: string;
  label: string;
  sizeMl: number | null;
  concentration: string | null;
  edition: string;
  identityStatus: "confirmed" | "conflicted" | "unresolved";
  sourceIds: string[];
  condition: "sealed" | "decant";
  market: string;
};
export type Seller = {
  id: string;
  name: string;
  url: string;
  evidence: string;
  region: string;
  checkedAt: string;
};
export type Offer = {
  id: string;
  sellerId: string;
  variantId: string;
  sizeMl: number;
  concentration: string;
  edition: string;
  condition: "sealed" | "decant";
  amountInr: number;
  shippingInr: number | null;
  stock: "in-stock" | "out-of-stock" | "unknown";
  observedAt: string;
  url: string;
};
export type ProductAsset = {
  id: string;
  fragranceId: string;
  sourceUrl: string;
  originalUrl: string;
  licenseStatus: "unverified" | "cleared";
  displayPath: string | null;
};
export type Catalog = {
  fragrances: Fragrance[];
  variants: Variant[];
  sources: SourceClaim[];
  sellers: Seller[];
  offers: Offer[];
  assets: ProductAsset[];
};
