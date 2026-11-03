# Rollback — blog-ui-release-2026-11-01

Verified previous production version: `964940e9-f78b-40d5-b8af-e72c1c4e793b` (2026-10-31). No service bindings are present; assets, compatibility date, redirects and 404 handling are preserved.

```sh
node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback 964940e9-f78b-40d5-b8af-e72c1c4e793b --name hanzifun --message "Restore pre-blog-redesign 404-URL baseline" --yes
```

Recheck `/`, `/blog/`, `/sitemap.xml` (404 URLs), `/tools/`, `/flashcards/teacher/` (noindex), HSK2 level 2, `/zh/`, old worksheet redirects with queries and existing MP3 requests. Do not clear or overwrite browser learning storage.

Local candidate/prior artifacts, source archive and file hashes are in ignored `.cache/releases/blog-ui-release-2026-11-01/`. The previous artifact was rebuilt from git `98f79fa`; its blog bytes match pre-release production. See `rollback-rehearsal.json` for the isolated rehearsal. No live rollback was performed as a rehearsal.
