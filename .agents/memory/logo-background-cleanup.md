---
name: Logo background cleanup
description: Preserve logo artwork and internal negative space when converting a solid-background source into a transparent web asset.
---

For logos on solid JPEG backgrounds, remove only the connected outer background rather than making every matching color transparent.

**Why:** A global white-to-transparent conversion can erase intentional white gaps inside lettering or symbols and make the logo look different.

**How to apply:** Use a connected background-removal step, keep the original artwork unchanged, and remove CSS boxes or shadows that were compensating for the old background.