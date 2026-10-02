import { z } from "zod";
export const SHELF_KEY = "perfume-atlas:shelf:v1";
const entrySchema = z.object({
  fragranceId: z.string().max(80),
  favorite: z.boolean(),
  trialStatus: z.enum(["not-tried", "tried"]),
  reaction: z.enum(["unsure", "love", "like", "pass"]),
  note: z.string().max(2000),
  updatedAt: z.string().max(40),
});
export type ShelfEntry = z.infer<typeof entrySchema>;
export type ShelfState = {
  version: 1;
  entries: ShelfEntry[];
  warning?: string;
};
export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};
export function readShelf(
  s: StorageLike,
  validIds: ReadonlySet<string>,
): ShelfState {
  const empty: ShelfState = { version: 1, entries: [] };
  try {
    const raw = s.getItem(SHELF_KEY);
    if (!raw) return empty;
    if (raw.length > 200000) throw Error("Invalid size");
    const root = z
      .object({ version: z.literal(1), entries: z.array(z.unknown()).max(100) })
      .parse(JSON.parse(raw));
    const seen = new Set<string>();
    let discarded = false;
    for (const row of root.entries) {
      const parsed = entrySchema.safeParse(row);
      if (
        !parsed.success ||
        !validIds.has(parsed.data.fragranceId) ||
        seen.has(parsed.data.fragranceId)
      ) {
        discarded = true;
        continue;
      }
      seen.add(parsed.data.fragranceId);
      empty.entries.push(parsed.data);
    }
    if (discarded)
      empty.warning = "Some older or invalid shelf entries were skipped.";
    return empty;
  } catch {
    return {
      ...empty,
      warning:
        "Your shelf could not be read. Browser storage may be blocked or contain unsupported data.",
    };
  }
}
export function writeShelf(s: StorageLike, state: ShelfState): void {
  const entries = z.array(entrySchema).max(100).parse(state.entries);
  s.setItem(SHELF_KEY, JSON.stringify({ version: 1, entries }));
}
export function resetShelf(s: StorageLike): void {
  s.removeItem(SHELF_KEY);
}
