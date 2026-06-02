import { z } from "zod";
import {
	GOAL_PERIODS,
	GOAL_TYPES,
	type GoalPeriod,
	type GoalType,
	JOURNAL_TYPES,
	type JournalType,
	MOODS,
	type MoodValue,
	THEMES,
	type ThemeValue,
} from "@/lib/constants";

const moodValues = MOODS.map((m) => m.value) as [MoodValue, ...MoodValue[]];
const journalTypeValues = JOURNAL_TYPES.map((j) => j.value) as [JournalType, ...JournalType[]];
const themeValues = THEMES.map((t) => t.value) as [ThemeValue, ...ThemeValue[]];
const goalTypeValues = GOAL_TYPES.map((g) => g.value) as [GoalType, ...GoalType[]];
const goalPeriodValues = GOAL_PERIODS.map((p) => p.value) as [GoalPeriod, ...GoalPeriod[]];

export const entrySchema = z.object({
	title: z.string().max(200).default(""),
	content: z.string().default(""),
	mood: z.enum(moodValues).nullable().default(null),
	moodIntensity: z.number().int().min(1).max(5).nullable().default(null),
	tags: z.array(z.string().min(1).max(40)).max(20).default([]),
	location: z
		.object({
			lat: z.number(),
			lng: z.number(),
			label: z.string().optional(),
		})
		.nullable()
		.default(null),
	weather: z
		.object({
			temp: z.number(),
			condition: z.string(),
			icon: z.string(),
		})
		.nullable()
		.default(null),
	journalType: z.enum(journalTypeValues).default("daily"),
	entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	favorite: z.boolean().default(false),
	pinned: z.boolean().default(false),
	isDraft: z.boolean().default(false),
});

export type EntryInput = z.infer<typeof entrySchema>;

export const templateSchema = z.object({
	name: z.string().min(1).max(80),
	description: z.string().max(200).default(""),
	content: z.string().min(1),
	journalType: z.enum(journalTypeValues).default("daily"),
});

export const goalSchema = z.object({
	title: z.string().min(1).max(80),
	description: z.string().max(200).default(""),
	type: z.enum(goalTypeValues),
	target: z.number().int().min(1).max(10000),
	period: z.enum(goalPeriodValues),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.nullable()
		.default(null),
});

export const settingsSchema = z.object({
	theme: z.enum(themeValues).default("system"),
	font: z.enum(["system", "serif", "sans"]).default("serif"),
	accentColor: z.string().default("#b45309"),
	defaultJournalType: z.enum(journalTypeValues).default("daily"),
	defaultMood: z.enum(moodValues).nullable().default(null),
	weekStart: z.union([z.literal(0), z.literal(1)]).default(0),
	notifications: z
		.object({
			dailyReminder: z.boolean().default(false),
			reminderTime: z.string().default("20:00"),
			weeklyDigest: z.boolean().default(false),
		})
		.default({ dailyReminder: false, reminderTime: "20:00", weeklyDigest: false }),
	privacy: z
		.object({
			analytics: z.boolean().default(true),
			crashReports: z.boolean().default(true),
		})
		.default({ analytics: true, crashReports: true }),
});

export const tagSchema = z.object({
	name: z.string().min(1).max(40),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/)
		.default("#b45309"),
});
