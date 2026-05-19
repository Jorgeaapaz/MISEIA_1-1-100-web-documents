import { test, expect } from "@playwright/test";

const uniqueEmail = `test-${Date.now()}@example.com`;
const password = "testpassword123";
const name = "Test User";

test.describe("Authentication", () => {
  test("register a new user", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Crear cuenta");

    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', uniqueEmail);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/documents");
    await expect(page).toHaveURL(/\/documents/);
  });

  test("logout and login", async ({ page }) => {
    // First register
    await page.goto("/register");
    const email = `test-${Date.now()}@example.com`;
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/documents");

    // Logout
    await page.click("text=Cerrar sesion");
    await expect(page.locator("text=Iniciar sesion")).toBeVisible();

    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/documents");
    await expect(page).toHaveURL(/\/documents/);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "nonexistent@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Credenciales incorrectas")).toBeVisible();
  });
});
