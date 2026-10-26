const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const lessons = require('../lessons.js');
const {
    getSceneIndexAtTime,
    getEqualSceneIndex,
    prefersStaticSceneMedia,
    getSceneVideoVolume,
    saveStoryResult,
    selectLesson,
    shuffleChoices,
    getActiveKeywordAtTime,
    getStoryTailDelay,
    STORY_STORAGE_KEY,
} = require('../story.js');

function resolveProjectAsset(assetUrl) {
    const relativePath = assetUrl.split(/[?#]/, 1)[0];
    return path.resolve(__dirname, '..', relativePath);
}

test('故事课包含至少五个有效且不重复的目标汉字', () => {
    for (const lesson of lessons) {
        assert.ok(lesson.targetChars.length >= 5);
        assert.equal(new Set(lesson.targetChars).size, lesson.targetChars.length);
        assert.equal(lesson.practice.length, lesson.targetChars.length);
        lesson.targetChars.forEach(char => {
            assert.match(char, /^\p{Script=Han}$/u);
            assert.ok(lesson.storyText.includes(char));
        });
    }
});

test('蚂蚁搬豆包含“用”并按旁白配置字幕关键词', () => {
    const lesson = lessons.find(item => item.id === 'ant-moving-bean-02');
    assert.ok(lesson.targetChars.includes('用'));
    assert.ok(lesson.practice.some(item => item.char === '用'));
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['用', '力', '豆', '办', '法', '请']
    );
});

test('花猫照镜子包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'cat-mirror-03');
    assert.deepEqual(lesson.targetChars, ['才', '睡', '左', '右', '只', '旁']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['才', '睡', '左', '右', '旁', '只']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('小乌龟包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'little-turtle-04');
    assert.deepEqual(lesson.targetChars, ['龟', '脖', '壳', '安', '事', '命']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['龟', '脖', '壳', '事', '安', '命']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('小青蛙包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'little-frog-05');
    assert.deepEqual(lesson.targetChars, ['睛', '嘴', '肚', '害', '保', '找']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['睛', '嘴', '肚', '害', '保', '找']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('画鸡包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'painting-rooster-06');
    assert.deepEqual(lesson.targetChars, ['冠', '裁', '雪', '生', '语', '门']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['冠', '裁', '雪', '生', '语', '门']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('没礼貌的风娃娃包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'wind-doll-07');
    assert.deepEqual(lesson.targetChars, ['没', '腿', '南', '北', '拍', '做']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['没', '腿', '南', '北', '拍', '做']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('一朵金花一个瓜包含六个学习字并按旁白分段显示', () => {
    const lesson = lessons.find(item => item.id === 'cucumber-flower-08');
    assert.deepEqual(lesson.targetChars, ['瓜', '挂', '朵', '当', '叔', '说']);
    assert.deepEqual(
        lesson.scenes[0].cues.flatMap(cue => cue.focusChars),
        ['瓜', '挂', '朵', '当', '叔', '说', '朵', '瓜']
    );
    lesson.targetChars.forEach(char => {
        assert.ok(lesson.storyText.includes(char));
        assert.ok(lesson.practice.some(item => item.char === char));
    });
});

test('只有配置了原声音量的场景才播放低音量视频声', () => {
    assert.equal(getSceneVideoVolume({ videoVolume: 0.12 }, true), 0.12);
    assert.equal(getSceneVideoVolume({ videoVolume: 0.12 }, false), 0);
    assert.equal(getSceneVideoVolume({}, true), 0);
    assert.equal(getSceneVideoVolume({ videoVolume: 3 }, true), 1);
    assert.equal(getSceneVideoVolume({ videoVolume: -1 }, true), 0);
});

test('正式故事视频默认静音，音频只使用 TTS 旁白', () => {
    for (const lesson of lessons) {
        lesson.scenes.forEach(scene => {
            assert.equal(getSceneVideoVolume(scene, true), 0, lesson.id);
        });
    }
});

test('旁白结束后仅保留视频与课程总时长允许的结尾画面', () => {
    assert.ok(Math.abs(getStoryTailDelay(10, 8.3, 10, 8.3) - 1.7) < 0.001);
    assert.equal(getStoryTailDelay(12, 8, 10, 8), 2);
    assert.equal(getStoryTailDelay(8, 8, 10, 8), 0);
    assert.ok(Math.abs(getStoryTailDelay(Number.NaN, 0, 10, 8.3) - 1.7) < 0.001);
});

test('旁白念到目标字时只高亮当前关键字', () => {
    const lesson = lessons.find(item => item.id === 'ant-moving-bean-02');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 1.1), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.3), '用');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.75), '力');
    assert.equal(getActiveKeywordAtTime(keywordCues, 2.5), '豆');
    assert.equal(getActiveKeywordAtTime(keywordCues, 4.9), '办');
    assert.equal(getActiveKeywordAtTime(keywordCues, 5.3), '法');
    assert.equal(getActiveKeywordAtTime(keywordCues, 5.9), '请');
    assert.equal(getActiveKeywordAtTime(keywordCues, 6.5), '');
});

test('小乌龟旁白按实测音频时间逐字高亮', () => {
    const lesson = lessons.find(item => item.id === 'little-turtle-04');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 0.3), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.58), '龟');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.21), '脖');
    assert.equal(getActiveKeywordAtTime(keywordCues, 3.4), '壳');
    assert.equal(getActiveKeywordAtTime(keywordCues, 4.8), '事');
    assert.equal(getActiveKeywordAtTime(keywordCues, 6.8), '安');
    assert.equal(getActiveKeywordAtTime(keywordCues, 8.5), '命');
    assert.equal(getActiveKeywordAtTime(keywordCues, 9.1), '');
});

test('小青蛙旁白按实测音频时间逐字高亮', () => {
    const lesson = lessons.find(item => item.id === 'little-frog-05');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 2.2), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 2.34), '睛');
    assert.equal(getActiveKeywordAtTime(keywordCues, 3.17), '嘴');
    assert.equal(getActiveKeywordAtTime(keywordCues, 3.94), '肚');
    assert.equal(getActiveKeywordAtTime(keywordCues, 6.34), '害');
    assert.equal(getActiveKeywordAtTime(keywordCues, 8.24), '保');
    assert.equal(getActiveKeywordAtTime(keywordCues, 9.1), '找');
    assert.equal(getActiveKeywordAtTime(keywordCues, 9.65), '');
});

