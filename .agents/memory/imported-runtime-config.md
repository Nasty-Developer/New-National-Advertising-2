---
name: Imported runtime configuration
description: Keep imported public surfaces usable when optional third-party configuration is absent.
---

Imported apps may include private admin or external-service configuration that is unavailable in a fresh project.

**Why:** A missing optional integration should not prevent the public website or preview from starting.

**How to apply:** Make external configuration lazy or explicitly optional at startup; keep protected features unavailable until the required environment is configured.