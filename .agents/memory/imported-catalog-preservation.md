---
name: Imported catalog preservation
description: Preserve imported catalog records while applying requested presentation priorities.
---

Imported catalog content should not be deleted or duplicated to satisfy a requested ranking or title correction. Keep stable IDs, slugs, image relationships, and all other records; apply display priorities at read time and normalize only the explicitly requested field.

**Why:** Imported workspaces may contain records outside the current seed list, and destructive startup cleanup can silently remove valid business content.

**How to apply:** When changing catalog order or labels, use deterministic API sorting and narrow field normalization. Treat seeding as create-if-missing only, and verify record counts remain stable after refresh.