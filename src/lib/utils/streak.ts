import dayjs from "dayjs";
import type { JournalEntry } from "@/types/journal";

export function computeStreaks(entries: JournalEntry[]): {
	current: number;
	longest: number;
	lastDate: string | null;
} {
	if (!entries.length) return { current: 0, longest: 0, lastDate: null };

	const dates = Array.from(
		new Set(entries.map((e) => dayjs(e.entryDate).format("YYYY-MM-DD"))),
	).sort();

	const lastDate = dates[dates.length - 1] ?? null;

	let longest = 1;
	let run = 1;
	for (let i = 1; i < dates.length; i++) {
		const prev = dayjs(dates[i - 1]);
		const cur = dayjs(dates[i]);
		if (cur.diff(prev, "day") === 1) {
			run += 1;
			longest = Math.max(longest, run);
		} else {
			run = 1;
		}
	}

	let current = 0;
	const today = dayjs().format("YYYY-MM-DD");
	const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
	const reference = dates.includes(today) ? today : dates.includes(yesterday) ? yesterday : null;
	if (reference) {
		let cursor = dayjs(reference);
		while (dates.includes(cursor.format("YYYY-MM-DD"))) {
			current += 1;
			cursor = cursor.subtract(1, "day");
		}
	}

	return { current, longest, lastDate };
}

export function buildActivityMap(entries: JournalEntry[]): Record<string, number> {
	const map: Record<string, number> = {};
	for (const e of entries) {
		const d = dayjs(e.entryDate).format("YYYY-MM-DD");
		map[d] = (map[d] ?? 0) + 1;
	}
	return map;
}

export function buildMoodMap(entries: JournalEntry[]): Record<string, number> {
	const map: Record<string, number> = {};
	for (const e of entries) {
		if (!e.mood) continue;
		const d = dayjs(e.entryDate).format("YYYY-MM-DD");
		map[d] = map[d] ?? 0;
	}
	return map;
}
