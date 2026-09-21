---
name: Imported workspace typecheck
description: Project-reference declarations can be stale after importing an existing pnpm workspace.
---

Run the root library typecheck before checking an imported artifact so project-reference declarations reflect the generated API client.

**Why:** An imported workspace can contain generated source files without the emitted declarations that leaf artifacts resolve during TypeScript checks.

**How to apply:** After importing or changing generated shared libraries, run the workspace library typecheck before the target artifact typecheck.