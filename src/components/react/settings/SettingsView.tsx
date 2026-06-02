import { Button } from "@components/react/ui/Button";
import { Field, Input, Select } from "@components/react/ui/Field";
import { Modal } from "@components/react/ui/Modal";
import { toast } from "@components/react/ui/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Bell,
	Check,
	Download,
	Eye,
	FileCode,
	FileJson,
	FileText,
	Globe,
	Loader2,
	Palette,
	Trash2,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { JOURNAL_TYPES, MOODS, THEMES } from "@/lib/constants";
import { signOut } from "@/lib/firebase/auth";
import { createEntry } from "@/lib/firebase/entries";
import { deleteUserAccountData } from "@/lib/firebase/user";
import { useEntries } from "@/lib/hooks/useEntries";
import { useSettings } from "@/lib/hooks/useSettings";
import { settingsSchema } from "@/lib/schemas";
import { downloadBlob, exportAll } from "@/lib/utils/export";
import { dedupeByContentHash, importFromFile, previewEntries } from "@/lib/utils/import";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import type { JournalEntry, UserSettings } from "@/types/journal";

type FormData = z.infer<typeof settingsSchema>;

const ACCENT_COLORS = [
	{ name: "Sienna", value: "#b45309" },
	{ name: "Forest", value: "#15803d" },
	{ name: "Teal", value: "#0f766e" },
	{ name: "Indigo", value: "#4338ca" },
	{ name: "Plum", value: "#7c3aed" },
	{ name: "Rose", value: "#be123c" },
];

