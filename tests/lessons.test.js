const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const characters = require('../characters.js');
const lessons = require('../lessons.js');
const storyAudioManifest = require('../assets/lessons/cat-and-fish/audio/manifest.json');
const {
    getSceneIndexAtTime,
    getEqualSceneIndex,
    saveStoryResult,
    STORY_STORAGE_KEY,
} = require('../story.js');

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

test('每个故事场景的插图文件都已归档', () => {
    for (const lesson of lessons) {
        lesson.scenes.forEach(scene => {
            assert.ok(fs.existsSync(path.resolve(__dirname, '..', scene.image)), scene.image);
        });
    }
});

test('故事、跟读和找一找都使用已归档的固定语音', () => {
    assert.equal(storyAudioManifest.voice, 'tencent-502007');
    for (const lesson of lessons) {
        const audioPaths = [
            lesson.narrationAudio,
            ...lesson.scenes.map(scene => scene.audio),
            ...lesson.practice.map(item => item.audio),
            ...lesson.quiz.map(question => question.audio),
            ...lesson.quiz.map(question => question.correctAudio),
            lesson.feedback.tryAgainAudio,
            lesson.feedback.completeAudio,
        ];
        audioPaths.forEach(audioPath => {
            assert.ok(audioPath);
            assert.ok(fs.existsSync(path.resolve(__dirname, '..', audioPath)), audioPath);
        });
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
    assert.equal(getSceneIndexAtTime(scenes, 3.7), 0);
    assert.equal(getSceneIndexAtTime(scenes, 3.8), 1);
    assert.equal(getSceneIndexAtTime(scenes, 8.6), 2);
});

test('固定旁白按总时长等分为三个画面', () => {
    assert.equal(getEqualSceneIndex(3, 0, 9), 0);
    assert.equal(getEqualSceneIndex(3, 2.99, 9), 0);
    assert.equal(getEqualSceneIndex(3, 3, 9), 1);
    assert.equal(getEqualSceneIndex(3, 6, 9), 2);
    assert.equal(getEqualSceneIndex(3, 9, 9), 2);
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