test('画鸡旁白按实测音频时间逐字高亮', () => {
    const lesson = lessons.find(item => item.id === 'painting-rooster-06');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 0.2), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.32), '冠');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.96), '裁');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.81), '雪');
    assert.equal(getActiveKeywordAtTime(keywordCues, 3.49), '生');
    assert.equal(getActiveKeywordAtTime(keywordCues, 5.71), '语');
    assert.equal(getActiveKeywordAtTime(keywordCues, 7.81), '门');
    assert.equal(getActiveKeywordAtTime(keywordCues, 8.32), '');
});

test('没礼貌的风娃娃旁白按实测音频时间逐字高亮', () => {
    const lesson = lessons.find(item => item.id === 'wind-doll-07');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 0.4), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.58), '没');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.79), '腿');
    assert.equal(getActiveKeywordAtTime(keywordCues, 2.83), '南');
    assert.equal(getActiveKeywordAtTime(keywordCues, 4.28), '北');
    assert.equal(getActiveKeywordAtTime(keywordCues, 5.76), '拍');
    assert.equal(getActiveKeywordAtTime(keywordCues, 7.56), '做');
    assert.equal(getActiveKeywordAtTime(keywordCues, 8.2), '');
});

test('一朵金花一个瓜旁白按实测音频时间逐字高亮', () => {
    const lesson = lessons.find(item => item.id === 'cucumber-flower-08');
    const keywordCues = lesson.scenes[0].keywordCues;

    assert.equal(getActiveKeywordAtTime(keywordCues, 0.2), '');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.38), '瓜');
    assert.equal(getActiveKeywordAtTime(keywordCues, 0.99), '挂');
    assert.equal(getActiveKeywordAtTime(keywordCues, 1.98), '朵');
    assert.equal(getActiveKeywordAtTime(keywordCues, 2.48), '当');
    assert.equal(getActiveKeywordAtTime(keywordCues, 3.5), '叔');
    assert.equal(getActiveKeywordAtTime(keywordCues, 4.1), '说');
    assert.equal(getActiveKeywordAtTime(keywordCues, 5.25), '朵');
    assert.equal(getActiveKeywordAtTime(keywordCues, 6.1), '瓜');
    assert.equal(getActiveKeywordAtTime(keywordCues, 6.5), '');
});