export function SettingsView() {
	const uid = useAuthStore((s) => s.uid);
	const { settings, update } = useSettings(uid);
	const theme = useThemeStore((s) => s.theme);
	const setTheme = useThemeStore((s) => s.setTheme);
	const resolved = useThemeStore((s) => s.resolved);
	const { allLoaded } = useEntries(uid);
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		watch,
	} = useForm<FormData>({
		resolver: zodResolver(settingsSchema) as never,
		defaultValues: settings as FormData,
		values: settings as FormData,
	});
	const [importing, setImporting] = useState(false);
	const [importPreview, setImportPreview] = useState<{
		entries: JournalEntry[];
		counts: { new: number; existing: number; total: number };
	} | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const fileRef = useRef<HTMLInputElement | null>(null);

	const accent = watch("accentColor");

	async function onSubmit(data: FormData) {
		await update(data as Partial<UserSettings>);
		toast({ message: "Settings saved", variant: "success" });
	}

	async function doExport(format: "json" | "markdown" | "txt" | "zip") {
		try {
			let result: { filename: string; blob: Blob };
			if (format === "json") {
				result = await exportAll(allLoaded, "json");
			} else if (format === "markdown") {
				result = await exportAll(allLoaded, "markdown");
			} else if (format === "txt") {
				result = await exportAll(allLoaded, "text");
			} else {
				result = await exportAll(allLoaded, "markdown");
			}
			downloadBlob(result.blob, result.filename);
			toast({ message: `Exported as ${format.toUpperCase()}`, variant: "success" });
		} catch (e) {
			toast({ message: "Export failed", variant: "error" });
		}
	}

	async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file || !uid) return;
		setImporting(true);
		try {
			const { entries } = await importFromFile(file, uid);
			const deduped = dedupeByContentHash(entries);
			previewEntries(deduped);
			setImportPreview({
				entries: deduped,
				counts: {
					new: deduped.length,
					existing: entries.length - deduped.length,
					total: entries.length,
				},
			});
		} catch (e) {
			toast({ message: "Could not parse file", variant: "error" });
		} finally {
			setImporting(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}

	async function onConfirmImport() {
		if (!importPreview || !uid) return;
		try {
			let imported = 0;
			for (const e of importPreview.entries) {
				await createEntry(uid, {
					title: e.title,
					content: e.content,
					mood: e.mood,
					moodIntensity: e.moodIntensity,
					tags: e.tags,
					journalType: e.journalType,
					entryDate: e.entryDate,
					favorite: e.favorite,
					pinned: e.pinned,
					isDraft: e.isDraft,
					location: e.location,
					weather: e.weather,
				});
				imported++;
			}
			toast({ message: `Imported ${imported} entries`, variant: "success" });
			setImportPreview(null);
		} catch (e) {
			toast({ message: "Import failed", variant: "error" });
		}
	}

	async function onDeleteAccount() {
		if (!uid) return;
		setDeleting(true);
		try {
			await deleteUserAccountData(uid);
			await signOut();
			toast({ message: "Account deleted", variant: "info" });
		} catch (e) {
			toast({ message: "Could not delete account", variant: "error" });
			setDeleting(false);
		}
	}

	return (
		<div className="space-y-8">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Settings</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Tune your journal</h1>
			</header>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<section className="space-y-4 rounded-xl border border-border bg-bg-elevated p-5">
					<h2 className="font-display text-lg tracking-tight">Appearance</h2>
					<Field label="Theme" htmlFor="theme">
						<div className="grid grid-cols-3 gap-2">
							{THEMES.map((t) => (
								<button
									key={t.value}
									type="button"
									onClick={() => setTheme(t.value as "light" | "dark" | "system")}
									className={`flex flex-col items-center gap-1 rounded-md border p-3 text-xs ${theme === t.value ? "border-accent bg-accent/5" : "border-border"}`}
								>
									{t.value === "light" && <Palette size={16} />}
									{t.value === "dark" && <Eye size={16} />}
									{t.value === "system" && <Globe size={16} />}
									{t.label}
								</button>
							))}
						</div>
						<p className="text-xs text-fg-muted">Currently: {resolved}</p>
					</Field>
					<Field label="Accent color">
						<div className="flex flex-wrap gap-2">
							{ACCENT_COLORS.map((c) => (
								<button
									key={c.value}
									type="button"
									onClick={() => update({ accentColor: c.value })}
									className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs"
									title={c.name}
								>
									<span className="h-4 w-4 rounded-full" style={{ background: c.value }} />
									{c.name}
									{accent === c.value && <Check size={12} className="text-accent" />}
								</button>
							))}
						</div>
					</Field>
					<Field label="Font" htmlFor="font">
						<Select id="font" {...register("font")}>
							<option value="serif">Serif (Fraunces)</option>
							<option value="sans">Sans (Inter)</option>
							<option value="system">System</option>
						</Select>
					</Field>
					<Field label="Week starts on" htmlFor="weekStart">
						<Select
							id="weekStart"
							{...register("weekStart", { setValueAs: (v) => Number(v) as 0 | 1 })}
						>
							<option value={0}>Sunday</option>
							<option value={1}>Monday</option>
						</Select>
					</Field>
				</section>

				<section className="space-y-4 rounded-xl border border-border bg-bg-elevated p-5">
					<h2 className="font-display text-lg tracking-tight">Defaults</h2>
					<div className="grid grid-cols-2 gap-3">
						<Field label="Default journal type" htmlFor="djt">
							<Select id="djt" {...register("defaultJournalType")}>
								{JOURNAL_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</Select>
						</Field>
						<Field label="Default mood" htmlFor="dm">
							<Select id="dm" {...register("defaultMood")}>
								<option value="">None</option>
								{MOODS.map((m) => (
									<option key={m.value} value={m.value}>
										{m.emoji} {m.label}
									</option>
								))}
							</Select>
						</Field>
					</div>
				</section>

				<section className="space-y-4 rounded-xl border border-border bg-bg-elevated p-5">
					<h2 className="flex items-center gap-2 font-display text-lg tracking-tight">
						<Bell size={16} /> Reminders
					</h2>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							{...register("notifications.dailyReminder")}
							className="h-4 w-4 rounded border-border accent-accent"
						/>
						Daily reminder
					</label>
					<Field label="Reminder time" htmlFor="rt" optional>
						<Input
							id="rt"
							type="time"
							{...register("notifications.reminderTime")}
							className="w-32"
						/>
					</Field>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							{...register("notifications.weeklyDigest")}
							className="h-4 w-4 rounded border-border accent-accent"
						/>
						Weekly digest
					</label>
				</section>

				<div className="flex justify-end">
					<Button type="submit" loading={isSubmitting}>
						Save settings
					</Button>
				</div>
			</form>

			<section className="space-y-4 rounded-xl border border-border bg-bg-elevated p-5">
				<h2 className="flex items-center gap-2 font-display text-lg tracking-tight">
					<Download size={16} /> Export
				</h2>
				<p className="text-sm text-fg-muted">
					Download your journal as a backup. Your data is yours.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						leading={<FileCode size={14} />}
						onClick={() => doExport("zip")}
					>
						Export ZIP (all)
					</Button>
					<Button
						variant="outline"
						leading={<FileJson size={14} />}
						onClick={() => doExport("json")}
					>
						JSON
					</Button>
					<Button
						variant="outline"
						leading={<FileText size={14} />}
						onClick={() => doExport("markdown")}
					>
						Markdown
					</Button>
					<Button
						variant="outline"
						leading={<FileText size={14} />}
						onClick={() => doExport("txt")}
					>
						Plain text
					</Button>
				</div>
			</section>

			<section className="space-y-4 rounded-xl border border-border bg-bg-elevated p-5">
				<h2 className="flex items-center gap-2 font-display text-lg tracking-tight">
					<Upload size={16} /> Import
				</h2>
				<p className="text-sm text-fg-muted">
					Bring entries in from JSON, Markdown, or a previous ZIP export.
				</p>
				<input
					ref={fileRef}
					type="file"
					accept=".json,.md,.markdown,.zip,.txt"
					className="hidden"
					onChange={onPickFile}
				/>
				<Button
					variant="outline"
					leading={
						importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />
					}
					onClick={() => fileRef.current?.click()}
					disabled={importing}
				>
					{importing ? "Parsing…" : "Choose file"}
				</Button>
			</section>

			<section className="space-y-3 rounded-xl border border-danger/30 bg-danger/5 p-5">
				<h2 className="font-display text-lg tracking-tight text-danger">Danger zone</h2>
				<p className="text-sm text-fg-muted">
					Permanently delete your account and all entries. Cannot be undone.
				</p>
				<Button
					variant="danger"
					leading={<Trash2 size={14} />}
					onClick={() => setConfirmDelete(true)}
				>
					Delete account
				</Button>
			</section>

			<Modal
				open={!!importPreview}
				onClose={() => setImportPreview(null)}
				title="Preview import"
				description={`${importPreview?.counts.new ?? 0} new, ${importPreview?.counts.existing ?? 0} duplicates`}
				size="xl"
			>
				{importPreview && (
					<div className="space-y-3">
						<p className="text-sm text-fg-muted">
							First {Math.min(5, importPreview.entries.length)} of {importPreview.entries.length}:
						</p>
						<ul className="max-h-64 space-y-1 overflow-y-auto">
							{importPreview.entries.slice(0, 5).map((e, i) => (
								<li key={i} className="rounded-md border border-border p-2 text-sm">
									<p className="font-medium">{e.title || "Untitled"}</p>
									<p className="text-xs text-fg-muted">
										{e.entryDate} · {e.journalType}
									</p>
								</li>
							))}
						</ul>
						<div className="flex justify-end gap-2">
							<Button variant="ghost" onClick={() => setImportPreview(null)}>
								Cancel
							</Button>
							<Button variant="primary" onClick={onConfirmImport}>
								Import
							</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal
				open={confirmDelete}
				onClose={() => setConfirmDelete(false)}
				title="Delete account?"
				description="All entries, templates, tags, and goals will be permanently deleted."
				size="sm"
			>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={() => setConfirmDelete(false)}>
						Cancel
					</Button>
					<Button
						variant="danger"
						loading={deleting}
						onClick={onDeleteAccount}
						leading={<Trash2 size={14} />}
					>
						Yes, delete everything
					</Button>
				</div>
			</Modal>
		</div>
	);
}
