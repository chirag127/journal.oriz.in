import { useEffect, useState } from "react";
import { defaultSettings, getSettings, saveSettings } from "@/lib/firebase/settings";
import { useSettingsStore } from "@/stores/settingsStore";
import type { UserSettings } from "@/types/journal";

export function useSettings(uid: string | null) {
	const local = useSettingsStore();
	const [settings, setSettings] = useState<UserSettings>({
		...defaultSettings,
		font: local.font,
		accentColor: local.accentColor,
		weekStart: local.weekStart,
	});

	useEffect(() => {
		if (!uid) return;
		let cancelled = false;
		getSettings(uid).then((s) => {
			if (cancelled) return;
			setSettings((cur) => ({ ...cur, ...s }));
		});
		return () => {
			cancelled = true;
		};
	}, [uid]);

	const update = async (patch: Partial<UserSettings>) => {
		setSettings((s) => ({ ...s, ...patch }));
		if (patch.font) local.setFont(patch.font);
		if (patch.accentColor) local.setAccentColor(patch.accentColor);
		if (patch.weekStart != null) local.setWeekStart(patch.weekStart);
		if (uid) await saveSettings(uid, patch);
	};

	return { settings, update };
}
