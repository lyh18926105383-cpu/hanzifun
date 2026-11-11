# Rollback — IndexNow key release

Previous actual Cloudflare Worker version: `868b1621-2470-4150-a8aa-2b4a4c925a86`.

If this release breaks production, restore that version using Wrangler rollback for the existing hanzifun service, then rerun the production HTTP checker with the previous artifact. This removes the key file while retaining the previous learning website. No browser storage, account data or database is changed by this release.

Previous static artifact: `/private/tmp/hanzifun-indexnow-20261111/previous`; candidate: `/private/tmp/hanzifun-indexnow-20261111/candidate`. Manifests in this release directory. Isolated candidate → previous → candidate rehearsal passed; no rollback was performed on production.
