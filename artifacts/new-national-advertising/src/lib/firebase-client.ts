import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";

const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || authDomain?.split(".")[0];
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const firebaseApp = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

let readyUser: User | null | undefined;
let resolveReady!: (user: User | null) => void;
export const firebaseAuthReady = new Promise<User | null>((resolve) => {
  resolveReady = resolve;
});
if (firebaseAuth) {
  onAuthStateChanged(firebaseAuth, (user) => {
    readyUser = user;
    resolveReady(user);
  });
} else {
  resolveReady(null);
}

export async function getFirebaseIdToken() {
  await firebaseAuthReady;
  return readyUser?.getIdToken() ?? null;
}