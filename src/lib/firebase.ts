/**
 * Firebase singleton — Journal uses the shared oriz-app project so a sign-in
 * on auth.oriz.in works across every oriz subdomain.
 */
import { initFirebase } from '@chirag127/oriz-ui'

const env = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

export const { app, auth, db } = initFirebase(env)
