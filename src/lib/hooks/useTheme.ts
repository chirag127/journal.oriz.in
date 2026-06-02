import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function useApplyTheme() {
	const theme = useThemeStore((s) => s.theme);
	const resolved = useThemeStore((s) => s.resolved);
	const setResolved = useThemeStore((s) => s.setResolved);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const root = document.documentElement;
		const apply = (mode: "light" | "dark") => {
			root.setAttribute("data-theme", mode);
			setResolved(mode);
		};
		if (theme === "system") {
			const mql = window.matchMedia("(prefers-color-scheme: dark)");
			apply(mql.matches ? "dark" : "light");
			const onChange = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
			mql.addEventListener("change", onChange);
			root.setAttribute("data-theme", "system");
			return () => mql.removeEventListener("change", onChange);
		}
		apply(theme);
	}, [theme, setResolved]);

	return { theme, resolved };
}
