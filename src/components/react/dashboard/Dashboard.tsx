import { Button } from "@components/react/ui/Button";
import { EmptyState } from "@components/react/ui/EmptyState";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { dayjs, fmt } from "@/lib/utils/date";
import { findMemories } from "@/lib/utils/memories";
import { buildActivityMap, computeStreaks } from "@/lib/utils/streak";
import { useAuthStore } from "@/stores/authStore";
import { EntryCard } from "../entries/EntryCard";
import { Link } from "../router";

export function Dashboard() {
	const uid = useAuthStore((s) => s.uid);
	const { recent, favorites, pinned, ready } = useEntries(uid);
	const [now] = useState(() => dayjs());

	const stats = useMemo(() => {
		const streaks = computeStreaks(recent);
		const activity = buildActivityMap(recent);
		const mems = findMemories(recent, now);
		return { streaks, activity, mems };
	}, [recent, now]);

	if (!ready) return <DashboardSkeleton />;

	const todaysEntry = recent.find((e) => e.entryDate === now.format("YYYY-MM-DD"));
	const last30 = recent.slice(0, 30);

	return (
		<div className="space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
						{now.format("dddd · MMMM D, YYYY")}
					</p>
					<h1 className="mt-1 font-display text-4xl leading-tight tracking-tight">
						{now.format("dddd")}
					</h1>
				</div>
				<Link href="/entries/new" className="no-underline">
					<Button variant="primary" leading={<BookOpen size={16} />}>
						New entry
					</Button>
				</Link>
			</header>

			{todaysEntry ? <TodaysEntryCard entry={todaysEntry} /> : <EmptyTodayCard />}

			<div className="grid gap-5 lg:grid-cols-3">
				<StreakCard
					current={stats.streaks.current}
					longest={stats.streaks.longest}
					activity={stats.activity}
				/>
				<MoodSummaryCard entries={recent} />
				<CountsCard recent={recent.length} total={recent.length} />
			</div>

			<div className="grid gap-5 lg:grid-cols-3">
				<section className="lg:col-span-2 space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="font-display text-xl tracking-tight">Recent entries</h2>
						<Link
							href="/entries"
							className="inline-flex items-center gap-1 text-sm text-fg-muted no-underline hover:text-fg"
						>
							View all <ArrowRight size={14} />
						</Link>
					</div>
					{last30.length === 0 ? (
						<EmptyState
							icon={<BookOpen size={28} />}
							title="Your journal is empty"
							description="Start writing to see entries here."
							action={
								<Link href="/entries/new" className="no-underline">
									<Button variant="primary">Write first entry</Button>
								</Link>
							}
						/>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{last30.slice(0, 6).map((e) => (
								<EntryCard key={e.id} entry={e} />
							))}
						</div>
					)}
				</section>

				<aside className="space-y-5">
					{pinned.length > 0 && (
						<section className="space-y-2">
							<div className="flex items-center justify-between">
								<h2 className="font-display text-lg tracking-tight">Pinned</h2>
								<Link href="/pinned" className="text-xs text-fg-muted hover:text-fg no-underline">
									All
								</Link>
							</div>
							<div className="space-y-2">
								{pinned.slice(0, 3).map((e) => (
									<EntryCard key={e.id} entry={e} compact />
								))}
							</div>
						</section>
					)}

					{favorites.length > 0 && (
						<section className="space-y-2">
							<div className="flex items-center justify-between">
								<h2 className="font-display text-lg tracking-tight">Favorites</h2>
								<Link
									href="/favorites"
									className="text-xs text-fg-muted hover:text-fg no-underline"
								>
									All
								</Link>
							</div>
							<div className="space-y-2">
								{favorites.slice(0, 3).map((e) => (
									<EntryCard key={e.id} entry={e} compact />
								))}
							</div>
						</section>
					)}

					{stats.mems.length > 0 && (
						<section className="space-y-2">
							<h2 className="flex items-center gap-1.5 font-display text-lg tracking-tight">
								<Sparkles size={14} className="text-accent" /> Memories
							</h2>
							<div className="space-y-2">
								{stats.mems.slice(0, 3).map((m) => (
									<Link
										key={m.entry.id}
										href={`/entries/${m.entry.id}`}
										className="block rounded-md border border-border bg-bg-elevated p-3 no-underline transition-colors hover:border-fg-muted"
									>
										<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
											{m.label}
										</p>
										<p className="mt-1 truncate text-sm font-medium">
											{m.entry.title || "Untitled entry"}
										</p>
										<p className="mt-0.5 text-xs text-fg-muted">
											{dayjs(m.entry.entryDate).format("MMM D, YYYY")} ·{" "}
											{fmt.relative(m.entry.entryDate)}
										</p>
									</Link>
								))}
							</div>
						</section>
					)}
				</aside>
			</div>
		</div>
	);
}

