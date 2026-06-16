import { describe, it, expect } from "vitest";
import { computeStreaks, buildActivityMap, buildMoodMap } from "@/lib/utils/streak";
import type { JournalEntry } from "@/types/journal";

function makeEntry(overrides: Partial<JournalEntry>): JournalEntry {
	return {
		id: "1",
		userId: "u1",
		title: "Test",
		content: "test content",
		mood: null,
		moodIntensity: null,
		tags: [],
		location: null,
		weather: null,
		journalType: "daily",
		entryDate: "2025-01-01",
		createdAt: "2025-01-01T00:00:00Z",
		updatedAt: "2025-01-01T00:00:00Z",
		favorite: false,
		pinned: false,
		wordCount: 10,
		readingTime: 0.5,
		isDraft: false,
		...overrides,
	};
}

describe("computeStreaks", () => {
	it("returns zeros for empty entries", () => {
		const result = computeStreaks([]);
		expect(result.current).toBe(0);
		expect(result.longest).toBe(0);
		expect(result.lastDate).toBeNull();
	});

	it("returns current 1 for a single entry today", () => {
		const today = new Date().toISOString().slice(0, 10);
		const result = computeStreaks([makeEntry({ entryDate: today })]);
		expect(result.current).toBe(1);
	});

	it("computes longest streak from consecutive dates", () => {
		const entries = [
			makeEntry({ id: "1", entryDate: "2025-01-01" }),
			makeEntry({ id: "2", entryDate: "2025-01-02" }),
			makeEntry({ id: "3", entryDate: "2025-01-03" }),
			makeEntry({ id: "4", entryDate: "2025-01-05" }),
		];
		const result = computeStreaks(entries);
		expect(result.longest).toBe(3);
	});

	it("handles duplicate dates without inflating streak", () => {
		const entries = [
			makeEntry({ id: "1", entryDate: "2025-01-01" }),
			makeEntry({ id: "2", entryDate: "2025-01-01" }),
			makeEntry({ id: "3", entryDate: "2025-01-02" }),
		];
		const result = computeStreaks(entries);
		expect(result.longest).toBe(2);
	});
});

describe("buildActivityMap", () => {
	it("builds map of date entry counts", () => {
		const entries = [
			makeEntry({ id: "1", entryDate: "2025-01-01" }),
			makeEntry({ id: "2", entryDate: "2025-01-01" }),
			makeEntry({ id: "3", entryDate: "2025-01-02" }),
		];
		const map = buildActivityMap(entries);
		expect(map["2025-01-01"]).toBe(2);
		expect(map["2025-01-02"]).toBe(1);
	});

	it("returns empty map for empty entries", () => {
		expect(buildActivityMap([])).toEqual({});
	});
});

describe("buildMoodMap", () => {
	it("builds map of dates with mood entries", () => {
		const entries = [
			makeEntry({ id: "1", entryDate: "2025-01-01", mood: "good" }),
			makeEntry({ id: "2", entryDate: "2025-01-02", mood: null }),
		];
		const map = buildMoodMap(entries);
		expect(map["2025-01-01"]).toBe(0);
		expect(map["2025-01-02"]).toBeUndefined();
	});
});
