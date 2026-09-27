---
name: Imported repository cleanup
description: Imported Replit repositories may contain unresolved merge markers and generated clients that must be refreshed before previewing.
---

Imported snapshots are not necessarily build-ready even when they include a complete app. Check for conflict markers across source files and regenerate OpenAPI-derived clients before restarting services.

**Why:** A repository can have a valid layout and still fail immediately because a prior merge was left unresolved or generated declarations no longer match the checked-in API contract.

**How to apply:** After importing, scan tracked source for merge markers, run the repository's codegen command, then typecheck the frontend and API before presenting the artifact.