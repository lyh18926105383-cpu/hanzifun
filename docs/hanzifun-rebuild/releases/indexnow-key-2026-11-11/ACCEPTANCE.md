# IndexNow verification file release — 2026-11-11

Owner explicitly requested deployment, Git push and a public URL accessibility check. Scope is the root verification text file and build integration; no IndexNow URL notifications were requested or sent.

## Local acceptance

- 203/203 existing tests PASS after supplying two existing hash-locked source archives from the main checkout; no new tests added.
- Production build: 3189 files. Exactly one file added, no removals. Existing pages/assets byte-identical to the previous build; the only changed existing file is content-manifest.json, whose only change is the review-decisions.json source hash.
- The build script is part of the existing character presentation signature. Refreshed only that signature and added a dated maintenance note; historical owner/content/audio approvals preserved.
- SEO errors=[], sitemap still 404 URLs. 390 local Wrangler HTTP checks PASS; key additionally returns 200, text/plain; charset=utf-8, exactly 32 bytes matching the owner file.
- Before release, 390 production HTTP checks matched the baseline. Actual preceding Cloudflare version: 868b1621-2470-4150-a8aa-2b4a4c925a86.
- Isolated candidate → previous → candidate restoration verified by file hashes. Previous/candidate artifacts and manifests retained under /private/tmp/hanzifun-indexnow-20261111.
- No UI change; existing rendered pages and assets verified byte for byte, so no new browser interaction acceptance claimed.

## Production acceptance

Deployed version `41f33bbd-23a0-4977-a1f6-76e7730ccec3`, 100% traffic, 2026-11-11 21:29:34 +08:00. Production 390/390 baseline HTTP checks PASS. The key additionally returns HTTP 200, text/plain, exactly 32 bytes matching the owner file. Deployment rebuild hashes match the frozen candidate. See deployment.json and production-key.json. Git destination is origin/main; final receipt is committed separately from source fe5e4cf.
