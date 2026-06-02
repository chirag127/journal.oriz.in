import type {
	InputHTMLAttributes,
	ReactNode,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
} from "react";
import { forwardRef } from "react";

interface FieldWrapProps {
	label?: string;
	hint?: string;
	error?: string;
	htmlFor?: string;
	children: ReactNode;
	className?: string;
	optional?: boolean;
}

export function Field({
	label,
	hint,
	error,
	htmlFor,
	children,
	className = "",
	optional,
}: FieldWrapProps) {
	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			{label && (
				<label
					htmlFor={htmlFor}
					className="font-sans text-xs font-medium text-fg-muted tracking-wide uppercase"
				>
					{label}
					{optional && <span className="ml-1 normal-case font-normal opacity-60">· optional</span>}
				</label>
			)}
			{children}
			{hint && !error && <p className="text-xs text-fg-muted">{hint}</p>}
			{error && <p className="text-xs text-danger">{error}</p>}
		</div>
	);
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className = "", invalid, ...rest },
	ref,
) {
	return (
		<input
			ref={ref}
			className={`h-10 w-full rounded-md border bg-bg-elevated px-3 text-sm text-fg placeholder:text-ink-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${invalid ? "border-danger" : "border-border"} ${className}`}
			{...rest}
		/>
	);
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ className = "", invalid, ...rest },
	ref,
) {
	return (
		<textarea
			ref={ref}
			className={`min-h-24 w-full rounded-md border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-ink-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${invalid ? "border-danger" : "border-border"} ${className}`}
			{...rest}
		/>
	);
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
	{ className = "", invalid, children, ...rest },
	ref,
) {
	return (
		<select
			ref={ref}
			className={`h-10 w-full rounded-md border bg-bg-elevated px-3 pr-8 text-sm text-fg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none bg-no-repeat bg-[length:14px] bg-[position:right_0.6rem_center] ${invalid ? "border-danger" : "border-border"} ${className}`}
			style={{
				backgroundImage:
					"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6256' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
			}}
			{...rest}
		>
			{children}
		</select>
	);
});
