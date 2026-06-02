import {
	BookMarked,
	BookOpen,
	Briefcase,
	Dumbbell,
	FlaskConical,
	GraduationCap,
	Heart,
	Moon,
	Plane,
	Sparkles,
} from "lucide-react";
import { JOURNAL_TYPES, type JournalType } from "@/lib/constants";

const ICON_MAP = {
	daily: BookOpen,
	gratitude: Heart,
	learning: GraduationCap,
	reading: BookMarked,
	travel: Plane,
	work: Briefcase,
	fitness: Dumbbell,
	dream: Moon,
	research: FlaskConical,
	reflection: Sparkles,
};

interface JournalTypeSelectProps {
	value: JournalType;
	onChange: (v: JournalType) => void;
}

export function JournalTypeSelect({ value, onChange }: JournalTypeSelectProps) {
	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
			{JOURNAL_TYPES.map((t) => {
				const Icon = ICON_MAP[t.value as keyof typeof ICON_MAP];
				const active = value === t.value;
				return (
					<button
						key={t.value}
						type="button"
						onClick={() => onChange(t.value as JournalType)}
						className={`flex items-start gap-2.5 rounded-md border p-3 text-left transition-colors ${
							active
								? "border-accent bg-accent/5 ring-1 ring-accent/20"
								: "border-border bg-bg-elevated hover:border-fg-muted"
						}`}
					>
						<Icon size={16} className={active ? "text-accent" : "text-fg-muted"} />
						<div className="min-w-0">
							<p className="text-sm font-medium">{t.label}</p>
							<p className="truncate text-[10px] text-fg-muted">{t.description}</p>
						</div>
					</button>
				);
			})}
		</div>
	);
}
