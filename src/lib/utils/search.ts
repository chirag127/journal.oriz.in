import Fuse, { type IFuseOptions } from "fuse.js";
import type { JournalEntry } from "@/types/journal";

const fuseOptions: IFuseOptions<JournalEntry> = {
	keys: [
		{ name: "title", weight: 3 },
		{ name: "content", weight: 1 },
		{ name: "tags", weight: 2 },
		{ name: "journalType", weight: 0.5 },
		{ name: "mood", weight: 0.3 },
	],
	threshold: 0.36,
	ignoreLocation: true,
	includeScore: true,
	includeMatches: true,
	minMatchCharLength: 2,
	useExtendedSearch: true,
};

export function buildSearchIndex(entries: JournalEntry[]): Fuse<JournalEntry> {
	return new Fuse(entries, fuseOptions);
}

export function runSearch(
	fuse: Fuse<JournalEntry>,
	query: string,
): { item: JournalEntry; score: number }[] {
	if (!query.trim()) return [];
	return fuse.search(query).map((r) => ({ item: r.item, score: r.score ?? 0 }));
}

export function searchEntries(fuse: Fuse<JournalEntry>, query: string): JournalEntry[] {
	return runSearch(fuse, query).map((r) => r.item);
}
