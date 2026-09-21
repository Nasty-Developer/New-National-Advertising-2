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

function assertConfig() {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);
  if (missing.length) throw new Error(`Firebase web configuration is missing: ${missing.join(", ")}`);
}

assertConfig();
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth: Auth = getAuth(firebaseApp);

let readyUser: User | null | undefined;
let resolveReady!: (user: User | null) => void;
export const firebaseAuthReady = new Promise<User | null>((resolve) => {
  resolveReady = resolve;
});
onAuthStateChanged(firebaseAuth, (user) => {
  readyUser = user;
  resolveReady(user);
});

export async function getFirebaseIdToken() {
  await firebaseAuthReady;
  return readyUser?.getIdToken() ?? null;
}