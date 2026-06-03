import { test, expect } from "@playwright/test";

test.describe("PWA artifacts", () => {
	test("favicon.svg is served and is XML", async ({ request }) => {
		const res = await request.get("/favicon.svg");
		expect(res.status()).toBe(200);
		const body = await res.text();
		expect(body).toMatch(/^<svg/);
	});

	test("manifest.webmanifest is valid JSON with PWA fields", async ({ request }) => {
		const res = await request.get("/manifest.webmanifest");
		expect(res.status()).toBe(200);
		const m = await res.json();
		expect(m.name).toBeTruthy();
		expect(m.short_name).toBeTruthy();
		expect(m.start_url).toBeTruthy();
		expect(m.display).toBe("standalone");
		expect(m.theme_color).toMatch(/^#/);
		expect(m.background_color).toMatch(/^#/);
		expect(Array.isArray(m.icons)).toBe(true);
		expect(m.icons.length).toBeGreaterThanOrEqual(3);
		for (const icon of m.icons) {
			expect(icon.src).toMatch(/^\/icons\//);
			expect(icon.sizes).toBeTruthy();
			expect(icon.type).toBe("image/png");
		}
		const hasMaskable = m.icons.some((i: { purpose?: string }) => i.purpose === "maskable");
		expect(hasMaskable).toBe(true);
	});

	test("all icon sizes resolve to PNG bytes", async ({ request }) => {
		const sizes = ["icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"];
		for (const s of sizes) {
			const res = await request.get(`/icons/${s}`);
			expect(res.status(), `${s} should resolve`).toBe(200);
			const body = await res.body();
			expect(body.length, `${s} should be non-empty`).toBeGreaterThan(0);
			expect(body[0]).toBe(0x89);
			expect(body[1]).toBe(0x50);
			expect(body[2]).toBe(0x4e);
			expect(body[3]).toBe(0x47);
		}
	});

	test("apple-touch-icon resolves", async ({ request }) => {
		const res = await request.get("/icons/apple-touch-icon.png");
		expect(res.status()).toBe(200);
		expect((await res.body()).length).toBeGreaterThan(0);
	});

	test("service worker is generated and fetchable", async ({ request }) => {
		const sw = await request.get("/sw.js");
		expect(sw.status()).toBe(200);
		const body = await sw.text();
		expect(body.length).toBeGreaterThan(100);
	});

	test("robots and sitemap are present", async ({ request }) => {
		const sitemapIndex = await request.get("/sitemap-index.xml");
		expect(sitemapIndex.status()).toBe(200);
		expect(await sitemapIndex.text()).toContain("<sitemapindex");
	});

	test("landing page links the manifest and has apple-touch-icon", async ({ page }) => {
		await page.goto("/");
		const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
		expect(manifestHref).toBe("/manifest.webmanifest");
		const appleHref = await page
			.locator('link[rel="apple-touch-icon"]')
			.getAttribute("href");
		expect(appleHref).toBe("/icons/apple-touch-icon.png");
		const icon192 = await page.locator('link[rel="icon"][sizes="192x192"]').getAttribute("href");
		expect(icon192).toBe("/icons/icon-192.png");
	});
});
