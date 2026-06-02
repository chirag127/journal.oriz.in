import { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { fmt } from "@/lib/utils/date";
import {
	entriesByDay,
	entriesByMonth,
	entriesByYear,
	moodDistribution,
	wordTrends,
} from "@/lib/utils/stats";
import { computeStreaks } from "@/lib/utils/streak";
import { useAuthStore } from "@/stores/authStore";

export function StatsView() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);

	const data = useMemo(() => {
		if (!allLoaded.length) return null;
		const streaks = computeStreaks(allLoaded);
		const byYear = entriesByYear(allLoaded);
		const byMonth = entriesByMonth(allLoaded).slice(-12);
		const byDay = entriesByDay(allLoaded).slice(-90);
		const mood = moodDistribution(allLoaded);
		const trend = wordTrends(allLoaded).slice(-30);
		const byType = JOURNAL_TYPES.map((t) => ({
			name: t.label,
			value: allLoaded.filter((e) => e.journalType === t.value).length,
		})).filter((d) => d.value > 0);
		const totalWords = allLoaded.reduce((a, b) => a + b.wordCount, 0);
		const avgWords = Math.round(totalWords / allLoaded.length);
		const totalReading = allLoaded.reduce((a, b) => a + b.readingTime, 0);
		return {
			streaks,
			byYear,
			byMonth,
			byDay,
			mood,
			trend,
			byType,
			totalWords,
			avgWords,
			totalReading,
		};
	}, [allLoaded]);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;
	if (!data) return <p className="text-fg-muted">Write a few entries to see your stats.</p>;

	return (
		<div className="space-y-6">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
					Statistics
				</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Your writing at a glance</h1>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Stat
					label="Current streak"
					value={`${data.streaks.current}d`}
					sub={`Longest: ${data.streaks.longest}d`}
				/>
				<Stat
					label="Total entries"
					value={String(allLoaded.length)}
					sub={`${data.totalWords.toLocaleString()} words`}
				/>
				<Stat label="Avg words/entry" value={String(data.avgWords)} sub="All time" />
				<Stat label="Total read time" value={fmt.reading(data.totalReading)} sub="All entries" />
			</div>

			<ChartCard title="Entries by month">
				<ResponsiveContainer width="100%" height={220}>
					<BarChart data={data.byMonth}>
						<CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
						<XAxis dataKey="month" stroke="var(--color-fg-muted)" fontSize={11} />
						<YAxis stroke="var(--color-fg-muted)" fontSize={11} allowDecimals={false} />
						<Tooltip
							contentStyle={{
								background: "var(--color-bg-elevated)",
								border: "1px solid var(--color-border)",
								borderRadius: 6,
								fontSize: 12,
							}}
						/>
						<Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</ChartCard>

			<ChartCard title="Words per day (last 30)">
				<ResponsiveContainer width="100%" height={220}>
					<LineChart data={data.trend}>
						<CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
						<XAxis dataKey="label" stroke="var(--color-fg-muted)" fontSize={11} />
						<YAxis stroke="var(--color-fg-muted)" fontSize={11} />
						<Tooltip
							contentStyle={{
								background: "var(--color-bg-elevated)",
								border: "1px solid var(--color-border)",
								borderRadius: 6,
								fontSize: 12,
							}}
						/>
						<Line
							type="monotone"
							dataKey="words"
							stroke="var(--color-accent)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartCard>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard title="Mood distribution">
					<ResponsiveContainer width="100%" height={220}>
						<PieChart>
							<Pie
								data={MOODS.map((m) => {
									const found = data.mood.find((x) => x.mood === m.value);
									return { name: m.label, value: found?.count ?? 0, color: m.color };
								})}
								dataKey="value"
								nameKey="name"
								innerRadius={50}
								outerRadius={80}
							/>
							<Tooltip
								contentStyle={{
									background: "var(--color-bg-elevated)",
									border: "1px solid var(--color-border)",
									borderRadius: 6,
									fontSize: 12,
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
					<div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-fg-muted">
						{MOODS.map((m) => (
							<span key={m.value} className="inline-flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />{" "}
								{m.label}
							</span>
						))}
					</div>
				</ChartCard>

				<ChartCard title="By year">
					<ResponsiveContainer width="100%" height={220}>
						<BarChart data={data.byYear}>
							<CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
							<XAxis dataKey="year" stroke="var(--color-fg-muted)" fontSize={11} />
							<YAxis stroke="var(--color-fg-muted)" fontSize={11} allowDecimals={false} />
							<Tooltip
								contentStyle={{
									background: "var(--color-bg-elevated)",
									border: "1px solid var(--color-border)",
									borderRadius: 6,
									fontSize: 12,
								}}
							/>
							<Bar dataKey="count" fill="var(--color-accent-soft)" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>
			</div>

			<ChartCard title="Journal types">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
					{data.byType.map((t) => (
						<div key={t.name} className="rounded-md border border-border p-3">
							<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
								{t.name}
							</p>
							<p className="mt-1 font-display text-2xl">{t.value}</p>
						</div>
					))}
				</div>
			</ChartCard>
		</div>
	);
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
	return (
		<div className="rounded-xl border border-border bg-bg-elevated p-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">{label}</p>
			<p className="mt-1 font-display text-3xl tracking-tight">{value}</p>
			{sub && <p className="text-xs text-fg-muted">{sub}</p>}
		</div>
	);
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded-xl border border-border bg-bg-elevated p-5">
			<h2 className="mb-3 font-display text-lg tracking-tight">{title}</h2>
			{children}
		</section>
	);
}
