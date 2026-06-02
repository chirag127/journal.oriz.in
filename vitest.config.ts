/// <reference types="vitest" />

import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@components": fileURLToPath(new URL("./src/components", import.meta.url)),
			"@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
			"@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
			"@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
			"@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
			"@types": fileURLToPath(new URL("./src/types", import.meta.url)),
			"@hooks": fileURLToPath(new URL("./src/lib/hooks", import.meta.url)),
		},
	},
	test: {
		environment: "happy-dom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist", ".astro", "tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/test/**", "src/types/**"],
		},
	},
});
