import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { now } from "@/lib/utils/date";
import { newId } from "@/lib/utils/export";
import type { Goal } from "@/types/journal";
import { getDb } from "./client";

const col = (uid: string) => collection(getDb(), "users", uid, "goals");
const docRef = (uid: string, id: string) => doc(getDb(), "users", uid, "goals", id);

function fromDoc(snap: import("firebase/firestore").DocumentSnapshot, userId: string): Goal {
	const d = snap.data() ?? {};
	return {
		id: snap.id,
		userId,
		title: (d.title as string) ?? "",
		description: (d.description as string) ?? "",
		type: (d.type as Goal["type"]) ?? "count",
		target: Number(d.target ?? 0),
		period: (d.period as Goal["period"]) ?? "daily",
		startDate: (d.startDate as string) ?? now().slice(0, 10),
		endDate: (d.endDate as string | null) ?? null,
		isArchived: Boolean(d.isArchived),
		createdAt: (d.createdAt as string) ?? now(),
		updatedAt: (d.updatedAt as string) ?? now(),
	};
}

export async function listGoals(uid: string): Promise<Goal[]> {
	const q = query(col(uid), orderBy("isArchived", "asc"), orderBy("createdAt", "desc"));
	const snap = await getDocs(q);
	return snap.docs.map((d) => fromDoc(d, uid));
}

export function onGoals(uid: string, cb: (goals: Goal[]) => void): () => void {
	const q = query(col(uid), orderBy("isArchived", "asc"), orderBy("createdAt", "desc"));
	return onSnapshot(q, (snap) => cb(snap.docs.map((d) => fromDoc(d, uid))));
}

export async function createGoal(
	uid: string,
	data: Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt" | "isArchived">,
): Promise<Goal> {
	const id = newId();
	const goal: Goal = {
		id,
		userId: uid,
		...data,
		isArchived: false,
		createdAt: now(),
		updatedAt: now(),
	};
	await setDoc(docRef(uid, id), {
		...goal,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return goal;
}

export async function updateGoal(uid: string, id: string, patch: Partial<Goal>): Promise<void> {
	await setDoc(docRef(uid, id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteGoal(uid: string, id: string): Promise<void> {
	await deleteDoc(docRef(uid, id));
}
