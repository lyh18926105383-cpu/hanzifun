(function(root, factory) {
    const lessons = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = lessons;
    }
    root.HANZI_STORY_LESSONS = lessons;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    return [
        {
            id: 'cat-and-fish-01',
            title: '小猫看鱼',
            theme: '动物朋友',
            coverEmoji: '🐱',
            targetChars: ['小', '猫', '看', '鱼', '笑'],
            storyText: '小猫轻轻走到池塘边，看见水里有一条小鱼。小鱼跳出水面，小猫开心地笑了。',
            narrationAudio: 'assets/lessons/cat-and-fish/audio/story-full.mp3',
            scenes: [
                {
                    image: 'assets/lessons/cat-and-fish/scene-1.jpg',
                    audio: 'assets/lessons/cat-and-fish/audio/story-scene-1.mp3',
                    narrationText: '小猫轻轻走到池塘边。',
                    fallbackEmoji: '🐱🌿',
                    alt: '一只橘黄色小猫来到池塘边',
                    caption: '小猫来到池塘边。',
                    focusChars: ['小', '猫'],
                    startAt: 0,
                    fallbackDuration: 3.8,
                },
                {
                    image: 'assets/lessons/cat-and-fish/scene-2.jpg',
                    audio: 'assets/lessons/cat-and-fish/audio/story-scene-2.mp3',
                    narrationText: '小猫看见水里有一条小鱼。',
                    fallbackEmoji: '🐱👀🐟',
                    alt: '小猫低头看着清水里的小鱼',
                    caption: '小猫低头看鱼儿。',
                    focusChars: ['看', '鱼'],
                    startAt: 3.8,
                    fallbackDuration: 3.8,
                },
                {
                    image: 'assets/lessons/cat-and-fish/scene-3.jpg',
                    audio: 'assets/lessons/cat-and-fish/audio/story-scene-3.mp3',
                    narrationText: '小鱼跳出水面，小猫开心地笑了。',
                    fallbackEmoji: '🐟💦😺',
                    alt: '小鱼跳出水面，小猫开心地笑了',
                    caption: '小鱼跳出水面，小猫笑了。',
                    focusChars: ['笑'],
                    startAt: 7.6,
                    fallbackDuration: 3.8,
                },
            ],
            fallbackDuration: 11.4,
            practice: [
                { char: '小', word: '小小的', emoji: '🤏', audio: 'audio/tts-v1/129-5c0f.mp3' },
                { char: '猫', word: '小猫', emoji: '🐱', audio: 'audio/tts-v1/032-732b.mp3' },
                { char: '看', word: '看一看', emoji: '👀', audio: 'audio/tts-v1/166-770b.mp3' },
                { char: '鱼', word: '小鱼', emoji: '🐟', audio: 'audio/tts-v1/029-9c7c.mp3' },
                { char: '笑', word: '笑一笑', emoji: '😊', audio: 'audio/tts-v1/167-7b11.mp3' },
            ],
            feedback: {
                tryAgainText: '再找一找，故事里见过它哦！',
                tryAgainAudio: 'assets/lessons/cat-and-fish/audio/try-again.mp3',
                completeText: '太棒了，故事课完成啦！',
                completeAudio: 'assets/lessons/cat-and-fish/audio/lesson-complete.mp3',
            },
            quiz: [
                {
                    prompt: '哪一个是故事里的小动物？',
                    emoji: '🐱',
                    choices: ['猫', '山', '饭'],
                    answer: '猫',
                    audio: 'assets/lessons/cat-and-fish/audio/quiz-1.mp3',
                    correctText: '猫，答对了！',
                    correctAudio: 'assets/lessons/cat-and-fish/audio/correct-1.mp3',
                },
                {
                    prompt: '小猫在水里看见了什么？',
                    emoji: '🐟',
                    choices: ['鱼', '鸟', '花'],
                    answer: '鱼',
                    audio: 'assets/lessons/cat-and-fish/audio/quiz-2.mp3',
                    correctText: '鱼，答对了！',
                    correctAudio: 'assets/lessons/cat-and-fish/audio/correct-2.mp3',
                },
                {
                    prompt: '小猫最后怎么样了？',
                    emoji: '😊',
                    choices: ['笑', '哭', '睡'],
                    answer: '笑',
                    audio: 'assets/lessons/cat-and-fish/audio/quiz-3.mp3',
                    correctText: '笑，答对了！',
                    correctAudio: 'assets/lessons/cat-and-fish/audio/correct-3.mp3',
                },
            ],
        },
    ];
});
