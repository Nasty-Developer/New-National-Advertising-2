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

export type FirebaseAuthStatus = "initializing" | "authenticated" | "unauthenticated";
export type FirebaseAuthSnapshot = {
  status: FirebaseAuthStatus;
  user: User | null;
};

let readyUser: User | null | undefined;
let authSnapshot: FirebaseAuthSnapshot = {
  status: firebaseAuth ? "initializing" : "unauthenticated",
  user: null,
};
const authSubscribers = new Set<() => void>();
let resolveReady!: (user: User | null) => void;
export const firebaseAuthReady = new Promise<User | null>((resolve) => {
  resolveReady = resolve;
});

if (firebaseAuth) {
  onAuthStateChanged(firebaseAuth, (user) => {
    readyUser = user;
    authSnapshot = {
      status: user ? "authenticated" : "unauthenticated",
      user,
    };
    resolveReady(user);
    authSubscribers.forEach((subscriber) => subscriber());
  });
} else {
  resolveReady(null);
}

export function subscribeToFirebaseAuth(subscriber: () => void) {
  authSubscribers.add(subscriber);
  return () => authSubscribers.delete(subscriber);
}

export function getFirebaseAuthSnapshot() {
  return authSnapshot;
}

const FIREBASE_AUTH_READY_TIMEOUT_MS = 10_000;

export async function getFirebaseIdToken() {
  await Promise.race([
    firebaseAuthReady,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), FIREBASE_AUTH_READY_TIMEOUT_MS);
    }),
  ]);
  const user = firebaseAuth?.currentUser ?? readyUser;
  return user?.getIdToken() ?? null;
}

export async function waitForFirebaseUser(expectedUid?: string) {
  const currentUser = firebaseAuth?.currentUser ?? readyUser;
  if (currentUser && (!expectedUid || currentUser.uid === expectedUid)) {
    return currentUser;
  }
  if (!firebaseAuth) return null;

  return new Promise<User | null>((resolve) => {
    let timeoutId: number | undefined;
    let unsubscribe = () => {};
    const finish = (user: User | null) => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(user);
    };
    const check = () => {
      const user = firebaseAuth.currentUser ?? readyUser;
      if (user && (!expectedUid || user.uid === expectedUid)) finish(user);
    };

    unsubscribe = subscribeToFirebaseAuth(check);
    timeoutId = window.setTimeout(() => {
      const user = firebaseAuth.currentUser ?? readyUser;
      finish(user && (!expectedUid || user.uid === expectedUid) ? user : null);
    }, FIREBASE_AUTH_READY_TIMEOUT_MS);
    check();
  });
}