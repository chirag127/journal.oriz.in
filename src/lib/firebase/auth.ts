import {
	createUserWithEmailAndPassword,
	onAuthStateChanged as fbOnAuthStateChanged,
	signOut as fbSignOut,
	GithubAuthProvider,
	GoogleAuthProvider,
	sendPasswordResetEmail,
	signInAnonymously,
	signInWithEmailAndPassword,
	signInWithPopup,
	type User,
	type UserCredential,
	updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({ allow_signup: "true" });

export type AuthError = { code: string; message: string };

function toError(err: unknown): AuthError {
	if (err && typeof err === "object" && "code" in err) {
		return {
			code: String((err as { code: unknown }).code),
			message: (err as unknown as Error).message,
		};
	}
	return { code: "unknown", message: err instanceof Error ? err.message : "Unknown error" };
}

export async function signUpWithEmail(
	email: string,
	password: string,
	displayName?: string,
): Promise<UserCredential> {
	try {
		const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
		if (displayName) {
			await updateProfile(cred.user, { displayName });
		}
		return cred;
	} catch (e) {
		throw toError(e);
	}
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
	try {
		return await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
	} catch (e) {
		throw toError(e);
	}
}

export async function signInWithGoogle(): Promise<UserCredential> {
	try {
		return await signInWithPopup(getFirebaseAuth(), googleProvider);
	} catch (e) {
		throw toError(e);
	}
}

export async function signInWithGithub(): Promise<UserCredential> {
	try {
		return await signInWithPopup(getFirebaseAuth(), githubProvider);
	} catch (e) {
		throw toError(e);
	}
}

export async function signInAnonymouslyNow(): Promise<UserCredential> {
	try {
		return await signInAnonymously(getFirebaseAuth());
	} catch (e) {
		throw toError(e);
	}
}

export async function signOut(): Promise<void> {
	try {
		await fbSignOut(getFirebaseAuth());
	} catch (e) {
		throw toError(e);
	}
}

export async function resetPassword(email: string): Promise<void> {
	try {
		await sendPasswordResetEmail(getFirebaseAuth(), email);
	} catch (e) {
		throw toError(e);
	}
}

export async function updateDisplayName(name: string): Promise<void> {
	try {
		const user = getFirebaseAuth().currentUser;
		if (!user) throw new Error("Not authenticated");
		await updateProfile(user, { displayName: name });
	} catch (e) {
		throw toError(e);
	}
}

export function onAuth(cb: (user: User | null) => void): () => void {
	return fbOnAuthStateChanged(getFirebaseAuth(), cb);
}

export const friendlyAuthError = (code: string): string => {
	switch (code) {
		case "auth/email-already-in-use":
			return "An account with this email already exists.";
		case "auth/invalid-email":
			return "Please enter a valid email address.";
		case "auth/weak-password":
			return "Password must be at least 6 characters.";
		case "auth/user-not-found":
		case "auth/wrong-password":
		case "auth/invalid-credential":
			return "Incorrect email or password.";
		case "auth/popup-closed-by-user":
			return "Sign-in popup was closed before completion.";
		case "auth/popup-blocked":
			return "Popup was blocked by the browser. Allow popups and try again.";
		case "auth/network-request-failed":
			return "Network error. Check your connection and try again.";
		case "auth/too-many-requests":
			return "Too many attempts. Please try again later.";
		case "auth/operation-not-allowed":
			return "This sign-in method is not enabled. Contact the app administrator.";
		default:
			return "Something went wrong. Please try again.";
	}
};
