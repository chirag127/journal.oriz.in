import { EmptyState } from "@components/react/ui/EmptyState";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { dayjs } from "@/lib/utils/date";
import { findMemories } from "@/lib/utils/memories";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "../router";

export function MemoriesView() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const mems = useMemo(
		() => (ready ? findMemories(allLoaded, new Date()) : []),
		[allLoaded, ready],
	);

	const grouped = useMemo(() => {
		const m = new Map<string, typeof mems>();
		for (const mem of mems) {
			if (!m.has(mem.label)) m.set(mem.label, []);
			m.get(mem.label)!.push(mem);
		}
		return Array.from(m.entries());
	}, [mems]);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;
	if (mems.length === 0) {
		return (
			<EmptyState
				icon={<Sparkles size={28} />}
				title="No memories yet"
				description="As you write more, past entries will surface here on their anniversaries."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Memories</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Echoes from the past</h1>
				<p className="mt-1 text-sm text-fg-muted">Entries from the same day in previous years.</p>
			</header>

			{grouped.map(([label, items]) => (
				<section key={label} className="space-y-3">
					<h2 className="font-display text-lg tracking-tight">{label}</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{items.map(({ entry }) => {
							const mood = entry.mood ? MOODS.find((m) => m.value === entry.mood) : null;
							const type = JOURNAL_TYPES.find((t) => t.value === entry.journalType);
							return (
								<Link
									key={entry.id}
									href={`/entries/${entry.id}`}
									className="block rounded-lg border border-border bg-bg-elevated p-4 no-underline transition-colors hover:border-fg-muted"
								>
									<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
										{dayjs(entry.entryDate).format("MMMM D, YYYY")}
									</p>
									<h3 className="mt-1 font-display text-base">{entry.title || "Untitled entry"}</h3>
									<p className="mt-1 line-clamp-2 text-xs text-fg-muted">
										{entry.content
											.replace(/[#*`>]/g, "")
											.split("\n")
											.filter(Boolean)
											.slice(0, 2)
											.join(" ")}
									</p>
									<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
										{type && <span>{type.label}</span>}
										{mood && (
											<span>
												· {mood.emoji} {mood.label}
											</span>
										)}
									</div>
								</Link>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);
}
