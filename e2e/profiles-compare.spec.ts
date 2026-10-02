import { test, expect } from "@playwright/test";
test("a profile has sourced notes and honest performance evidence", async ({
  page,
}) => {
  await page.goto("/perfumes/liquid-brun");
  await expect(
    page.getByRole("heading", { name: "Liquid Brun", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Limited performance evidence.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "French Avenue: Liquid Brun", exact: true }),
  ).toHaveAttribute("href", "https://frenchavenue.com/products/liquid-brun");
});
test("exact editions remain distinct and invalid comparison IDs disappear", async ({
  page,
}) => {
  await page.goto("/perfumes/cdn-intense");
  await page.getByLabel("Exact variant").selectOption("cdn-intense-le-105");
  await expect(page.getByTestId("variant-identity")).toContainText(
    "Limited Edition",
  );
  await expect(page.getByTestId("variant-identity")).toContainText(
    "conflicted",
  );
  await page.goto(
    "/compare?ids=liquid-brun-100,liquid-brun-100,invalid,cdn-intense-150,cdn-intense-le-105,marwa-100",
  );
  await expect(page.getByTestId("comparison-product")).toHaveCount(3);
});
test("unknown perfume returns a useful not-found page", async ({ page }) => {
  const r = await page.goto("/perfumes/missing");
  expect(r?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Back to the collection" }),
  ).toBeVisible();
});
