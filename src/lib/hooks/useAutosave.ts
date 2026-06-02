import { useCallback, useEffect, useRef, useState } from "react";

interface AutosaveOptions<T> {
	data: T;
	save: (data: T) => Promise<void> | void;
	delay?: number;
	enabled?: boolean;
}

export function useAutosave<T>({ data, save, delay = 5000, enabled = true }: AutosaveOptions<T>) {
	const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
	const initial = useRef(true);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const dataRef = useRef(data);
	dataRef.current = data;

	const doSave = useCallback(async () => {
		if (!enabled) return;
		setStatus("saving");
		try {
			await save(dataRef.current);
			setLastSavedAt(new Date());
			setStatus("saved");
		} catch (e) {
			console.error("autosave error", e);
			setStatus("error");
		}
	}, [save, enabled]);

	useEffect(() => {
		if (!enabled) return;
		if (initial.current) {
			initial.current = false;
			return;
		}
		if (timer.current) clearTimeout(timer.current);
		setStatus("idle");
		timer.current = setTimeout(doSave, delay);
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [data, delay, doSave, enabled]);

	useEffect(() => {
		if (!enabled) return;
		const flush = () => {
			if (timer.current) clearTimeout(timer.current);
			doSave();
		};
		window.addEventListener("beforeunload", flush);
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") flush();
		});
		return () => {
			window.removeEventListener("beforeunload", flush);
		};
	}, [doSave, enabled]);

	return { status, lastSavedAt, save: doSave };
}