function TodaysEntryCard({ entry }: { entry: import("@/types/journal").JournalEntry }) {
	const mood = entry.mood ? MOODS.find((m) => m.value === entry.mood) : null;
	const type = JOURNAL_TYPES.find((t) => t.value === entry.journalType);
	return (
		<Link
			href={`/entries/${entry.id}`}
			className="group block rounded-xl border border-border bg-paper-soft/40 p-6 no-underline transition-colors hover:border-fg-muted"
		>
			<div className="mb-3 flex items-center justify-between text-xs text-fg-muted">
				<span className="font-mono uppercase tracking-[0.16em]">Today's entry</span>
				{mood && (
					<span aria-hidden className="text-base">
						{mood.emoji}
					</span>
				)}
			</div>
			<h2 className="font-display text-2xl tracking-tight">{entry.title || "Untitled entry"}</h2>
			<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-muted">
				{entry.content
					.replace(/^#+\s*/gm, "")
					.split("\n")
					.filter(Boolean)
					.slice(0, 3)
					.join(" ")}
			</p>
			<div className="mt-3 flex items-center gap-2 text-xs text-fg-muted">
				{type && <span>{type.label}</span>}
				<span className="ml-auto inline-flex items-center gap-1 text-accent">
					Continue writing <ArrowRight size={12} />
				</span>
			</div>
		</Link>
	);
}

function EmptyTodayCard() {
	return (
		<div className="rounded-xl border border-dashed border-border bg-paper-soft/30 p-6">
			<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
				No entry yet
			</p>
			<h2 className="mt-2 font-display text-2xl tracking-tight">How is your day going?</h2>
			<p className="mt-1 text-sm text-fg-muted">
				A few sentences today is worth a year of memoirs later.
			</p>
			<Link href="/entries/new" className="no-underline">
				<Button className="mt-4" variant="primary" leading={<BookOpen size={14} />}>
					Start writing
				</Button>
			</Link>
		</div>
	);
}

function StreakCard({
	current,
	longest,
	activity,
}: {
	current: number;
	longest: number;
	activity: Record<string, number>;
}) {
	const last14 = Array.from({ length: 14 }, (_, i) => {
		const d = dayjs().subtract(13 - i, "day");
		const key = d.format("YYYY-MM-DD");
		return { date: d, count: activity[key] ?? 0, key };
	});
	return (
		<div className="rounded-xl border border-border bg-bg-elevated p-5">
			<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Streak</p>
			<p className="mt-2 font-display text-4xl">
				{current}
				<span className="text-sm font-sans text-fg-muted"> day{current === 1 ? "" : "s"}</span>
			</p>
			<p className="mt-1 text-xs text-fg-muted">Longest: {longest}</p>
			<div className="mt-3 flex h-7 items-end gap-0.5">
				{last14.map((d) => (
					<div
						key={d.key}
						title={`${d.date.format("MMM D")} · ${d.count}`}
						className={`h-full w-full rounded-sm transition-colors ${d.count > 0 ? "bg-accent" : "bg-paper-sunken"}`}
						style={{ height: `${Math.max(20, d.count * 100)}%` }}
					/>
				))}
			</div>
		</div>
	);
}

function MoodSummaryCard({ entries }: { entries: import("@/types/journal").JournalEntry[] }) {
	const counts: Record<string, number> = {};
	for (const e of entries) {
		if (e.mood) counts[e.mood] = (counts[e.mood] ?? 0) + 1;
	}
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	return (
		<div className="rounded-xl border border-border bg-bg-elevated p-5">
			<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
				Mood (last 30)
			</p>
			{total === 0 ? (
				<p className="mt-3 text-sm text-fg-muted">Tag moods to see trends.</p>
			) : (
				<div className="mt-3 space-y-2">
					{MOODS.map((m) => {
						const c = counts[m.value] ?? 0;
						const pct = total ? Math.round((c / total) * 100) : 0;
						return (
							<div key={m.value}>
								<div className="flex justify-between text-xs">
									<span>
										{m.emoji} {m.label}
									</span>
									<span className="font-mono text-fg-muted">{pct}%</span>
								</div>
								<div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-sunken">
									<div className="h-full" style={{ width: `${pct}%`, background: m.color }} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function CountsCard({ recent, total }: { recent: number; total: number }) {
	return (
		<div className="rounded-xl border border-border bg-bg-elevated p-5">
			<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">At a glance</p>
			<dl className="mt-3 space-y-2 text-sm">
				<div className="flex justify-between">
					<dt className="text-fg-muted">Last 30 entries</dt>
					<dd className="font-mono">{recent}</dd>
				</div>
				<div className="flex justify-between">
					<dt className="text-fg-muted">Total</dt>
					<dd className="font-mono">{total}</dd>
				</div>
				<div className="mt-3 flex gap-2">
					<Link
						href="/calendar"
						className="flex-1 rounded-md border border-border px-2 py-1.5 text-center text-xs no-underline hover:border-fg-muted"
					>
						Calendar
					</Link>
					<Link
						href="/stats"
						className="flex-1 rounded-md border border-border px-2 py-1.5 text-center text-xs no-underline hover:border-fg-muted"
					>
						Stats
					</Link>
				</div>
			</dl>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="h-12 w-1/3 rounded bg-paper-sunken" />
			<div className="h-32 rounded-xl bg-paper-sunken" />
			<div className="grid gap-5 lg:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<div key={i} className="h-32 rounded-xl bg-paper-sunken" />
				))}
			</div>
		</div>
	);
}
