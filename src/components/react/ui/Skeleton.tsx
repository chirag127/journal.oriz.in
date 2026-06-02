import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	h?: string;
	w?: string;
	rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({
	className = "",
	h = "h-4",
	w = "w-full",
	rounded = "md",
	style,
	...rest
}: SkeletonProps) {
	const radius = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" }[
		rounded
	];
	return (
		<div
			className={`${h} ${w} ${radius} animate-pulse bg-paper-sunken ${className}`}
			style={style}
			{...rest}
		/>
	);
}
