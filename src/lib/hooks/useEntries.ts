import { useEffect, useState } from "react";
import {
	onAllEntries,
	onFavoriteEntries,
	onPinnedEntries,
	onRecentEntries,
} from "@/lib/firebase/entries";
import { useEntriesStore } from "@/stores/entriesStore";
import type { JournalEntry } from "@/types/journal";

export function useEntries(uid: string | null) {
	const { recent, pinned, favorites, allLoaded, setRecent, setPinned, setFavorites, setAllLoaded } =
		useEntriesStore();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!uid) {
			setReady(true);
			return;
		}
		setReady(false);
		const u1 = onRecentEntries(uid, 30, (e) => {
			setRecent(e);
			setReady(true);
		});
		const u2 = onPinnedEntries(uid, (e) => setPinned(e));
		const u3 = onFavoriteEntries(uid, (e) => setFavorites(e));
		const u4 = onAllEntries(uid, (e) => setAllLoaded(e));
		return () => {
			u1();
			u2();
			u3();
			u4();
		};
	}, [uid, setRecent, setPinned, setFavorites, setAllLoaded]);

	return { recent, pinned, favorites, allLoaded, ready };
}

export function useEntryList(): JournalEntry[] {
	return useEntriesStore((s) => s.allLoaded);
}
