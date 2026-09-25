import { useSyncExternalStore } from "react";
import {
  getFirebaseAuthSnapshot,
  subscribeToFirebaseAuth,
} from "@/lib/firebase-client";

export function useFirebaseAuth() {
  return useSyncExternalStore(
    subscribeToFirebaseAuth,
    getFirebaseAuthSnapshot,
    getFirebaseAuthSnapshot,
  );
}