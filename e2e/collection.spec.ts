import { test, expect } from "@playwright/test";
test("search and explore a fragrance, with a useful empty state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Search fragrances").fill("Liquid Brun");
  await page
    .getByRole("button", { name: "Explore Liquid Brun", exact: true })
    .click();
  await expect(page.getByTestId("selected-fragrance")).toContainText(
    "creamy vanilla",
  );
  await expect(
    page.getByRole("link", { name: "Explore this scent" }),
  ).toHaveAttribute("href", "/perfumes/liquid-brun");
  await page.getByLabel("Search fragrances").fill("not-a-fragrance");
  await expect(page.getByText("No scents found")).toBeVisible();
});
