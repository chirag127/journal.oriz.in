import { create } from "zustand";
import type { EntryFilter, JournalEntry } from "@/types/journal";

interface EntriesStore {
	recent: JournalEntry[];
	pinned: JournalEntry[];
	favorites: JournalEntry[];
	allLoaded: JournalEntry[];
	filter: EntryFilter;
	setRecent: (e: JournalEntry[]) => void;
	setPinned: (e: JournalEntry[]) => void;
	setFavorites: (e: JournalEntry[]) => void;
	setAllLoaded: (e: JournalEntry[]) => void;
	setFilter: (f: Partial<EntryFilter>) => void;
	reset: () => void;
}

const defaultFilter: EntryFilter = {
	journalType: "all",
	mood: "all",
	tags: [],
	favorite: false,
	pinned: false,
	sort: "entryDate",
	order: "desc",
	length: "all",
};

export const useEntriesStore = create<EntriesStore>((set) => ({
	recent: [],
	pinned: [],
	favorites: [],
	allLoaded: [],
	filter: defaultFilter,
	setRecent: (e) => set({ recent: e }),
	setPinned: (e) => set({ pinned: e }),
	setFavorites: (e) => set({ favorites: e }),
	setAllLoaded: (e) => set({ allLoaded: e }),
	setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
	reset: () => set({ filter: defaultFilter, recent: [], pinned: [], favorites: [], allLoaded: [] }),
}));
