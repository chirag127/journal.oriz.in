import dayjs from "dayjs";
import type { JournalEntry } from "@/types/journal";

export interface Memory {
	entryId: string;
	yearsAgo: number;
	type: "on-this-day" | "1y" | "2y" | "5y" | "10y";
	entry: JournalEntry;
	label: string;
}

const TYPE_LABELS: Record<Memory["type"], string> = {
	"on-this-day": "On this day",
	"1y": "1 year ago",
	"2y": "2 years ago",
	"5y": "5 years ago",
	"10y": "10 years ago",
};

export function memoryLabel(type: Memory["type"]): string {
	return TYPE_LABELS[type];
}

export function findMemories(entries: JournalEntry[], refDate?: dayjs.ConfigType): Memory[] {
	const now = refDate ? dayjs(refDate) : dayjs();
	const memories: Memory[] = [];

	for (const entry of entries) {
		const entryDay = dayjs(entry.entryDate);
		if (entryDay.isAfter(now)) continue;
		const years = now.year() - entryDay.year();
		const sameMonthDay = entryDay.month() === now.month() && entryDay.date() === now.date();

		let type: Memory["type"] | null = null;
		if (years === 0) continue;
		if (years === 1 && sameMonthDay) type = "1y";
		else if (years === 2 && sameMonthDay) type = "2y";
		else if (years === 5 && sameMonthDay) type = "5y";
		else if (years === 10 && sameMonthDay) type = "10y";
		else if (sameMonthDay) type = "on-this-day";

		if (type)
			memories.push({ entryId: entry.id, yearsAgo: years, type, entry, label: TYPE_LABELS[type] });
	}

	return memories.sort((a, b) => a.yearsAgo - b.yearsAgo);
}
