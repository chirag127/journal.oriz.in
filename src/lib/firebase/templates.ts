import {
	collection,
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
} from "firebase/firestore";
import { BUILT_IN_TEMPLATES } from "@/lib/constants";
import { now } from "@/lib/utils/date";
import { newId } from "@/lib/utils/export";
import type { JournalTemplate } from "@/types/journal";
import { getDb } from "./client";

const col = (uid: string) => collection(getDb(), "users", uid, "templates");
const docRef = (uid: string, id: string) => doc(getDb(), "users", uid, "templates", id);

function fromDoc(
	snap: import("firebase/firestore").DocumentSnapshot,
	userId: string,
): JournalTemplate {
	const d = snap.data() ?? {};
	return {
		id: snap.id,
		userId,
		name: (d.name as string) ?? "",
		description: (d.description as string) ?? "",
		content: (d.content as string) ?? "",
		isBuiltIn: Boolean(d.isBuiltIn),
		journalType: (d.journalType as JournalTemplate["journalType"]) ?? "daily",
		createdAt: (d.createdAt as string) ?? now(),
		updatedAt: (d.updatedAt as string) ?? now(),
	};
}

export async function seedBuiltInTemplates(uid: string): Promise<void> {
	const db = getDb();
	const existing = await getDocs(query(col(uid), limit(1)));
	if (!existing.empty) return;
	const batch = await import("firebase/firestore").then((m) => m.writeBatch(db));
	for (const t of BUILT_IN_TEMPLATES) {
		const ref = doc(db, "users", uid, "templates", t.id);
		batch.set(ref, {
			userId: uid,
			name: t.name,
			description: t.description,
			content: t.content,
			isBuiltIn: true,
			journalType: t.journalType,
			createdAt: now(),
			updatedAt: now(),
		});
	}
	await batch.commit();
}

export async function listTemplates(uid: string): Promise<JournalTemplate[]> {
	const q = query(col(uid), orderBy("isBuiltIn", "desc"), orderBy("name", "asc"));
	const snap = await getDocs(q);
	return snap.docs.map((d) => fromDoc(d, uid));
}

export function onTemplates(uid: string, cb: (templates: JournalTemplate[]) => void): () => void {
	const q = query(col(uid), orderBy("isBuiltIn", "desc"), orderBy("name", "asc"));
	return onSnapshot(q, (snap) => cb(snap.docs.map((d) => fromDoc(d, uid))));
}

export async function getTemplate(uid: string, id: string): Promise<JournalTemplate | null> {
	const snap = await getDoc(docRef(uid, id));
	if (!snap.exists()) return null;
	return fromDoc(snap, uid);
}

export async function createTemplate(
	uid: string,
	data: Omit<JournalTemplate, "id" | "userId" | "createdAt" | "updatedAt" | "isBuiltIn">,
): Promise<JournalTemplate> {
	const id = newId();
	const template: JournalTemplate = {
		id,
		userId: uid,
		...data,
		isBuiltIn: false,
		createdAt: now(),
		updatedAt: now(),
	};
	await setDoc(docRef(uid, id), {
		...template,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return template;
}

export async function updateTemplate(
	uid: string,
	id: string,
	patch: Partial<Omit<JournalTemplate, "id" | "userId" | "createdAt" | "isBuiltIn">>,
): Promise<void> {
	await setDoc(docRef(uid, id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteTemplate(uid: string, id: string): Promise<void> {
	const snap = await getDoc(docRef(uid, id));
	if (!snap.exists()) return;
	if (snap.data()?.isBuiltIn) return; // protect built-ins
	await deleteDoc(docRef(uid, id));
}
