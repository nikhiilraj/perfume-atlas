import { test, expect } from "@playwright/test";
test("two tabs preserve additions and removals while editing notes", async ({
  page,
  context,
}) => {
  await page.goto("/shelf?add=liquid-brun");
  await expect(page.getByLabel("My note for Liquid Brun")).toBeVisible();
  const second = await context.newPage();
  await second.goto("/shelf");
  await second.getByLabel("My note for Liquid Brun").fill("My draft");
  await page.goto("/shelf?add=marwa");
  await expect(
    page.getByLabel("My note for Arabiyat Prestige Marwa"),
  ).toBeVisible();
  await second
    .getByRole("button", { name: "Save notes for Liquid Brun" })
    .click();
  await second.reload();
  await expect(
    second.getByLabel("My note for Arabiyat Prestige Marwa"),
  ).toBeVisible();
  await expect(second.getByLabel("My note for Liquid Brun")).toHaveValue(
    "My draft",
  );
  await second
    .getByLabel("My note for Arabiyat Prestige Marwa")
    .fill("Keep tea scent");
  await page
    .getByRole("button", { name: "Remove Liquid Brun from shelf" })
    .click();
  await second
    .getByRole("button", { name: "Save notes for Arabiyat Prestige Marwa" })
    .click();
  await second.reload();
  await expect(second.getByLabel("My note for Liquid Brun")).toHaveCount(0);
  await expect(
    second.getByLabel("My note for Arabiyat Prestige Marwa"),
  ).toHaveValue("Keep tea scent");
});
test("shelf presents editorial overlap without promising a clone", async ({
  page,
}) => {
  await page.goto("/shelf?add=liquid-brun");
  await expect(page.getByLabel("Compare a scent with my shelf")).toBeVisible();
  await page
    .getByLabel("Compare a scent with my shelf")
    .selectOption("khamrah");
  await expect(page.getByTestId("shelf-overlap")).toContainText("Liquid Brun");
  await expect(page.getByTestId("shelf-overlap")).toContainText("sweet");
  await expect(page.getByTestId("shelf-overlap")).toContainText(
    "Editorial inference",
  );
});
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
