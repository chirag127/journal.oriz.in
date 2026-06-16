import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
	it("joins string arguments", () => {
		expect(cn("a", "b", "c")).toBe("a b c");
	});

	it("filters out falsy strings", () => {
		expect(cn("a", "", "b", null, "c", undefined, false)).toBe("a b c");
	});

	it("handles object entries with truthy values", () => {
		expect(cn("base", { active: true, hidden: false })).toBe("base active");
	});

	it("handles empty input", () => {
		expect(cn()).toBe("");
	});

	it("handles mixed strings and objects", () => {
		expect(cn("btn", { "btn-primary": true, disabled: false }, "mt-2")).toBe(
			"btn btn-primary mt-2",
		);
	});

	it("handles all falsy inputs", () => {
		expect(cn(null, undefined, false, "")).toBe("");
	});

	it("handles multiple objects", () => {
		expect(cn({ a: true, b: false }, { c: true })).toBe("a c");
	});
});
