import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import type { UserProfile } from "@/types/journal";

interface AuthStore {
	profile: UserProfile | null;
	uid: string | null;
	isLoading: boolean;
	setProfile: (p: UserProfile | null) => void;
	setUid: (uid: string | null) => void;
	setLoading: (b: boolean) => void;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			profile: null,
			uid: null,
			isLoading: true,
			setProfile: (p) => set({ profile: p }),
			setUid: (uid) => set({ uid }),
			setLoading: (b) => set({ isLoading: b }),
			reset: () => set({ profile: null, uid: null, isLoading: false }),
		}),
		{
			name: STORAGE_KEYS.auth,
			partialize: (s) => ({ uid: s.uid }),
		},
	),
);
