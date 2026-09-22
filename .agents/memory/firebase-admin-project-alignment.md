---
name: Firebase Admin project alignment
description: Production Firebase ID-token verification failures and safe diagnostics.
---

After the browser completes Firebase email/password sign-in and the API returns a token-rejected 401, the bearer header path is working; the next boundary to verify is that Firebase Admin is initialized for the same project as the browser token.

**Why:** Firebase Admin can reject a valid browser token when the server project ID, service-account project, or pasted Render environment values do not match the client Firebase project. The response must not expose the token or service-account material.

**How to apply:** Keep server configuration in environment variables, normalize pasted values, and log only non-secret metadata such as the configured server project, token audience/issuer, expiry state, and Firebase error code/message. Recheck the deployed backend after its environment is corrected.