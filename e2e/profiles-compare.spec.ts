import { test, expect } from "@playwright/test";
test("comparison controls add and remove editions", async ({ page }) => {
  await page.goto("/compare");
  await page.getByLabel("Add an exact variant").selectOption("liquid-brun-100");
  await page.getByRole("button", { name: "Add to compare" }).click();
  await expect(page.getByTestId("comparison-product")).toHaveCount(1);
  await page.getByRole("button", { name: /Remove Liquid Brun/ }).click();
  await expect(page.getByTestId("comparison-product")).toHaveCount(0);
});
test("comparison preserves the exact edition across a profile round trip", async ({
  page,
}) => {
  await page.goto("/compare?ids=cdn-intense-le-105");
  await page.getByRole("link", { name: "Explore profile" }).click();
  await expect(page.getByLabel("Exact variant")).toHaveValue(
    "cdn-intense-le-105",
  );
  await expect(page.getByTestId("variant-identity")).toContainText(
    "conflicted",
  );
  await page.getByRole("link", { name: "Compare this edition" }).click();
  await expect(page).toHaveURL(/ids=cdn-intense-le-105/);
  await expect(page.getByTestId("comparison-product")).toContainText(
    "Limited Edition",
  );
});
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
