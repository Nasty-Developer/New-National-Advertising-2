---
name: Live category normalization
description: The public category metadata endpoint and product records use different casing for the same catalog names.
---

Use the live product-category metadata for ordering, active state, and managed imagery, but resolve navigation and counts against the exact category value on published product records.

**Why:** The category metadata route currently returns uppercase labels while product records use title case; filtering is exact-match and would otherwise produce empty category pages.

**How to apply:** When adding category-driven UI, match category names case-insensitively for lookup, then emit the product record's exact category string in product URLs and filters.