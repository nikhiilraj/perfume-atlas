export function parseComparisonIds(
  raw: string | null,
  validIds: ReadonlySet<string>,
): string[] {
  return [
    ...new Set((raw ?? "").split(",").filter((id) => validIds.has(id))),
  ].slice(0, 3);
}
