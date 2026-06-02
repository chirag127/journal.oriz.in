import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEMES, type ThemeValue } from "@/lib/constants";
import { useApplyTheme } from "@/lib/hooks/useTheme";
import { useThemeStore } from "@/stores/themeStore";

const icons: Record<ThemeValue, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
	const theme = useThemeStore((s) => s.theme);
	const setTheme = useThemeStore((s) => s.setTheme);
	useApplyTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="inline-flex h-9 w-32 items-center gap-1 rounded-md border border-border bg-bg-elevated p-1" />
		);
	}

	return (
		<div className="inline-flex h-9 items-center gap-0.5 rounded-md border border-border bg-bg-elevated p-1">
			{THEMES.map((t) => {
				const Icon = icons[t.value];
				const active = theme === t.value;
				return (
					<button
						key={t.value}
						type="button"
						onClick={() => setTheme(t.value)}
						className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors ${
							active
								? "bg-accent text-accent-fg"
								: "text-fg-muted hover:text-fg hover:bg-paper-sunken"
						}`}
						aria-label={t.label}
						title={t.label}
					>
						<Icon size={14} />
					</button>
				);
			})}
		</div>
	);
}
