import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { localFirestore } from "./local-data";
import type { LocalFirestore } from "./local-data";

function normalizeEnvironmentValue(value: string): string {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Firebase-backed production features.`);
  return normalizeEnvironmentValue(value);
}

export function hasFirebaseConfiguration(): boolean {
  return Boolean(
    hasFirebaseAuthConfiguration() && process.env.FIREBASE_STORAGE_BUCKET,
  );
}

export function hasFirebaseAuthConfiguration(): boolean {
  return missingFirebaseAuthConfiguration().length === 0;
}

export function missingFirebaseAuthConfiguration(): string[] {
  return [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ].filter((name) => !process.env[name]);
}

export function firebaseProjectId(): string {
  return required("FIREBASE_PROJECT_ID");
}

function getFirebaseApp() {
  if (!hasFirebaseAuthConfiguration()) {
    throw new Error("Firebase Auth configuration is not available.");
  }
  const existing = getApps()[0];
  if (existing) return existing;

  const options = {
    credential: cert({
      projectId: firebaseProjectId(),
      clientEmail: required("FIREBASE_CLIENT_EMAIL"),
      privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
    ...(process.env.FIREBASE_STORAGE_BUCKET
      ? { storageBucket: normalizeEnvironmentValue(process.env.FIREBASE_STORAGE_BUCKET) }
      : {}),
  };

  return initializeApp(options);
}

export function firebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function firestore(): LocalFirestore {
  return hasFirebaseAuthConfiguration()
    ? (getFirestore(getFirebaseApp()) as unknown as LocalFirestore)
    : localFirestore;
}

export function firebaseBucket() {
  return getStorage(getFirebaseApp()).bucket(required("FIREBASE_STORAGE_BUCKET"));
}