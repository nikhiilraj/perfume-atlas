import { test, expect } from "@playwright/test";
test("save, reload, edit and clear the browser shelf", async ({ page }) => {
  await page.goto("/shelf?add=liquid-brun");
  await expect(
    page.getByRole("heading", { name: "Liquid Brun", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("My note for Liquid Brun")
    .fill("Too sweet for my office");
  await page.getByLabel("Reaction to Liquid Brun").selectOption("pass");
  await page
    .getByRole("button", { name: "Save notes for Liquid Brun" })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved in this browser");
  await page.reload();
  await expect(page.getByLabel("My note for Liquid Brun")).toHaveValue(
    "Too sweet for my office",
  );
  await page.getByRole("button", { name: "Clear my shelf" }).click();
  await expect(page.getByText("Your shelf is waiting.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Your shelf is waiting.")).toBeVisible();
});
