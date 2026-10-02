import { getCatalog } from "@/lib/catalog/query";
import { preferencesSchema } from "@/lib/recommendations/types";
import { recommend } from "@/lib/server/recommend";
const limit = 16 * 1024;
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return Response.json(
      { error: "Use this guide to request recommendations." },
      { status: 403 },
    );
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return Response.json(
      { error: "Send a JSON preference object." },
      { status: 400 },
    );
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit)
    return Response.json({ error: "Request is too large." }, { status: 413 });
  let raw = "";
  try {
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json(
        { error: "Preferences are required." },
        { status: 400 },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return Response.json(
          { error: "Request is too large." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    raw = new TextDecoder().decode(bytes);
  } catch {
    return Response.json(
      { error: "Could not read preferences." },
      { status: 400 },
    );
  }
  try {
    const parsed = preferencesSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return Response.json(
        { error: "Please check your preference fields and budget." },
        { status: 400 },
      );
    const c = getCatalog();
    if (
      parsed.data.likedProductIds.some(
        (id) => !c.fragrances.some((f) => f.id === id),
      )
    )
      return Response.json(
        { error: "Choose liked perfumes from this collection." },
        { status: 400 },
      );
    const result = await recommend(c, parsed.data, {
      apiKey: process.env.JEV_API_KEY,
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "Invalid preference JSON." },
      { status: 400 },
    );
  }
}
