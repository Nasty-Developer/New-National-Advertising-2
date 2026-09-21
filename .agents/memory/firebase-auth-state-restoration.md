---
name: Firebase auth state restoration
description: Durable rules for Firebase browser auth state and protected-route timing.
---

The initial Firebase auth callback and the current auth state are different concerns. A one-time readiness promise may resolve with `null` during startup and must not be the only source used for later token reads after sign-in.

**Why:** Login can complete before a separate cached readiness value is updated, causing the API request to omit the new user's token and the protected route to loop back to sign-in.

**How to apply:** Keep a live auth-state subscription, read `auth.currentUser` for token requests, wait for the signed-in UID before admin authorization, and call Firebase `signOut()` on logout.