import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
	test("login page renders AuthForm with Google + GitHub + email", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: /welcome back|sign in/i }).first()).toBeVisible();
		await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Continue as guest/i })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/password/i)).toBeVisible();
		await expect(page.getByRole("button", { name: /^Sign in$/i })).toBeVisible();
	});

	test("signup page shows name field", async ({ page }) => {
		await page.goto("/signup");
		await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
		await expect(page.getByLabel(/^Name$/i)).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/password/i)).toBeVisible();
		await expect(page.getByRole("button", { name: /Create account/i })).toBeVisible();
	});
});
