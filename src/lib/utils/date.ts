import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import dayOfYear from "dayjs/plugin/dayOfYear";
import duration from "dayjs/plugin/duration";
import isoWeek from "dayjs/plugin/isoWeek";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(dayOfYear);

export const fmt = {
	date: (d: string | Date) => dayjs(d).format("MMMM D, YYYY"),
	shortDate: (d: string | Date) => dayjs(d).format("MMM D"),
	iso: (d: string | Date) => dayjs(d).format("YYYY-MM-DD"),
	monthDay: (d: string | Date) => dayjs(d).format("MMM D"),
	monthYear: (d: string | Date) => dayjs(d).format("MMMM YYYY"),
	year: (d: string | Date) => dayjs(d).format("YYYY"),
	time: (d: string | Date) => dayjs(d).format("h:mm A"),
	datetime: (d: string | Date) => dayjs(d).format("MMM D, YYYY · h:mm A"),
	relative: (d: string | Date) => dayjs(d).fromNow(),
	dayOfWeek: (d: string | Date) => dayjs(d).format("dddd"),
	dayOfWeekShort: (d: string | Date) => dayjs(d).format("ddd"),
	weekRange: (d: string | Date) => {
		const start = dayjs(d).startOf("week");
		const end = dayjs(d).endOf("week");
		return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
	},
	monthRange: (d: string | Date) => dayjs(d).format("MMMM YYYY"),
	reading: (mins: number) => (mins < 1 ? "< 1 min" : `${Math.round(mins)} min`),
};

export const today = () => dayjs().format("YYYY-MM-DD");
export const now = () => dayjs().toISOString();
export const startOfToday = () => dayjs().startOf("day").toISOString();

export function daysAgo(days: number): string {
	return dayjs().subtract(days, "day").format("YYYY-MM-DD");
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
	return dayjs(a).isSame(b, "day");
}

export function isSameMonth(a: string | Date, b: string | Date): boolean {
	return dayjs(a).isSame(b, "month");
}

export function getMonthMatrix(year: number, month: number, weekStart: 0 | 1 = 0) {
	const first = dayjs(new Date(year, month, 1));
	const offset = (first.day() - weekStart + 7) % 7;
	const start = first.subtract(offset, "day");
	const matrix: dayjs.Dayjs[][] = [];
	for (let w = 0; w < 6; w++) {
		const week: dayjs.Dayjs[] = [];
		for (let d = 0; d < 7; d++) {
			week.push(start.add(w * 7 + d, "day"));
		}
		matrix.push(week);
	}
	return matrix;
}

export function getYearDays(year: number) {
	const start = dayjs(new Date(year, 0, 1));
	const days: dayjs.Dayjs[] = [];
	for (let i = 0; i < 366; i++) {
		const d = start.add(i, "day");
		if (d.year() === year) days.push(d);
		else break;
	}
	return days;
}

export default dayjs;
export { dayjs };
