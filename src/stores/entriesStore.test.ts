import { describe, it, expect, beforeEach } from "vitest";
import { useEntriesStore } from "@/stores/entriesStore";
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

describe("entriesStore", () => {
	beforeEach(() => {
		useEntriesStore.getState().reset();
	});

	it("starts with empty arrays and default filter", () => {
		const s = useEntriesStore.getState();
		expect(s.recent).toEqual([]);
		expect(s.pinned).toEqual([]);
		expect(s.favorites).toEqual([]);
		expect(s.allLoaded).toEqual([]);
		expect(s.filter.journalType).toBe("all");
	});

	it("setRecent updates recent entries", () => {
		const entries = [makeEntry({ id: "1" })];
		useEntriesStore.getState().setRecent(entries);
		expect(useEntriesStore.getState().recent).toHaveLength(1);
	});

	it("setPinned updates pinned entries", () => {
		const entries = [makeEntry({ id: "1", pinned: true })];
		useEntriesStore.getState().setPinned(entries);
		expect(useEntriesStore.getState().pinned).toHaveLength(1);
	});

	it("setFavorites updates favorites", () => {
		const entries = [makeEntry({ id: "1", favorite: true })];
		useEntriesStore.getState().setFavorites(entries);
		expect(useEntriesStore.getState().favorites).toHaveLength(1);
	});

	it("setAllLoaded updates allLoaded", () => {
		const entries = [makeEntry({ id: "1" }), makeEntry({ id: "2" })];
		useEntriesStore.getState().setAllLoaded(entries);
		expect(useEntriesStore.getState().allLoaded).toHaveLength(2);
	});

	it("setFilter merges partial filter", () => {
		useEntriesStore.getState().setFilter({ journalType: "gratitude" });
		expect(useEntriesStore.getState().filter.journalType).toBe("gratitude");
		expect(useEntriesStore.getState().filter.mood).toBe("all");
	});

	it("reset restores default state", () => {
		useEntriesStore.setState({ recent: [makeEntry({ id: "1" })], filter: { ...useEntriesStore.getState().filter, journalType: "gratitude" } });
		useEntriesStore.getState().reset();
		const s = useEntriesStore.getState();
		expect(s.recent).toEqual([]);
		expect(s.filter.journalType).toBe("all");
	});
});
