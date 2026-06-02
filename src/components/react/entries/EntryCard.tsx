import { Badge } from "@components/react/ui/Badge";
import { Cloud, Hash, MapPin, Pin, Star } from "lucide-react";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/date";
import { excerpt } from "@/lib/utils/markdown";
import type { JournalEntry } from "@/types/journal";
import { Link } from "../router";

interface EntryCardProps {
	entry: JournalEntry;
	showDate?: boolean;
	showType?: boolean;
	compact?: boolean;
}

export function EntryCard({
	entry,
	showDate = true,
	showType = true,
	compact = false,
}: EntryCardProps) {
	const mood = entry.mood ? MOODS.find((m) => m.value === entry.mood) : null;
	const type = JOURNAL_TYPES.find((t) => t.value === entry.journalType);

	return (
		<Link
			href={`/entries/${entry.id}`}
			className="group block rounded-lg border border-border bg-bg-elevated p-4 transition-all hover:border-fg-muted hover:shadow-sm"
		>
			<div className="mb-2 flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<h3
						className={cn(
							"truncate font-display tracking-tight",
							compact ? "text-base" : "text-lg",
						)}
					>
						{entry.title || "Untitled entry"}
					</h3>
					{showDate && (
						<p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
							{fmt.date(entry.entryDate)} · {fmt.relative(entry.updatedAt)}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1">
					{entry.pinned && <Pin size={12} className="text-accent" fill="currentColor" />}
					{entry.favorite && <Star size={12} className="text-accent" fill="currentColor" />}
				</div>
			</div>

			{!compact && entry.content && (
				<p className="line-clamp-3 text-sm leading-relaxed text-fg-muted">
					{excerpt(entry.content, 220)}
				</p>
			)}

			<div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
				{showType && type && <Badge variant="muted">{type.label}</Badge>}
				{mood && (
					<Badge variant="accent">
						<span aria-hidden>{mood.emoji}</span> {mood.label}
					</Badge>
				)}
				{!compact && entry.tags.length > 0 && (
					<div className="flex flex-wrap items-center gap-1">
						{entry.tags.slice(0, 3).map((t) => (
							<Badge key={t} variant="default">
								<Hash size={9} /> {t}
							</Badge>
						))}
						{entry.tags.length > 3 && <span className="text-xs">+{entry.tags.length - 3}</span>}
					</div>
				)}
				{!compact && entry.weather && (
					<Badge variant="muted">
						<Cloud size={9} /> {entry.weather.condition}
					</Badge>
				)}
				{!compact && entry.location && (
					<Badge variant="muted">
						<MapPin size={9} />
					</Badge>
				)}
				<span className="ml-auto font-mono text-[10px]">{fmt.reading(entry.readingTime)}</span>
			</div>
		</Link>
	);
}
