import { Badge } from "@components/react/ui/Badge";
import { Button } from "@components/react/ui/Button";
import { Field, Input, Select, Textarea } from "@components/react/ui/Field";
import { Modal } from "@components/react/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { JOURNAL_TYPES } from "@/lib/constants";
import { useTemplates } from "@/lib/hooks/useCollection";
import { templateSchema } from "@/lib/schemas";
import { renderMarkdown } from "@/lib/utils/markdown";
import { useAuthStore } from "@/stores/authStore";
import type { JournalTemplate } from "@/types/journal";
import { Link } from "../router";

export function TemplatesView() {
	const uid = useAuthStore((s) => s.uid);
	const { templates, create, update, remove, ready } = useTemplates(uid);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<JournalTemplate | null>(null);

	if (!ready) return <div className="h-96 animate-pulse rounded-xl bg-paper-sunken" />;

	return (
		<div className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
						Templates
					</p>
					<h1 className="mt-1 font-display text-3xl tracking-tight">Reusable prompts</h1>
				</div>
				<Button
					variant="primary"
					leading={<Plus size={14} />}
					onClick={() => {
						setEditing(null);
						setOpen(true);
					}}
				>
					New template
				</Button>
			</header>

			<div className="grid gap-3 sm:grid-cols-2">
				{templates.map((t) => (
					<div key={t.id} className="rounded-lg border border-border bg-bg-elevated p-4">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3 className="font-display text-base">{t.name}</h3>
								<p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>
								<div className="mt-2 flex flex-wrap items-center gap-1.5">
									<Badge variant="muted">
										{JOURNAL_TYPES.find((j) => j.value === t.journalType)?.label}
									</Badge>
									{t.isBuiltIn && <Badge variant="accent">Built-in</Badge>}
								</div>
							</div>
							<div className="flex items-center gap-1">
								{!t.isBuiltIn && (
									<>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												setEditing(t);
												setOpen(true);
											}}
											aria-label="Edit"
										>
											<Edit2 size={14} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => remove(t.id)}
											aria-label="Delete"
										>
											<Trash2 size={14} className="text-fg-muted" />
										</Button>
									</>
								)}
							</div>
						</div>
						<Link href={`/entries/new?template=${t.id}`} className="no-underline">
							<Button variant="outline" size="sm" className="mt-3 w-full">
								Use template
							</Button>
						</Link>
					</div>
				))}
			</div>

			<TemplateModal
				open={open}
				onClose={() => setOpen(false)}
				template={editing}
				onSubmit={async (data) => {
					if (editing) await update(editing.id, data as Parameters<typeof update>[1]);
					else await create(data as Parameters<typeof create>[0]);
					setOpen(false);
				}}
			/>
		</div>
	);
}

function TemplateModal({
	open,
	onClose,
	template,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	template: JournalTemplate | null;
	onSubmit: (d: z.infer<typeof templateSchema>) => Promise<void>;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch,
	} = useForm<z.infer<typeof templateSchema>>({
		resolver: zodResolver(templateSchema) as never,
		defaultValues: template
			? {
					name: template.name,
					description: template.description,
					content: template.content,
					journalType: template.journalType,
				}
			: { name: "", description: "", content: "", journalType: "daily" },
	});

	const content = watch("content");

	useEffect(() => {
		if (open) {
			reset(
				template
					? {
							name: template.name,
							description: template.description,
							content: template.content,
							journalType: template.journalType,
						}
					: { name: "", description: "", content: "", journalType: "daily" },
			);
		}
	}, [open, template, reset]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={template ? "Edit template" : "New template"}
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<div className="grid grid-cols-2 gap-3">
					<Field label="Name" htmlFor="t-name" error={errors.name?.message}>
						<Input id="t-name" {...register("name")} placeholder="Morning Pages" />
					</Field>
					<Field label="Type" htmlFor="t-type">
						<Select id="t-type" {...register("journalType")}>
							{JOURNAL_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</Select>
					</Field>
				</div>
				<Field label="Description" htmlFor="t-desc" optional>
					<Input id="t-desc" {...register("description")} placeholder="What this template is for" />
				</Field>
				<div className="grid gap-3 md:grid-cols-2">
					<Field label="Content" htmlFor="t-content" error={errors.content?.message}>
						<Textarea
							id="t-content"
							{...register("content")}
							rows={14}
							className="font-mono text-sm"
						/>
					</Field>
					<Field label="Preview">
						<div
							className="scrollbar-thin h-72 overflow-y-auto rounded-md border border-border bg-paper-soft/40 p-3 prose-journal text-sm"
							dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }}
						/>
					</Field>
				</div>
				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" loading={isSubmitting}>
						{template ? "Save" : "Create template"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
