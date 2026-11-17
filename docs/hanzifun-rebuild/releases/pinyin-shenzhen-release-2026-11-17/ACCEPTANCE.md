# Pinyin + Shenzhen release acceptance

Owner explicitly authorized six concrete pages, Git push and documentation; see OWNER-AUTHORIZATION.md. Initial local-only reports are historical and superseded for this release. Prepared 17 November; publication moves to 18 November 2026 because the browser approval review timed out across midnight. No fresh human approval on 18 November is claimed; only date metadata changed. APEC official homepage was reread on 18 November and still lists 18–19 November in Shenzhen; scheduled wording remains.

- 214/214 final tests. Production SEO: 421 English pages, 412 Sitemap URLs, 9 noindex previews, no errors.
- Two independent 3661-file builds agree; artifact SHA in freeze.json. Against verified prior production: 13 changed files, 52 added, 0 removed, 3596 unchanged. Existing dictionary/pinyin page and all protected story/audio/data/stroke assets are unchanged.
- Current production version e324e278-d904-4928-b6a6-746fd96daabb observed by Wrangler; 390 pre-release HTTP checks match the 3609-file rollback artifact. Original homepage-release checksum matches.
- Frozen candidate: Cloudflare Assets 390 old-site checks + 27 stroke-topic checks + 6 release routes, 51 assets, exact canonical/robots/Sitemap/RSS. Cloudflare default no-slash redirects are 307 preserving query; existing explicit 301 rules remain.
- Six phone layouts pass; shui3 lookup and Escape, actual publication date and index status checked in the frozen candidate. Detailed desktop/mobile, accessibility and real tool/print journeys remain linked from manifest.
- Isolated candidate → previous → candidate static pointer rollback rehearsal passes; no production or user storage touched.

Production status is pending until deployment.json and production HTTP/browser receipts are written. No IndexNow notification, recurring monitor, GSC ranking result or new teaching/audio signoff is claimed.