test('故事场景时间递增并覆盖全部目标字', () => {
    for (const lesson of lessons) {
        assert.ok(lesson.scenes.length >= 1);
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

test('每个故事场景的视频均已归档且低于 4 MiB', () => {
    for (const lesson of lessons) {
        lesson.scenes.forEach(scene => {
            assert.ok(scene.video);
            const videoPath = resolveProjectAsset(scene.video);
            assert.ok(fs.existsSync(videoPath), scene.video);
            assert.ok(fs.statSync(videoPath).size < 4 * 1024 * 1024, scene.video);
        });
    }
});

test('每个正式故事视频都不包含音频轨道', () => {
    for (const lesson of lessons) {
        lesson.scenes.forEach(scene => {
            const videoPath = resolveProjectAsset(scene.video);
            const videoBytes = fs.readFileSync(videoPath);
            assert.equal(
                videoBytes.includes(Buffer.from('soun')),
                false,
                scene.video
            );
        });
    }
});

test('减少动态效果或节省流量时使用静态插图', () => {
    assert.equal(prefersStaticSceneMedia(() => ({ matches: true }), { saveData: false }), true);
    assert.equal(prefersStaticSceneMedia(() => ({ matches: false }), { saveData: true }), true);
    assert.equal(prefersStaticSceneMedia(() => ({ matches: false }), { saveData: false }), false);
});

test('故事、跟读和找一找都使用已归档的固定语音', () => {
    for (const lesson of lessons) {
        const manifestPath = path.resolve(
            __dirname,
            '..',
            path.dirname(lesson.narrationAudio),
            'manifest.json'
        );
        const storyAudioManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.equal(storyAudioManifest.lessonId, lesson.id);
        assert.equal(storyAudioManifest.voice, 'tencent-502007');
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

test('根据链接参数选择故事课，无效参数回到第一课', () => {
    assert.equal(selectLesson(lessons, '?lesson=ant-moving-bean-02').id, 'ant-moving-bean-02');
    assert.equal(selectLesson(lessons, '?lesson=little-turtle-04').id, 'little-turtle-04');
    assert.equal(selectLesson(lessons, '?lesson=little-frog-05').id, 'little-frog-05');
    assert.equal(selectLesson(lessons, '?lesson=painting-rooster-06').id, 'painting-rooster-06');
    assert.equal(selectLesson(lessons, '?lesson=wind-doll-07').id, 'wind-doll-07');
    assert.equal(selectLesson(lessons, '?lesson=cucumber-flower-08').id, 'cucumber-flower-08');
    assert.equal(selectLesson(lessons, '?lesson=missing').id, 'cat-and-fish-01');
    assert.equal(selectLesson([], '?lesson=ant-moving-bean-02'), null);
});

test('首页可以进入全部故事课', () => {
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('<details class="story-collection">'));

    lessons.forEach(lesson => {
        assert.ok(
            indexHtml.includes(`story.html?lesson=${lesson.id}`),
            `Missing homepage link for ${lesson.id}`
        );
    });

    const homepageLessonIds = [
        ...indexHtml.matchAll(/story\.html\?lesson=([^"]+)/g),
    ].map(match => match[1]);

    assert.deepEqual(
        homepageLessonIds,
        lessons.map(lesson => lesson.id)
    );
});

test('认字题答案存在于选项中', () => {
    for (const lesson of lessons) {
        assert.ok(lesson.quiz.length >= 2);
        lesson.quiz.forEach(question => assert.ok(question.choices.includes(question.answer)));
    }
});

test('找一找选项会随机打乱且不修改课程原数据', () => {
    const choices = ['豆', '鱼', '花'];
    const randomValues = [0, 0];
    const shuffled = shuffleChoices(choices, () => randomValues.shift());

    assert.deepEqual(shuffled, ['鱼', '花', '豆']);
    assert.deepEqual(choices, ['豆', '鱼', '花']);
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

test('中文首页与故事页提供返回英文主站入口', () => {
    for (const file of ['index.html', 'story.html']) {
        const html = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
        assert.match(html, /<a class="english-site-link" href="\/"[^>]*>/);
        assert.match(html, /返回英文版/);
    }
});
