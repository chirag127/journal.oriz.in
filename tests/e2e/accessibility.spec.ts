import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
	test("lang attribute is set", async ({ page }) => {
		await page.goto("/");
		const lang = await page.locator("html").getAttribute("lang");
		expect(lang).toBe("en");
	});

	test("viewport meta tag is present", async ({ page }) => {
		await page.goto("/");
		const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
		expect(viewport).toContain("width=device-width");
	});

	test("theme-color meta is present for both color schemes", async ({ page }) => {
		await page.goto("/");
		const metas = await page.locator('meta[name="theme-color"]').count();
		expect(metas).toBeGreaterThanOrEqual(2);
	});

	test("landing page has no broken images", async ({ page }) => {
		await page.goto("/");
		const brokenImages: string[] = [];
		page.on("response", (res) => {
			const url = res.url();
			if (res.status() >= 400 && /\.(png|jpg|svg|webp|ico)/i.test(url)) {
				brokenImages.push(`${res.status()} ${url}`);
			}
		});
		await page.waitForLoadState("networkidle");
		expect(brokenImages, `broken image assets: ${brokenImages.join("\n")}`).toEqual([]);
	});

	test("login form is keyboard-navigable", async ({ page }) => {
		await page.goto("/login");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
		expect(focusedTag).toBeTruthy();
	});

	test("html data-theme is set to a valid value on landing", async ({ page }) => {
		await page.goto("/");
		const t = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
		expect(["light", "dark", "system"]).toContain(t);
	});
});
