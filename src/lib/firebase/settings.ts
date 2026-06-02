import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { now } from "@/lib/utils/date";
import type { UserSettings } from "@/types/journal";
import { getDb } from "./client";

const ref = (uid: string) => doc(getDb(), "users", uid, "settings", "preferences");

export const defaultSettings: UserSettings = {
	theme: "system",
	font: "serif",
	accentColor: "#b45309",
	defaultJournalType: "daily",
	defaultMood: null,
	weekStart: 0,
	notifications: { dailyReminder: false, reminderTime: "20:00", weeklyDigest: false },
	privacy: { analytics: true, crashReports: true },
	updatedAt: now(),
};

export async function getSettings(uid: string): Promise<UserSettings> {
	const snap = await getDoc(ref(uid));
	if (!snap.exists()) return defaultSettings;
	return { ...defaultSettings, ...(snap.data() as Partial<UserSettings>) };
}

export async function saveSettings(uid: string, patch: Partial<UserSettings>): Promise<void> {
	await setDoc(ref(uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}
