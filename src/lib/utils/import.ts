import dayjs from "dayjs";
import JSZip from "jszip";
import { JOURNAL_TYPES } from "@/lib/constants";
import { newId } from "@/lib/utils/export";
import { countWords, plainTextFromMarkdown, readingTimeMinutes } from "@/lib/utils/markdown";
import type { JournalEntry, JournalType } from "@/types/journal";

export interface ImportPreviewItem {
	title: string;
	entryDate: string;
	journalType: JournalType;
	wordCount: number;
	tags: string[];
	mood: string | null;
	source: string;
}

export interface ImportResult {
	entries: JournalEntry[];
	errors: string[];
}

function detectJournalType(text: string): JournalType {
	const lower = text.toLowerCase();
	for (const t of JOURNAL_TYPES) {
		if (lower.includes(`# ${t.label.toLowerCase()}`) || lower.includes(`type: ${t.value}`)) {
			return t.value;
		}
	}
	return "daily";
}

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, body: content };
	const meta: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const idx = line.indexOf(":");
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		const value = line
			.slice(idx + 1)
			.trim()
			.replace(/^["']|["']$/g, "");
		meta[key] = value;
	}
	return { meta, body: match[2] };
}

function buildEntryFromMarkdown(content: string, userId: string, _source: string): JournalEntry {
	const { meta, body } = parseFrontmatter(content);
	const stripped = body.replace(/^#\s+.*\n/, "").trim();
	const wc = countWords(stripped);
	const rt = readingTimeMinutes(stripped);
	return {
		id: newId(),
		userId,
		title: meta.title || body.split("\n")[0].replace(/^#\s+/, "").trim() || "Imported entry",
		content: stripped,
		mood: (meta.mood as JournalEntry["mood"]) || null,
		moodIntensity: meta.moodIntensity ? Number(meta.moodIntensity) : null,
		tags: meta.tags
			? meta.tags
					.replace(/^\[|]$/g, "")
					.split(",")
					.map((t) => t.trim().replace(/^["']|["']$/g, ""))
					.filter(Boolean)
			: [],
		location: null,
		weather: null,
		journalType: (meta.journalType as JournalType) || detectJournalType(body),
		entryDate: meta.entryDate || dayjs().format("YYYY-MM-DD"),
		createdAt: meta.createdAt || new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		favorite: meta.favorite === "true",
		pinned: meta.pinned === "true",
		wordCount: wc,
		readingTime: rt,
		isDraft: false,
	};
}

function buildEntryFromJson(
	data: Record<string, unknown>,
	userId: string,
	_source: string,
): JournalEntry {
	const content = String(data.content ?? "");
	const wc = Number(data.wordCount ?? countWords(content));
	const rt = Number(data.readingTime ?? readingTimeMinutes(content));
	return {
		id: newId(),
		userId,
		title: String(data.title ?? "Imported entry"),
		content,
		mood: (data.mood as JournalEntry["mood"]) ?? null,
		moodIntensity: data.moodIntensity != null ? Number(data.moodIntensity) : null,
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
		location: null,
		weather: null,
		journalType: (data.journalType as JournalType) ?? "daily",
		entryDate: String(data.entryDate ?? dayjs().format("YYYY-MM-DD")),
		createdAt: String(data.createdAt ?? new Date().toISOString()),
		updatedAt: new Date().toISOString(),
		favorite: Boolean(data.favorite),
		pinned: Boolean(data.pinned),
		wordCount: wc,
		readingTime: rt,
		isDraft: false,
	};
}

export async function importFromFile(file: File, userId: string): Promise<ImportResult> {
	const errors: string[] = [];
	const entries: JournalEntry[] = [];
	const name = file.name;
	if (file.name.endsWith(".zip") || file.type === "application/zip") {
		try {
			const zip = await JSZip.loadAsync(file);
			for (const filename of Object.keys(zip.files)) {
				if (filename.endsWith(".md")) {
					const content = await zip.files[filename].async("text");
					entries.push(buildEntryFromMarkdown(content, userId, filename));
				} else if (filename.endsWith(".json")) {
					const content = await zip.files[filename].async("text");
					try {
						const data = JSON.parse(content);
						entries.push(buildEntryFromJson(data, userId, filename));
					} catch (e) {
						errors.push(`Invalid JSON in ${filename}`);
					}
				}
			}
		} catch (e) {
			errors.push(`Failed to read ZIP: ${(e as Error).message}`);
		}
	} else if (file.name.endsWith(".json") || file.type === "application/json") {
		const text = await file.text();
		try {
			const data = JSON.parse(text);
			if (Array.isArray(data?.entries)) {
				for (const item of data.entries) {
					entries.push(buildEntryFromJson(item, userId, name));
				}
			} else if (Array.isArray(data)) {
				for (const item of data) {
					entries.push(buildEntryFromJson(item, userId, name));
				}
			} else {
				entries.push(buildEntryFromJson(data, userId, name));
			}
		} catch (e) {
			errors.push(`Invalid JSON: ${(e as Error).message}`);
		}
	} else if (file.name.endsWith(".md") || file.name.endsWith(".markdown")) {
		const text = await file.text();
		entries.push(buildEntryFromMarkdown(text, userId, name));
	} else if (file.name.endsWith(".txt")) {
		const text = await file.text();
		const title = text.split("\n")[0].slice(0, 80).trim() || "Imported entry";
		entries.push({
			id: newId(),
			userId,
			title,
			content: text,
			mood: null,
			moodIntensity: null,
			tags: [],
			location: null,
			weather: null,
			journalType: "daily",
			entryDate: dayjs().format("YYYY-MM-DD"),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			favorite: false,
			pinned: false,
			wordCount: countWords(text),
			readingTime: readingTimeMinutes(text),
			isDraft: false,
		});
	} else {
		errors.push(`Unsupported file type: ${file.name}`);
	}
	return { entries, errors };
}

export function previewEntries(entries: JournalEntry[]): ImportPreviewItem[] {
	return entries.map((e) => ({
		title: e.title,
		entryDate: e.entryDate,
		journalType: e.journalType,
		wordCount: e.wordCount,
		tags: e.tags,
		mood: e.mood,
		source: "import",
	}));
}

export function dedupeByContentHash(entries: JournalEntry[]): JournalEntry[] {
	const seen = new Set<string>();
	const out: JournalEntry[] = [];
	for (const e of entries) {
		const hash = `${e.title}|${plainTextFromMarkdown(e.content).slice(0, 200)}|${e.entryDate}`;
		if (seen.has(hash)) continue;
		seen.add(hash);
		out.push(e);
	}
	return out;
}
