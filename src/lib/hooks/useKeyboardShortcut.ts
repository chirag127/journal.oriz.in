import { useEffect } from "react";

const SHORTCUTS: Record<string, (e: KeyboardEvent) => void> = {};

export function useKeyboardShortcut(
	combo: string,
	handler: (e: KeyboardEvent) => void,
	options: { enabled?: boolean; allowInInputs?: boolean } = {},
): void {
	const { enabled = true, allowInInputs = false } = options;
	useEffect(() => {
		if (!enabled) return;
		SHORTCUTS[combo] = handler;
		return () => {
			delete SHORTCUTS[combo];
		};
	}, [combo, handler, enabled]);

	useEffect(() => {
		if (!enabled) return;
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const inInput =
				target &&
				(target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
			if (inInput && !allowInInputs) return;

			for (const c of Object.keys(SHORTCUTS)) {
				if (matchCombo(c, e)) {
					e.preventDefault();
					SHORTCUTS[c](e);
					return;
				}
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [enabled, allowInInputs]);
}

function matchCombo(combo: string, e: KeyboardEvent): boolean {
	const parts = combo
		.toLowerCase()
		.split("+")
		.map((p) => p.trim());
	const key = parts[parts.length - 1];
	const wantMod = parts.includes("mod") || parts.includes("cmd") || parts.includes("ctrl");
	const wantShift = parts.includes("shift");
	const wantAlt = parts.includes("alt") || parts.includes("option");

	const modKey = e.metaKey || e.ctrlKey;
	if (wantMod !== modKey) return false;
	if (wantShift !== e.shiftKey) return false;
	if (wantAlt !== e.altKey) return false;

	return e.key.toLowerCase() === key;
}
