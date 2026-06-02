import type { ReactNode } from "react";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-paper-soft/40 px-6 py-12 text-center ${className}`}
		>
			{icon && <div className="text-fg-muted opacity-70">{icon}</div>}
			<div className="space-y-1">
				<p className="font-display text-xl text-fg">{title}</p>
				{description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
			</div>
			{action && <div className="pt-2">{action}</div>}
		</div>
	);
}
