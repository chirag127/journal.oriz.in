import { Avatar } from "@components/react/ui/Avatar";
import { Button } from "@components/react/ui/Button";
import { Field, Input, Select } from "@components/react/ui/Field";
import { toast } from "@components/react/ui/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { JOURNAL_TYPES, MOODS } from "@/lib/constants";
import { updateDisplayName } from "@/lib/firebase/auth";
import { ensureUserProfile, updateUserProfile } from "@/lib/firebase/user";
import { useProfile } from "@/lib/hooks/useAuth";
import { useEntries } from "@/lib/hooks/useEntries";
import { dayjs } from "@/lib/utils/date";
import { computeStreaks } from "@/lib/utils/streak";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
	displayName: z.string().min(1).max(60),
	defaultJournalType: z.enum(JOURNAL_TYPES.map((j) => j.value) as [string, ...string[]]),
	defaultMood: z.enum(MOODS.map((m) => m.value) as [string, ...string[]]).nullable(),
	timezone: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ProfileView() {
	const uid = useAuthStore((s) => s.uid);
	const profile = useProfile(uid);
	const { allLoaded, ready } = useEntries(uid);
	const [saving, setSaving] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			displayName: "",
			defaultJournalType: "daily",
			defaultMood: null,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		},
	});

	useEffect(() => {
		if (profile) {
			reset({
				displayName: profile.displayName ?? "",
				defaultJournalType: profile.defaultJournalType,
				defaultMood: null,
				timezone: profile.timezone,
			});
		}
	}, [profile, reset]);

	async function onSubmit(data: FormData) {
		if (!uid) return;
		setSaving(true);
		try {
			if (data.displayName !== profile?.displayName) {
				try {
					await updateDisplayName(data.displayName);
				} catch {
					/* ignored */
				}
			}
			await updateUserProfile(uid, {
				displayName: data.displayName,
				defaultJournalType: data.defaultJournalType as never,
				timezone: data.timezone,
			});
			await ensureUserProfile(uid, {
				email: profile?.email ?? null,
				displayName: data.displayName,
				isAnonymous: profile?.isAnonymous ?? false,
			});
			toast({ message: "Profile saved", variant: "success" });
		} catch (e) {
			toast({ message: "Could not save", variant: "error" });
		} finally {
			setSaving(false);
		}
	}

	const streaks = ready ? computeStreaks(allLoaded) : null;
	const joinDate = profile?.createdAt ? dayjs(profile.createdAt) : null;

	return (
		<div className="space-y-6">
			<header>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Profile</p>
				<h1 className="mt-1 font-display text-3xl tracking-tight">Your writer's identity</h1>
			</header>

			<div className="grid gap-5 lg:grid-cols-3">
				<section className="rounded-xl border border-border bg-bg-elevated p-5 lg:col-span-2">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="flex items-center gap-4">
							<Avatar name={profile?.displayName} photoURL={profile?.photoURL} size={64} />
							<label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-paper-soft px-3 py-2 text-sm">
								<Camera size={14} /> Change photo
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => e.target.files?.[0]}
								/>
							</label>
						</div>
						<Field label="Display name" htmlFor="dn" error={errors.displayName?.message}>
							<Input id="dn" {...register("displayName")} />
						</Field>
						<Field label="Email" htmlFor="em" optional>
							<Input id="em" value={profile?.email ?? ""} disabled className="opacity-70" />
						</Field>
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
							<Field label="Default mood" htmlFor="dm" optional>
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
						<Field label="Timezone" htmlFor="tz">
							<Input id="tz" {...register("timezone")} />
						</Field>
						<div className="flex justify-end">
							<Button
								type="submit"
								loading={saving}
								leading={
									saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />
								}
							>
								Save profile
							</Button>
						</div>
					</form>
				</section>

				<aside className="space-y-3">
					<div className="rounded-xl border border-border bg-bg-elevated p-5">
						<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
							Quick stats
						</p>
						<dl className="mt-2 space-y-2 text-sm">
							<div className="flex justify-between">
								<dt className="text-fg-muted">Total entries</dt>
								<dd className="font-mono">{allLoaded.length}</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-fg-muted">Current streak</dt>
								<dd className="font-mono">{streaks?.current ?? 0}d</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-fg-muted">Longest streak</dt>
								<dd className="font-mono">{streaks?.longest ?? 0}d</dd>
							</div>
							{joinDate && (
								<div className="flex justify-between">
									<dt className="text-fg-muted">Joined</dt>
									<dd className="font-mono">{joinDate.format("MMM YYYY")}</dd>
								</div>
							)}
						</dl>
					</div>
					<div className="rounded-xl border border-border bg-bg-elevated p-5">
						<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
							Account
						</p>
						<p className="mt-2 text-sm">{profile?.isAnonymous ? "Guest account" : "Signed in"}</p>
						{profile?.email && <p className="text-xs text-fg-muted">{profile.email}</p>}
					</div>
				</aside>
			</div>
		</div>
	);
}
