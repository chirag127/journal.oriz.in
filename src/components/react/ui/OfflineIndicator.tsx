import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
	const [online, setOnline] = useState(true);
	useEffect(() => {
		if (typeof window === "undefined") return;
		setOnline(navigator.onLine);
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);

	return (
		<div
			className={`fixed bottom-4 right-4 z-30 transition-all duration-300 ${
				online ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
			}`}
		>
			<div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-xs shadow-md">
				<WifiOff size={12} className="text-danger" />
				Offline — changes will sync when you reconnect
			</div>
		</div>
	);
}
