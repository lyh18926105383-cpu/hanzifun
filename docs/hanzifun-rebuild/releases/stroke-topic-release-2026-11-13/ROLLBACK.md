# Rollback

Pre-release production version: `b2f87f9e-7431-4ad6-ab1c-1bba1aacf5fa` (100% traffic, observed from Cloudflare before this release). Production-before 390 checks matched the origin/main static backup.

For a material production regression, restore that existing version:

```sh
NODE_OPTIONS=--dns-result-order=ipv4first node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback b2f87f9e-7431-4ad6-ab1c-1bba1aacf5fa --name hanzifun --message "Restore before stroke-topic release" --yes
```

Frozen previous/candidate assets and per-file fingerprints are retained in `.cache/releases/stroke-topic-release-2026-11-13/`. See isolated rollback-rehearsal.json. Recheck existing 339 pages, Pinyin/SEO/IndexNow, Blog/Tools, legacy redirects, audio and all topic routes. Preserve local learning records; no cleanup, database operation or production rollback was performed for rehearsal. Owner can review full 24-hour/7-day windows and later GSC results manually; observations are pending and no automation was created.
