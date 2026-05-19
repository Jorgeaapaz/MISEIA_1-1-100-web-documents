import { test, expect } from "@playwright/test";

const email = `docs-${Date.now()}@example.com`;
const password = "testpassword123";

test.describe("Document CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    await page.goto("/register");
    await page.fill('input[type="text"]', "Doc Tester");
    await page.fill('input[type="email"]', email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/documents");
  });

  test("shows empty state when no documents", async ({ page }) => {
    await expect(page.locator("text=No hay documentos")).toBeVisible();
  });

  test("navigates to upload page", async ({ page }) => {
    await page.click("text=Subir documento");
    await expect(page).toHaveURL(/\/documents\/upload/);
    await expect(page.locator("h1")).toContainText("Subir documento");
  });

  test("documents page has search bar", async ({ page }) => {
    await expect(
      page.locator('input[placeholder="Buscar documentos..."]')
    ).toBeVisible();
  });
});
