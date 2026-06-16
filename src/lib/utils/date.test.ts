import { describe, it, expect } from "vitest";
import {
	dayjs,
	fmt,
	today,
	now,
	startOfToday,
	daysAgo,
	isSameDay,
	isSameMonth,
	getMonthMatrix,
	getYearDays,
} from "@/lib/utils/date";

describe("date utils", () => {
	it("today returns YYYY-MM-DD format", () => {
		const d = today();
		expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("now returns ISO string", () => {
		const d = now();
		expect(d).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it("startOfToday returns ISO string", () => {
		const d = startOfToday();
		expect(d).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it("daysAgo returns correct day", () => {
		const d = daysAgo(1);
		const expected = dayjs().subtract(1, "day").format("YYYY-MM-DD");
		expect(d).toBe(expected);
	});

	it("isSameDay returns true for same date", () => {
		const d = "2025-06-15";
		expect(isSameDay(d, "2025-06-15")).toBe(true);
		expect(isSameDay(d, "2025-06-16")).toBe(false);
	});

	it("isSameMonth returns true for same month", () => {
		expect(isSameMonth("2025-06-01", "2025-06-30")).toBe(true);
		expect(isSameMonth("2025-06-01", "2025-07-01")).toBe(false);
	});

	describe("fmt", () => {
		const d = "2025-06-15T10:30:00";

		it("date formats as MMMM D, YYYY", () => {
			expect(fmt.date(d)).toBe("June 15, 2025");
		});

		it("shortDate formats as MMM D", () => {
			expect(fmt.shortDate(d)).toMatch(/^[A-Z][a-z]{2}\s\d{1,2}$/);
		});

		it("iso formats as YYYY-MM-DD", () => {
			expect(fmt.iso(d)).toBe("2025-06-15");
		});

		it("time formats as h:mm AM/PM", () => {
			expect(fmt.time(d)).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
		});

		it("relative returns a string", () => {
			const rel = fmt.relative(d);
			expect(typeof rel).toBe("string");
			expect(rel.length).toBeGreaterThan(0);
		});

		it("reading returns correct format", () => {
			expect(fmt.reading(0.5)).toBe("< 1 min");
			expect(fmt.reading(5)).toBe("5 min");
			expect(fmt.reading(1)).toBe("1 min");
		});

		it("dayOfWeek returns day name", () => {
			expect(fmt.dayOfWeek("2025-06-15")).toBe("Sunday");
			expect(fmt.dayOfWeekShort("2025-06-15")).toBe("Sun");
		});

		it("monthYear formats correctly", () => {
			expect(fmt.monthYear(d)).toBe("June 2025");
		});

		it("datetime formats correctly", () => {
			const dt = fmt.datetime(d);
			expect(dt).toContain("Jun");
			expect(dt).toContain("2025");
		});

		it("weekRange returns start-end string", () => {
			const wr = fmt.weekRange("2025-06-15");
			expect(wr).toContain("–");
		});

		it("monthRange returns MMMM YYYY", () => {
			expect(fmt.monthRange(d)).toBe("June 2025");
		});
	});

	describe("getMonthMatrix", () => {
		it("returns 6x7 matrix", () => {
			const matrix = getMonthMatrix(2025, 5);
			expect(matrix).toHaveLength(6);
			for (const week of matrix) {
				expect(week).toHaveLength(7);
			}
		});

		it("works with weekStart=1 (Monday)", () => {
			const matrix = getMonthMatrix(2025, 5, 1);
			expect(matrix).toHaveLength(6);
		});
	});

	describe("getYearDays", () => {
		it("returns all days in a year", () => {
			const days = getYearDays(2025);
			expect(days).toHaveLength(365);
		});

		it("returns 366 days for leap year", () => {
			const days = getYearDays(2024);
			expect(days).toHaveLength(366);
		});
	});
});
