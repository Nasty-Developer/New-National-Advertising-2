---
name: Imported API workflow refresh
description: Prevent stale bundled API routes after importing or changing an artifact.
---

After importing an API artifact or changing bundled route registration, the managed API workflow can continue serving an older compiled bundle until it is restarted.

**Why:** A healthy `/api/healthz` response can mask that all other routes are still missing from the running process.

**How to apply:** Restart the managed API workflow after import/build changes, then verify both health and representative public data endpoints such as products, services, and machines.