(function(root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.HanziFunTtsCorpus = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    const VERSION = 'tts-v1';

    const PILOT_CHARACTERS = [
        '豆', '用', '只', '龟', '睛', '冠', '没', '当', '相', '答',
        '发', '给', '正', '泉', '眼', '夜', '和', '几', '听', '公',
    ];

    const PRONUNCIATION_OVERRIDES = {
        '只': {
            pinyin: 'zhi1',
            text: '只，一只的只，一只小鸟。',
        },
        '冠': {
            pinyin: 'guan1',
            text: '冠，皇冠的冠，闪亮皇冠。',
        },
        '没': {
            pinyin: 'mei2',
            text: '没，没有的没，这里没有。',
        },
        '当': {
            pinyin: 'dang1',
            text: '当，当心的当，走路当心。',
        },
        '相': {
            pinyin: 'xiang1',
            text: '相，相同的相，一模一样。',
        },
        '答': {
            pinyin: 'da2',
            text: '答，回答的答，认真回答。',
        },
        '发': {
            pinyin: 'fa4',
            text: '发，头发的发，头发飘飘。',
        },
        '给': {
            pinyin: 'gei3',
            text: '给，给你的给，送礼物。',
        },
        '正': {
            pinyin: 'zheng4',
            text: '正，正好的正，大小正好。',
        },
        '和': {
            pinyin: 'he2',
            text: '和，和好的和，友好相处。',
        },
        '几': {
            pinyin: 'ji3',
            text: '几，几个的几，数数几个。',
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
