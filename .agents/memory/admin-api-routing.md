---
name: Admin API routing
description: Production checks for Firebase-backed admin sessions when the frontend and API deploy separately.
---

The deployed admin-session request must reach the API service and return JSON; an HTTP 200 SPA fallback from `/api/admin/session` is a routing or `VITE_API_URL` problem, not a successful session.

**Why:** A static-host fallback can return `index.html` for API paths, which hides the missing backend route and leaves authentication state ambiguous.

**How to apply:** Check the browser's actual admin-session URL, require JSON parsing for that request, and configure the frontend API base URL or hosting rewrite before testing Firebase roles.