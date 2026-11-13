# HanziFun · 汉字饭

**Learn Chinese characters visually—with stories, flashcards, and real-life context.**

[Visit HanziFun](https://hanzifun.online/) · [Explore the Dictionary](https://hanzifun.online/dictionary/) · [Explore Stroke order](https://hanzifun.online/stroke-order/) · [Try Free Flashcards](https://hanzifun.online/flashcards/)

HanziFun helps learners connect Chinese characters with their shapes, sounds, meanings, and everyday uses.

Explore a character, listen to its pronunciation, follow its stroke order, and practise remembering it. From a child's first picture story to a traveller's first restaurant order, HanziFun brings Chinese learning into familiar, meaningful moments.

## Who It's For

- **Kids and families** introducing Chinese through stories, character cards, and shared activities.
- **Travellers and business learners** building vocabulary for practical conversations.
- **Students and independent learners** studying characters, pronunciation, and HSK vocabulary.
- **Teachers** creating focused practice decks and printable learning materials.

## What You Can Explore

### Chinese Character Dictionary

Browse **339 published character entries** with pinyin, English meanings, pronunciation, example words, and sentences.

Explore character components, memory notes, and related characters. Search by Chinese character, pinyin, or English meaning, or browse the pinyin and radical indexes.

[Explore the dictionary →](https://hanzifun.online/dictionary/)

### Interactive Stroke Order

Watch characters take shape one stroke at a time. Play or pause the animation, move between strokes, and adjust the playback speed.

Stroke order is available within character pages and through a dedicated practice tool.

[Try the stroke order tool →](https://hanzifun.online/stroke-order/)

### Pinyin Chart with Audio

Explore **410 pinyin syllables**, organised into 24 groups. Filter by spelling, initial, or final, and listen to available pronunciations.

Print the chart in A4 or Letter format for a study reference.

[Open the pinyin chart →](https://hanzifun.online/pinyin-chart/)

### Flashcards and Personal Review

Practise with themed character sets or characters saved from the dictionary. Recall the meaning, reveal the answer, and choose **Familiar** or **Again** to guide future review.

Your learning history, saved characters, and review progress stay in your browser on your device. You can return to an unfinished session and continue practising without creating an account.

[Start practising →](https://hanzifun.online/flashcards/)

### HSK Learning Resources

Explore vocabulary resources that distinguish between **HSK 2.0** and **HSK 3.0**, with readings, meanings, and links to available character pages.

Current coverage includes level-one resources for both versions and an additional HSK 2.0 level-two vocabulary collection.

[Explore HSK resources →](https://hanzifun.online/academic/)

### Chinese for Everyday Situations

Learn through practical scenarios, including restaurants, airports, hotels, supermarkets, and business introductions.

Read sentences with pinyin and English translations, explore individual words, and follow links into character study and practice.

[Explore real-life scenarios →](https://hanzifun.online/scenarios/)

### Stories and Printable Activities

Introduce children to Chinese through illustrated stories, narration, read-along activities, and character recognition exercises.

Printable character cards support learning at home and in the classroom.

[Discover the kids zone →](https://hanzifun.online/kids/) · [Browse printable resources →](https://hanzifun.online/worksheets/)

### Culture Tools

Follow your curiosity into Chinese language and culture:

- **Chinese Name Explorer:** explore character combinations, sounds, and meanings.
- **Chinese Menu Decoder:** look up characters in food and menu terms.
- **Zodiac and Elements Calculator:** explore lunar-year animals and elements.
- **Tattoo Character Checker:** examine character meanings and context.
- **Teacher Decks:** create, save, practise, and print custom character sets.

[Explore the tools →](https://hanzifun.online/tools/)

### Learning Guides and Articles

Read about study routines, family learning, travel, and Chinese culture, with links to relevant characters and activities.

[Read the blog →](https://hanzifun.online/blog/)

## A Simple Learning Loop

1. **Discover** a character through a story, topic, or everyday situation.
2. **Understand** its pronunciation, meaning, shape, and usage.
3. **Practise** with stroke order and flashcards.
4. **Return** to saved characters and review what needs another look.

## Local Development

HanziFun uses a lightweight static-site architecture built with HTML, CSS, JavaScript, and Node.js build scripts. Browser-based learning features use local storage.

Install development dependencies:

```bash
npm ci
```

Run the automated tests:

```bash
npm test
```

Build the site:

```bash
npm run build:site
```

The generated website is written to `dist/`. To preview it with Python installed:

```bash
python3 -m http.server 8000 --directory dist
```

Open [localhost:8000](http://localhost:8000/) in your browser.

Generate a production build with:

```bash
npm run build:production
```

## Project Structure

```text
site/                     Page templates, layouts, routes, and site configuration
src/client/               Browser-side learning features and interactions
data/                     Character, pinyin, HSK, stroke, and source data
content/editorial/        Articles and printable resource definitions
public/                   Static assets copied into the build
assets/                   Shared images, audio, and story media
scripts/                  Build, validation, and content tooling
tests/                    Automated tests
docs/hanzifun-rebuild/     Specifications, task tracking, and handover notes
```

## Data and Attribution

HanziFun combines original teaching material with reference data from sources including CC-CEDICT, Unicode Unihan, Hanzi Writer Data, and Make Me a Hanzi.

Third-party datasets and assets retain their respective licenses and attribution requirements. See `data/licenses/` and the website's [Sources and Attribution](https://hanzifun.online/data-sources/) page for details.

## Contributing

Before making changes, read `AGENTS.md` and the current project status in:

- `docs/hanzifun-rebuild/PROGRESS.md`
- `docs/hanzifun-rebuild/TASKS.md`

Story-course work must also follow `STORY_COURSE_PRODUCTION_WORKFLOW.md`.

Keep changes focused, run the relevant checks, and update the project handover notes when completing a development task.
