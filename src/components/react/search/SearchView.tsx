import { EmptyState } from "@components/react/ui/EmptyState";
import { Input } from "@components/react/ui/Field";
import { Hash, Pin, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEntries } from "@/lib/hooks/useEntries";
import { fmt } from "@/lib/utils/date";
import { buildSearchIndex, searchEntries } from "@/lib/utils/search";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "../router";

export function SearchView() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const [q, setQ] = useState("");
	const debounced = useDebounce(q, 200);
	const idx = useMemo(() => buildSearchIndex(allLoaded), [allLoaded]);
	const results = useMemo(
		() => (debounced.trim() ? searchEntries(idx, debounced) : []),
		[idx, debounced],
	);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Search</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Find anything you've written</h1>
			</header>
			<div className="relative">
				<Search
					size={16}
					className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted"
				/>
				<Input
					autoFocus
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Try a word, phrase, or #tag…"
					className="h-14 pl-12 text-lg"
				/>
			</div>
			{!debounced.trim() ? (
				<div className="text-sm text-fg-muted">
					<p>
						Searches title, content, and tags. Type a date like <code>2024-12</code> or a tag like{" "}
						<code>#learning</code>.
					</p>
				</div>
			) : results.length === 0 ? (
				<EmptyState title="No matches" description="Try a different search term." />
			) : (
				<>
					<p className="text-xs text-fg-muted">
						{results.length} {results.length === 1 ? "result" : "results"}
					</p>
					<ul className="space-y-2">
						{results.map((e) => {
							const mood = e.mood ? MOODS.find((m) => m.value === e.mood) : null;
							const type = JOURNAL_TYPES.find((t) => t.value === e.journalType);
							return (
								<li key={e.id}>
									<Link
										href={`/entries/${e.id}`}
										className="block rounded-lg border border-border bg-bg-elevated p-4 no-underline transition-colors hover:border-fg-muted"
									>
										<div className="mb-1 flex items-start justify-between gap-2">
											<h3 className="font-display text-lg tracking-tight">
												{e.title || "Untitled entry"}
											</h3>
											<div className="flex items-center gap-1 text-fg-muted">
												{e.pinned && <Pin size={12} className="text-accent" fill="currentColor" />}
												{e.favorite && (
													<Star size={12} className="text-accent" fill="currentColor" />
												)}
											</div>
										</div>
										<p className="line-clamp-2 text-sm text-fg-muted">
											{e.content
												.replace(/[#*`>]/g, "")
												.split("\n")
												.filter(Boolean)
												.slice(0, 2)
												.join(" ")}
										</p>
										<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
											<span className="font-mono">{fmt.date(e.entryDate)}</span>
											{type && <span>· {type.label}</span>}
											{mood && (
												<span>
													· {mood.emoji} {mood.label}
												</span>
											)}
											{e.tags.slice(0, 3).map((t) => (
												<span key={t} className="inline-flex items-center gap-0.5">
													<Hash size={10} />
													{t}
												</span>
											))}
										</div>
									</Link>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</div>
	);
}
