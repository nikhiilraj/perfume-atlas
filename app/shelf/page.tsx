import { getCatalog } from "@/lib/catalog/query";
import { ShelfView } from "@/components/shelf-view";
export const metadata = { title: "My scent shelf" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const q = await searchParams;
  return (
    <ShelfView
      catalog={getCatalog()}
      addId={typeof q.add === "string" ? q.add : undefined}
    />
  );
}
