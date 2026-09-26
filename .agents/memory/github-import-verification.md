---
name: GitHub import verification
description: Verify that a requested GitHub import includes the runnable web artifact before troubleshooting preview behavior.
---

When a project was created from a GitHub import, verify that the repository's runnable app artifact and source files are actually present before diagnosing a blank preview.

**Why:** A project can contain only the default API/canvas scaffold even after an import was requested, which makes the preview appear blank even though the source repository has a working web app.

**How to apply:** If the expected web artifact is missing, recover the repository source first, register its web artifact, restart its managed workflow, and then verify the preview.

Imported repositories can include a complete `.replit-artifact/artifact.toml` without being registered in the current project; registration must be checked separately before relying on the preview.

**Why:** Copying repository files into a project does not necessarily create the platform artifact record or its managed workflow.

**How to apply:** Compare the imported artifact directories against the registered artifact list, and register the app before restarting or presenting it.

After registration, scan imported TypeScript, TSX, and OpenAPI sources for committed merge-conflict markers before relying on the preview.

**Why:** The imported repository's merge commit contained unresolved markers in executable app, API, and generated-client files even though Git reported a clean checkout.

**How to apply:** Use the merge parents to recover a coherent source set, then typecheck the affected app and API packages and confirm the preview and health endpoint respond.