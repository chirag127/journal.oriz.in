import { MOODS, type MoodValue } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

interface MoodPickerProps {
	value: MoodValue | null;
	intensity?: number | null;
	onChange: (mood: MoodValue | null, intensity?: number | null) => void;
	size?: "sm" | "md" | "lg";
	showIntensity?: boolean;
	layout?: "row" | "grid";
}

export function MoodPicker({
	value,
	intensity,
	onChange,
	size = "md",
	showIntensity = false,
	layout = "row",
}: MoodPickerProps) {
	const dims = {
		sm: { btn: "h-9 w-9 text-lg", label: "text-[10px]" },
		md: { btn: "h-11 w-11 text-xl", label: "text-xs" },
		lg: { btn: "h-14 w-14 text-2xl", label: "text-sm" },
	}[size];

	return (
		<div className="space-y-3">
			<div
				className={cn("gap-1.5", layout === "row" ? "flex flex-wrap" : "grid grid-cols-5 gap-2")}
			>
				{MOODS.map((m) => {
					const selected = value === m.value;
					return (
						<button
							key={m.value}
							type="button"
							onClick={() => onChange(selected ? null : (m.value as MoodValue), intensity ?? 3)}
							className={cn(
								"group flex flex-col items-center gap-1 rounded-md border bg-bg-elevated px-2 py-2 transition-all",
								dims.btn,
								selected
									? "border-accent ring-2 ring-accent/20"
									: "border-border hover:border-fg-muted",
							)}
							aria-pressed={selected}
							aria-label={m.label}
							title={m.label}
						>
							<span className="leading-none">{m.emoji}</span>
							<span className={cn("text-fg-muted group-hover:text-fg", dims.label)}>{m.label}</span>
						</button>
					);
				})}
			</div>
			{showIntensity && value != null && (
				<div className="space-y-1.5">
					<div className="flex items-center justify-between text-xs text-fg-muted">
						<span>Intensity</span>
						<span className="font-mono">{intensity ?? 3}/5</span>
					</div>
					<input
						type="range"
						min={1}
						max={5}
						step={1}
						value={intensity ?? 3}
						onChange={(e) => onChange(value, Number(e.target.value))}
						className="w-full accent-accent"
					/>
				</div>
			)}
		</div>
	);
}
