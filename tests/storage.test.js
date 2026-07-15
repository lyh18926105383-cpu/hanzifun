const test = require('node:test');
const assert = require('node:assert/strict');

const {
    STORAGE_KEY,
    createEmptyData,
    loadData,
    saveData,
    clearData,
    recordSession,
    getDashboard,
    createStore,
} = require('../storage.js');

function createMemoryStorage(initialValue = null) {
    const values = new Map();
    if (initialValue !== null) values.set(STORAGE_KEY, initialValue);
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
        removeItem(key) {
            values.delete(key);
        },
    };
}

test('损坏或不可用的本机数据不会影响页面启动', () => {
    assert.deepEqual(loadData(createMemoryStorage('{bad json')), createEmptyData());
    assert.deepEqual(loadData({ getItem() { throw new Error('blocked'); } }), createEmptyData());
    assert.equal(saveData({ setItem() { throw new Error('blocked'); } }, createEmptyData()), false);
});

test('完成首轮后保存学习记录并生成薄弱字', () => {
    const storage = createMemoryStorage();
    const store = createStore(storage);
    const completedAt = Date.UTC(2026, 6, 15, 8, 30);

    const outcome = store.record({
        kind: 'learning',
        cards: [{ char: '山' }, { char: '水' }],
        statuses: [true, false],
        completedAt,
    });
    const dashboard = store.getDashboard();

    assert.equal(outcome.saved, true);
    assert.equal(dashboard.learningRounds, 1);
    assert.equal(dashboard.learnedCharacters, 2);
    assert.deepEqual(dashboard.weakCharacters.map(item => item.char), ['水']);
    assert.deepEqual(loadData(storage), store.getData());
});

test('复习为熟悉后移出薄弱字但保留历史次数', () => {
    const firstPass = recordSession(createEmptyData(), {
        kind: 'learning',
        cards: [{ char: '水' }],
        statuses: [false],
        completedAt: 1000,
    });
    const afterReview = recordSession(firstPass, {
        kind: 'review',
        cards: [{ char: '水' }],
        statuses: [true],
        completedAt: 2000,
    });
    const dashboard = getDashboard(afterReview);

    assert.equal(dashboard.learningRounds, 1);
    assert.equal(dashboard.reviewRounds, 1);
    assert.equal(dashboard.weakCharacters.length, 0);
    assert.deepEqual(afterReview.characters['水'], {
        seenCount: 2,
        familiarCount: 1,
        unfamiliarCount: 1,
        needsReview: false,
        lastResult: true,
        lastSeenAt: 2000,
    });
});

test('可以清空当前设备上的全部学习记录', () => {
    const storage = createMemoryStorage(JSON.stringify({
        version: 1,
        sessions: [],
        characters: { 山: { seenCount: 1, familiarCount: 1 } },
    }));

    assert.equal(clearData(storage), true);
    assert.deepEqual(loadData(storage), createEmptyData());
});

test('学习足迹只展示最近八轮并保留每轮汉字', () => {
    let data = createEmptyData();
    for (let index = 1; index <= 10; index += 1) {
        data = recordSession(data, {
            kind: 'learning',
            cards: [{ char: String(index) }],
            statuses: [index % 2 === 0],
            completedAt: index,
        });
    }

    const recentSessions = getDashboard(data).recentSessions;
    assert.equal(recentSessions.length, 8);
    assert.deepEqual(recentSessions.map(session => session.results[0].char), ['10', '9', '8', '7', '6', '5', '4', '3']);
});
