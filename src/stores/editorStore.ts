import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

export type EditorMode = "write" | "split" | "preview";

interface EditorStore {
	mode: EditorMode;
	fullscreen: boolean;
	draft: Record<string, { title: string; content: string; updatedAt: string }>;
	setMode: (m: EditorMode) => void;
	toggleFullscreen: () => void;
	setFullscreen: (b: boolean) => void;
	saveDraft: (id: string, data: { title: string; content: string }) => void;
	removeDraft: (id: string) => void;
	clearDrafts: () => void;
}

export const useEditorStore = create<EditorStore>()(
	persist(
		(set, get) => ({
			mode: "split",
			fullscreen: false,
			draft: {},
			setMode: (m) => set({ mode: m }),
			toggleFullscreen: () => set({ fullscreen: !get().fullscreen }),
			setFullscreen: (b) => set({ fullscreen: b }),
			saveDraft: (id, data) =>
				set((s) => ({
					draft: {
						...s.draft,
						[id]: { ...data, updatedAt: new Date().toISOString() },
					},
				})),
			removeDraft: (id) =>
				set((s) => {
					const { [id]: _, ...rest } = s.draft;
					return { draft: rest };
				}),
			clearDrafts: () => set({ draft: {} }),
		}),
		{ name: STORAGE_KEYS.drafts, partialize: (s) => ({ mode: s.mode }) },
	),
);
