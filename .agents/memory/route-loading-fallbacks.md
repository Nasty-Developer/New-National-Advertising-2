---
name: Route loading fallbacks
description: Prevent API-backed detail pages from becoming false not-found states when global startup loading is removed.
---

API-backed detail routes must distinguish “data is still loading” from “the requested record does not exist.” When a global startup gate is removed for faster first paint, give detail pages an explicit loading/error state and, where safe, reuse existing local content as a first-render fallback.

**Why:** A route that previously depended on a global data gate can render its not-found branch during the first query pass, even though the record exists and the API is healthy.

**How to apply:** Audit every detail route after changing startup loading behavior. Keep record-level filtering separate from item-level cleanup so valid API records cannot be removed by a shared exclusion set.