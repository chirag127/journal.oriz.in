import dayjs from "dayjs";
import JSZip from "jszip";
import { nanoid } from "nanoid";
import { plainTextFromMarkdown } from "@/lib/utils/markdown";
import type { Goal, JournalEntry, JournalTemplate, Tag } from "@/types/journal";

export type ExportFormat = "json" | "markdown" | "text";

function safeFilename(s: string): string {
	return (
		s
			.replace(/[^\w\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-")
			.slice(0, 80) || "untitled"
	);
}

function frontmatter(entry: JournalEntry): string {
	const lines = [
		"---",
		`id: ${entry.id}`,
		`title: ${JSON.stringify(entry.title)}`,
		`journalType: ${entry.journalType}`,
		`entryDate: ${entry.entryDate}`,
		`createdAt: ${entry.createdAt}`,
		`updatedAt: ${entry.updatedAt}`,
		entry.mood ? `mood: ${entry.mood}` : null,
		entry.moodIntensity != null ? `moodIntensity: ${entry.moodIntensity}` : null,
		entry.tags.length ? `tags: [${entry.tags.map((t) => JSON.stringify(t)).join(", ")}]` : null,
		entry.favorite ? "favorite: true" : null,
		entry.pinned ? "pinned: true" : null,
		`wordCount: ${entry.wordCount}`,
		`readingTime: ${entry.readingTime}`,
		entry.location?.label ? `location: ${JSON.stringify(entry.location.label)}` : null,
		entry.weather
			? `weather: ${JSON.stringify({ temp: entry.weather.temp, condition: entry.weather.condition })}`
			: null,
		"---",
		"",
	];
	return lines.filter(Boolean).join("\n");
}

function entryToMarkdown(entry: JournalEntry): string {
	const title = entry.title || "Untitled";
	return [frontmatter(entry), `# ${title}`, "", entry.content.trim(), ""].join("\n");
}

function entryToText(entry: JournalEntry): string {
	const lines = [
		titleCase(entry.title || "Untitled"),
		"=".repeat(Math.min(60, (entry.title || "Untitled").length + 4)),
		"",
		`Date: ${dayjs(entry.entryDate).format("dddd, MMMM D, YYYY")}`,
		entry.mood ? `Mood: ${entry.mood}` : null,
		entry.tags.length ? `Tags: ${entry.tags.join(", ")}` : null,
		`Words: ${entry.wordCount} · Reading: ${Math.ceil(entry.readingTime)} min`,
		"",
		"-".repeat(40),
		"",
		plainTextFromMarkdown(entry.content),
		"",
	];
	return lines.filter((l) => l !== null).join("\n");
}

function titleCase(s: string): string {
	return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export function exportEntry(
	entry: JournalEntry,
	format: ExportFormat,
): { filename: string; mime: string; blob: Blob } {
	const date = dayjs(entry.entryDate).format("YYYY-MM-DD");
	const name = safeFilename(`${date}-${entry.title || "untitled"}`);
	if (format === "markdown") {
		return {
			filename: `${name}.md`,
			mime: "text/markdown",
			blob: new Blob([entryToMarkdown(entry)], { type: "text/markdown" }),
		};
	}
	if (format === "text") {
		return {
			filename: `${name}.txt`,
			mime: "text/plain",
			blob: new Blob([entryToText(entry)], { type: "text/plain" }),
		};
	}
	return {
		filename: `${name}.json`,
		mime: "application/json",
		blob: new Blob([JSON.stringify(entry, null, 2)], { type: "application/json" }),
	};
}

export async function exportAll(
	entries: JournalEntry[],
	format: ExportFormat,
	options?: { templates?: JournalTemplate[]; tags?: Tag[]; goals?: Goal[] },
): Promise<{ filename: string; blob: Blob }> {
	const stamp = dayjs().format("YYYY-MM-DD-HHmm");
	if (format === "json") {
		const payload = {
			exportedAt: new Date().toISOString(),
			version: 1,
			entries,
			templates: options?.templates ?? [],
			tags: options?.tags ?? [],
			goals: options?.goals ?? [],
		};
		return {
			filename: `journal-export-${stamp}.json`,
			blob: new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
		};
	}
	const zip = new JSZip();
	const folder = zip.folder(`journal-export-${stamp}`);
	if (!folder) throw new Error("Failed to create zip folder");
	for (const e of entries) {
		const date = dayjs(e.entryDate).format("YYYY-MM-DD");
		const name = safeFilename(`${date}-${e.title || "untitled"}`);
		if (format === "markdown") folder.file(`${name}.md`, entryToMarkdown(e));
		else folder.file(`${name}.txt`, entryToText(e));
	}
	const blob = await zip.generateAsync({ type: "blob" });
	return { filename: `journal-export-${stamp}.zip`, blob };
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const newId = (): string => nanoid(12);
