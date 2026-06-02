// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

const tailwindPlugin = tailwindcss();

// https://astro.build/config
export default defineConfig({
	site: "https://journal.oriz.in",
	trailingSlash: "never",
	output: "static",
	integrations: [
		react(),
		mdx(),
		sitemap(),
		AstroPWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			manifest: {
				name: "Journal — Private. Fast. Beautiful.",
				short_name: "Journal",
				description:
					"Private journaling for capturing thoughts, recording memories, tracking progress, and reflecting on life.",
				theme_color: "#1A1814",
				background_color: "#F8F4ED",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/dashboard",
				icons: [
					{
						src: "/icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/icons/icon-maskable-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/icons/icon-maskable-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				navigateFallback: "/offline",
				navigateFallbackDenylist: [/^\/api/, /^\/sw\.js$/],
				globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
				runtimeCaching: [
					{
						urlPattern: ({ request }) =>
							request.destination === "image" || request.destination === "font",
						handler: "CacheFirst",
						options: {
							cacheName: "assets",
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern: ({ request }) =>
							request.destination === "style" || request.destination === "script",
						handler: "StaleWhileRevalidate",
						options: { cacheName: "app-shell" },
					},
				],
			},
			devOptions: { enabled: false },
		}),
	],
	vite: {
		plugins: [/** @type {any} */ (tailwindPlugin)],
		ssr: {
			noExternal: ["lucide-react"],
		},
	},
	build: {
		inlineStylesheets: "auto",
	},
});
