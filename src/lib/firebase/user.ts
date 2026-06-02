import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { now } from "@/lib/utils/date";
import type { UserProfile } from "@/types/journal";
import { getDb } from "./client";

export async function ensureUserProfile(
	uid: string,
	data: Partial<UserProfile> & {
		email: string | null;
		displayName: string | null;
		isAnonymous: boolean;
	},
): Promise<void> {
	const ref = doc(getDb(), "users", uid);
	const snap = await getDoc(ref);
	if (snap.exists()) return;
	const profile: UserProfile = {
		uid,
		email: data.email,
		displayName: data.displayName,
		photoURL: data.photoURL ?? null,
		isAnonymous: data.isAnonymous,
		createdAt: now(),
		updatedAt: now(),
		defaultJournalType: data.defaultJournalType ?? "daily",
		timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
	};
	await setDoc(ref, profile);
}

export function getUserProfileRef(uid: string) {
	return doc(getDb(), "users", uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
	const snap = await getDoc(getUserProfileRef(uid));
	if (!snap.exists()) return null;
	return snap.data() as UserProfile;
}

export function onUserProfile(uid: string, cb: (p: UserProfile | null) => void): () => void {
	return onSnapshot(getUserProfileRef(uid), (snap) => {
		if (!snap.exists()) return cb(null);
		cb(snap.data() as UserProfile);
	});
}

export async function updateUserProfile(
	uid: string,
	patch: Partial<Omit<UserProfile, "uid" | "createdAt">>,
): Promise<void> {
	await setDoc(getUserProfileRef(uid), { ...patch, updatedAt: now() }, { merge: true });
}

export async function deleteUserAccountData(uid: string): Promise<void> {
	const db = getDb();
	const { deleteDoc, collection, getDocs, writeBatch } = await import("firebase/firestore");
	const colNames = ["entries", "templates", "tags", "goals", "settings", "counters"];
	for (const col of colNames) {
		const snap = await getDocs(collection(db, `users/${uid}/${col}`));
		const batch = writeBatch(db);
		snap.forEach((d) => {
			batch.delete(d.ref);
		});
		await batch.commit();
	}
	await deleteDoc(doc(db, `users/${uid}`));
}
