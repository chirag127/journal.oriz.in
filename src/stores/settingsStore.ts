import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

interface SettingsStore {
	font: "system" | "serif" | "sans";
	accentColor: string;
	weekStart: 0 | 1;
	setFont: (f: "system" | "serif" | "sans") => void;
	setAccentColor: (c: string) => void;
	setWeekStart: (w: 0 | 1) => void;
}

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set) => ({
			font: "serif",
			accentColor: "#b45309",
			weekStart: 0,
			setFont: (f) => set({ font: f }),
			setAccentColor: (c) => set({ accentColor: c }),
			setWeekStart: (w) => set({ weekStart: w }),
		}),
		{ name: STORAGE_KEYS.settings },
	),
);
