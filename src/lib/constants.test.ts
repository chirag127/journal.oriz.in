import { describe, it, expect } from "vitest";
import {
	MOODS,
	JOURNAL_TYPES,
	THEMES,
	GOAL_TYPES,
	GOAL_PERIODS,
	DEFAULT_TAGS,
	BUILT_IN_TEMPLATES,
	STORAGE_KEYS,
	APP_NAME,
	APP_TAGLINE,
	APP_URL,
} from "@/lib/constants";

describe("constants", () => {
	it("MOODS has 5 moods with all required fields", () => {
		expect(MOODS).toHaveLength(5);
		for (const m of MOODS) {
			expect(m).toHaveProperty("value");
			expect(m).toHaveProperty("label");
			expect(m).toHaveProperty("emoji");
			expect(m).toHaveProperty("color");
		}
	});

	it("JOURNAL_TYPES has 10 types", () => {
		expect(JOURNAL_TYPES).toHaveLength(10);
		for (const t of JOURNAL_TYPES) {
			expect(t).toHaveProperty("value");
			expect(t).toHaveProperty("label");
			expect(t).toHaveProperty("icon");
			expect(t).toHaveProperty("description");
		}
	});

	it("THEMES has light, dark, system", () => {
		expect(THEMES).toHaveLength(3);
		const values = THEMES.map((t) => t.value);
		expect(values).toContain("light");
		expect(values).toContain("dark");
		expect(values).toContain("system");
	});

	it("GOAL_TYPES has count, streak, words", () => {
		expect(GOAL_TYPES).toHaveLength(3);
		const values = GOAL_TYPES.map((g) => g.value);
		expect(values).toContain("count");
		expect(values).toContain("streak");
		expect(values).toContain("words");
	});

	it("GOAL_PERIODS has daily, weekly, monthly, yearly", () => {
		expect(GOAL_PERIODS).toHaveLength(4);
		const values = GOAL_PERIODS.map((p) => p.value);
		expect(values).toEqual(["daily", "weekly", "monthly", "yearly"]);
	});

	it("DEFAULT_TAGS has 7 tags with name and color", () => {
		expect(DEFAULT_TAGS).toHaveLength(7);
		for (const t of DEFAULT_TAGS) {
			expect(t).toHaveProperty("name");
			expect(t).toHaveProperty("color");
		}
	});

	it("BUILT_IN_TEMPLATES has 10 templates", () => {
		expect(BUILT_IN_TEMPLATES).toHaveLength(10);
		for (const t of BUILT_IN_TEMPLATES) {
			expect(t).toHaveProperty("id");
			expect(t).toHaveProperty("name");
			expect(t).toHaveProperty("journalType");
			expect(t).toHaveProperty("description");
			expect(t).toHaveProperty("content");
			expect(t.content.length).toBeGreaterThan(20);
		}
	});

	it("STORAGE_KEYS has all expected keys", () => {
		const keys = ["auth", "theme", "editor", "settings", "filters", "drafts"];
		for (const k of keys) {
			expect(STORAGE_KEYS).toHaveProperty(k);
			expect(STORAGE_KEYS[k as keyof typeof STORAGE_KEYS]).toContain("journal.");
		}
	});

	it("APP_NAME and APP_TAGLINE are non-empty strings", () => {
		expect(APP_NAME).toBe("Journal");
		expect(APP_TAGLINE.length).toBeGreaterThan(10);
		expect(APP_URL).toMatch(/^https?:\/\//);
	});
});
