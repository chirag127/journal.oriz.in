import { expect, test } from "@playwright/test";

test.describe("Performance and SEO", () => {
	test("landing page has meta description and og tags", async ({ page }) => {
		await page.goto("/");
		const desc = await page.locator('meta[name="description"]').getAttribute("content");
		expect(desc).toBeTruthy();
		expect(desc!.length).toBeGreaterThan(40);
		const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
		expect(ogTitle).toBeTruthy();
		const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
		expect(ogImage).toBeTruthy();
	});

	test("canonical link is set", async ({ page }) => {
		await page.goto("/");
		const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
		expect(canonical).toMatch(/^https?:\/\/journal\.oriz\.in\//);
	});

	test("landing page HTML is well-formed", async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.status()).toBe(200);
		const html = await response!.text();
		expect(html.startsWith("<!doctype html>") || html.startsWith("<!DOCTYPE html>")).toBe(true);
		expect(html).toContain("<html");
		expect(html).toContain("</html>");
	});

	test("preconnect to Google Fonts is set", async ({ page }) => {
		await page.goto("/");
		const preconnects = await page.locator('link[rel="preconnect"]').count();
		expect(preconnects).toBeGreaterThanOrEqual(2);
	});

	test("Fraunces font is loaded", async ({ page }) => {
		const res = await page.goto("/");
		const body = await res!.text();
		expect(body).toContain("Fraunces");
	});
});
