import { type Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
	authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
	measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isValidConfig =
	typeof firebaseConfig.apiKey === "string" &&
	firebaseConfig.apiKey.length > 0 &&
	!firebaseConfig.apiKey.includes("your_");

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

export function isFirebaseConfigured(): boolean {
	return isValidConfig;
}

export function getFirebaseApp(): FirebaseApp {
	if (app) return app;
	if (!isValidConfig) {
		throw new Error(
			"Firebase is not configured. Copy .env.example to .env.local and fill in your project credentials.",
		);
	}
	app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	return app;
}

export function getFirebaseAuth(): Auth {
	if (auth) return auth;
	auth = getAuth(getFirebaseApp());
	return auth;
}

export function getDb(): Firestore {
	if (db) return db;
	db = getFirestore(getFirebaseApp());
	return db;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
	if (analytics) return analytics;
	if (typeof window === "undefined") return null;
	const ok = await isSupported();
	if (!ok) return null;
	analytics = getAnalytics(getFirebaseApp());
	return analytics;
}

export { firebaseConfig };
