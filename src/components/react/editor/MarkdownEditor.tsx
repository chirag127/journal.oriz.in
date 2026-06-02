import {
	Bold,
	CheckSquare,
	Code,
	Columns,
	Edit3,
	Eye,
	Heading2,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Maximize2,
	Minimize2,
	Quote,
	Table,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils/cn";
import { countWords, readingTimeMinutes, renderMarkdown } from "@/lib/utils/markdown";
import { type EditorMode, useEditorStore } from "@/stores/editorStore";

interface MarkdownEditorProps {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder,
	className = "",
	autoFocus,
}: MarkdownEditorProps) {
	const mode = useEditorStore((s) => s.mode);
	const setMode = useEditorStore((s) => s.setMode);
	const fullscreen = useEditorStore((s) => s.fullscreen);
	const toggleFullscreen = useEditorStore((s) => s.toggleFullscreen);
	const setFullscreen = useEditorStore((s) => s.setFullscreen);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [stats, setStats] = useState({ words: 0, minutes: 0 });

	const html = useMemo(() => (mode !== "write" ? renderMarkdown(value) : ""), [value, mode]);

	useEffect(() => {
		setStats({ words: countWords(value), minutes: readingTimeMinutes(value) });
	}, [value]);

	function applyWrap(before: string, after: string = before, placeholderText = "text") {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const sel = value.slice(start, end) || placeholderText;
		const next = value.slice(0, start) + before + sel + after + value.slice(end);
		onChange(next);
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(start + before.length, start + before.length + sel.length);
		});
	}

	function applyLine(prefix: string) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const lineStart = value.lastIndexOf("\n", start - 1) + 1;
		const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
		onChange(next);
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(start + prefix.length, start + prefix.length);
		});
	}

	function applyLink() {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const sel = value.slice(start, end) || "text";
		const inserted = `[${sel}](url)`;
		const next = value.slice(0, start) + inserted + value.slice(end);
		onChange(next);
		requestAnimationFrame(() => {
			ta.focus();
			const urlStart = start + inserted.indexOf("url");
			ta.setSelectionRange(urlStart, urlStart + 3);
		});
	}

	useKeyboardShortcut("mod+b", () => applyWrap("**"), { allowInInputs: true });
	useKeyboardShortcut("mod+i", () => applyWrap("_"), { allowInInputs: true });
	useKeyboardShortcut("mod+k", () => applyLink(), { allowInInputs: true });
	useKeyboardShortcut("mod+shift+f", () => toggleFullscreen(), { allowInInputs: true });
	useKeyboardShortcut(
		"mod+.",
		() => {
			const order: EditorMode[] = ["write", "split", "preview"];
			const i = order.indexOf(mode);
			setMode(order[(i + 1) % order.length]);
		},
		{ allowInInputs: true },
	);

	useEffect(() => {
		function onEsc(e: KeyboardEvent) {
			if (e.key === "Escape" && fullscreen) {
				setFullscreen(false);
			}
		}
		window.addEventListener("keydown", onEsc);
		return () => window.removeEventListener("keydown", onEsc);
	}, [fullscreen, setFullscreen]);

	return (
		<div
			className={cn(
				"flex flex-col rounded-lg border border-border bg-bg-elevated",
				fullscreen && "fixed inset-3 z-50 shadow-2xl",
				className,
			)}
		>
			<Toolbar
				mode={mode}
				onMode={setMode}
				fullscreen={fullscreen}
				onFullscreen={toggleFullscreen}
				onAction={(a) => {
					switch (a) {
						case "bold":
							applyWrap("**");
							break;
						case "italic":
							applyWrap("_");
							break;
						case "h2":
							applyLine("## ");
							break;
						case "list":
							applyLine("- ");
							break;
						case "ordered":
							applyLine("1. ");
							break;
						case "quote":
							applyLine("> ");
							break;
						case "code":
							applyWrap("`");
							break;
						case "link":
							applyLink();
							break;
						case "table":
							applyWrap("\n| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |\n", "", "");
							break;
						case "checklist":
							applyLine("- [ ] ");
							break;
					}
				}}
			/>
			<div
				className={cn(
					"grid min-h-0 flex-1",
					mode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
				)}
			>
				{(mode === "write" || mode === "split") && (
					<textarea
						ref={textareaRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={placeholder || "Start writing…"}
						// biome-ignore lint/a11y/noAutofocus: editor autofocus is the primary affordance for the writing flow
						autoFocus={autoFocus}
						spellCheck
						className={cn(
							"scrollbar-thin w-full resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed text-fg outline-none placeholder:text-fg-subtle",
							fullscreen ? "min-h-[calc(100vh-180px)]" : "min-h-[60vh]",
							mode === "split" && "md:border-r md:border-border",
						)}
					/>
				)}
				{(mode === "preview" || mode === "split") && (
					<div className="scrollbar-thin overflow-y-auto p-6">
						{value.trim() ? (
							<div className="prose-journal" dangerouslySetInnerHTML={{ __html: html }} />
						) : (
							<p className="text-sm italic text-fg-muted">Nothing to preview yet.</p>
						)}
					</div>
				)}
			</div>
			<div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-fg-muted">
				<span className="font-mono">
					{stats.words} {stats.words === 1 ? "word" : "words"} ·{" "}
					{Math.max(1, Math.ceil(stats.minutes))} min read
				</span>
				<span className="font-mono uppercase tracking-wider">{mode} · ⌘. to cycle</span>
			</div>
		</div>
	);
}

