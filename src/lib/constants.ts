export const MOODS = [
	{ value: "excellent", label: "Excellent", emoji: "🤩", color: "var(--color-mood-excellent)" },
	{ value: "good", label: "Good", emoji: "🙂", color: "var(--color-mood-good)" },
	{ value: "neutral", label: "Neutral", emoji: "😐", color: "var(--color-mood-neutral)" },
	{ value: "bad", label: "Bad", emoji: "🙁", color: "var(--color-mood-bad)" },
	{ value: "terrible", label: "Terrible", emoji: "😣", color: "var(--color-mood-terrible)" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const JOURNAL_TYPES = [
	{ value: "daily", label: "Daily Journal", icon: "book-open", description: "Capture your day" },
	{
		value: "gratitude",
		label: "Gratitude",
		icon: "heart",
		description: "What you're thankful for",
	},
	{
		value: "learning",
		label: "Learning",
		icon: "graduation-cap",
		description: "Notes on what you're learning",
	},
	{ value: "reading", label: "Reading", icon: "book-marked", description: "Books and articles" },
	{ value: "travel", label: "Travel", icon: "plane", description: "Trips and journeys" },
	{ value: "work", label: "Work", icon: "briefcase", description: "Career and projects" },
	{ value: "fitness", label: "Fitness", icon: "dumbbell", description: "Body and movement" },
	{ value: "dream", label: "Dream", icon: "moon", description: "Dreams and visions" },
	{
		value: "research",
		label: "Research",
		icon: "flask-conical",
		description: "Studies and inquiry",
	},
	{ value: "reflection", label: "Reflection", icon: "sparkles", description: "Deep reflection" },
] as const;

export type JournalType = (typeof JOURNAL_TYPES)[number]["value"];

export const THEMES = [
	{ value: "light", label: "Light", icon: "sun" },
	{ value: "dark", label: "Dark", icon: "moon" },
	{ value: "system", label: "System", icon: "monitor" },
] as const;

export type ThemeValue = (typeof THEMES)[number]["value"];

export const GOAL_TYPES = [
	{ value: "count", label: "Total count", description: "Hit a target number of entries" },
	{ value: "streak", label: "Streak", description: "Consecutive days of writing" },
	{ value: "words", label: "Word count", description: "Total words written" },
] as const;

export type GoalType = (typeof GOAL_TYPES)[number]["value"];

export const GOAL_PERIODS = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
] as const;

export type GoalPeriod = (typeof GOAL_PERIODS)[number]["value"];

export const DEFAULT_TAGS = [
	{ name: "personal", color: "#b45309" },
	{ name: "work", color: "#1d4ed8" },
	{ name: "travel", color: "#0e7490" },
	{ name: "books", color: "#7c3aed" },
	{ name: "fitness", color: "#15803d" },
	{ name: "ideas", color: "#a16207" },
	{ name: "learning", color: "#0f766e" },
] as const;

export const BUILT_IN_TEMPLATES = [
	{
		id: "daily-reflection",
		name: "Daily Reflection",
		journalType: "daily",
		description: "End your day by reflecting on what happened.",
		content: `## What happened today?



## How did I feel?



## What went well?



## What could have gone better?



## What did I learn?



## Tomorrow I will...


`,
	},
	{
		id: "morning",
		name: "Morning Pages",
		journalType: "daily",
		description: "Start your day with intention and clarity.",
		content: `## How am I feeling right now?



## What is my intention for today?



## What am I grateful for?



## What would make today great?



## Affirmation


`,
	},
	{
		id: "evening",
		name: "Evening Reflection",
		journalType: "daily",
		description: "Wind down and review your day.",
		content: `## Three wins from today

1.
2.
3.

## One thing I struggled with



## What I learned about myself today



## What I'll do differently tomorrow


`,
	},
	{
		id: "weekly-review",
		name: "Weekly Review",
		journalType: "reflection",
		description: "Zoom out on your week.",
		content: `## The headline of my week



## What progress did I make?



## What challenged me?



## How did I feel overall?



## What will I focus on next week?


`,
	},
	{
		id: "monthly-review",
		name: "Monthly Review",
		journalType: "reflection",
		description: "Take stock of the month.",
		content: `## The arc of this month



## Major events



## Lessons learned



## Habits that served me



## Habits to let go of



## Goals for next month

1.
2.
3.

`,
	},
	{
		id: "yearly-review",
		name: "Yearly Review",
		journalType: "reflection",
		description: "Reflect on the year that was.",
		content: `## The year in one sentence



## Biggest wins

1.
2.
3.

## Hardest moments

1.
2.
3.

## What changed in me?



## What did I let go of?



## What did I begin?



## What do I want next year to be about?


`,
	},
	{
		id: "travel-log",
		name: "Travel Log",
		journalType: "travel",
		description: "Capture a trip or a single day on the road.",
		content: `## Where I am



## What I did today



## What I ate



## Who I met



## Highlights



## What surprised me


`,
	},
	{
		id: "reading-notes",
		name: "Reading Notes",
		journalType: "reading",
		description: "Notes from a book, article, or essay.",
		content: `## What I'm reading

**Title:**
**Author:**
**Where I am:** page / chapter

## Key ideas

- 

## Quotes worth saving

> 

## My response


`,
	},
	{
		id: "learning-notes",
		name: "Learning Notes",
		journalType: "learning",
		description: "Capture what you're learning.",
		content: `## What I'm learning


## Why it matters


## Key concepts

- 

## How it connects to what I already know


## What I want to explore next


`,
	},
	{
		id: "gratitude",
		name: "Gratitude",
		journalType: "gratitude",
		description: "A simple gratitude entry.",
		content: `## Three things I'm grateful for today

1.
2.
3.

## Why they matter


## A small joy from today


`,
	},
] as const;

export const STORAGE_KEYS = {
	auth: "journal.auth",
	theme: "journal.theme",
	editor: "journal.editor",
	settings: "journal.settings",
	filters: "journal.filters",
	drafts: "journal.drafts",
} as const;

export const APP_NAME = "Journal";
export const APP_TAGLINE = "Private. Fast. Beautiful. Your Life, Your Thoughts.";
export const APP_URL = "https://journal.oriz.in";
