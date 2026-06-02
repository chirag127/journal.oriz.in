import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastData {
	id: string;
	message: string;
	variant?: ToastVariant;
	duration?: number;
}

let pushImpl: ((t: Omit<ToastData, "id">) => void) | null = null;

export function toast(t: Omit<ToastData, "id">) {
	pushImpl?.(t);
}

export function ToastContainer() {
	const items: ToastData[] = [];
	const remove = (_id: string) => {
		// not used; container is just a render
	};
	return (
		<div
			aria-live="polite"
			className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
		>
			{items.map((t) => (
				<div
					key={t.id}
					className="pointer-events-auto flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm shadow-md animate-reveal"
				>
					{t.variant === "error" && <AlertCircle size={16} className="text-danger" />}
					{t.variant === "success" && <CheckCircle2 size={16} className="text-success" />}
					<span>{t.message}</span>
					<button
						type="button"
						onClick={() => remove(t.id)}
						className="ml-2 opacity-60 hover:opacity-100"
						aria-label="Dismiss"
					>
						<X size={14} />
					</button>
				</div>
			))}
		</div>
	);
}

export function useToastBridge() {
	useEffect(() => {
		pushImpl = (t) => {
			const el = document.createElement("div");
			el.setAttribute("role", "status");
			el.className =
				"pointer-events-auto fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm shadow-md";
			el.style.transition = "opacity 240ms ease";
			el.innerHTML = `<span>${t.message.replace(/</g, "&lt;")}</span>`;
			document.body.appendChild(el);
			const dur = t.duration ?? 3200;
			setTimeout(() => {
				el.style.opacity = "0";
				setTimeout(() => el.remove(), 260);
			}, dur);
		};
		return () => {
			pushImpl = null;
		};
	}, []);
}
