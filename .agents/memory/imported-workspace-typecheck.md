---
name: Imported workspace typecheck
description: Project-reference declarations can be stale after importing an existing pnpm workspace.
---

Run the root library typecheck before checking an imported artifact so project-reference declarations reflect the generated API client. If imported generated files contain merge markers, resolve them in the OpenAPI source first and regenerate instead of hand-editing generated output.

<<<<<<< HEAD
Run the full workspace typecheck before considering an import complete. A homepage can render even when another route has malformed JSX or its hook call no longer matches the checked-in generated client.

**Why:** An imported workspace can contain generated source files without the emitted declarations that leaf artifacts resolve during TypeScript checks.

**How to apply:** After importing or changing generated shared libraries, run the workspace library typecheck and then the full workspace typecheck before presenting the app.
=======
**Why:** An imported workspace can contain generated source files without the emitted declarations that leaf artifacts resolve during TypeScript checks.

**How to apply:** After importing or changing generated shared libraries, run the workspace library typecheck before the target artifact typecheck.
>>>>>>> origin/main
