# Rollback — SEO copy 2026-11-11

Actual previous Worker version: `7dbd256d-f587-44c3-9e5b-b1d022621052` (100% traffic verified before release).

Restore that version on the existing hanzifun service if production checks fail, then verify against `/private/tmp/hanzifun-seo-release-20261111/previous`. Candidate and previous artifacts are retained there with full manifests in this release directory. Isolated candidate → previous → candidate restoration passed by exact file hashes; production was not switched during rehearsal.

No account data, browser learning records, database or media content is modified. If an IndexNow notification has already been sent, a rollback requires notifying those changed URLs again after the restore is verified.
