import type { ComponentProps } from "react";

// Standard navigation avoids the starter's production RSC prefetch failure.
// Semantic links also work before hydration and with scripts disabled.
export default function SiteLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
