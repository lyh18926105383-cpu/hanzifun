const test = require('node:test');
const assert = require('node:assert/strict');

const characters = require('../characters.js');
const lessons = require('../lessons.js');
const { getSceneIndexAtTime, saveStoryResult, STORY_STORAGE_KEY } = require('../story.js');

test('故事课包含五个有效且不重复的目标汉字', () => {
    const library = new Set(characters.map(item => item.char));
    for (const lesson of lessons) {
        assert.equal(lesson.targetChars.length, 5);
        assert.equal(new Set(lesson.targetChars).size, 5);
        lesson.targetChars.forEach(char => {
            assert.ok(library.has(char));
            assert.ok(lesson.storyText.includes(char));
        });
    }
});

test('故事场景时间递增并覆盖全部目标字', () => {
    for (const lesson of lessons) {
        assert.ok(lesson.scenes.length >= 3);
        const focusChars = lesson.scenes.flatMap(scene => scene.focusChars);
        lesson.scenes.forEach((scene, index) => {
            assert.ok(scene.image);
            assert.ok(scene.alt);
            assert.ok(scene.caption);
            if (index > 0) assert.ok(scene.startAt > lesson.scenes[index - 1].startAt);
        });
        lesson.targetChars.forEach(char => assert.ok(focusChars.includes(char)));
    }
});

test('认字题答案存在于选项中', () => {
    for (const lesson of lessons) {
        assert.ok(lesson.quiz.length >= 2);
        lesson.quiz.forEach(question => assert.ok(question.choices.includes(question.answer)));
    }
});

test('根据播放时间切换正确场景', () => {
    const scenes = lessons[0].scenes;
    assert.equal(getSceneIndexAtTime(scenes, 0), 0);
    assert.equal(getSceneIndexAtTime(scenes, 3.1), 0);
    assert.equal(getSceneIndexAtTime(scenes, 3.2), 1);
    assert.equal(getSceneIndexAtTime(scenes, 8), 2);
});

test('故事课结果保存在独立的本机记录中', () => {
    const values = new Map();
    const storage = {
        getItem: key => values.has(key) ? values.get(key) : null,
        setItem: (key, value) => values.set(key, value),
    };
    const saved = saveStoryResult(storage, { lessonId: 'cat-and-fish-01', quizCorrect: 3 });
    assert.equal(saved, true);
    assert.equal(JSON.parse(values.get(STORY_STORAGE_KEY)).sessions[0].quizCorrect, 3);
});
