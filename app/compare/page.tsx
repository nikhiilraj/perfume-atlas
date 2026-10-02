import { getCatalog } from "@/lib/catalog/query";
import { parseComparisonIds } from "@/lib/compare/selection";
import { ComparisonView } from "@/components/comparison-view";
export const metadata = { title: "Compare fragrances" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const c = getCatalog(),
    q = await searchParams;
  return (
    <ComparisonView
      catalog={c}
      selectedVariantIds={parseComparisonIds(
        typeof q.ids === "string" ? q.ids : null,
        new Set(c.variants.map((v) => v.id)),
      )}
    />
  );
}
