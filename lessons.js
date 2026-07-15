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
            storyText: '小猫看见水里的鱼，开心地笑了。',
            narrationAudio: '',
            scenes: [
                {
                    image: 'assets/lessons/cat-and-fish/scene-1.webp',
                    fallbackEmoji: '🐱🌿',
                    alt: '一只橘黄色小猫来到池塘边',
                    caption: '小猫来到池塘边。',
                    focusChars: ['小', '猫'],
                    startAt: 0,
                },
                {
                    image: 'assets/lessons/cat-and-fish/scene-2.webp',
                    fallbackEmoji: '🐱👀🐟',
                    alt: '小猫低头看着清水里的小鱼',
                    caption: '小猫低头看鱼儿。',
                    focusChars: ['看', '鱼'],
                    startAt: 3.2,
                },
                {
                    image: 'assets/lessons/cat-and-fish/scene-3.webp',
                    fallbackEmoji: '🐟💦😺',
                    alt: '小鱼跳出水面，小猫开心地笑了',
                    caption: '小鱼跳出水面，小猫笑了。',
                    focusChars: ['笑'],
                    startAt: 6.4,
                },
            ],
            fallbackDuration: 9.6,
            practice: [
                { char: '小', word: '小小的', emoji: '🤏' },
                { char: '猫', word: '小猫', emoji: '🐱' },
                { char: '看', word: '看一看', emoji: '👀' },
                { char: '鱼', word: '小鱼', emoji: '🐟' },
                { char: '笑', word: '笑一笑', emoji: '😊' },
            ],
            quiz: [
                {
                    prompt: '哪一个是故事里的小动物？',
                    emoji: '🐱',
                    choices: ['猫', '山', '饭'],
                    answer: '猫',
                },
                {
                    prompt: '小猫在水里看见了什么？',
                    emoji: '🐟',
                    choices: ['鱼', '鸟', '花'],
                    answer: '鱼',
                },
                {
                    prompt: '小猫最后怎么样了？',
                    emoji: '😊',
                    choices: ['笑', '哭', '睡'],
                    answer: '笑',
                },
            ],
        },
    ];
});
