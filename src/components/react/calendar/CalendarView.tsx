import { Button } from "@components/react/ui/Button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { cn } from "@/lib/utils/cn";
import { dayjs, getMonthMatrix } from "@/lib/utils/date";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { JournalEntry } from "@/types/journal";
import { Link } from "../router";

export function CalendarView() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const weekStart = useSettingsStore((s) => s.weekStart);
	const [cursor, setCursor] = useState(() => dayjs());
	const [selected, setSelected] = useState<string | null>(dayjs().format("YYYY-MM-DD"));

	const byDate = useMemo(() => {
		const m = new Map<string, JournalEntry[]>();
		for (const e of allLoaded) {
			if (!m.has(e.entryDate)) m.set(e.entryDate, []);
			m.get(e.entryDate)!.push(e);
		}
		return m;
	}, [allLoaded]);

	const month = cursor.month();
	const year = cursor.year();
	const matrix = useMemo(() => getMonthMatrix(year, month, weekStart), [year, month, weekStart]);
	const weekdays =
		weekStart === 1
			? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
			: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const dayEntries = selected ? (byDate.get(selected) ?? []) : [];

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
						Calendar
					</p>
					<h1 className="mt-1 font-display text-3xl tracking-tight">
						{cursor.format("MMMM YYYY")}
					</h1>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setCursor((c) => c.subtract(1, "month"))}
					>
						<ChevronLeft size={16} />
					</Button>
					<Button variant="ghost" size="sm" onClick={() => setCursor(dayjs())}>
						Today
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setCursor((c) => c.add(1, "month"))}>
						<ChevronRight size={16} />
					</Button>
				</div>
			</header>

			<div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
				<div className="grid grid-cols-7 border-b border-border bg-paper-sunken/50 text-xs">
					{weekdays.map((d) => (
						<div
							key={d}
							className="px-2 py-2 text-center font-mono uppercase tracking-wider text-fg-muted"
						>
							{d}
						</div>
					))}
				</div>
				{matrix.map((week, wi) => (
					<div key={wi} className="grid grid-cols-7">
						{week.map((d) => {
							const key = d.format("YYYY-MM-DD");
							const inMonth = d.month() === month;
							const isToday = d.isSame(dayjs(), "day");
							const isSelected = key === selected;
							const entries = byDate.get(key) ?? [];
							const dominant = dominantMood(entries);
							return (
								<button
									key={key}
									type="button"
									onClick={() => setSelected(key)}
									className={cn(
										"relative h-20 border-b border-r border-border p-1.5 text-left transition-colors",
										!inMonth && "bg-paper-sunken/30 text-fg-subtle",
										isSelected && "ring-2 ring-accent ring-inset",
									)}
								>
									<div className="flex items-start justify-between">
										<span
											className={cn(
												"inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono",
												isToday && "bg-ink text-paper",
											)}
										>
											{d.format("D")}
										</span>
										{entries.length > 0 && (
											<span className="text-[10px] font-mono text-fg-muted">{entries.length}</span>
										)}
									</div>
									{dominant && (
										<div
											className="mt-1 inline-flex items-center rounded-full px-1 text-[10px]"
											style={{ background: `${dominant.color}33`, color: dominant.color }}
										>
											<span aria-hidden>{dominant.emoji}</span>
										</div>
									)}
								</button>
							);
						})}
					</div>
				))}
			</div>

			{selected && (
				<section className="rounded-xl border border-border bg-bg-elevated p-5">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-display text-xl tracking-tight">
							{dayjs(selected).format("dddd, MMMM D, YYYY")}
						</h2>
						<div className="flex gap-2">
							<Link href={`/entries/new?date=${selected}`} className="no-underline">
								<Button variant="primary" size="sm" leading={<Plus size={12} />}>
									New entry
								</Button>
							</Link>
						</div>
					</div>
					{dayEntries.length === 0 ? (
						<p className="text-sm text-fg-muted">No entries on this day.</p>
					) : (
						<ul className="space-y-2">
							{dayEntries.map((e) => {
								const type = JOURNAL_TYPES.find((t) => t.value === e.journalType);
								return (
									<li key={e.id}>
										<Link
											href={`/entries/${e.id}`}
											className="flex items-center justify-between rounded-md border border-border bg-paper-soft/40 p-3 no-underline transition-colors hover:border-fg-muted"
										>
											<div>
												<p className="font-medium">{e.title || "Untitled entry"}</p>
												<p className="text-xs text-fg-muted">{type?.label}</p>
											</div>
											<span className="font-mono text-[10px] text-fg-muted">
												{e.wordCount} words
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					)}
				</section>
			)}
		</div>
	);
}

function dominantMood(entries: JournalEntry[]) {
	const counts: Record<string, number> = {};
	for (const e of entries) if (e.mood) counts[e.mood] = (counts[e.mood] ?? 0) + 1;
	const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
	if (!top) return null;
	const m = MOODS.find((x) => x.value === top);
	return m ? { color: m.color, emoji: m.emoji } : null;
}
