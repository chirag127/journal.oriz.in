import { describe, it, expect } from "vitest";
import {
	countWords,
	readingTimeMinutes,
	renderMarkdown,
	plainTextFromMarkdown,
	excerpt,
} from "@/lib/utils/markdown";

describe("markdown utils", () => {
	describe("countWords", () => {
		it("counts words in plain text", () => {
			expect(countWords("hello world")).toBe(2);
		});

		it("returns 0 for empty string", () => {
			expect(countWords("")).toBe(0);
		});

		it("strips markdown syntax before counting", () => {
			const md = "**bold** text with `code` and [link](url)";
			expect(countWords(md)).toBe(5);
		});

		it("strips code blocks", () => {
			const md = "some text\n```\ncode block here\n```\nmore text";
			expect(countWords(md)).toBe(4);
		});

		it("strips images", () => {
			const md = "text ![alt](img.png) more";
			expect(countWords(md)).toBe(2);
		});
	});

	describe("readingTimeMinutes", () => {
		it("returns 0 for empty text", () => {
			expect(readingTimeMinutes("")).toBe(0);
		});

		it("calculates reading time at 220 wpm", () => {
			const words = "word ".repeat(440).trim();
			expect(readingTimeMinutes(words)).toBeCloseTo(2, 0);
		});

		it("accepts custom wpm", () => {
			const words = "word ".repeat(200).trim();
			expect(readingTimeMinutes(words, 100)).toBeCloseTo(2, 0);
		});
	});

	describe("renderMarkdown", () => {
		it("returns empty string for empty input", () => {
			expect(renderMarkdown("")).toBe("");
		});

		it("converts markdown to HTML", () => {
			const html = renderMarkdown("# Hello");
			expect(html).toContain("<h1");
			expect(html).toContain("Hello");
		});

		it("sanitizes dangerous HTML", () => {
			const html = renderMarkdown('<script>alert("xss")</script>');
			expect(html).not.toContain("<script>");
		});

		it("handles bold and italic", () => {
			const html = renderMarkdown("**bold** and *italic*");
			expect(html).toContain("<strong>");
			expect(html).toContain("<em>");
		});

		it("handles links", () => {
			const html = renderMarkdown("[text](https://example.com)");
			expect(html).toContain('href="https://example.com"');
		});
	});

	describe("plainTextFromMarkdown", () => {
		it("returns empty string for empty input", () => {
			expect(plainTextFromMarkdown("")).toBe("");
		});

		it("strips markdown formatting", () => {
			const result = plainTextFromMarkdown("**bold** and *italic*");
			expect(result).toBe("bold and italic");
		});

		it("extracts link text", () => {
			const result = plainTextFromMarkdown("[click here](https://example.com)");
			expect(result).toBe("click here");
		});

		it("strips headings markers", () => {
			const result = plainTextFromMarkdown("## Heading\n\nContent");
			expect(result).toBe("Heading\n\nContent");
		});

		it("strips blockquotes", () => {
			const result = plainTextFromMarkdown("> quoted text");
			expect(result).toBe("quoted text");
		});

		it("strips code blocks", () => {
			const md = "text\n```\ncode\n```\nend";
			expect(plainTextFromMarkdown(md)).toBe("text\n\nend");
		});
	});

	describe("excerpt", () => {
		it("returns full text when under max", () => {
			expect(excerpt("short text")).toBe("short text");
		});

		it("truncates with ellipsis when over max", () => {
			const long = "a ".repeat(100);
			const result = excerpt(long, 10);
			expect(result).toMatch(/…$/);
			expect(result.length).toBeLessThan(long.length);
		});

		it("strips markdown before truncation", () => {
			const md = "**bold** text with [link](url)";
			const result = excerpt(md, 200);
			expect(result).not.toContain("**");
		});
	});
});
