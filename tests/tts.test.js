const test = require('node:test');
const assert = require('node:assert/strict');

const characters = require('../characters.js');
const {
    PILOT_CHARACTERS,
    PRONUNCIATION_OVERRIDES,
    buildSpeechText,
    buildCorpus,
} = require('../tts-corpus.js');
const {
    normalizeManifest,
    getManifestEntry,
    createAudioController,
} = require('../audio.js');

test('TTS 语料覆盖 200 个汉字且文件编号唯一', () => {
    const corpus = buildCorpus(characters);
    assert.equal(corpus.length, 200);
    assert.equal(new Set(corpus.map(item => item.id)).size, 200);
    assert.equal(new Set(corpus.map(item => item.char)).size, 200);
    for (const item of corpus) {
        assert.ok(item.text.startsWith(item.char));
        assert.ok(item.text.endsWith('。'));
    }
});

test('试听集包含 20 个代表字和全部多音字修正', () => {
    assert.equal(PILOT_CHARACTERS.length, 20);
    assert.equal(new Set(PILOT_CHARACTERS).size, 20);
    for (const char of Object.keys(PRONUNCIATION_OVERRIDES)) {
        assert.ok(PILOT_CHARACTERS.includes(char));
    }
    assert.equal(buildSpeechText(characters.find(item => item.char === '发')), '发，头发的发，头发飘飘。');
    assert.equal(buildSpeechText(characters.find(item => item.char === '给')), '给，给你的给，送礼物。');
});

test('音频清单只接受有 URL 的条目', () => {
    const manifest = normalizeManifest({
        version: 'tts-v1',
        voice: 'test',
        cards: {
            '山': { url: 'audio/tts-v1/001.mp3' },
            '水': { text: '水，滴滴水珠。' },
        },
    });
    assert.equal(getManifestEntry(manifest, { char: '山' }).url, 'audio/tts-v1/001.mp3');
    assert.equal(getManifestEntry(manifest, { char: '水' }), null);
    assert.equal(getManifestEntry(null, { char: '山' }), null);
});

test('有静态资源时优先播放预生成音频', async () => {
    const events = [];
    class FakeAudio {
        constructor(url) {
            this.url = url;
            this.currentTime = 0;
        }
        load() {
            events.push(`load:${this.url}`);
        }
        play() {
            events.push(`play:${this.url}`);
            return Promise.resolve();
        }
        pause() {
            events.push(`pause:${this.url}`);
        }
    }
    const controller = createAudioController({
        fetch: async () => ({
            ok: true,
            json: async () => ({
                version: 'tts-v1',
                cards: { '山': { url: 'audio/shan.mp3' } },
            }),
        }),
        Audio: FakeAudio,
        speechSynthesis: { cancel() {}, speak() { events.push('fallback'); } },
        SpeechSynthesisUtterance: class {},
    });

    assert.equal(await controller.preload({ char: '山' }), true);
    assert.deepEqual(await controller.play({ char: '山' }), { mode: 'static-audio' });
    assert.ok(events.includes('load:audio/shan.mp3'));
    assert.ok(events.includes('play:audio/shan.mp3'));
    assert.ok(!events.includes('fallback'));
});

test('静态音频不可用时退回浏览器中文朗读', async () => {
    const spoken = [];
    class FakeUtterance {
        constructor(text) {
            this.text = text;
        }
    }
    const controller = createAudioController({
        fetch: async () => ({ ok: true, json: async () => ({ version: 'tts-v1', cards: {} }) }),
        speechSynthesis: {
            cancel() {},
            speak(utterance) { spoken.push(utterance); },
        },
        SpeechSynthesisUtterance: FakeUtterance,
        corpusApi: { buildSpeechText },
    });
    const card = characters.find(item => item.char === '长');
    const result = await controller.play(card);

    assert.equal(result.mode, 'speech-synthesis');
    assert.equal(spoken[0].text, '长，长短的长，长长的。');
    assert.equal(spoken[0].lang, 'zh-CN');
});

test('关闭声音后不播放也不触发兜底', async () => {
    let spoken = false;
    const controller = createAudioController({
        enabled: false,
        fetch: async () => ({ ok: true, json: async () => ({ cards: {} }) }),
        speechSynthesis: { cancel() {}, speak() { spoken = true; } },
        SpeechSynthesisUtterance: class {},
    });

    assert.deepEqual(await controller.play({ char: '山', hint: '一座高山' }), { mode: 'disabled' });
    assert.equal(spoken, false);
});
