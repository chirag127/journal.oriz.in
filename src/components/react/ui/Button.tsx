import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const baseClasses =
	"inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out-quart select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed";

const sizeClasses: Record<Size, string> = {
	sm: "h-8 px-3 text-sm rounded-md",
	md: "h-10 px-4 text-sm rounded-md",
	lg: "h-12 px-6 text-base rounded-lg",
	icon: "h-9 w-9 rounded-md",
};

const variantClasses: Record<Variant, string> = {
	primary: "bg-ink text-paper hover:bg-ink-soft active:translate-y-px",
	secondary: "bg-paper-sunken text-ink border border-border hover:bg-paper-soft",
	ghost: "text-ink hover:bg-paper-sunken",
	danger: "bg-danger text-paper hover:opacity-90",
	outline: "border border-border bg-transparent text-ink hover:bg-paper-sunken",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
	leading?: ReactNode;
	trailing?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		className = "",
		variant = "primary",
		size = "md",
		loading,
		leading,
		trailing,
		children,
		disabled,
		...rest
	},
	ref,
) {
	return (
		<button
			ref={ref}
			className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
			disabled={disabled || loading}
			{...rest}
		>
			{loading ? <Spinner /> : leading}
			{children}
			{trailing}
		</button>
	);
});

function Spinner() {
	return (
		<svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
			<path
				d="M22 12a10 10 0 0 0-10-10"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: Variant;
	size?: Size;
	href: string;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
	{ className = "", variant = "primary", size = "md", children, ...rest },
	ref,
) {
	return (
		<a
			ref={ref}
			className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
			{...rest}
		>
			{children}
		</a>
	);
});
