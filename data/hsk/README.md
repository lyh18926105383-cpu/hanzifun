# HF-07 source-backed level-one libraries

Only headwords, source edition, level and list membership are extracted from HSK. No official definitions, pinyin, examples, questions, PDF/XLSX layouts or logos are redistributed. Exact source hashes/URLs/transport and the project scope decision are in `../sources.lock.json` and `../licenses/HSK-SCOPE.md`.

- `source-headwords.json`: bounded headword facts, source ordinals and sheet/cell or PDF page/line/row locators. PDF page numbers are physical, 1-based (the first vocabulary page is PDF page 80 / printed page 77). `sourceLabel` retains official homograph numbering and the old 喂（叹词） label; `glyph` removes only headword annotation/numbering.
- `membership.json`: the existing membership schema, extended to preserve the official combined level `1-2` writing list. Old vocabulary 150 / derived characters 174; newer vocabulary 300 / recognition 246 / combined writing 100. Level-1 incremental and cumulative sets coincide. Recognition is not inferred from vocabulary: 店 and 饺 occur in level-1 words but not its recognition list.
- `lexicon.json`: 213 supplemental characters, source-backed candidate readings/senses/Traditional relations/Unihan fields, component evidence and raw stroke hashes, plus distinct vocabulary records. All supplemental entries are teaching drafts, not accepted Tier 2. The original 126 core data and IDs remain unchanged. 您好 lacks an exact locked CEDICT headword; the scenario labels its original contextual gloss instead of inventing a dictionary record.
- `strokes/`: 213 unchanged per-character Hanzi Writer 2.0.1 graphics files. Published at the existing `/data/strokes/{codepoint}.json` path, with lazily requested version hashes. No duplicated full graphics archive is committed.
- `coverage.json`: independently validated source denominators, core overlap, dictionary attestation and acceptance counts. The 339-character site union includes the original core and scenario-only additions; it is not a claimed official HSK count.

## Rebuild

1. Restore the already locked HF-02 archives with its source-fetch workflow if needed; do not silently upgrade CC-CEDICT/Unihan/graphics.
2. `node scripts/fetch-hsk-sources.mjs` restores the ignored official XLSX/PDF using locked transport URLs and checks bytes. The older official host failed TLS during this run, so its original XLSX was transported through Internet Archive capture 20231029193623; its 150 normalized level-1 headwords match Jina's current official-URL extraction exactly.
3. `python scripts/extract-hsk-sources.py` (Python with pypdf 6.10.0 in the verified runtime) re-extracts bounded membership facts. Any source change must be reviewed before explicitly updating the source-headwords hash in the lock. Raw archives and whole-PDF text remain in ignored `.cache/hf07/`.
4. `node scripts/build-hsk-data.mjs` performs offline hash-checked extraction from the locked CC-CEDICT, Unihan, component and graphics archives. `HF_HSK_OUTPUT_DIR=/absolute/temp/path` writes a separate reproduction.
5. `node scripts/validate-hsk-data.mjs` validates membership/schema, independent counts, IDs/locators, readbacks, component references, raw stroke hashes, sentence boundaries and byte-identical rebuild. `--no-rebuild` runs the same structural checks without reconstructing artifacts.

CC-CEDICT contributor/MDBG readings and senses remain CC BY-SA 4.0. Unicode fields retain Unicode License v3. MMH component fields retain LGPL-3.0-or-later and modifiable source locators/build code. Graphics retain Arphic Public License. These are separate field/data licenses, not a single website code license. Original scenario text is in `../scenarios/scenarios.json` with its explicit AI quick review and pending human/listening acceptance.

HSK main libraries have complete source membership and learning links and may be indexed under the scoped decision. Supplemental dictionary and scene pages remain previews because teaching/audio acceptance is pending, never because illustrations or a new written permission are missing. Filters use fragments with one canonical library address. Practice and favorites use constituent character IDs, not invented word rating events.
