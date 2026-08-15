const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const characters = require('../characters.js');
const lessons = require('../lessons.js');
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

test('首页按标题、故事课、识字卡、学习记录顺序组织模块', () => {
    const homepage = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    const moduleOrder = [
        'id="homeTitle"',
        'id="storyCourses"',
        'id="flashcards"',
        'id="learningRecord"',
    ].map(marker => homepage.indexOf(marker));

    assert.deepEqual(moduleOrder, [...moduleOrder].sort((a, b) => a - b));
    assert.match(homepage, />听故事·识汉字<\/h1>/u);
    assert.match(homepage, />看一看·翻一翻·轻松学汉字<\/p>/u);
    assert.match(homepage, /href="#storyCourses"/);
    assert.match(homepage, /href="#flashcards"/);
    assert.match(homepage, /id="homeRoundCount"/);
    assert.match(homepage, /id="homeCharacterCount"/);
    assert.match(homepage, /id="homeWeakCount"/);
    assert.doesNotMatch(homepage, /今天学到哪儿啦？/);
    assert.doesNotMatch(homepage, /记录保存在当前设备，随时回来继续。/);
    assert.doesNotMatch(`${homepage}\n${appSource}`, /目前没有薄弱字[，,].*继续保持/);
    assert.doesNotMatch(`${homepage}\n${appSource}`, /homeWeakSummary/);
    assert.match(homepage, /id="storyList"/);
    assert.match(homepage, /id="btnBackToTop"/);
    const learningRecordStart = homepage.indexOf('id="learningRecord"');
    const learningRecordEnd = homepage.indexOf('</section>', learningRecordStart);
    const backToTopPosition = homepage.indexOf('id="btnBackToTop"');
    assert.ok(backToTopPosition > learningRecordStart && backToTopPosition < learningRecordEnd);
    assert.match(homepage, /<script src="lessons\.js"><\/script>/);
    assert.equal(lessons.length, 8);
});
