import { test, expect } from "@playwright/test";
test("blocked WebGL preserves collection and navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByText("Simple view · 3D unavailable")).toBeVisible();
  await page.getByLabel("Search fragrances").fill("marwa");
  await expect(
    page.getByRole("button", {
      name: "Explore Arabiyat Prestige Marwa",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore this scent" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Arabiyat Prestige Marwa",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
});
test("reduced motion and keyboard work in simple view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Simple view", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enter 3D view" }),
  ).toBeVisible();
  await page.getByLabel("Search fragrances").focus();
  await page.keyboard.type("Fattan");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Reference budget")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Explore Fattan Pour Homme" }),
  ).toBeVisible();
});
test("a blocked shelf reports failed save and still permits browsing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/shelf?add=liquid-brun");
  await expect(page.getByRole("alert")).toContainText("Could not save");
  await expect(
    page.getByRole("link", { name: "Explore the collection" }),
  ).toBeVisible();
});
test("mobile routes and 200% text remain inside viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/perfumes/liquid-brun",
    "/discover",
    "/compare?ids=cdn-intense-150,cdn-intense-le-105,marwa-100",
    "/shelf",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByLabel("Search fragrances").fill("Liquid");
  await page.evaluate(() => {
    const originalSizes = Array.from(document.querySelectorAll("body *"))
      .filter(
        (e): e is HTMLElement =>
          e instanceof HTMLElement && !e.closest("canvas"),
      )
      .map((e) => [e, parseFloat(getComputedStyle(e).fontSize)] as const);
    originalSizes.forEach(([element, size]) => {
      element.style.fontSize = size * 2 + "px";
    });
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});
test("without scripts, profiles and collection information are still available", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "The collection", exact: true }),
  ).toBeVisible();
  await page.goto("/perfumes/liquid-brun");
  await expect(
    page.getByText("Limited performance evidence.", { exact: false }),
  ).toBeVisible();
  await context.close();
});
