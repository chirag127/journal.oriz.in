import { describe, it, expect } from "vitest";
import { findMemories, memoryLabel } from "@/lib/utils/memories";
import type { JournalEntry } from "@/types/journal";

function makeEntry(overrides: Partial<JournalEntry>): JournalEntry {
	return {
		id: "1",
		userId: "u1",
		title: "Test",
		content: "test",
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

describe("memoryLabel", () => {
	it("returns label for each memory type", () => {
		expect(memoryLabel("on-this-day")).toBe("On this day");
		expect(memoryLabel("1y")).toBe("1 year ago");
		expect(memoryLabel("2y")).toBe("2 years ago");
		expect(memoryLabel("5y")).toBe("5 years ago");
		expect(memoryLabel("10y")).toBe("10 years ago");
	});
});

describe("findMemories", () => {
	it("finds memories for same month/day in previous years", () => {
		const refDate = "2025-06-15";
		const entries = [
			makeEntry({ id: "1", entryDate: "2024-06-15" }),
			makeEntry({ id: "2", entryDate: "2023-06-15" }),
		];
		const mems = findMemories(entries, refDate);
		expect(mems.length).toBeGreaterThanOrEqual(2);
		expect(mems.some((m) => m.yearsAgo === 1)).toBe(true);
		expect(mems.some((m) => m.yearsAgo === 2)).toBe(true);
	});

	it("returns empty array when no memories match", () => {
		const refDate = "2025-06-15";
		const entries = [makeEntry({ id: "1", entryDate: "2024-01-01" })];
		const mems = findMemories(entries, refDate);
		expect(mems).toEqual([]);
	});

	it("does not include entries from the same year", () => {
		const refDate = "2025-06-15";
		const entries = [makeEntry({ id: "1", entryDate: "2025-06-15" })];
		const mems = findMemories(entries, refDate);
		expect(mems).toEqual([]);
	});

	it("sorts memories by yearsAgo ascending", () => {
		const refDate = "2025-06-15";
		const entries = [
			makeEntry({ id: "3", entryDate: "2020-06-15" }),
			makeEntry({ id: "1", entryDate: "2024-06-15" }),
			makeEntry({ id: "2", entryDate: "2023-06-15" }),
		];
		const mems = findMemories(entries, refDate);
		const years = mems.map((m) => m.yearsAgo);
		expect(years).toEqual([...years].sort((a, b) => a - b));
	});
});
