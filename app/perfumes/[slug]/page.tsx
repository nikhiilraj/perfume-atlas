import { notFound } from "next/navigation";
import { getCatalog, getFragrance, getVariants } from "@/lib/catalog/query";
import { PerfumeDetail } from "@/components/perfume-detail";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const f = getFragrance((await params).slug);
  return { title: f?.name ?? "Scent not found", description: f?.summary };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const f = getFragrance((await params).slug);
  if (!f) notFound();
  const variants = getVariants(f.id);
  const requested = (await searchParams).variant;
  const initialVariantId =
    variants.find((v) => v.id === requested)?.id ?? variants[0].id;
  return (
    <PerfumeDetail
      fragrance={f}
      variants={variants}
      initialVariantId={initialVariantId}
      catalog={getCatalog()}
    />
  );
}
