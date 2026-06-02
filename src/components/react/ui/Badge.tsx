import type { ReactNode } from "react";

interface BadgeProps {
	children: ReactNode;
	variant?: "default" | "accent" | "muted" | "outline";
	className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
	const variants = {
		default: "bg-paper-sunken text-fg",
		accent: "bg-accent/15 text-accent",
		muted: "text-fg-muted",
		outline: "border border-border text-fg-muted",
	};
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${variants[variant]} ${className}`}
		>
			{children}
		</span>
	);
}
