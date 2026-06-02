import { Badge } from "@components/react/ui/Badge";
import { LinkButton } from "@components/react/ui/Button";
import { Skeleton } from "@components/react/ui/Skeleton";
import { ArrowLeft, Cloud, Hash, MapPin, Pin, Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { useEntries } from "@/lib/hooks/useEntries";
import { fmt } from "@/lib/utils/date";
import { renderMarkdown } from "@/lib/utils/markdown";
import { useAuthStore } from "@/stores/authStore";
import { Link, useLocation } from "../router";

export function EntryDetailView() {
	const loc = useLocation();
	const id = decodeURIComponent(loc.pathname.replace(/^\/entries\//, ""));
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const entry = useMemo(() => allLoaded.find((e) => e.id === id), [allLoaded, id]);

	useEffect(() => {
		window.scrollTo({ top: 0 });
	}, [id]);

	if (!ready) {
		return (
			<div className="space-y-4">
				<Skeleton h="h-6" w="w-32" />
				<Skeleton h="h-12" />
				<Skeleton h="h-96" />
			</div>
		);
	}

	if (!entry) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-paper-soft/40 p-8 text-center">
				<p className="font-display text-2xl">Entry not found</p>
				<LinkButton href="/entries">Back to entries</LinkButton>
			</div>
		);
	}

	const mood = entry.mood ? MOODS.find((m) => m.value === entry.mood) : null;
	const type = JOURNAL_TYPES.find((t) => t.value === entry.journalType);

	return (
		<article className="space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
				<LinkButton href="/entries" variant="ghost" size="sm">
					<ArrowLeft size={14} /> All entries
				</LinkButton>
				<div className="flex items-center gap-1 text-xs text-fg-muted">
					<LinkButton href={`/entries/${entry.id}/edit`} variant="outline" size="sm">
						Edit
					</LinkButton>
				</div>
			</header>

			<div className="space-y-3">
				<div className="flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
					<Badge variant="muted">{type?.label}</Badge>
					{mood && (
						<Badge variant="accent">
							{mood.emoji} {mood.label}
						</Badge>
					)}
					{entry.favorite && (
						<Badge variant="accent">
							<Star size={9} fill="currentColor" /> Favorite
						</Badge>
					)}
					{entry.pinned && (
						<Badge variant="accent">
							<Pin size={9} fill="currentColor" /> Pinned
						</Badge>
					)}
				</div>
				<h1 className="font-display text-4xl leading-tight tracking-tight">
					{entry.title || "Untitled entry"}
				</h1>
				<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
					{fmt.date(entry.entryDate)} · Updated {fmt.relative(entry.updatedAt)} · {entry.wordCount}{" "}
					words · {fmt.reading(entry.readingTime)}
				</p>
			</div>

			<div
				className="prose-journal"
				dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }}
			/>

			<footer className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-fg-muted">
				{entry.location && (
					<Badge variant="muted">
						<MapPin size={9} />{" "}
						{entry.location.label ??
							`${entry.location.lat.toFixed(2)}, ${entry.location.lng.toFixed(2)}`}
					</Badge>
				)}
				{entry.weather && (
					<Badge variant="muted">
						<Cloud size={9} /> {entry.weather.condition} {Math.round(entry.weather.temp)}°
					</Badge>
				)}
				{entry.tags.length > 0 && (
					<span className="inline-flex items-center gap-1">
						{entry.tags.map((t) => (
							<Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="no-underline">
								<Badge variant="default">
									<Hash size={9} />
									{t}
								</Badge>
							</Link>
						))}
					</span>
				)}
			</footer>
		</article>
	);
}