function Toolbar({
	mode,
	onMode,
	fullscreen,
	onFullscreen,
	onAction,
}: {
	mode: EditorMode;
	onMode: (m: EditorMode) => void;
	fullscreen: boolean;
	onFullscreen: () => void;
	onAction: (a: string) => void;
}) {
	const tools = [
		{ id: "bold", label: "Bold ⌘B", Icon: Bold },
		{ id: "italic", label: "Italic ⌘I", Icon: Italic },
		{ id: "h2", label: "Heading", Icon: Heading2 },
		{ id: "list", label: "Bullet list", Icon: List },
		{ id: "ordered", label: "Numbered list", Icon: ListOrdered },
		{ id: "quote", label: "Quote", Icon: Quote },
		{ id: "code", label: "Inline code", Icon: Code },
		{ id: "link", label: "Link ⌘K", Icon: LinkIcon },
		{ id: "table", label: "Table", Icon: Table },
		{ id: "checklist", label: "Checklist", Icon: CheckSquare },
	] as const;
	return (
		<div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
			{tools.map(({ id, label, Icon }) => (
				<button
					key={id}
					type="button"
					onClick={() => onAction(id)}
					title={label}
					aria-label={label}
					className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-paper-sunken hover:text-fg"
				>
					<Icon size={14} />
				</button>
			))}
			<div className="mx-1 h-5 w-px bg-border" />
			<div className="inline-flex h-7 items-center gap-0.5 rounded bg-paper-sunken p-0.5">
				{(["write", "split", "preview"] as const).map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => onMode(m)}
						className={cn(
							"inline-flex h-6 items-center gap-1 rounded px-1.5 text-xs",
							mode === m ? "bg-bg-elevated text-fg shadow-sm" : "text-fg-muted hover:text-fg",
						)}
						aria-label={m}
					>
						{m === "write" && <Edit3 size={11} />}
						{m === "split" && <Columns size={11} />}
						{m === "preview" && <Eye size={11} />}
						<span className="capitalize">{m}</span>
					</button>
				))}
			</div>
			<div className="ml-auto flex items-center gap-0.5">
				<button
					type="button"
					onClick={onFullscreen}
					className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-paper-sunken hover:text-fg"
					aria-label="Toggle fullscreen"
					title="Fullscreen ⌘⇧F"
				>
					{fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
				</button>
			</div>
		</div>
	);
}
