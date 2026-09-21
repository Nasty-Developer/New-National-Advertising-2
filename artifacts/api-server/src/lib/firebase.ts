import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Firebase-backed production features.`);
  return value;
}

function getFirebaseApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: required("FIREBASE_PROJECT_ID"),
      clientEmail: required("FIREBASE_CLIENT_EMAIL"),
      privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
    storageBucket: required("FIREBASE_STORAGE_BUCKET"),
  });
}

export function firebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function firestore() {
  return getFirestore(getFirebaseApp());
}

export function firebaseBucket() {
  return getStorage(getFirebaseApp()).bucket();
}