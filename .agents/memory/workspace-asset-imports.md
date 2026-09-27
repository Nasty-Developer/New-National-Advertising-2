---
name: Workspace asset imports
description: Resolve uploaded files correctly when running package-scoped import scripts.
---

When a temporary import script runs through `pnpm --filter <package> exec`, its working directory is the filtered package directory rather than the workspace root. Resolve paths to shared folders such as `attached_assets` from the workspace root before validating or uploading files.

**Why:** A signage image batch initially stopped at its preflight check because the script looked for workspace attachments inside the API package. No data was changed, but the failure added avoidable recovery work.

**How to apply:** For future batch imports, establish the workspace root explicitly before reading uploaded assets, and run a no-write match/count preflight before uploading or updating records.