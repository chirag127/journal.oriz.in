import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeValue } from "@/lib/constants";
import { STORAGE_KEYS } from "@/lib/constants";

interface ThemeStore {
	theme: ThemeValue;
	resolved: "light" | "dark";
	setTheme: (t: ThemeValue) => void;
	setResolved: (r: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: "system",
			resolved: "light",
			setTheme: (t) => set({ theme: t }),
			setResolved: (r) => set({ resolved: r }),
		}),
		{
			name: STORAGE_KEYS.theme,
			partialize: (s) => ({ theme: s.theme }),
		},
	),
);
