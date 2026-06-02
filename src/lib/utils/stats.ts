import dayjs from "dayjs";
import { MOODS } from "@/lib/constants";
import type { JournalEntry } from "@/types/journal";

export function totalWords(entries: JournalEntry[]): number {
	return entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
}

export function averageWords(entries: JournalEntry[]): number {
	if (!entries.length) return 0;
	return Math.round(totalWords(entries) / entries.length);
}

export function longestEntry(entries: JournalEntry[]): JournalEntry | null {
	if (!entries.length) return null;
	return entries.reduce((max, e) => (e.wordCount > max.wordCount ? e : max));
}

export function shortestEntry(entries: JournalEntry[]): JournalEntry | null {
	const nonEmpty = entries.filter((e) => e.wordCount > 0);
	if (!nonEmpty.length) return null;
	return nonEmpty.reduce((min, e) => (e.wordCount < min.wordCount ? e : min));
}

export function entriesByDay(
	entries: JournalEntry[],
	days = 30,
): { date: string; count: number }[] {
	const buckets: Record<string, number> = {};
	const start = dayjs().subtract(days - 1, "day");
	for (let i = 0; i < days; i++) {
		const d = start.add(i, "day").format("YYYY-MM-DD");
		buckets[d] = 0;
	}
	for (const e of entries) {
		const d = dayjs(e.entryDate).format("YYYY-MM-DD");
		if (d in buckets) buckets[d] += 1;
	}
	return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

export function entriesByWeek(
	entries: JournalEntry[],
	weeks = 12,
): { week: string; count: number; words: number }[] {
	const buckets: Record<string, { count: number; words: number }> = {};
	for (let i = weeks - 1; i >= 0; i--) {
		const weekStart = dayjs().subtract(i, "week").startOf("week");
		const key = weekStart.format("YYYY-MM-DD");
		buckets[key] = { count: 0, words: 0 };
	}
	for (const e of entries) {
		const ws = dayjs(e.entryDate).startOf("week").format("YYYY-MM-DD");
		if (ws in buckets) {
			buckets[ws].count += 1;
			buckets[ws].words += e.wordCount || 0;
		}
	}
	return Object.entries(buckets).map(([week, v]) => ({ week, ...v }));
}

export function entriesByMonth(
	entries: JournalEntry[],
	months = 12,
): { month: string; count: number; words: number }[] {
	const buckets: Record<string, { count: number; words: number }> = {};
	for (let i = months - 1; i >= 0; i--) {
		const m = dayjs().subtract(i, "month").startOf("month");
		const key = m.format("YYYY-MM");
		buckets[key] = { count: 0, words: 0 };
	}
	for (const e of entries) {
		const key = dayjs(e.entryDate).format("YYYY-MM");
		if (key in buckets) {
			buckets[key].count += 1;
			buckets[key].words += e.wordCount || 0;
		}
	}
	return Object.entries(buckets).map(([month, v]) => ({ month, ...v }));
}

export function entriesByYear(
	entries: JournalEntry[],
): { year: string; count: number; words: number }[] {
	const buckets: Record<string, { count: number; words: number }> = {};
	for (const e of entries) {
		const y = dayjs(e.entryDate).format("YYYY");
		if (!buckets[y]) buckets[y] = { count: 0, words: 0 };
		buckets[y].count += 1;
		buckets[y].words += e.wordCount || 0;
	}
	return Object.entries(buckets)
		.map(([year, v]) => ({ year, ...v }))
		.sort((a, b) => a.year.localeCompare(b.year));
}

export function moodDistribution(
	entries: JournalEntry[],
): { mood: string; label: string; emoji: string; count: number; color: string }[] {
	const counts: Record<string, number> = {};
	for (const e of entries) {
		if (!e.mood) continue;
		counts[e.mood] = (counts[e.mood] ?? 0) + 1;
	}
	return MOODS.map((m) => ({
		mood: m.value,
		label: m.label,
		emoji: m.emoji,
		color: m.color,
		count: counts[m.value] ?? 0,
	}));
}

export function moodTrend(
	entries: JournalEntry[],
	days = 30,
): { date: string; mood: number | null }[] {
	const moodToScore: Record<string, number> = {
		excellent: 5,
		good: 4,
		neutral: 3,
		bad: 2,
		terrible: 1,
	};
	const buckets: Record<string, { sum: number; count: number }> = {};
	for (let i = days - 1; i >= 0; i--) {
		const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
		buckets[d] = { sum: 0, count: 0 };
	}
	for (const e of entries) {
		if (!e.mood) continue;
		const d = dayjs(e.entryDate).format("YYYY-MM-DD");
		if (d in buckets) {
			buckets[d].sum += moodToScore[e.mood];
			buckets[d].count += 1;
		}
	}
	return Object.entries(buckets).map(([date, v]) => ({
		date,
		mood: v.count > 0 ? v.sum / v.count : null,
	}));
}

export function journalTypeDistribution(
	entries: JournalEntry[],
): { type: string; count: number }[] {
	const counts: Record<string, number> = {};
	for (const e of entries) {
		counts[e.journalType] = (counts[e.journalType] ?? 0) + 1;
	}
	return Object.entries(counts)
		.map(([type, count]) => ({ type, count }))
		.sort((a, b) => b.count - a.count);
}

export function wordTrends(
	entries: JournalEntry[],
	days = 30,
): { date: string; label: string; words: number }[] {
	const buckets: Record<string, number> = {};
	for (let i = days - 1; i >= 0; i--) {
		const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
		buckets[d] = 0;
	}
	for (const e of entries) {
		const d = dayjs(e.entryDate).format("YYYY-MM-DD");
		if (d in buckets) buckets[d] += e.wordCount || 0;
	}
	return Object.entries(buckets).map(([date, words]) => ({
		date,
		label: dayjs(date).format("MMM D"),
		words,
	}));
}
