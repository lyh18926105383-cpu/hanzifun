const test = require('node:test');
const assert = require('node:assert/strict');

const characters = require('../characters.js');
const {
    getActiveIndices,
    getProgress,
    findNextUnassessed,
    buildReviewQueue,
    resolveCharacters,
    resolveSessionCards,
} = require('../app.js');

test('字库按识字表顺序包含 108 张卡片', () => {
    const expected = [...'豆用力办法请才睡左右只旁龟脖壳安事命睛嘴肚害保找冠裁雪生语门没腿南北拍做瓜挂呆当叔说同相鼻眉双进医钱主方答姓女孩快步很肉身借问招怕惊遍原川规蚕插周发臂给孙军夏果西边欢正泉眼睛荷尖早夜所黑光点浪和姐群听男向几条久半候公'];
    assert.deepEqual(characters.map(item => item.char), expected);
    assert.equal(characters.length, 108);
    assert.equal(new Set(characters.map(item => item.char)).size, 107);
    assert.equal(characters.filter(item => item.char === '睛').length, 2);
});

test('每个汉字都有完整且有效的展示字段', () => {
    for (const item of characters) {
        assert.match(item.char, /^\p{Script=Han}$/u);
        assert.ok(item.word);
        assert.ok(item.emoji);
        assert.ok(item.hint);
        assert.ok(item.type === 'noun' || item.type === 'verb');
    }
});

test('第一轮每张卡只判断一次，全部判断后结束', () => {
    const statuses = [null, null, null];
    const activeIndices = getActiveIndices(statuses.length, [], false);
    let currentIndex = 0;

    statuses[currentIndex] = true;
    currentIndex = findNextUnassessed(activeIndices, currentIndex, statuses);
    assert.equal(currentIndex, 1);

    statuses[currentIndex] = false;
    currentIndex = findNextUnassessed(activeIndices, currentIndex, statuses);
    assert.equal(currentIndex, 2);

    statuses[currentIndex] = true;
    assert.equal(findNextUnassessed(activeIndices, currentIndex, statuses), undefined);
    assert.deepEqual(getProgress(statuses, activeIndices), {
        total: 3,
        completed: 3,
        remaining: 0,
        percent: 100,
        familiar: 2,
        unfamiliar: 1,
    });
    assert.deepEqual(buildReviewQueue(statuses), [1]);
});

test('复习模式只统计复习队列中的卡片', () => {
    const statuses = [true, false, true];
    const reviewQueue = buildReviewQueue(statuses);
    const activeIndices = getActiveIndices(statuses.length, reviewQueue, true);

    statuses[reviewQueue[0]] = null;
    assert.equal(getProgress(statuses, activeIndices).completed, 0);
    assert.equal(getProgress(statuses, activeIndices).remaining, 1);

    statuses[reviewQueue[0]] = true;
    assert.equal(findNextUnassessed(activeIndices, reviewQueue[0], statuses), undefined);
    assert.equal(getProgress(statuses, activeIndices).completed, 1);
});

test('可以按历史记录还原同一组汉字和原有顺序', () => {
    const library = [
        { char: '山', word: '高山' },
        { char: '水', word: '河水' },
        { char: '火', word: '火焰' },
    ];
    const session = {
        results: [
            { char: '水', status: false },
            { char: '山', status: true },
            { char: '云', status: false },
        ],
    };

    assert.deepEqual(resolveSessionCards(session, library), [library[1], library[0]]);
});

test('可以把薄弱字列表还原成一轮复习卡片', () => {
    const library = [
        { char: '山', word: '高山' },
        { char: '水', word: '河水' },
        { char: '火', word: '火焰' },
    ];

    assert.deepEqual(resolveCharacters(['火', '山', '云'], library), [library[2], library[0]]);
});
