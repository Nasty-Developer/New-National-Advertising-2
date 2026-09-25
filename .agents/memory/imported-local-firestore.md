---
name: Imported local Firestore compatibility
description: Imported Firebase-backed APIs may run against a local Firestore adapter during development.
---

Keep the local development Firestore adapter behaviorally compatible with the Firestore collection methods used by routes, including filtering and generated document writes.

**Why:** The imported public site can load while catalog endpoints fail only when lazy seeding exercises an adapter method that the remote Firestore SDK provides but the local fallback does not.

**How to apply:** When adding Firestore route logic, update the local adapter contract and verify the affected endpoint through the shared API path before presenting the app.