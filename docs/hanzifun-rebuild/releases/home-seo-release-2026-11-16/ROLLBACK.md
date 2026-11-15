# Homepage SEO rollback

The verified previous production version is `dc532d9e-5506-4415-a50a-a166e1e80f5f`, deployment `09dd977c-b8a3-47ed-a45e-56ea94bba467`. Its static backup is `.cache/releases/home-seo-release-2026-11-16/previous`; the complete file hashes remain in the adjacent previous-files.json, with the aggregate hash in previous-artifact.json.

If post-deployment checks fail, restore that existing version with Wrangler rollback against the existing hanzifun configuration, then repeat the production HTTP checks against the previous backup. Alternatively, deploy that verified previous directory through a separate Assets-only config for hanzifun using strict/keep-vars. Do not rebuild older source or use the new candidate directory as the rollback payload.

An isolated candidate → previous → candidate pointer rehearsal passed; see rollback-rehearsal.json. This is a static-only change: there is no database/schema migration, local-storage deletion or reset of learner records.
