import { Button } from "@components/react/ui/Button";
import { EmptyState } from "@components/react/ui/EmptyState";
import { Field, Input, Select } from "@components/react/ui/Field";
import { BookOpen, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEntries } from "@/lib/hooks/useEntries";
import { buildSearchIndex, searchEntries } from "@/lib/utils/search";
import { useAuthStore } from "@/stores/authStore";
import type { EntryFilter, JournalEntry, JournalType, MoodValue } from "@/types/journal";
import { Link } from "../router";
import { EntryCard } from "./EntryCard";

const SORTS = [
	{ value: "entryDate_desc", label: "Newest first" },
	{ value: "entryDate_asc", label: "Oldest first" },
	{ value: "updatedAt_desc", label: "Recently edited" },
	{ value: "title_asc", label: "Title (A→Z)" },
	{ value: "wordCount_desc", label: "Longest" },
	{ value: "wordCount_asc", label: "Shortest" },
];

export function EntriesList({ scope = "all" }: { scope?: "favorites" | "pinned" | "all" }) {
	const uid = useAuthStore((s) => s.uid);
	const { favorites, pinned, allLoaded, ready } = useEntries(uid);
	const [query, setQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filter, setFilter] = useState<EntryFilter>({
		journalType: "all",
		mood: "all",
		favorite: false,
		pinned: false,
		sort: "entryDate",
		order: "desc",
	});
	const debouncedQ = useDebounce(query, 200);

	const base = scope === "favorites" ? favorites : scope === "pinned" ? pinned : allLoaded;
	const searchIndex = useMemo(() => buildSearchIndex(base), [base]);
	const visible = useMemo(() => {
		let list = base;
		if (debouncedQ.trim()) list = searchEntries(searchIndex, debouncedQ);
		if (filter.journalType && filter.journalType !== "all")
			list = list.filter((e) => e.journalType === filter.journalType);
		if (filter.mood && filter.mood !== "all") list = list.filter((e) => e.mood === filter.mood);
		if (filter.favorite) list = list.filter((e) => e.favorite);
		if (filter.pinned) list = list.filter((e) => e.pinned);
		list = sortEntries(list, filter.sort ?? "entryDate", filter.order ?? "desc");
		return list;
	}, [base, debouncedQ, filter, searchIndex]);

	if (!ready) return <EntriesSkeleton />;

	const title = scope === "favorites" ? "Favorites" : scope === "pinned" ? "Pinned" : "All entries";

	return (
		<div className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
						{base.length} {base.length === 1 ? "entry" : "entries"}
					</p>
					<h1 className="mt-1 font-display text-3xl tracking-tight">{title}</h1>
				</div>
				<Link href="/entries/new" className="no-underline">
					<Button variant="primary">New entry</Button>
				</Link>
			</header>

			<div className="flex flex-wrap items-center gap-2">
				<div className="relative w-full min-w-0 flex-1 sm:w-auto sm:min-w-60">
					<Search
						size={14}
						className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
					/>
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search title, content, tags…"
						className="pl-9"
					/>
				</div>
				<Button
					variant={showFilters ? "primary" : "outline"}
					size="md"
					onClick={() => setShowFilters((s) => !s)}
					leading={<Filter size={14} />}
				>
					Filters
				</Button>
				<Select
					value={`${filter.sort ?? "entryDate"}_${filter.order ?? "desc"}`}
					onChange={(e) => {
						const [s, o] = e.target.value.split("_");
						setFilter((f) => ({
							...f,
							sort: s as EntryFilter["sort"],
							order: o as "asc" | "desc",
						}));
					}}
					className="w-full sm:w-48"
				>
					{SORTS.map((s) => (
						<option key={s.value} value={s.value}>
							{s.label}
						</option>
					))}
				</Select>
			</div>

			{showFilters && (
				<div className="grid gap-3 rounded-lg border border-border bg-bg-elevated p-4 sm:grid-cols-4">
					<Field label="Type">
						<Select
							value={filter.journalType}
							onChange={(e) =>
								setFilter((f) => ({ ...f, journalType: e.target.value as JournalType | "all" }))
							}
						>
							<option value="all">All</option>
							{JOURNAL_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</Select>
					</Field>
					<Field label="Mood">
						<Select
							value={filter.mood}
							onChange={(e) =>
								setFilter((f) => ({ ...f, mood: e.target.value as MoodValue | "all" }))
							}
						>
							<option value="all">All</option>
							{MOODS.map((m) => (
								<option key={m.value} value={m.value}>
									{m.emoji} {m.label}
								</option>
							))}
						</Select>
					</Field>
					<Field label="Favorites">
						<label className="flex h-10 items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={filter.favorite}
								onChange={(e) => setFilter((f) => ({ ...f, favorite: e.target.checked }))}
								className="h-4 w-4 rounded border-border accent-accent"
							/>
							Only favorites
						</label>
					</Field>
					<Field label="Pinned">
						<label className="flex h-10 items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={filter.pinned}
								onChange={(e) => setFilter((f) => ({ ...f, pinned: e.target.checked }))}
								className="h-4 w-4 rounded border-border accent-accent"
							/>
							Only pinned
						</label>
					</Field>
				</div>
			)}

			{visible.length === 0 ? (
				<EmptyState
					icon={<BookOpen size={28} />}
					title="No entries match"
					description="Try clearing filters or write a new entry."
					action={
						<Link href="/entries/new" className="no-underline">
							<Button variant="primary">Write a new entry</Button>
						</Link>
					}
				/>
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{visible.map((e) => (
						<EntryCard key={e.id} entry={e} />
					))}
				</div>
			)}
		</div>
	);
}

function sortEntries(
	list: JournalEntry[],
	sort: NonNullable<EntryFilter["sort"]>,
	order: "asc" | "desc",
): JournalEntry[] {
	const sign = order === "asc" ? 1 : -1;
	const sorted = [...list];
	if (sort === "title") {
		sorted.sort((a, b) => sign * a.title.localeCompare(b.title));
	} else {
		sorted.sort((a, b) => {
			const av =
				sort === "wordCount"
					? a.wordCount
					: sort === "updatedAt"
						? new Date(a.updatedAt).getTime()
						: a.entryDate;
			const bv =
				sort === "wordCount"
					? b.wordCount
					: sort === "updatedAt"
						? new Date(b.updatedAt).getTime()
						: b.entryDate;
			return av < bv ? -sign : av > bv ? sign : 0;
		});
	}
	return sorted;
}

function EntriesSkeleton() {
	return (
		<div className="space-y-4">
			<div className="h-10 w-1/3 rounded bg-paper-sunken" />
			<div className="grid gap-3 sm:grid-cols-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="h-36 rounded-lg bg-paper-sunken" />
				))}
			</div>
		</div>
	);
}
