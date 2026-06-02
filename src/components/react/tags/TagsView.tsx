import { Button } from "@components/react/ui/Button";
import { Field, Input } from "@components/react/ui/Field";
import { Modal } from "@components/react/ui/Modal";
import { toast } from "@components/react/ui/Toast";
import { Edit2, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { getTags, updateEntry } from "@/lib/firebase/entries";
import { useEntries } from "@/lib/hooks/useEntries";
import { tagSchema } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
import type { JournalEntry, Tag } from "@/types/journal";
import { Link } from "../router";

export function TagsView() {
	const uid = useAuthStore((s) => s.uid);
	const { allLoaded, ready } = useEntries(uid);
	const [tags, setTags] = useState<Tag[]>([]);
	const [renaming, setRenaming] = useState<Tag | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!uid) return;
		setLoading(true);
		getTags(uid).then((t) => {
			setTags(t);
			setLoading(false);
		});
	}, [uid]);

	const countByTag = new Map<string, number>();
	for (const e of allLoaded) {
		for (const t of e.tags) countByTag.set(t, (countByTag.get(t) ?? 0) + 1);
	}

	if (!ready || loading) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Tags</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Organize by topic</h1>
			</header>

			{tags.length === 0 ? (
				<p className="text-sm text-fg-muted">No tags yet. Add some when you write an entry.</p>
			) : (
				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{tags.map((t) => {
						const c = countByTag.get(t.name) ?? 0;
						return (
							<div
								key={t.id}
								className="flex items-center justify-between rounded-md border border-border bg-bg-elevated p-3"
							>
								<Link
									href={`/tags/${encodeURIComponent(t.name)}`}
									className="flex flex-1 items-center gap-2 no-underline"
								>
									<Hash size={14} className="text-accent" />
									<span className="font-medium">{t.name}</span>
									<span className="ml-1 text-xs text-fg-muted">{c}</span>
								</Link>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setRenaming(t)}
									aria-label="Rename"
								>
									<Edit2 size={12} />
								</Button>
							</div>
						);
					})}
				</div>
			)}

			<Modal
				open={!!renaming}
				onClose={() => setRenaming(null)}
				title={`Rename "${renaming?.name}"`}
				size="sm"
			>
				{renaming && (
					<RenameForm tag={renaming} entries={allLoaded} onDone={() => setRenaming(null)} />
				)}
			</Modal>
		</div>
	);
}

function RenameForm({
	tag,
	entries,
	onDone,
}: {
	tag: Tag;
	entries: JournalEntry[];
	onDone: () => void;
}) {
	const [name, setName] = useState(tag.name);
	const [busy, setBusy] = useState(false);
	const uid = useAuthStore((s) => s.uid);

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (!uid) return;
		const parsed = tagSchema.safeParse({ name: name.trim().toLowerCase() });
		if (!parsed.success) {
			toast({ message: "Invalid name", variant: "error" });
			return;
		}
		const newName = parsed.data.name;
		if (newName === tag.name) {
			onDone();
			return;
		}
		setBusy(true);
		try {
			const affected = entries.filter((e) => e.tags.includes(tag.name));
			for (const e of affected) {
				const next = e.tags.map((t) => (t === tag.name ? newName : t));
				await updateEntry(uid, e.id, { tags: Array.from(new Set(next)) });
			}
			toast({ message: `Renamed across ${affected.length} entries`, variant: "success" });
			onDone();
		} catch (err) {
			toast({ message: "Rename failed", variant: "error" });
		} finally {
			setBusy(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<Field label="New name" htmlFor="rn">
				<Input id="rn" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
			</Field>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="ghost" onClick={onDone}>
					Cancel
				</Button>
				<Button type="submit" loading={busy}>
					Rename everywhere
				</Button>
			</div>
		</form>
	);
}
