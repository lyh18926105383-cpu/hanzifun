# HF-13 file-based editorial workflow

`articles.json` is the maintained source for the three formal culture / travel-business / family articles. The old `site/data.mjs` samples only preserve the 77-path prototype inventory; the build replaces their pages. Existing AdSense guides remain maintained separately in `site/content/adsense/`.

- `draft`: preview body only in local/staging; production emits a noindex preparation page at the existing route. Full prose is excluded from production browser data/search/home cards.
- `reviewed`: explicit human decision, reviewer/date/evidence and current content SHA-256 required. May render publicly without indexing.
- `published`: same valid review plus fixed publication date, and an explicit published entry in `site/release.json` before indexing.
- `archived`: body excluded, route remains noindex. Remove its published release entry when archiving.

Run `node scripts/review-editorial.mjs --decision decisions.json` for a dry run, then append `--apply` to store a real human review. Decision records require `slug`, `acceptance: approved`, `kind: human`, `reviewer`, `date`, `contentSha256`, and `evidence`. Never populate a human decision from an AI quick review. After approval, set a fixed publication date and published state/release route as part of the reviewed release candidate. Changing title, author, prose, references, character IDs, deck or image invalidates the signature. Publication date and workflow status are excluded from the body digest to permit the reviewed-to-published transition.

The build validates schema, dates, duplicate slugs, references, image alt, approved dictionary links and related deck. Production refuses an unreviewed indexable article. A legitimate visible Codex author byline is allowed by the learner-copy gate only in an exact attribution span; pipeline prose still fails. Article JSON-LD is checked against visible title, author, canonical and fixed dates.

`worksheets.json` defines the family/classroom six-card sets. Values are read from the already signed core dictionary and checked against its actual review decisions. No new pronunciation, teaching text or font asset is imported. `/worksheets/{family,classroom}/` supports portrait A4/Letter at 100%, with browser headers/footers off. HTML remains the maintained printable resource; PDF samples are evidence under `docs/hanzifun-rebuild/evidence/hf13/`.

Verification: `node --test tests/editorial-workflow.test.mjs tests/starter-100.test.mjs`, the production build / SEO / full test commands, then a local build at `/private/tmp/hf13-preview` and `node scripts/verify-editorial-browser.mjs`. The browser script uses a new isolated visitor context for each journey, waits for atomic completion storage before refreshing, and does not touch the Owner browser profile.
