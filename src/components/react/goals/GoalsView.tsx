import { Button } from "@components/react/ui/Button";
import { Field, Input, Select, Textarea } from "@components/react/ui/Field";
import { Modal } from "@components/react/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArchiveRestore, Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { GOAL_PERIODS, GOAL_TYPES } from "@/lib/constants";
import { useGoals } from "@/lib/hooks/useCollection";
import { goalSchema } from "@/lib/schemas";
import { dayjs, today } from "@/lib/utils/date";
import { useAuthStore } from "@/stores/authStore";
import type { Goal } from "@/types/journal";

export function GoalsView() {
	const uid = useAuthStore((s) => s.uid);
	const { goals, create, update, remove, ready } = useGoals(uid);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Goal | null>(null);

	const active = goals.filter((g) => !g.isArchived);
	const archived = goals.filter((g) => g.isArchived);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">Goals</p>
					<h1 className="mt-1 font-display text-3xl tracking-tight">Build the habit</h1>
				</div>
				<Button
					variant="primary"
					leading={<Plus size={14} />}
					onClick={() => {
						setEditing(null);
						setOpen(true);
					}}
				>
					New goal
				</Button>
			</header>

			{active.length === 0 && archived.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border bg-paper-soft/40 p-8 text-center">
					<Target size={28} className="mx-auto text-fg-muted" />
					<p className="mt-2 font-display text-xl">No goals yet</p>
					<p className="mt-1 text-sm text-fg-muted">
						Set a target — like writing 3× a week — and track it.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{active.length > 0 && (
						<section className="space-y-3">
							<h2 className="font-display text-lg">Active</h2>
							<div className="grid gap-3 sm:grid-cols-2">
								{active.map((g) => (
									<GoalCard
										key={g.id}
										goal={g}
										onEdit={() => {
											setEditing(g);
											setOpen(true);
										}}
										onUpdate={update}
										onRemove={remove}
									/>
								))}
							</div>
						</section>
					)}
					{archived.length > 0 && (
						<section className="space-y-3">
							<h2 className="font-display text-lg">Archived</h2>
							<div className="grid gap-3 sm:grid-cols-2">
								{archived.map((g) => (
									<GoalCard
										key={g.id}
										goal={g}
										onEdit={() => {
											setEditing(g);
											setOpen(true);
										}}
										onUpdate={update}
										onRemove={remove}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			)}

			<GoalModal
				open={open}
				onClose={() => setOpen(false)}
				goal={editing}
				onSubmit={async (data) => {
					if (editing) await update(editing.id, data as Partial<Goal>);
					else await create(data as Parameters<typeof create>[0]);
					setOpen(false);
				}}
			/>
		</div>
	);
}

function GoalCard({
	goal,
	onEdit,
	onUpdate,
	onRemove,
}: {
	goal: Goal;
	onEdit: () => void;
	onUpdate: (id: string, p: Partial<Goal>) => Promise<void>;
	onRemove: (id: string) => Promise<void>;
}) {
	return (
		<div className="rounded-lg border border-border bg-bg-elevated p-4">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
						{GOAL_TYPES.find((t) => t.value === goal.type)?.label} · {goal.period}
					</p>
					<h3 className="mt-0.5 truncate font-display text-lg">{goal.title}</h3>
					{goal.description && (
						<p className="mt-1 line-clamp-2 text-xs text-fg-muted">{goal.description}</p>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onUpdate(goal.id, { isArchived: !goal.isArchived })}
						aria-label={goal.isArchived ? "Unarchive" : "Archive"}
					>
						{goal.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
					</Button>
					<Button variant="ghost" size="icon" onClick={() => onRemove(goal.id)} aria-label="Delete">
						<Trash2 size={14} className="text-fg-muted" />
					</Button>
				</div>
			</div>
			<div className="mt-3 flex items-center gap-2">
				<Target size={12} className="text-accent" />
				<span className="text-sm">
					Target: <strong>{goal.target}</strong> · {dayjs(goal.startDate).format("MMM D")}
					{goal.endDate ? ` – ${dayjs(goal.endDate).format("MMM D")}` : ""}
				</span>
			</div>
			<button
				type="button"
				onClick={onEdit}
				className="mt-3 w-full rounded-md border border-dashed border-border py-1.5 text-xs text-fg-muted hover:border-fg-muted"
			>
				Edit goal
			</button>
		</div>
	);
}

function GoalModal({
	open,
	onClose,
	goal,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	goal: Goal | null;
	onSubmit: (data: z.infer<typeof goalSchema>) => Promise<void>;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<z.infer<typeof goalSchema>>({
		resolver: zodResolver(goalSchema) as never,
		defaultValues: goal
			? {
					title: goal.title,
					description: goal.description,
					type: goal.type,
					target: goal.target,
					period: goal.period,
					startDate: goal.startDate,
					endDate: goal.endDate ?? undefined,
				}
			: {
					title: "",
					description: "",
					type: "count",
					target: 3,
					period: "weekly",
					startDate: today(),
				},
	});

	useEffect(() => {
		if (open) {
			reset(
				goal
					? {
							title: goal.title,
							description: goal.description,
							type: goal.type,
							target: goal.target,
							period: goal.period,
							startDate: goal.startDate,
							endDate: goal.endDate ?? undefined,
						}
					: {
							title: "",
							description: "",
							type: "count",
							target: 3,
							period: "weekly",
							startDate: today(),
						},
			);
		}
	}, [open, goal, reset]);

	return (
		<Modal open={open} onClose={onClose} title={goal ? "Edit goal" : "New goal"} size="md">
			<form
				onSubmit={handleSubmit(async (data) => {
					await onSubmit(data);
				})}
				className="space-y-3"
			>
				<Field label="Title" htmlFor="title" error={errors.title?.message}>
					<Input id="title" {...register("title")} placeholder="e.g., Write 3× a week" />
				</Field>
				<Field label="Description" htmlFor="description" optional>
					<Textarea
						id="description"
						{...register("description")}
						placeholder="Why this goal matters"
					/>
				</Field>
				<div className="grid grid-cols-2 gap-3">
					<Field label="Type" htmlFor="type">
						<Select id="type" {...register("type")}>
							{GOAL_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</Select>
					</Field>
					<Field label="Target" htmlFor="target" error={errors.target?.message}>
						<Input
							id="target"
							type="number"
							min={1}
							{...register("target", { valueAsNumber: true })}
						/>
					</Field>
				</div>
				<div className="grid grid-cols-3 gap-3">
					<Field label="Period" htmlFor="period">
						<Select id="period" {...register("period")}>
							{GOAL_PERIODS.map((p) => (
								<option key={p.value} value={p.value}>
									{p.label}
								</option>
							))}
						</Select>
					</Field>
					<Field label="Start" htmlFor="startDate">
						<Input id="startDate" type="date" {...register("startDate")} />
					</Field>
					<Field label="End" htmlFor="endDate" optional>
						<Input id="endDate" type="date" {...register("endDate")} />
					</Field>
				</div>
				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" loading={isSubmitting}>
						{goal ? "Save" : "Create goal"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
