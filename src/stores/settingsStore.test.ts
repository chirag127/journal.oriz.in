import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/stores/settingsStore";

describe("settingsStore", () => {
	beforeEach(() => {
		useSettingsStore.setState({ font: "serif", accentColor: "#b45309", weekStart: 0 });
	});

	it("starts with default settings", () => {
		const s = useSettingsStore.getState();
		expect(s.font).toBe("serif");
		expect(s.accentColor).toBe("#b45309");
		expect(s.weekStart).toBe(0);
	});

	it("setFont changes font", () => {
		useSettingsStore.getState().setFont("sans");
		expect(useSettingsStore.getState().font).toBe("sans");
	});

	it("setAccentColor changes accent color", () => {
		useSettingsStore.getState().setAccentColor("#1d4ed8");
		expect(useSettingsStore.getState().accentColor).toBe("#1d4ed8");
	});

	it("setWeekStart changes week start day", () => {
		useSettingsStore.getState().setWeekStart(1);
		expect(useSettingsStore.getState().weekStart).toBe(1);
	});
});
