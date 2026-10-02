import { test, expect } from "@playwright/test";
for (const [name, payload] of [
  ["missing fields", { candidates: [], method: "rules" }],
  [
    "unknown identity",
    {
      candidates: [
        {
          variantId: "missing",
          fragranceId: "missing",
          score: 1,
          reasonCodes: [],
          caveats: [],
          budgetEvidence: "unknown",
        },
      ],
      exclusions: [],
      noMatchReason: null,
      method: "jev",
    },
  ],
  [
    "missing candidate fields",
    {
      candidates: [
        { variantId: "liquid-brun-100", fragranceId: "liquid-brun" },
      ],
      exclusions: [],
      noMatchReason: null,
      method: "rules",
    },
  ],
] as const) {
  test(`malformed recommendation ${name} returns the rules shortlist`, async ({
    page,
  }) => {
    await page.route("**/api/recommend", (route) =>
      route.fulfill({ json: payload }),
    );
    await page.goto("/discover");
    await page.getByRole("button", { name: "Build my shortlist" }).click();
    await expect(page.getByText("Rules-based matching")).toBeVisible();
    await expect(page.getByTestId("recommendation-card")).toHaveCount(3);
  });
}
test("consultation produces explained results and a profile route", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Build my shortlist" }).click();
  await expect(
    page.getByRole("heading", { name: "Your sampling shortlist." }),
  ).toBeVisible();
  await expect(page.getByTestId("recommendation-card")).toHaveCount(3);
  await expect(page.getByText("Rules-based matching")).toBeVisible();
  await page.getByRole("link", { name: "Explore profile" }).first().click();
  await expect(
    page.getByText("Limited performance evidence.", { exact: false }),
  ).toBeVisible();
});
test("a tiny budget explains no match without silently increasing it", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByLabel("Maximum reference budget (INR)").fill("500");
  await page.getByRole("button", { name: "Build my shortlist" }).click();
  await expect(
    page.getByText("No scents meet these constraints."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit my answers" }),
  ).toBeVisible();
});
