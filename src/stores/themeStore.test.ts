import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/stores/themeStore";

describe("themeStore", () => {
	beforeEach(() => {
		useThemeStore.setState({ theme: "system", resolved: "light" });
	});

	it("starts with system theme and light resolved", () => {
		const s = useThemeStore.getState();
		expect(s.theme).toBe("system");
		expect(s.resolved).toBe("light");
	});

	it("setTheme updates the theme", () => {
		useThemeStore.getState().setTheme("dark");
		expect(useThemeStore.getState().theme).toBe("dark");
	});

	it("setResolved updates the resolved theme", () => {
		useThemeStore.getState().setResolved("dark");
		expect(useThemeStore.getState().resolved).toBe("dark");
	});
});
