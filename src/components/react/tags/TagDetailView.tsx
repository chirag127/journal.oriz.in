import { EntryCard } from "@components/react/entries/EntryCard";
import { EmptyState } from "@components/react/ui/EmptyState";
import { Hash } from "lucide-react";
import { useMemo } from "react";
import { useEntries } from "@/lib/hooks/useEntries";
import { useAuthStore } from "@/stores/authStore";
import { Link, useParams } from "../router";

export function TagDetailView() {
	const params = useParams();
	const tagName = decodeURIComponent(params.tag ?? "");
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);

	const filtered = useMemo(() => {
		return allLoaded.filter((e) => e.tags.includes(tagName));
	}, [allLoaded, tagName]);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header>
				<Link href="/tags" className="text-xs text-fg-muted no-underline hover:text-fg">
					← All tags
				</Link>
				<h1 className="mt-2 flex items-center gap-2 font-display text-3xl tracking-tight">
					<Hash size={24} className="text-accent" /> {tagName}
				</h1>
				<p className="mt-1 text-sm text-fg-muted">
					{filtered.length} {filtered.length === 1 ? "entry" : "entries"}
				</p>
			</header>
			{filtered.length === 0 ? (
				<EmptyState title="No entries with this tag" description="Tag entries to see them here." />
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{filtered.map((e) => (
						<EntryCard key={e.id} entry={e} />
					))}
				</div>
			)}
		</div>
	);
}
