import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	hideClose?: boolean;
}

const sizeMap = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-2xl",
};

export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	size = "md",
	hideClose,
}: ModalProps) {
	const ref = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (open && !el.open) el.showModal();
		if (!open && el.open) el.close();
	}, [open]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onCancel = (e: Event) => {
			e.preventDefault();
			onClose();
		};
		el.addEventListener("cancel", onCancel);
		return () => el.removeEventListener("cancel", onCancel);
	}, [onClose]);

	return (
		<dialog
			ref={ref}
			className="bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === ref.current) onClose();
			}}
		>
			<div
				className={`w-[92vw] ${sizeMap[size]} rounded-xl border border-border bg-bg-elevated p-6 shadow-xl animate-reveal`}
			>
				{(title || !hideClose) && (
					<div className="mb-4 flex items-start justify-between gap-4">
						<div>
							{title && <h2 className="font-display text-2xl tracking-tight">{title}</h2>}
							{description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
						</div>
						{!hideClose && (
							<button
								type="button"
								onClick={onClose}
								className="-m-1 rounded-md p-1 text-fg-muted hover:bg-paper-sunken"
								aria-label="Close"
							>
								<X size={18} />
							</button>
						)}
					</div>
				)}
				{children}
			</div>
		</dialog>
	);
}
