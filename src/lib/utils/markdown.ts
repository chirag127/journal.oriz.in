import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
	gfm: true,
	breaks: true,
});

export function countWords(text: string): number {
	if (!text) return 0;
	const stripped = text
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]*`/g, "")
		.replace(/!\[[^\]]*\]\([^)]+\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[#>*_~`]/g, "")
		.replace(/[-*+]\s+/g, "")
		.replace(/\d+\.\s+/g, "");
	const words = stripped.trim().split(/\s+/).filter(Boolean);
	return words.length;
}

export function readingTimeMinutes(text: string, wpm = 220): number {
	const words = countWords(text);
	return words / wpm;
}

export function renderMarkdown(md: string): string {
	if (!md) return "";
	const rawHtml = marked.parse(md, { async: false }) as string;
	return DOMPurify.sanitize(rawHtml, {
		USE_PROFILES: { html: true },
		ADD_ATTR: ["target", "rel"],
	});
}

export function plainTextFromMarkdown(md: string): string {
	if (!md) return "";
	return md
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]*`/g, "")
		.replace(/!\[[^\]]*\]\([^)]+\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/^>+\s?/gm, "")
		.replace(/^#+\s+/gm, "")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/__([^_]+)__/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/_([^_]+)_/g, "$1")
		.replace(/~~([^~]+)~~/g, "$1")
		.replace(/^[-*+]\s+/gm, "")
		.replace(/^\d+\.\s+/gm, "")
		.trim();
}

export function excerpt(text: string, max = 180): string {
	const plain = plainTextFromMarkdown(text);
	if (plain.length <= max) return plain;
	return `${plain.slice(0, max).trimEnd()}…`;
}
