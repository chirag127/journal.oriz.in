import { describe, it, expect } from "vitest";
import { entrySchema, templateSchema, goalSchema, settingsSchema, tagSchema } from "@/lib/schemas";

describe("entrySchema", () => {
	it("accepts a valid entry", () => {
		const result = entrySchema.safeParse({
			title: "My Day",
			content: "Was great",
			mood: "good",
			moodIntensity: 3,
			tags: ["personal"],
			journalType: "daily",
			entryDate: "2025-06-15",
			favorite: false,
			pinned: false,
			isDraft: false,
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid mood", () => {
		const result = entrySchema.safeParse({
			content: "test",
			entryDate: "2025-06-15",
			mood: "superhappy",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid entryDate format", () => {
		const result = entrySchema.safeParse({
			content: "test",
			entryDate: "06-15-2025",
		});
		expect(result.success).toBe(false);
	});

	it("defaults optional fields", () => {
		const result = entrySchema.parse({
			content: "test",
			entryDate: "2025-06-15",
		});
		expect(result.title).toBe("");
		expect(result.mood).toBeNull();
		expect(result.tags).toEqual([]);
		expect(result.journalType).toBe("daily");
		expect(result.favorite).toBe(false);
	});

	it("rejects title longer than 200 chars", () => {
		const result = entrySchema.safeParse({
			title: "x".repeat(201),
			content: "test",
			entryDate: "2025-06-15",
		});
		expect(result.success).toBe(false);
	});

	it("rejects more than 20 tags", () => {
		const result = entrySchema.safeParse({
			content: "test",
			entryDate: "2025-06-15",
			tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
		});
		expect(result.success).toBe(false);
	});

	it("accepts location and weather", () => {
		const result = entrySchema.safeParse({
			content: "test",
			entryDate: "2025-06-15",
			location: { lat: 37.77, lng: -122.41, label: "San Francisco" },
			weather: { temp: 22, condition: "Sunny", icon: "01d" },
		});
		expect(result.success).toBe(true);
	});
});

describe("templateSchema", () => {
	it("accepts valid template", () => {
		const result = templateSchema.safeParse({
			name: "Daily Reflection",
			description: "End your day",
			content: "## What happened?",
			journalType: "daily",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty name", () => {
		const result = templateSchema.safeParse({
			name: "",
			content: "test",
		});
		expect(result.success).toBe(false);
	});
});

describe("goalSchema", () => {
	it("accepts valid goal", () => {
		const result = goalSchema.safeParse({
			title: "Write daily",
			type: "streak",
			target: 30,
			period: "monthly",
			startDate: "2025-01-01",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid goal type", () => {
		const result = goalSchema.safeParse({
			title: "Bad goal",
			type: "invalid",
			target: 10,
			period: "daily",
			startDate: "2025-01-01",
		});
		expect(result.success).toBe(false);
	});
});

describe("settingsSchema", () => {
	it("accepts valid settings with defaults", () => {
		const result = settingsSchema.parse({
			theme: "dark",
			font: "serif",
			accentColor: "#b45309",
		});
		expect(result.theme).toBe("dark");
		expect(result.notifications.dailyReminder).toBe(false);
		expect(result.privacy.analytics).toBe(true);
	});

	it("rejects invalid theme", () => {
		const result = settingsSchema.safeParse({
			theme: "neon",
		});
		expect(result.success).toBe(false);
	});
});

describe("tagSchema", () => {
	it("accepts valid tag", () => {
		const result = tagSchema.safeParse({
			name: "personal",
			color: "#b45309",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid hex color", () => {
		const result = tagSchema.safeParse({
			name: "personal",
			color: "green",
		});
		expect(result.success).toBe(false);
	});
});
