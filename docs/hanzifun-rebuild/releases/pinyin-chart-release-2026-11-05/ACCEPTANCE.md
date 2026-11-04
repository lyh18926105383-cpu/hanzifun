# Pinyin Chart release acceptance

## Authorized scope

The Owner approved the Pinyin Chart copy and grouping, removal of the page's Stop audio control and general audio note, an online pronunciation introduction, and one-click printing. This release keeps the existing syllable records and playable samples.

## Pre-deployment checks

- The production build contains 3188 public files. Rebuilding the candidate produces the same per-file hash manifest.
- npm test passes 203 tests with no skipped tests.
- npm run validate:seo reports no errors. The canonical Pinyin Chart URL remains in the 404-URL production sitemap.
- The candidate adds three public output files relative to a production rebuild of current main: pinyin-chart/index.html, site-assets/pinyin-chart.v1.css, and site-assets/pinyin-chart.v1.mjs.
- The old production page was fetched before deployment and showed the previous title and H1.
- Local Wrangler HTTP checks pass for 390 routes and resources, including all 339 character pages.
- Chrome checks confirm the print action, the complete 410-syllable printout after filtering, tone forms, audio, keyboard behavior, and page restoration. The screen has no horizontal overflow at 360, 540, 581, or 1390 CSS pixels.
- A4 and Letter print previews each contain five readable pages.
- No accounts, cloud sync, billing, stories, or user learning records are included in the release.

## Deployment and production verification

Deployment authorization is recorded in the manifest. The current Cloudflare version is reserved as the rollback target. The actual new version, deployment ID, production HTTP checks, and online browser result will be recorded in deployment.json after deployment.

## Production result

Release commit 4ef23d7 was pushed to origin/main. Wrangler 4.156.0 deployed version fd7c4714-615c-4791-a8e0-4cf9fdf70c93 at 100% traffic. The exact production deployment ID, time, and checks are recorded in deployment.json.

After deployment, 390 production HTTP checks passed with zero errors, including all 339 character pages, and the Chrome browser journey passed with no page errors. The live Pinyin Chart has the updated title, H1, definition and product introduction. Its 24 groups, print button, full chart print after filtering and pronunciation playback were verified. A4 and Letter previews each contain five pages.
