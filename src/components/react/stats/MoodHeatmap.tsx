import { useMemo, useState } from "react";
import { useEntries } from "@/lib/hooks/useEntries";
import { cn } from "@/lib/utils/cn";
import { dayjs, getYearDays } from "@/lib/utils/date";
import { buildActivityMap } from "@/lib/utils/streak";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function MoodHeatmap() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const weekStart = useSettingsStore((s) => s.weekStart);
	const [year, setYear] = useState(() => dayjs().year());

	const activity = useMemo(
		() => (ready ? buildActivityMap(allLoaded) : ({} as Record<string, number>)),
		[allLoaded, ready],
	);
	const moodByDate = useMemo(() => {
		const m = new Map<string, string | null>();
		for (const e of allLoaded) if (e.mood) m.set(e.entryDate, e.mood);
		return m;
	}, [allLoaded]);
	const days = useMemo(() => getYearDays(year), [year]);

	const monthLabels: { label: string; left: number }[] = [];
	let lastMonth = -1;
	for (const d of days) {
		const m = d.month();
		if (m !== lastMonth) {
			monthLabels.push({ label: d.format("MMM"), left: d.dayOfYear() });
			lastMonth = m;
		}
	}

	const MOOD_COLOR: Record<string, string> = {
		excellent: "var(--color-mood-excellent)",
		good: "var(--color-mood-good)",
		neutral: "var(--color-mood-neutral)",
		bad: "var(--color-mood-bad)",
		terrible: "var(--color-mood-terrible)",
	};

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="rounded-xl border border-border bg-bg-elevated p-5">
			<div className="mb-3 flex items-center justify-between">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
						Activity
					</p>
					<p className="font-display text-2xl tracking-tight">{year}</p>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="rounded-md border border-border px-2 py-1 text-xs hover:border-fg-muted"
						onClick={() => setYear((y) => y - 1)}
					>
						←
					</button>
					<button
						type="button"
						className="rounded-md border border-border px-2 py-1 text-xs hover:border-fg-muted"
						onClick={() => setYear(dayjs().year())}
					>
						This year
					</button>
					<button
						type="button"
						className="rounded-md border border-border px-2 py-1 text-xs hover:border-fg-muted"
						onClick={() => setYear((y) => y + 1)}
					>
						→
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<div className="relative ml-6">
					<div className="mb-1 h-3 text-[10px] text-fg-muted">
						{monthLabels.map((m) => (
							<span
								key={m.label + m.left}
								className="absolute"
								style={{ left: `${(m.left / days.length) * 100}%` }}
							>
								{m.label}
							</span>
						))}
					</div>
					<div className="flex gap-0.5">
						{Array.from({ length: 7 }, (_, dow) => (
							<div key={dow} className="flex flex-col gap-0.5">
								{Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => {
									const i = w * 7 + (weekStart === 1 ? (dow + 6) % 7 : dow);
									const d = days[i];
									if (!d || d.year() !== year) return <div key={w} className="h-3 w-3" />;
									const key = d.format("YYYY-MM-DD");
									const count = activity[key] ?? 0;
									const mood = moodByDate.get(key) ?? null;
									return (
										<div
											key={w}
											title={`${d.format("MMM D, YYYY")} · ${count} entr${count === 1 ? "y" : "ies"}`}
											className={cn("h-3 w-3 rounded-sm", count === 0 && "bg-paper-sunken")}
											style={
												count > 0
													? {
															background: mood ? MOOD_COLOR[mood] : "var(--color-accent)",
															opacity: Math.min(1, 0.4 + count * 0.2),
														}
													: undefined
											}
										/>
									);
								})}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
