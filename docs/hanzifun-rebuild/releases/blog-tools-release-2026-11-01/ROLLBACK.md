# Combined release rollback

Verified previous production version: `d448b127-6331-464b-b719-0e5ebdd9c415`. It retains the approved Blog and restores the pre-gallery Tools UI.

```sh
node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback d448b127-6331-464b-b719-0e5ebdd9c415 --name hanzifun --message "Restore approved Blog before Tools gallery" --yes
```

Recheck Blog/RSS/photos, Tools routes, private teacher noindex, Sitemap404, Chinese/legacy redirects with queries and MP3 access. Do not clear browser learning records. Local previous and candidate artifacts/hashes are in `.cache/releases/blog-tools-release-2026-11-01/`; isolated pointer rollback was exercised, production was not switched back as a rehearsal.
