import type { GoalPeriod, GoalType, JournalType, MoodValue, ThemeValue } from "@lib/constants";

export type { MoodValue, JournalType, ThemeValue, GoalType, GoalPeriod };

export interface UserProfile {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	isAnonymous: boolean;
	createdAt: string;
	updatedAt: string;
	defaultJournalType: JournalType;
	timezone: string;
}

export interface LocationData {
	lat: number;
	lng: number;
	label?: string;
}

export interface WeatherData {
	temp: number;
	condition: string;
	icon: string;
}

export interface JournalEntry {
	id: string;
	userId: string;
	title: string;
	content: string;
	mood: MoodValue | null;
	moodIntensity: number | null;
	tags: string[];
	location: LocationData | null;
	weather: WeatherData | null;
	journalType: JournalType;
	entryDate: string;
	createdAt: string;
	updatedAt: string;
	favorite: boolean;
	pinned: boolean;
	wordCount: number;
	readingTime: number;
	isDraft: boolean;
}

export interface JournalTemplate {
	id: string;
	userId: string;
	name: string;
	description: string;
	content: string;
	isBuiltIn: boolean;
	journalType: JournalType;
	createdAt: string;
	updatedAt: string;
}

export interface Tag {
	id: string;
	userId: string;
	name: string;
	color: string;
	count: number;
	createdAt: string;
}

export interface Goal {
	id: string;
	userId: string;
	title: string;
	description: string;
	type: GoalType;
	target: number;
	period: GoalPeriod;
	startDate: string;
	endDate: string | null;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UserSettings {
	theme: ThemeValue;
	font: "system" | "serif" | "sans";
	accentColor: string;
	defaultJournalType: JournalType;
	defaultMood: MoodValue | null;
	weekStart: 0 | 1;
	notifications: {
		dailyReminder: boolean;
		reminderTime: string;
		weeklyDigest: boolean;
	};
	privacy: {
		analytics: boolean;
		crashReports: boolean;
	};
	updatedAt: string;
}

export interface Counters {
	totalEntries: number;
	totalWords: number;
	currentStreak: number;
	longestStreak: number;
	lastEntryDate: string | null;
	entriesByYear: Record<string, number>;
	entriesByMonth: Record<string, number>;
	entriesByMood: Record<MoodValue, number>;
	updatedAt: string;
}

export type EntryFilter = {
	search?: string;
	journalType?: JournalType | "all";
	mood?: MoodValue | "all";
	tags?: string[];
	favorite?: boolean;
	pinned?: boolean;
	startDate?: string;
	endDate?: string;
	sort?: "entryDate" | "updatedAt" | "wordCount" | "title";
	order?: "asc" | "desc";
	length?: "all" | "shortest" | "longest";
};
