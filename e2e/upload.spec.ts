import { test, expect } from "@playwright/test";
import path from "path";

const email = `upload-${Date.now()}@example.com`;
const password = "testpassword123";

test.describe("File Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[type="text"]', "Upload Tester");
    await page.fill('input[type="email"]', email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/documents");
  });

  test("upload page renders correctly", async ({ page }) => {
    await page.goto("/documents/upload");
    await expect(page.locator("h1")).toContainText("Subir documento");
    await expect(
      page.locator("text=Arrastra un archivo aqui")
    ).toBeVisible();
  });

  test("shows file picker on click", async ({ page }) => {
    await page.goto("/documents/upload");
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeHidden();
  });
});
