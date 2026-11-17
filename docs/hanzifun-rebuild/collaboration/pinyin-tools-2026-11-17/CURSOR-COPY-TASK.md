# Cursor copy task · Pinyin tools

Owner authorized Cursor assistance on 2026-11-17. Codex owns implementation, integration, acceptance and handover. Use the existing available model; do not purchase credits or enable paid API usage.

## Exact workspace and write boundary

Target: `/Users/graceshi/.codex/worktrees/92f7/汉字饭hanzifun`.
This is different from the older Desktop main checkout. Read target AGENTS.md and only the recent top of target PROGRESS.md / TASKS.md. You may create/edit ONLY target `content/pinyin-tools/prose.json`. Use absolute paths. Do not modify any other checkout, dependencies, source, tests, task/progress files or Git metadata. Do not commit, push or deploy. No .env/credentials needed.

## Deliverable

Write one valid JSON object with exactly `converter`, `tones`, `toneMarks` keys. Each value has:

```json
{"intro":"one sentence","steps":["step one","step two","step three"],"explanation":"150–220 words in plain text","faqs":[{"question":"...","answer":"..."}]}
```

Five original FAQ entries per page. Plain strings only, no HTML or Markdown. English audience: beginner Mandarin learners, parents and teachers. Useful writing, no padding or keyword repetition. State capabilities accurately:

- `/pinyin-chart/chinese-to-pinyin/`: local browser Hanzi-to-pinyin tool. Simplified/traditional text. Tone marks / numeric tones / unmarked pinyin, optional hanzi comparison and copy. Phrase context can help with polyphonic readings but names and uncommon uses need checking. Preserve punctuation. No translation, OCR, dictionary or audio promised here. Explain conversion is phonetic transcription rather than translating meaning. Avoid claims that all readings are always correct.
- `/pinyin-chart/tones/`: four lexical Mandarin tones and context-dependent neutral tone, audio examples and a listening quiz using existing static syllable recordings. Use mā/má/mǎ/mà. Third tone in running speech is often low; isolated full third tone is not a mandatory rise every time. Explain tone sandhi simply without inventing automatic speech grading, recording, microphone or new audio capabilities. No claim singing melodies reliably teaches lexical tones.
- `/pinyin-chart/tone-marks/`: local numeric-to-marked pinyin editor, e.g. ni3 hao3 -> nǐ hǎo, lv4 -> lǜ, nv3 -> nǚ. Reverse marks-to-numbers and strip tone marks. Can use ü/v/u: aliases. Must keep lu distinct from lü. Explain mark placement (a, then e, ou on o, otherwise final vowel; iu/ui mark the second vowel). Neutral 0/5 removes the tone mark. No translation and no Chinese IME (does not turn nihao into 你好).

All tools are free, no signup/payment/cloud sync; conversion stays in the browser. Main `/pinyin-chart/` is the interactive 410-syllable pronunciation chart. The main SEO title and description are preserved; H1 changed by Owner to Look up Pinyin. Do not draft the main page or story lessons.

Run JSON parsing and report exact output path, keys, word counts and any limits. Complete autonomously within the boundary, return actual checks. If the task cannot run, report the reason without altering settings or installing software.
