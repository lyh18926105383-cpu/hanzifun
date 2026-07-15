(function(root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.HanziFunTtsCorpus = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    const VERSION = 'tts-v1';

    const PILOT_CHARACTERS = [
        '山', '水', '花', '风', '地', '发', '长', '给', '月', '雨',
        '鸟', '猫', '虎', '手', '牙', '饭', '家', '书', '车', '飞',
    ];

    const PRONUNCIATION_OVERRIDES = {
        '地': {
            pinyin: 'di4',
            text: '地，大地的地，大地母亲。',
        },
        '发': {
            pinyin: 'fa4',
            text: '发，头发的发，头发飘飘。',
        },
        '长': {
            pinyin: 'chang2',
            text: '长，长短的长，长长的。',
        },
        '给': {
            pinyin: 'gei3',
            text: '给，给你的给，送礼物。',
        },
    };

    function buildSpeechText(card) {
        const override = PRONUNCIATION_OVERRIDES[card.char];
        if (override) return override.text;
        if (card.word && card.word !== card.char) {
            return `${card.char}，${card.word}，${card.hint}。`;
        }
        return `${card.char}，${card.hint}。`;
    }

    function buildFileId(card, index) {
        const order = String(index + 1).padStart(3, '0');
        const codePoint = card.char.codePointAt(0).toString(16);
        return `${order}-${codePoint}`;
    }

    function buildCorpus(library) {
        return library.map((card, index) => ({
            id: buildFileId(card, index),
            char: card.char,
            word: card.word,
            hint: card.hint,
            text: buildSpeechText(card),
            pronunciation: PRONUNCIATION_OVERRIDES[card.char]?.pinyin || null,
            pilot: PILOT_CHARACTERS.includes(card.char),
        }));
    }

    return {
        VERSION,
        PILOT_CHARACTERS,
        PRONUNCIATION_OVERRIDES,
        buildSpeechText,
        buildFileId,
        buildCorpus,
    };
});
