import {
	collection,
	type DocumentSnapshot,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	startAfter,
	Timestamp,
	where,
} from "firebase/firestore";
import { now } from "@/lib/utils/date";
import { newId } from "@/lib/utils/export";
import { countWords, readingTimeMinutes } from "@/lib/utils/markdown";
import type { EntryFilter, JournalEntry } from "@/types/journal";
import { getDb } from "./client";

const col = (uid: string) => collection(getDb(), "users", uid, "entries");
const docRef = (uid: string, id: string) => doc(getDb(), "users", uid, "entries", id);

function toIso(v: unknown): string {
	if (!v) return now();
	if (v instanceof Timestamp) return v.toDate().toISOString();
	if (typeof v === "string") return v;
	return now();
}

function fromDoc(snap: DocumentSnapshot, userId: string): JournalEntry {
	const d = snap.data() ?? {};
	return {
		id: snap.id,
		userId,
		title: (d.title as string) ?? "",
		content: (d.content as string) ?? "",
		mood: (d.mood as JournalEntry["mood"]) ?? null,
		moodIntensity: (d.moodIntensity as number | null) ?? null,
		tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
		location: (d.location as JournalEntry["location"]) ?? null,
		weather: (d.weather as JournalEntry["weather"]) ?? null,
		journalType: (d.journalType as JournalEntry["journalType"]) ?? "daily",
		entryDate: (d.entryDate as string) ?? now().slice(0, 10),
		createdAt: toIso(d.createdAt),
		updatedAt: toIso(d.updatedAt),
		favorite: Boolean(d.favorite),
		pinned: Boolean(d.pinned),
		wordCount: Number(d.wordCount ?? 0),
		readingTime: Number(d.readingTime ?? 0),
		isDraft: Boolean(d.isDraft),
	};
}

