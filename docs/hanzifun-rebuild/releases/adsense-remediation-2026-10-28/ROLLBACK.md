# Static production rollback

Actual pre-release version: `3167ce5a-c87c-4405-88f1-a3eac7722b9f` (100% traffic). Observed production Sitemap: 358 URLs.

```sh
node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback 3167ce5a-c87c-4405-88f1-a3eac7722b9f --name hanzifun --message "Restore pre-AdSense-remediation production" --yes
```

Use if production smoke checks fail. Recheck homepage, /zh/, /privacy/, Sitemap and resources afterward. This restores the old static assets and index configuration; it does not delete browser learning records. Cloudflare retains this version. Rollback command shape is supported by the installed Wrangler 4.153.0; no live rollback is performed as a rehearsal.
