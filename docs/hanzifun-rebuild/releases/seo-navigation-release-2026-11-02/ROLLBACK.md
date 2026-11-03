# SEO release rollback

Verified previous Cloudflare production version: `32b8140f-a7cb-4b5c-9592-06f5a0a73f2f` (2026-11-01 01:06:42 +08:00). This is newer than the earlier log version 992a6d92; use the actual pre-release version.

```sh
NODE_OPTIONS=--dns-result-order=ipv4first node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback 32b8140f-a7cb-4b5c-9592-06f5a0a73f2f --name hanzifun --message "Restore production before SEO navigation release" --yes
```

Static previous/candidate copies and per-file hashes are retained in ignored `.cache/releases/seo-navigation-release-2026-11-02/`. The isolated candidate→previous→candidate pointer restoration was verified; production was not switched back as a rehearsal. Preserve all browser records. Recheck the three SEO pages, Blog/Tools, teacher noindex, Sitemap404, Chinese/query redirects and old audio.
