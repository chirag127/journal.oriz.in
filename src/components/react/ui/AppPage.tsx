import { AppGuard } from "@components/react/ui/AppGuard";
import { AppShell } from "@components/react/ui/AppShell";
import { OfflineIndicator } from "@components/react/ui/OfflineIndicator";
import { PwaInstallPrompt } from "@components/react/ui/PwaInstallPrompt";
import { useEffect } from "react";
import { useApplyTheme } from "@/lib/hooks/useTheme";
import { useLocation } from "../router";

export function AppPage({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
	useApplyTheme();
	const loc = useLocation();
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
	}, [loc.pathname]);
	return (
		<AppGuard>
			<AppShell wide={wide}>{children}</AppShell>
			<OfflineIndicator />
			<PwaInstallPrompt />
		</AppGuard>
	);
}
