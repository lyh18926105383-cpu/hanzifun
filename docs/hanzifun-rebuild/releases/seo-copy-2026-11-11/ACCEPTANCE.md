# SEO copy release — 2026-11-11

Owner explicitly authorized production deployment, Git push, IndexNow notification for changed pages and updating TASKS/PROGRESS.

- Source: 44a2a95, fast-forward push to origin/main succeeded.
- Production version `a50a93a9-829c-4ab1-bf71-0f16fac5f8bb`, 100% traffic, 2026-11-11T22:20:54.026151+08:00.
- Actual preceding version `7dbd256d-f587-44c3-9e5b-b1d022621052` retained for rollback. It was newer than the earlier manual IndexNow deployment receipt but matched the previous artifact in all 390 pre-release HTTP checks.
- Rebuilt 3189 files and matched the previously validated 203/203-test candidate byte for byte. No source changes since that test run; no unnecessary repeated test suite run. SEO errors=[]; sitemap still 404 URLs.
- Only ten requested HTML pages and content-manifest review source hash differ from the previous release. Key file, other pages and static assets unchanged. Deployment rebuild matches frozen candidate hashes.
- Isolated candidate → previous → candidate restoration PASS; production was not rolled back.
- Production 390/390 HTTP checks PASS. Chrome 1440/390px: 20/20 checks PASS for exact Title/Description/H1, preserved Kids/Worksheets headings, canonical/index directives, and no overflow. pageErrors=[].
- Live key HTTP200, 32 bytes match the owner file.
- Submitted exactly the ten changed public URLs to IndexNow once. HTTP 202: received, key validation pending. Not an indexing or ranking guarantee. Actual response and submitted URLs are in indexnow-submission.json; key value redacted.
- Final handoff/docs are committed separately and pushed to origin/main. No account, cloud sync, billing, learning-storage or story-media changes.
