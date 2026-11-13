# Rollback

Pre-release production version `d486aed9-1e80-467e-b32c-5cbc2504534f` matched the static previous backup in390 checks. For a material release regression:

```sh
NODE_OPTIONS=--dns-result-order=ipv4first node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback d486aed9-1e80-467e-b32c-5cbc2504534f --name hanzifun --message "Restore before primary navigation release" --yes
```

Backups/fingerprints live in `.cache/releases/primary-nav-release-2026-11-13/`. The isolated pointer rehearsal never switched production. Restore/recheck all existing stroke-topic/Pinyin/SEO/IndexNow content and preserve local user records. No scheduled monitor or future indexing result is claimed.
