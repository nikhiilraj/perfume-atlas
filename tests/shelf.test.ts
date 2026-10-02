import { describe, it, expect } from "vitest";
import {
  readShelf,
  writeShelf,
  resetShelf,
  SHELF_KEY,
  type ShelfState,
} from "@/lib/shelf/storage";
const store = (raw: string | null) => ({
  getItem: () => raw,
  setItem: (_key: string, value: string) => {
    raw = value;
  },
  removeItem: () => {
    raw = null;
  },
});
const entry = {
  fragranceId: "valid",
  favorite: true,
  trialStatus: "tried",
  reaction: "like",
  note: "Nice",
  updatedAt: "2026-10-02",
};
describe("local shelf resilience", () => {
  it("recovers malformed and unsupported storage with a visible warning", () => {
    for (const raw of ["{", JSON.stringify({ version: 2, entries: [] })]) {
      const s = readShelf(store(raw), new Set(["valid"]));
      expect(s.entries).toEqual([]);
      expect(s.warning).toBeTruthy();
    }
  });
  it("removes unknown IDs and duplicates without losing valid notes", () => {
    const s = readShelf(
      store(
        JSON.stringify({
          version: 1,
          entries: [entry, entry, { ...entry, fragranceId: "bad" }],
        }),
      ),
      new Set(["valid"]),
    );
    expect(s.entries).toHaveLength(1);
    expect(s.entries[0].note).toBe("Nice");
  });
  it("reads blocked storage safely but never pretends a failed write succeeded", () => {
    const s = {
      getItem: () => {
        throw Error("Blocked");
      },
      setItem: () => {
        throw Error("Blocked");
      },
      removeItem: () => {
        throw Error("Blocked");
      },
    };
    expect(readShelf(s, new Set()).warning).toBeTruthy();
    expect(() => writeShelf(s, { version: 1, entries: [] })).toThrow();
  });
  it("saves and resets only its own key", () => {
    const s = store(null),
      state = { version: 1, entries: [entry] } as ShelfState;
    writeShelf(s, state);
    expect(readShelf(s, new Set(["valid"])).entries).toHaveLength(1);
    resetShelf(s);
    expect(s.getItem()).toBeNull();
    expect(SHELF_KEY).toBe("perfume-atlas:shelf:v1");
  });
});
