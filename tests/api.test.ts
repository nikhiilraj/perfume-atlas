import { z } from "zod";
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/recommend/route";
import { makePreferences } from "./fixtures";
const request = (body: string, headers: Record<string, string> = {}) =>
  new Request("https://guide.example/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
describe("bounded recommendation endpoint", () => {
  it("rejects cross-origin requests", async () => {
    expect(
      (
        await POST(
          request(JSON.stringify(makePreferences()), {
            Origin: "https://bad.example",
          }),
        )
      ).status,
    ).toBe(403);
  });
  it("rejects malformed, oversized and unknown preferences", async () => {
    for (const body of [
      "{",
      JSON.stringify({ ...makePreferences(), maxBudgetInr: -1 }),
      JSON.stringify({ ...makePreferences(), likedProductIds: ["missing"] }),
    ])
      expect((await POST(request(body))).status).toBe(400);
    expect((await POST(request(" ".repeat(17000)))).status).toBe(413);
  });
  it("returns an honest baseline with no secret configured", async () => {
    const r = await POST(request(JSON.stringify(makePreferences())));
    expect(r.status).toBe(200);
    const body = z
      .object({ method: z.string(), candidates: z.array(z.unknown()) })
      .parse(await r.json());
    expect(body.method).toBe("rules");
    expect(body.candidates.length).toBeLessThanOrEqual(3);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
  });
});
