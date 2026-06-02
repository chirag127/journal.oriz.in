import { Button } from "@components/react/ui/Button";
import { useToastBridge } from "@components/react/ui/Toast";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { onAuth } from "@/lib/firebase/auth";
import { getDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { rebuildCounters } from "@/lib/firebase/counters";
import { listEntries } from "@/lib/firebase/entries";
import { seedBuiltInTemplates } from "@/lib/firebase/templates";
import { ensureUserProfile } from "@/lib/firebase/user";
import { useEntries } from "@/lib/hooks/useEntries";
import { useAuthStore } from "@/stores/authStore";

export function AppGuard({ children }: { children: React.ReactNode }) {
	const { uid, isLoading, setUid, setProfile, setLoading, reset } = useAuthStore();
	const [bootstrapped, setBootstrapped] = useState(false);
	const [needsConfig, setNeedsConfig] = useState(false);
	useEntries(uid);
	useToastBridge();

	useEffect(() => {
		if (!isFirebaseConfigured()) {
			setNeedsConfig(true);
			setLoading(false);
			return;
		}
		try {
			getDb();
			const unsub = onAuth(async (user) => {
				if (!user) {
					reset();
					setLoading(false);
					setBootstrapped(true);
					return;
				}
				await ensureUserProfile(user.uid, {
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
					isAnonymous: user.isAnonymous,
				});
				setUid(user.uid);
				setBootstrapped(true);
				setLoading(false);
				seedBuiltInTemplates(user.uid).catch(console.error);
				// rebuild counters in background
				listEntries(user.uid, { limitN: 500 }).then(({ entries }) => {
					rebuildCounters(user.uid, entries).catch(console.error);
				});
			});
			return unsub;
		} catch (e) {
			console.error("Auth init failed", e);
			setLoading(false);
			setBootstrapped(true);
		}
	}, [reset, setLoading, setProfile, setUid]);

	if (needsConfig) return <ConfigNotice />;
	if (isLoading || !bootstrapped) return <BootScreen />;
	if (!uid) return <SignInNotice />;
	return <>{children}</>;
}

function ConfigNotice() {
	return (
		<div className="grid min-h-screen place-items-center px-6">
			<div className="max-w-lg rounded-xl border border-border bg-bg-elevated p-8 text-center">
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
					Configuration required
				</p>
				<h1 className="mt-3 font-display text-3xl">Almost there</h1>
				<p className="mt-3 text-fg-muted">
					Journal needs a Firebase project to authenticate and store entries. Copy{" "}
					<code className="rounded bg-paper-sunken px-1.5 py-0.5 text-sm">.env.example</code> to{" "}
					<code className="rounded bg-paper-sunken px-1.5 py-0.5 text-sm">.env.local</code>, fill in
					your project credentials, and restart the dev server.
				</p>
				<p className="mt-4 text-sm text-fg-muted">
					Free forever on the Firebase Spark plan. No credit card needed.
				</p>
			</div>
		</div>
	);
}

function BootScreen() {
	return (
		<div className="grid min-h-screen place-items-center">
			<div className="flex flex-col items-center gap-3">
				<div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
				<p className="font-display text-lg">{APP_NAME}</p>
			</div>
		</div>
	);
}

function SignInNotice() {
	return (
		<div className="grid min-h-screen place-items-center px-6">
			<div className="max-w-md text-center">
				<h1 className="font-display text-4xl">Welcome back</h1>
				<p className="mt-3 text-fg-muted">Sign in to continue your story.</p>
				<div className="mt-6 flex justify-center gap-3">
					<Button onClick={() => (window.location.href = "/login")}>Sign in</Button>
					<Button variant="outline" onClick={() => (window.location.href = "/signup")}>
						Create account
					</Button>
				</div>
			</div>
		</div>
	);
}
