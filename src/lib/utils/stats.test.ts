import { describe, it, expect } from "vitest";
import {
	totalWords,
	averageWords,
	longestEntry,
	shortestEntry,
	entriesByDay,
	moodDistribution,
	moodTrend,
	journalTypeDistribution,
	wordTrends,
} from "@/lib/utils/stats";
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
		wordCount: 100,
		readingTime: 1,
		isDraft: false,
		...overrides,
	};
}

describe("stats utils", () => {
	describe("totalWords", () => {
		it("sums word counts", () => {
			const entries = [
				makeEntry({ wordCount: 100 }),
				makeEntry({ wordCount: 200 }),
			];
			expect(totalWords(entries)).toBe(300);
		});

		it("returns 0 for empty array", () => {
			expect(totalWords([])).toBe(0);
		});
	});

	describe("averageWords", () => {
		it("calculates average", () => {
			const entries = [
				makeEntry({ wordCount: 100 }),
				makeEntry({ wordCount: 200 }),
			];
			expect(averageWords(entries)).toBe(150);
		});

		it("returns 0 for empty array", () => {
			expect(averageWords([])).toBe(0);
		});
	});

	describe("longestEntry", () => {
		it("returns entry with highest wordCount", () => {
			const entries = [
				makeEntry({ id: "1", wordCount: 100 }),
				makeEntry({ id: "2", wordCount: 300 }),
				makeEntry({ id: "3", wordCount: 200 }),
			];
			expect(longestEntry(entries)?.id).toBe("2");
		});

		it("returns null for empty array", () => {
			expect(longestEntry([])).toBeNull();
		});
	});

	describe("shortestEntry", () => {
		it("returns entry with lowest non-zero wordCount", () => {
			const entries = [
				makeEntry({ id: "1", wordCount: 100 }),
				makeEntry({ id: "2", wordCount: 50 }),
				makeEntry({ id: "3", wordCount: 200 }),
			];
			expect(shortestEntry(entries)?.id).toBe("2");
		});

		it("returns null when all entries have 0 words", () => {
			const entries = [
				makeEntry({ id: "1", wordCount: 0 }),
				makeEntry({ id: "2", wordCount: 0 }),
			];
			expect(shortestEntry(entries)).toBeNull();
		});

		it("returns null for empty array", () => {
			expect(shortestEntry([])).toBeNull();
		});
	});

	describe("entriesByDay", () => {
		it("returns correct bucket sizes", () => {
			const today = new Date().toISOString().slice(0, 10);
			const entries = [makeEntry({ entryDate: today })];
			const result = entriesByDay(entries, 7);
			expect(result).toHaveLength(7);
			const todayBucket = result.find((r) => r.date === today);
			expect(todayBucket?.count).toBe(1);
		});
	});

	describe("moodDistribution", () => {
		it("counts moods correctly", () => {
			const entries = [
				makeEntry({ mood: "good" }),
				makeEntry({ mood: "good" }),
				makeEntry({ mood: "bad" }),
			];
			const dist = moodDistribution(entries);
			const good = dist.find((d) => d.mood === "good");
			const bad = dist.find((d) => d.mood === "bad");
			expect(good?.count).toBe(2);
			expect(bad?.count).toBe(1);
		});

		it("includes all moods even with zero count", () => {
			const dist = moodDistribution([]);
			expect(dist).toHaveLength(5);
			for (const d of dist) {
				expect(d.count).toBe(0);
			}
		});
	});

	describe("moodTrend", () => {
		it("returns array of dates with mood scores", () => {
			const today = new Date().toISOString().slice(0, 10);
			const entries = [makeEntry({ entryDate: today, mood: "good" })];
			const trend = moodTrend(entries, 7);
			expect(trend).toHaveLength(7);
			const todayEntry = trend.find((t) => t.date === today);
			expect(todayEntry?.mood).toBe(4);
		});
	});

	describe("journalTypeDistribution", () => {
		it("counts by journal type", () => {
			const entries = [
				makeEntry({ journalType: "daily" }),
				makeEntry({ journalType: "daily" }),
				makeEntry({ journalType: "gratitude" }),
			];
			const dist = journalTypeDistribution(entries);
			const daily = dist.find((d) => d.type === "daily");
			expect(daily?.count).toBe(2);
		});
	});

	describe("wordTrends", () => {
		it("returns word counts per day", () => {
			const today = new Date().toISOString().slice(0, 10);
			const entries = [makeEntry({ entryDate: today, wordCount: 150 })];
			const trends = wordTrends(entries, 7);
			expect(trends).toHaveLength(7);
			const todayEntry = trends.find((t) => t.date === today);
			expect(todayEntry?.words).toBe(150);
		});
	});
});
