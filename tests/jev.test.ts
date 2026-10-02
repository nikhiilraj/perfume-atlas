import { describe, it, expect, vi } from "vitest";
import { recommend } from "@/lib/server/recommend";
import { makeCatalog, makePreferences, makeVariant } from "./fixtures";
const valid = (id = "test-100") => ({
  model: "jev-latest",
  answers: {
    [id]: {
      type: "score",
      score: 3,
      confidence: 0.8,
      legend: {
        "0": "Poor",
        "1": "Weak",
        "2": "Mixed",
        "3": "Good",
        "4": "Clear",
      },
      probabilities: { "0": 0, "1": 0, "2": 0, "3": 1, "4": 0 },
    },
  },
});
const fake = (payload: unknown) =>
  vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify(payload)));
describe("optional Jev and fallback", () => {
  it("makes no call without a key", async () => {
    const f = fake(valid());
    const r = await recommend(makeCatalog(), makePreferences(), { fetch: f });
    expect(r.method).toBe("rules");
    expect(f).not.toHaveBeenCalled();
  });
  it("uses only validated bounded judgments and never leaks the secret", async () => {
    const f = fake(valid());
    const r = await recommend(makeCatalog(), makePreferences(), {
      apiKey: "test-secret",
      fetch: f,
    });
    expect(r.method).toBe("jev");
    expect(JSON.stringify(r)).not.toContain("test-secret");
    const body = JSON.parse(f.mock.calls[0][1]?.body as string);
    expect(body.questions["test-100"].type).toBe("score");
    expect(body.state.candidates[0].profile.family).toBe("Warm");
  });
  it.each([
    { answers: {} },
    valid("unknown"),
    { answers: { "test-100": { type: "score", score: 900, confidence: 1 } } },
  ])("falls back on malformed or unknown IDs", async (payload) => {
    expect(
      (
        await recommend(makeCatalog(), makePreferences(), {
          apiKey: "test-secret",
          fetch: fake(payload),
        })
      ).method,
    ).toBe("rules");
  });
  it("falls back on timeout and aborted requests", async () => {
    const f = vi.fn<typeof fetch>(
      (_url, opts) =>
        new Promise((_resolve, reject) =>
          opts?.signal?.addEventListener("abort", () =>
            reject(Error("aborted")),
          ),
        ),
    );
    const r = await recommend(makeCatalog(), makePreferences(), {
      apiKey: "test-secret",
      fetch: f,
      timeoutMs: 10,
    });
    expect(r.method).toBe("rules");
  });
  it("never sends or restores ineligible candidates", async () => {
    const f = fake(valid());
    const r = await recommend(
      makeCatalog({
        variants: [makeVariant({ identityStatus: "unresolved" })],
      }),
      makePreferences(),
      { apiKey: "test-secret", fetch: f },
    );
    expect(r.candidates).toEqual([]);
    expect(f).not.toHaveBeenCalled();
    const disliked = await recommend(
      makeCatalog(),
      makePreferences({ excludedTraitIds: ["sweet"] }),
      { apiKey: "test-secret", fetch: f },
    );
    expect(disliked.candidates).toEqual([]);
  });
});
