# Pinyin Chart rollback

The actual pre-release production version is recorded in manifest.json. It remains available in Cloudflare as a static rollback target.

    WRANGLER_LOG_PATH=/private/tmp/wrangler-logs \
      node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js \
      rollback ae7f0dd3-a9a9-44ae-a77a-332922dac2a9 \
      --name hanzifun \
      --message "Restore production before Pinyin Chart release" \
      --yes

This release does not write or migrate account data. After rollback, verify /pinyin-chart/, the sitemap, pinyin character index, Blog, Tools, flashcards, Chinese pages, and audio resources. The rebuilt previous static package and its per-file SHA-256 manifest are preserved in .cache/releases/pinyin-chart-release-2026-11-05/.
