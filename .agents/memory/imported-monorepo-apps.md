---
name: Imported monorepo apps
description: Durable guidance for bringing a Replit monorepo from GitHub into an existing artifact workspace.
---

When importing a repository that already follows the workspace monorepo layout, treat its app artifact and shared API/lib packages as the source of truth, but preserve the destination project's active orchestration metadata and tool configuration. Register an imported web app as an artifact before restoring its source so it receives managed preview routing and workflow registration. Imported lockfiles can lag package manifests; resolve that drift in the workspace lockfile before starting services.

**Why:** A direct copy can leave a runnable-looking app invisible to the artifact registry, and stale lockfiles can block dependency installation even when the imported source typechecks.

**How to apply:** Inspect the repo for an existing `artifacts/<app>` package and API/lib packages, register the app if needed, restore code/assets without overwriting active skill/config directories, then install and verify the whole workspace.