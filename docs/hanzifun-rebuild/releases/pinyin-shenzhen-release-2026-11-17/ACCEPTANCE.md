# Pinyin + Shenzhen release acceptance

Owner explicitly authorized six concrete pages, Git push and documentation; see OWNER-AUTHORIZATION.md. Initial local-only reports are historical and superseded for this release. Prepared 17 November; publication moves to 18 November 2026 because the browser approval review timed out across midnight. No fresh human approval on 18 November is claimed; only date metadata changed. APEC official homepage was reread on 18 November and still lists 18–19 November in Shenzhen; scheduled wording remains.

- 214/214 final tests. Production SEO: 421 English pages, 412 Sitemap URLs, 9 noindex previews, no errors.
- Two independent 3661-file builds agree; artifact SHA in freeze.json. Against verified prior production: 13 changed files, 52 added, 0 removed, 3596 unchanged. Existing dictionary/pinyin page and all protected story/audio/data/stroke assets are unchanged.
- Current production version e324e278-d904-4928-b6a6-746fd96daabb observed by Wrangler; 390 pre-release HTTP checks match the 3609-file rollback artifact. Original homepage-release checksum matches.
- Frozen candidate: Cloudflare Assets 390 old-site checks + 27 stroke-topic checks + 6 release routes, 51 assets, exact canonical/robots/Sitemap/RSS. Cloudflare default no-slash redirects are 307 preserving query; existing explicit 301 rules remain.
- Six phone layouts pass; shui3 lookup and Escape, actual publication date and index status checked in the frozen candidate. Detailed desktop/mobile, accessibility and real tool/print journeys remain linked from manifest.
- Isolated candidate → previous → candidate static pointer rollback rehearsal passes; no production or user storage touched.

Production deployed 2026-11-18T07:13:18.360938+08:00, explicit version c174bee3-e355-4f1b-99cf-e2e603018853 at 100%. Later equivalent version b1b3d675-5029-4b6c-b677-52be6cf4856f observed. Formal 390+27 HTTP, six pages/51 assets, Sitemap/RSS and browser journeys PASS; see deployment.json. Source d43c9f1 pushed to origin/main. First deploy connectivity failure resolved with exact-package retry. No IndexNow notification, recurring monitor, GSC ranking result or new teaching/audio signoff is claimed.
