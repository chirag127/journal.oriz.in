import { useEffect, useState } from "react";
import { onAuth } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { ensureUserProfile, getUserProfile, onUserProfile } from "@/lib/firebase/user";
import { useAuthStore } from "@/stores/authStore";
import type { UserProfile } from "@/types/journal";

export function useAuth() {
	const { profile, uid, isLoading, setProfile, setUid, setLoading, reset } = useAuthStore();

	useEffect(() => {
		if (!isFirebaseConfigured()) {
			setLoading(false);
			return;
		}
		try {
			const unsub = onAuth(async (user) => {
				if (!user) {
					reset();
					return;
				}
				await ensureUserProfile(user.uid, {
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
					isAnonymous: user.isAnonymous,
				});
				setUid(user.uid);
				const p = await getUserProfile(user.uid);
				setProfile(p);
				setLoading(false);
			});
			return unsub;
		} catch (e) {
			console.error("Auth init failed", e);
			setLoading(false);
		}
	}, [reset, setLoading, setProfile, setUid]);

	return { profile, uid, isLoading };
}

export function useProfile(uid: string | null): UserProfile | null {
	const [p, setP] = useState<UserProfile | null>(null);
	useEffect(() => {
		if (!uid) {
			setP(null);
			return;
		}
		try {
			return onUserProfile(uid, setP);
		} catch (e) {
			console.error(e);
			return;
		}
	}, [uid]);
	return p;
}
