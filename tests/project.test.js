const test = require('node:test');
const assert = require('node:assert/strict');

const characters = require('../characters.js');
const {
    getActiveIndices,
    getProgress,
    findNextUnassessed,
    buildReviewQueue,
} = require('../app.js');

test('字库包含 200 个不重复汉字', () => {
    assert.equal(characters.length, 200);
    assert.equal(new Set(characters.map(item => item.char)).size, 200);
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