export async function createEntry(
	uid: string,
	data: Omit<
		JournalEntry,
		"id" | "userId" | "createdAt" | "updatedAt" | "wordCount" | "readingTime"
	>,
): Promise<JournalEntry> {
	const id = newId();
	const wc = countWords(data.content);
	const rt = readingTimeMinutes(data.content);
	const entry: JournalEntry = {
		id,
		userId: uid,
		...data,
		wordCount: wc,
		readingTime: rt,
		createdAt: now(),
		updatedAt: now(),
	};
	await setDoc(docRef(uid, id), {
		...entry,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	await updateCounters(uid, { entryDelta: 1, wordDelta: wc, lastDate: data.entryDate });
	await incrementTagCounts(uid, data.tags);
	return entry;
}

export async function updateEntry(
	uid: string,
	id: string,
	patch: Partial<Omit<JournalEntry, "id" | "userId" | "createdAt">>,
): Promise<void> {
	const ref = docRef(uid, id);
	const current = await getDoc(ref);
	if (!current.exists()) throw new Error("Entry not found");
	const prev = fromDoc(current, uid);
	const wc = patch.content != null ? countWords(patch.content) : prev.wordCount;
	const rt = patch.content != null ? readingTimeMinutes(patch.content) : prev.readingTime;
	const data: Record<string, unknown> = {
		...patch,
		wordCount: wc,
		readingTime: rt,
		updatedAt: serverTimestamp(),
	};
	await setDoc(ref, data, { merge: true });
	if (patch.content != null) {
		await updateCounters(uid, {
			wordDelta: wc - prev.wordCount,
			entryDate: prev.entryDate,
		});
	}
	if (patch.tags) {
		const removed = prev.tags.filter((t) => !patch.tags!.includes(t));
		const added = patch.tags.filter((t) => !prev.tags.includes(t));
		if (removed.length) await incrementTagCounts(uid, removed, -1);
		if (added.length) await incrementTagCounts(uid, added, 1);
	}
	if (patch.favorite != null || patch.pinned != null || patch.mood != null) {
		// no-op
	}
}

export async function deleteEntry(uid: string, id: string): Promise<void> {
	const current = await getDoc(docRef(uid, id));
	if (!current.exists()) return;
	const prev = fromDoc(current, uid);
	await deleteDoc(docRef(uid, id));
	await updateCounters(uid, {
		entryDelta: -1,
		wordDelta: -prev.wordCount,
		entryDate: prev.entryDate,
	});
	await incrementTagCounts(uid, prev.tags, -1);
}

export async function getEntry(uid: string, id: string): Promise<JournalEntry | null> {
	const snap = await getDoc(docRef(uid, id));
	if (!snap.exists()) return null;
	return fromDoc(snap, uid);
}

export interface ListOptions extends Partial<EntryFilter> {
	limitN?: number;
	startAfterDoc?: DocumentSnapshot;
}

export async function listEntries(
	uid: string,
	options: ListOptions = {},
): Promise<{ entries: JournalEntry[]; lastDoc: DocumentSnapshot | null }> {
	const {
		limitN = 50,
		journalType,
		mood,
		favorite,
		pinned,
		startDate,
		endDate,
		sort = "entryDate",
		order = "desc",
		startAfterDoc,
	} = options;

	const constraints = [];
	if (journalType && journalType !== "all")
		constraints.push(where("journalType", "==", journalType));
	if (mood && mood !== "all") constraints.push(where("mood", "==", mood));
	if (favorite) constraints.push(where("favorite", "==", true));
	if (pinned) constraints.push(where("pinned", "==", true));
	if (startDate) constraints.push(where("entryDate", ">=", startDate));
	if (endDate) constraints.push(where("entryDate", "<=", endDate));

	const orderField = sort === "title" ? "title" : sort;
	const q = query(
		col(uid),
		...constraints,
		orderBy(orderField, order),
		limit(limitN),
		...(startAfterDoc ? [startAfter(startAfterDoc)] : []),
	);

	const snap = await getDocs(q);
	const entries = snap.docs.map((d) => fromDoc(d, uid));
	const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
	return { entries, lastDoc };
}

export function onRecentEntries(
	uid: string,
	limitN: number,
	cb: (entries: JournalEntry[]) => void,
): () => void {
	const q = query(col(uid), orderBy("entryDate", "desc"), limit(limitN));
	return onSnapshot(
		q,
		(snap) => {
			cb(snap.docs.map((d) => fromDoc(d, uid)));
		},
		(err) => console.error("entry listener error", err),
	);
}

export function onPinnedEntries(uid: string, cb: (entries: JournalEntry[]) => void): () => void {
	const q = query(col(uid), where("pinned", "==", true), orderBy("updatedAt", "desc"), limit(20));
	return onSnapshot(
		q,
		(snap) => cb(snap.docs.map((d) => fromDoc(d, uid))),
		(err) => console.error("pinned listener error", err),
	);
}

export function onFavoriteEntries(uid: string, cb: (entries: JournalEntry[]) => void): () => void {
	const q = query(col(uid), where("favorite", "==", true), orderBy("entryDate", "desc"), limit(50));
	return onSnapshot(
		q,
		(snap) => cb(snap.docs.map((d) => fromDoc(d, uid))),
		(err) => console.error("fav listener error", err),
	);
}

export function onAllEntries(uid: string, cb: (entries: JournalEntry[]) => void): () => void {
	const q = query(col(uid), orderBy("entryDate", "desc"), limit(500));
	return onSnapshot(
		q,
		(snap) => cb(snap.docs.map((d) => fromDoc(d, uid))),
		(err) => console.error("all entries listener error", err),
	);
}

async function updateCounters(
	uid: string,
	patch: {
		entryDelta?: number;
		wordDelta?: number;
		entryDate?: string;
		lastDate?: string;
	},
): Promise<void> {
	const ref = doc(getDb(), "users", uid, "counters", "stats");
	const snap = await getDoc(ref);
	const cur = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
	const next: Record<string, unknown> = {
		...cur,
		totalEntries: Math.max(0, Number(cur.totalEntries ?? 0) + (patch.entryDelta ?? 0)),
		totalWords: Math.max(0, Number(cur.totalWords ?? 0) + (patch.wordDelta ?? 0)),
		updatedAt: serverTimestamp(),
	};
	if (patch.lastDate) next.lastEntryDate = patch.lastDate;
	await setDoc(ref, next, { merge: true });
}

async function incrementTagCounts(uid: string, tags: string[], delta: 1 | -1 = 1): Promise<void> {
	if (!tags.length) return;
	const db = getDb();
	const { writeBatch } = await import("firebase/firestore");
	const snap = await getTags(uid);
	const byName = new Map(snap.map((t) => [t.name.toLowerCase(), t]));
	const batch = writeBatch(db);
	for (const name of tags) {
		const existing = byName.get(name.toLowerCase());
		if (existing) {
			batch.update(doc(db, "users", uid, "tags", existing.id), {
				count: Math.max(0, existing.count + delta),
			});
		} else if (delta > 0) {
			const id = name.toLowerCase().replace(/\s+/g, "-");
			batch.set(doc(db, "users", uid, "tags", id), {
				userId: uid,
				name,
				color: "#b45309",
				count: 1,
				createdAt: serverTimestamp(),
			});
		}
	}
	await batch.commit();
}

export async function getTags(uid: string): Promise<import("@/types/journal").Tag[]> {
	const db = getDb();
	const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
	const q = query(collection(db, "users", uid, "tags"), orderBy("name", "asc"));
	const snap = await getDocs(q);
	return snap.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			userId: uid,
			name: (data.name as string) ?? d.id,
			color: (data.color as string) ?? "#b45309",
			count: Number(data.count ?? 0),
			createdAt: toIso(data.createdAt),
		};
	});
}
