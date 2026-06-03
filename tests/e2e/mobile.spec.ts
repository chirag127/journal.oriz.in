import { test, expect, devices } from "@playwright/test";

test.use(devices["iPhone 14"]);

test.describe("Mobile layout", () => {
	test("landing page is readable and has CTA above the fold", async ({ page }) => {
		await page.goto("/");
		const heading = page.getByRole("heading", { level: 1 });
		await expect(heading).toBeVisible();
		const box = await heading.boundingBox();
		expect(box?.width).toBeLessThan(450);
		await expect(page.getByRole("link", { name: /Start writing/i }).first()).toBeVisible();
	});

	test("login page is usable on mobile", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
		const btn = page.getByRole("button", { name: /Continue with Google/i });
		const box = await btn.boundingBox();
		expect(box?.width).toBeGreaterThan(200);
	});

	test("sign-in notice renders on mobile for /dashboard", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({
			timeout: 10_000,
		});
	});
});
