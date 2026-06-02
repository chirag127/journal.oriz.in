import { Badge } from "@components/react/ui/Badge";
import { EmptyState } from "@components/react/ui/EmptyState";
import { Calendar as CalIcon, Hash, Pin, Star } from "lucide-react";
import { useMemo } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { dayjs } from "@/lib/utils/date";
import { useAuthStore } from "@/stores/authStore";
import type { JournalEntry } from "@/types/journal";
import { useNavigate } from "../router";

export function TimelineView() {
	const uid = useAuthStore((s) => s.uid);
	const nav = useNavigate();
	const { allLoaded, ready } = useEntries(uid);

	const grouped = useMemo(() => {
		const m = new Map<string, JournalEntry[]>();
		const sorted = [...allLoaded].sort((a, b) => b.entryDate.localeCompare(a.entryDate));
		for (const e of sorted) {
			const key = dayjs(e.entryDate).format("MMMM YYYY");
			if (!m.has(key)) m.set(key, []);
			m.get(key)!.push(e);
		}
		return Array.from(m.entries());
	}, [allLoaded]);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	if (allLoaded.length === 0) {
		return (
			<EmptyState
				icon={<CalIcon size={28} />}
				title="Your timeline is empty"
				description="Start writing to see your story unfold."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Timeline</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Your story, month by month</h1>
			</header>

			<ol className="relative space-y-8 border-l-2 border-border pl-6">
				{grouped.map(([month, entries]) => (
					<li key={month} className="relative">
						<span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-border bg-bg" />
						<h2 className="font-display text-xl tracking-tight">{month}</h2>
						<p className="mt-1 text-xs text-fg-muted">
							{entries.length} {entries.length === 1 ? "entry" : "entries"}
						</p>
						<ul className="mt-3 space-y-2">
							{entries.map((e) => {
								const mood = e.mood ? MOODS.find((m) => m.value === e.mood) : null;
								const type = JOURNAL_TYPES.find((t) => t.value === e.journalType);
								return (
									<li key={e.id}>
										<button
											type="button"
											onClick={() => nav(`/entries/${e.id}`)}
											className="block w-full rounded-md border border-border bg-bg-elevated p-3 text-left transition-colors hover:border-fg-muted"
										>
											<div className="flex items-start justify-between gap-2">
												<div>
													<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
														{dayjs(e.entryDate).format("MMM D")}
													</p>
													<p className="font-medium">{e.title || "Untitled entry"}</p>
												</div>
												<div className="flex items-center gap-1 text-fg-muted">
													{e.pinned && (
														<Pin size={11} className="text-accent" fill="currentColor" />
													)}
													{e.favorite && (
														<Star size={11} className="text-accent" fill="currentColor" />
													)}
												</div>
											</div>
											<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
												{type && <Badge variant="muted">{type.label}</Badge>}
												{mood && (
													<Badge variant="accent">
														{mood.emoji} {mood.label}
													</Badge>
												)}
												{e.tags.slice(0, 3).map((t) => (
													<Badge key={t} variant="default">
														<Hash size={9} />
														{t}
													</Badge>
												))}
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					</li>
				))}
			</ol>
		</div>
	);
}
