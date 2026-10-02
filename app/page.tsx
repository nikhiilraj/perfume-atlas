import { CollectionExplorer } from "@/components/collection-explorer";
import { getCatalog } from "@/lib/catalog/query";
export default function Page() {
  return <CollectionExplorer catalog={getCatalog()} />;
}
