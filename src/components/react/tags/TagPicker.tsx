import { Hash, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Tag } from "@/types/journal";

interface TagPickerProps {
	available: Tag[];
	selected: string[];
	onChange: (tags: string[]) => void;
	max?: number;
	placeholder?: string;
}

export function TagPicker({
	available,
	selected,
	onChange,
	max = 12,
	placeholder = "Add tag…",
}: TagPickerProps) {
	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (!ref.current) return;
			if (!ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, []);

	const trimmed = input.trim().toLowerCase();
	const suggestions = available
		.filter((t) => !selected.includes(t.name) && t.name.toLowerCase().includes(trimmed))
		.slice(0, 8);

	function add(name: string) {
		const clean = name.trim().toLowerCase();
		if (!clean || selected.includes(clean) || selected.length >= max) return;
		onChange([...selected, clean]);
		setInput("");
	}

	function remove(t: string) {
		onChange(selected.filter((s) => s !== t));
	}

	return (
		<div ref={ref} className="space-y-2">
			<div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-bg-elevated p-1.5">
				{selected.map((t) => (
					<span
						key={t}
						className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs text-accent"
					>
						<Hash size={10} />
						{t}
						<button
							type="button"
							onClick={() => remove(t)}
							className="ml-0.5 rounded-sm opacity-70 hover:bg-accent/20 hover:opacity-100"
							aria-label={`Remove ${t}`}
						>
							<X size={11} />
						</button>
					</span>
				))}
				<input
					type="text"
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === ",") {
							e.preventDefault();
							add(input);
						} else if (e.key === "Backspace" && !input && selected.length) {
							remove(selected[selected.length - 1]);
						}
					}}
					placeholder={selected.length ? "" : placeholder}
					className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-fg-muted"
				/>
			</div>
			{open && (suggestions.length > 0 || input.trim()) && (
				<div className="rounded-md border border-border bg-bg-elevated p-1 shadow-md">
					{suggestions.map((s) => (
						<button
							key={s.id}
							type="button"
							onClick={() => add(s.name)}
							className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-paper-sunken"
						>
							<span className="inline-flex items-center gap-1.5">
								<Hash size={12} className="text-fg-muted" /> {s.name}
							</span>
							<span className="text-xs text-fg-muted">{s.count}</span>
						</button>
					))}
					{input.trim() && !suggestions.find((s) => s.name.toLowerCase() === trimmed) && (
						<button
							type="button"
							onClick={() => add(input)}
							className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm text-accent hover:bg-paper-sunken"
						>
							<Plus size={12} /> Create "{input.trim().toLowerCase()}"
						</button>
					)}
				</div>
			)}
		</div>
	);
}
