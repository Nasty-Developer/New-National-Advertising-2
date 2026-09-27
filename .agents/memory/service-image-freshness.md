---
name: Service image freshness
description: Prevent retired service imagery from appearing while the CMS catalogue refreshes.
---

Service visuals must render only from a completed current services response. Treat cached service records as unavailable while a refresh is in flight or has failed, and avoid stale-while-revalidate caching for the CMS services endpoint.

**Why:** A cached API response can contain retired service image paths and paint them briefly before the current catalogue arrives.

**How to apply:** Keep the frontend on a neutral skeleton/error state until the current services request succeeds, and use revalidation rather than a stale response window for service catalogue reads.