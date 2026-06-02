import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

export function PwaInstallPrompt() {
	const [event, setEvent] = useState<{
		prompt: () => void;
		userChoice: Promise<{ outcome: string }>;
	} | null>(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const onPrompt = (e: Event) => {
			e.preventDefault();
			setEvent(e as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> });
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (dismissed) return;
		const dismissedFlag = localStorage.getItem("journal.pwa.dismissed");
		if (dismissedFlag) setDismissed(true);
	}, [dismissed]);

	if (!event || dismissed) return null;

	return (
		<div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 shadow-md animate-reveal">
			<Download size={14} className="text-accent" />
			<span className="text-sm">Install Journal</span>
			<button
				type="button"
				onClick={() => {
					event.prompt();
					event.userChoice.then((choice) => {
						if (choice.outcome === "accepted") setEvent(null);
					});
				}}
				className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper hover:bg-ink-soft"
			>
				Install
			</button>
			<button
				type="button"
				onClick={() => {
					setDismissed(true);
					localStorage.setItem("journal.pwa.dismissed", "1");
				}}
				className="text-fg-muted hover:text-fg"
				aria-label="Dismiss"
			>
				<X size={14} />
			</button>
		</div>
	);
}
