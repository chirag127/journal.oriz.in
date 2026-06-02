interface AvatarProps {
	name?: string | null;
	photoURL?: string | null;
	size?: number;
	className?: string;
}

export function Avatar({ name, photoURL, size = 32, className = "" }: AvatarProps) {
	const initial = (name || "Y").charAt(0).toUpperCase();
	const dim = `${size}px`;
	return (
		<div
			className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-semibold text-accent ${className}`}
			style={{ width: dim, height: dim, fontSize: size / 2.4 }}
		>
			{photoURL ? (
				<img src={photoURL} alt="" className="h-full w-full object-cover" />
			) : (
				<span>{initial}</span>
			)}
		</div>
	);
}
