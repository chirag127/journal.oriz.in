import { MarkdownEditor } from "@components/react/editor/MarkdownEditor";
import { JournalTypeSelect } from "@components/react/entries/JournalTypeSelect";
import { MoodPicker } from "@components/react/mood/MoodPicker";
import { TagPicker } from "@components/react/tags/TagPicker";
import { Button } from "@components/react/ui/Button";
import { Field, Input } from "@components/react/ui/Field";
import { Modal } from "@components/react/ui/Modal";
import { Skeleton } from "@components/react/ui/Skeleton";
import { toast } from "@components/react/ui/Toast";
import {
	Calendar,
	Check,
	Cloud,
	CloudOff,
	FileText,
	Loader2,
	MapPin,
	MoreHorizontal,
	Pin,
	Save,
	Star,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { JOURNAL_TYPES } from "@/lib/constants";
import { createEntry, deleteEntry, getEntry, getTags, updateEntry } from "@/lib/firebase/entries";
import { onTemplates } from "@/lib/firebase/templates";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { useLocation } from "@/lib/hooks/useLocation";
import { useWeather } from "@/lib/hooks/useWeather";
import { fmt, today } from "@/lib/utils/date";
import { useAuthStore } from "@/stores/authStore";
import type {
	JournalEntry,
	JournalTemplate,
	JournalType,
	LocationData,
	MoodValue,
	Tag,
	WeatherData,
} from "@/types/journal";
import { useNavigate } from "../router";

interface EntryEditorProps {
	id?: string;
	initialDate?: string;
	initialTemplate?: string;
}

export function EntryEditor({ id, initialDate, initialTemplate }: EntryEditorProps) {
	const uid = useAuthStore((s) => s.uid);
	const nav = useNavigate();
	const [loaded, setLoaded] = useState(!id);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [mood, setMood] = useState<MoodValue | null>(null);
	const [intensity, setIntensity] = useState<number | null>(null);
	const [tags, setTags] = useState<string[]>([]);
	const [journalType, setJournalType] = useState<JournalType>("daily");
	const [entryDate, setEntryDate] = useState<string>(initialDate ?? today());
	const [favorite, setFavorite] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [isDraft, setIsDraft] = useState(false);
	const [location, setLocation] = useState<LocationData | null>(null);
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [templates, setTemplates] = useState<JournalTemplate[]>([]);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showTypePicker, setShowTypePicker] = useState(false);

	const fullEntryRef = useRef<JournalEntry | null>(null);
	const { request } = useLocation();

	const { data: weatherData } = useWeather(
		weather || !location ? {} : { lat: location.lat, lng: location.lng },
	);

	useEffect(() => {
		if (!uid) return;
		getTags(uid)
			.then(setAvailableTags)
			.catch(() => {});
		const unsub = onTemplates(uid, setTemplates);
		return unsub;
	}, [uid]);

	useEffect(() => {
		if (id && uid) {
			getEntry(uid, id)
				.then((e) => {
					if (!e) {
						toast({ message: "Entry not found", variant: "error" });
						nav("/entries");
						return;
					}
					fullEntryRef.current = e;
					setTitle(e.title);
					setContent(e.content);
					setMood(e.mood);
					setIntensity(e.moodIntensity);
					setTags(e.tags);
					setJournalType(e.journalType);
					setEntryDate(e.entryDate);
					setFavorite(e.favorite);
					setPinned(e.pinned);
					setIsDraft(e.isDraft);
					setLocation(e.location);
					setWeather(e.weather);
					setLoaded(true);
				})
				.catch((err) => {
					console.error(err);
					toast({ message: "Couldn't load entry", variant: "error" });
					nav("/entries");
				});
		} else if (initialTemplate && templates.length) {
			const t = templates.find((x) => x.id === initialTemplate);
			if (t) {
				setContent(t.content);
				setJournalType(t.journalType);
			}
		}
	}, [id, uid, initialTemplate, templates, nav]);

	useEffect(() => {
		if (weatherData && !weather) setWeather(weatherData);
	}, [weatherData, weather]);

	const handleSave = async (data: {
		title: string;
		content: string;
		mood: MoodValue | null;
		moodIntensity: number | null;
		tags: string[];
		journalType: JournalType;
		entryDate: string;
		favorite: boolean;
		pinned: boolean;
		isDraft: boolean;
		location: LocationData | null;
		weather: WeatherData | null;
	}) => {
		if (!uid) return;
		if (!data.title.trim() && !data.content.trim()) {
			setIsDraft(true);
			return;
		}
		const titleFinal = data.title.trim() || deriveTitle(data.content);
		if (id) {
			await updateEntry(uid, id, {
				title: titleFinal,
				content: data.content,
				mood: data.mood,
				moodIntensity: data.moodIntensity,
				tags: data.tags,
				journalType: data.journalType,
				entryDate: data.entryDate,
				favorite: data.favorite,
				pinned: data.pinned,
				isDraft: data.isDraft,
				location: data.location,
				weather: data.weather,
			});
		} else {
			const entry = await createEntry(uid, {
				title: titleFinal,
				content: data.content,
				mood: data.mood,
				moodIntensity: data.moodIntensity,
				tags: data.tags,
				journalType: data.journalType,
				entryDate: data.entryDate,
				favorite: data.favorite,
				pinned: data.pinned,
				isDraft: data.isDraft,
				location: data.location,
				weather: data.weather,
			});
			fullEntryRef.current = entry;
			nav(`/entries/${entry.id}`, { replace: true });
		}
	};

	const { status, lastSavedAt } = useAutosave({
		data: {
			title,
			content,
			mood,
			moodIntensity: intensity,
			tags,
			journalType,
			entryDate,
			favorite,
			pinned,
			isDraft,
			location,
			weather,
		},
		save: handleSave,
		delay: 4500,
		enabled: !!uid && loaded,
	});

	useKeyboardShortcut(
		"mod+s",
		(e) => {
			e.preventDefault();
			handleSave({
				title,
				content,
				mood,
				moodIntensity: intensity,
				tags,
				journalType,
				entryDate,
				favorite,
				pinned,
				isDraft,
				location,
				weather,
			}).then(() => toast({ message: "Saved", variant: "success" }));
		},
		{ allowInInputs: true },
	);

	async function onDelete() {
		if (!id || !uid) return;
		try {
			await deleteEntry(uid, id);
			toast({ message: "Entry deleted", variant: "success" });
			nav("/entries");
		} catch (e) {
			toast({ message: "Couldn't delete entry", variant: "error" });
		}
	}

	async function onAttachLocation() {
		try {
			request();
			setTimeout(() => {
				if (typeof navigator !== "undefined" && navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
						() => toast({ message: "Couldn't get location", variant: "error" }),
						{ enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
					);
				}
			}, 0);
		} catch (e) {
			toast({ message: "Couldn't get location", variant: "error" });
		}
	}

	if (!loaded) {
		return (
			<div className="space-y-4">
				<Skeleton h="h-8" w="w-1/3" />
				<Skeleton h="h-12" />
				<Skeleton h="h-[60vh]" />
			</div>
		);
	}

	const typeData = JOURNAL_TYPES.find((j) => j.value === journalType);

	return (
		<div className="space-y-5">
			<header className="flex flex-wrap items-center justify-between gap-y-3 gap-x-3 border-b border-border pb-4">
				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<button
						type="button"
						onClick={() => setShowTypePicker(true)}
						className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-sm hover:border-fg-muted"
					>
						<FileText size={14} className="text-fg-muted" />
						<span className="truncate">{typeData?.label ?? "Journal"}</span>
					</button>
					<SavedBadge status={status} lastSavedAt={lastSavedAt} />
				</div>
				<div className="flex items-center gap-1">
					<IconToggle
						on={favorite}
						onClick={() => setFavorite((f) => !f)}
						icon={Star}
						label="Favorite"
					/>
					<IconToggle on={pinned} onClick={() => setPinned((p) => !p)} icon={Pin} label="Pin" />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowSettings(true)}
						aria-label="More settings"
					>
						<MoreHorizontal size={16} />
					</Button>
					{id && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setConfirmDelete(true)}
							aria-label="Delete"
						>
							<Trash2 size={16} className="text-fg-muted" />
						</Button>
					)}
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							handleSave({
								title,
								content,
								mood,
								moodIntensity: intensity,
								tags,
								journalType,
								entryDate,
								favorite,
								pinned,
								isDraft,
								location,
								weather,
							}).then(() => toast({ message: "Saved", variant: "success" }));
						}}
						leading={<Save size={14} />}
					>
						Save
					</Button>
				</div>
			</header>

			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="A title for your day…"
				className="w-full border-0 bg-transparent font-display text-3xl leading-tight tracking-tight outline-none placeholder:text-fg-subtle sm:text-4xl"
			/>

			<MarkdownEditor
				value={content}
				onChange={setContent}
				placeholder="Begin writing your thoughts…"
				autoFocus={!id}
			/>

			<div className="grid gap-5 lg:grid-cols-3">
				<section className="space-y-3 lg:col-span-2">
					<Field label="Tags">
						<TagPicker available={availableTags} selected={tags} onChange={setTags} />
					</Field>
				</section>
				<aside className="space-y-3">
					<Field label="Mood">
						<MoodPicker
							value={mood}
							intensity={intensity}
							showIntensity
							size="sm"
							onChange={(m, i) => {
								setMood(m);
								setIntensity(i ?? null);
							}}
						/>
					</Field>
					<div className="rounded-md border border-border bg-bg-elevated p-3">
						<div className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-fg-muted">
							Context
						</div>
						<button
							type="button"
							onClick={onAttachLocation}
							className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-paper-sunken"
						>
							<MapPin size={14} className="text-fg-muted" />
							<span className="flex-1 truncate">
								{location
									? (location.label ?? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`)
									: "Attach location"}
							</span>
							{location && (
								<X
									size={12}
									className="text-fg-muted"
									onClick={(e) => {
										e.stopPropagation();
										setLocation(null);
										setWeather(null);
									}}
								/>
							)}
						</button>
						{weather && (
							<div className="mt-1 flex items-center gap-2 px-2 py-1.5 text-sm text-fg-muted">
								<Cloud size={14} />
								<span>{weather.condition}</span>
								<span className="ml-auto font-mono text-xs">{Math.round(weather.temp)}°</span>
							</div>
						)}
						<label className="mt-2 flex items-center gap-2 px-2 py-1.5 text-sm text-fg-muted">
							<Calendar size={14} />
							<span className="flex-1">{fmt.date(entryDate)}</span>
							<input
								type="date"
								value={entryDate}
								onChange={(e) => setEntryDate(e.target.value)}
								className="bg-transparent text-xs text-fg-muted outline-none"
							/>
						</label>
					</div>
					{templates.length > 0 && (
						<details className="rounded-md border border-border bg-bg-elevated p-3">
							<summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-fg-muted">
								Insert template
							</summary>
							<div className="mt-2 space-y-1">
								{templates.map((t) => (
									<button
										key={t.id}
										type="button"
										onClick={() => setContent((c) => (c ? c + "\n\n" + t.content : t.content))}
										className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-paper-sunken"
									>
										{t.name}
									</button>
								))}
							</div>
						</details>
					)}
				</aside>
			</div>

			<Modal
				open={showTypePicker}
				onClose={() => setShowTypePicker(false)}
				title="Journal type"
				description="Choose what kind of entry this is."
				size="xl"
			>
				<JournalTypeSelect
					value={journalType}
					onChange={(v) => {
						setJournalType(v);
						setShowTypePicker(false);
					}}
				/>
			</Modal>

			<Modal
				open={showSettings}
				onClose={() => setShowSettings(false)}
				title="Entry settings"
				size="sm"
			>
				<div className="space-y-3">
					<Field label="Date" htmlFor="entryDate2">
						<Input
							id="entryDate2"
							type="date"
							value={entryDate}
							onChange={(e) => setEntryDate(e.target.value)}
						/>
					</Field>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={isDraft}
							onChange={(e) => setIsDraft(e.target.checked)}
							className="h-4 w-4 rounded border-border accent-accent"
						/>
						Save as draft (won't appear in stats)
					</label>
				</div>
			</Modal>

			<Modal
				open={confirmDelete}
				onClose={() => setConfirmDelete(false)}
				title="Delete this entry?"
				description="This cannot be undone."
				size="sm"
			>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={() => setConfirmDelete(false)}>
						Cancel
					</Button>
					<Button variant="danger" onClick={onDelete} leading={<Trash2 size={14} />}>
						Delete
					</Button>
				</div>
			</Modal>
		</div>
	);
}

function deriveTitle(content: string): string {
	const first = content.split("\n").find((l) => l.trim().length > 0) ?? "";
	return first.replace(/^#+\s*/, "").slice(0, 80);
}

function IconToggle({
	on,
	onClick,
	icon: Icon,
	label,
}: {
	on: boolean;
	onClick: () => void;
	icon: typeof Star;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			aria-pressed={on}
			className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border transition-colors sm:h-9 sm:w-9 ${
				on ? "bg-accent/15 text-accent" : "bg-bg-elevated text-fg-muted hover:text-fg"
			}`}
		>
			<Icon size={14} fill={on ? "currentColor" : "none"} />
		</button>
	);
}

function SavedBadge({
	status,
	lastSavedAt,
}: {
	status: "idle" | "saving" | "saved" | "error";
	lastSavedAt: Date | null;
}) {
	const text = useMemo(() => {
		switch (status) {
			case "saving":
				return "Saving…";
			case "saved":
				return lastSavedAt ? `Saved ${fmt.relative(lastSavedAt)}` : "Saved";
			case "error":
				return "Save failed";
			default:
				return "Autosave on";
		}
	}, [status, lastSavedAt]);
	const Icon =
		status === "saving"
			? Loader2
			: status === "saved"
				? Check
				: status === "error"
					? CloudOff
					: Cloud;
	return (
		<span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
			<Icon size={11} className={status === "saving" ? "animate-spin" : ""} />
			{text}
		</span>
	);
}
