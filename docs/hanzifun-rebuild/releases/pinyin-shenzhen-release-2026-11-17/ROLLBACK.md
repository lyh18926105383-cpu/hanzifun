# Static rollback

If production smoke checks fail, stop and restore the verified previous Cloudflare version `e324e278-d904-4928-b6a6-746fd96daabb` using Wrangler rollback (verify command help first), or deploy the preserved static `previous` directory using the independent `rollback.json` config. Use strict/keep-vars; do not rebuild or alter bindings.

Local release root: `.cache/releases/pinyin-shenzhen-release-2026-11-17/`. `previous` is the exact 3609-file verified prior artifact; fingerprint is in previous-artifact.json and full paths/hashes are in ignored previous-files.json. `candidate` is frozen independently with its own fingerprint. The old homepage candidate was copied, not moved.

No database, account or localStorage migration is involved. Never clear user records as rollback. After restoring, rerun scripts/verify-release-http.mjs against previous and verify canonical, redirects, Range and main learning entries. Isolated static pointer rehearsal is in rollback-rehearsal.json.

Owner may manually review 24-hour/7-day errors and Search Console indexing after release. Those future windows are not yet observed and no scheduled monitoring was created.
