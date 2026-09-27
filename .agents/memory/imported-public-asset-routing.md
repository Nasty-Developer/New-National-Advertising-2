---
name: Imported public asset routing
description: Distinguish bundled frontend images from CMS-managed storage paths in imported websites.
---

Imported websites may contain both bundled files under the frontend public directory and runtime-managed images served by the API storage route. Known bundled prefixes must remain direct frontend URLs; only CMS-managed paths should be rewritten to storage.

**Why:** Treating bundled category JPGs as storage paths produced browser 404s even though the files were present locally, making valid catalog cards appear broken.

**How to apply:** When importing or optimizing a site, inventory the public asset prefixes and test representative local JPG, WebP, and PNG URLs before routing image paths through the API.