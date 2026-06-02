import { useCallback, useEffect, useState } from "react";
import { createGoal, deleteGoal, onGoals, updateGoal } from "@/lib/firebase/goals";
import {
	createTemplate,
	deleteTemplate,
	onTemplates,
	updateTemplate,
} from "@/lib/firebase/templates";
import type { Goal, JournalTemplate } from "@/types/journal";

export function useGoals(uid: string | null) {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!uid) {
			setGoals([]);
			setReady(true);
			return;
		}
		setReady(false);
		const unsub = onGoals(uid, (g) => {
			setGoals(g);
			setReady(true);
		});
		return unsub;
	}, [uid]);

	const create = useCallback(
		async (data: Parameters<typeof createGoal>[1]) => {
			if (!uid) throw new Error("Not authenticated");
			return createGoal(uid, data);
		},
		[uid],
	);

	const update = useCallback(
		async (id: string, patch: Partial<Goal>) => {
			if (!uid) throw new Error("Not authenticated");
			await updateGoal(uid, id, patch);
		},
		[uid],
	);

	const remove = useCallback(
		async (id: string) => {
			if (!uid) throw new Error("Not authenticated");
			await deleteGoal(uid, id);
		},
		[uid],
	);

	return { goals, create, update, remove, ready };
}

export function useTemplates(uid: string | null) {
	const [templates, setTemplates] = useState<JournalTemplate[]>([]);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!uid) {
			setTemplates([]);
			setReady(true);
			return;
		}
		setReady(false);
		const unsub = onTemplates(uid, (t) => {
			setTemplates(t);
			setReady(true);
		});
		return unsub;
	}, [uid]);

	const create = useCallback(
		async (data: Parameters<typeof createTemplate>[1]) => {
			if (!uid) throw new Error("Not authenticated");
			return createTemplate(uid, data);
		},
		[uid],
	);

	const update = useCallback(
		async (id: string, patch: Parameters<typeof updateTemplate>[2]) => {
			if (!uid) throw new Error("Not authenticated");
			await updateTemplate(uid, id, patch);
		},
		[uid],
	);

	const remove = useCallback(
		async (id: string) => {
			if (!uid) throw new Error("Not authenticated");
			await deleteTemplate(uid, id);
		},
		[uid],
	);

	return { templates, create, update, remove, ready };
}
