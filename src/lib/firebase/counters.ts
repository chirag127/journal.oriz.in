import dayjs from "dayjs";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { computeStreaks } from "@/lib/utils/streak";
import type { Counters, JournalEntry } from "@/types/journal";
import { getDb } from "./client";

const ref = (uid: string) => doc(getDb(), "users", uid, "counters", "stats");

export async function getCounters(uid: string): Promise<Counters | null> {
	const snap = await getDoc(ref(uid));
	if (!snap.exists()) return null;
	return snap.data() as Counters;
}

export async function rebuildCounters(uid: string, entries: JournalEntry[]): Promise<Counters> {
	const totalEntries = entries.length;
	const totalWords = entries.reduce((s, e) => s + (e.wordCount || 0), 0);
	const { current, longest, lastDate } = computeStreaks(entries);

	const entriesByYear: Record<string, number> = {};
	const entriesByMonth: Record<string, number> = {};
	const entriesByMood: Record<string, number> = {
		excellent: 0,
		good: 0,
		neutral: 0,
		bad: 0,
		terrible: 0,
	};

	for (const e of entries) {
		const y = dayjs(e.entryDate).format("YYYY");
		const m = dayjs(e.entryDate).format("YYYY-MM");
		entriesByYear[y] = (entriesByYear[y] ?? 0) + 1;
		entriesByMonth[m] = (entriesByMonth[m] ?? 0) + 1;
		if (e.mood) entriesByMood[e.mood] = (entriesByMood[e.mood] ?? 0) + 1;
	}

	const counters: Counters = {
		totalEntries,
		totalWords,
		currentStreak: current,
		longestStreak: longest,
		lastEntryDate: lastDate,
		entriesByYear,
		entriesByMonth,
		entriesByMood: entriesByMood as Counters["entriesByMood"],
		updatedAt: new Date().toISOString(),
	};

	await setDoc(ref(uid), { ...counters, updatedAt: serverTimestamp() });
	return counters;
}
