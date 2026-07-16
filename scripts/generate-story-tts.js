const fs = require('node:fs');
const path = require('node:path');

const lessons = require('../lessons.js');
const { synthesize } = require('./generate-tencent-tts.js');

const projectRoot = path.resolve(__dirname, '..');
const localEnvPath = path.join(projectRoot, '.env');
if (fs.existsSync(localEnvPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(localEnvPath);
}

function readArgument(name, fallback) {
    const prefix = `--${name}=`;
    const value = process.argv.find(argument => argument.startsWith(prefix));
    return value ? value.slice(prefix.length) : fallback;
}

function getVoiceType() {
    const configuredVoice = process.env.TTS_VOICE_NAME || '';
    const configuredId = configuredVoice.match(/(\d+)$/)?.[1];
    return Number(readArgument('voice', configuredId || '502007'));
}

async function main() {
    const secretId = process.env.TENCENTCLOUD_SECRET_ID;
    const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;
    if (!secretId || !secretKey) {
        throw new Error('Missing TENCENTCLOUD_SECRET_ID or TENCENTCLOUD_SECRET_KEY.');
    }

    const lesson = lessons.find(item => item.id === 'cat-and-fish-01');
    if (!lesson) throw new Error('Missing cat-and-fish-01 lesson.');

    const outputDirectory = path.join(
        projectRoot,
        'assets',
        'lessons',
        'cat-and-fish',
        'audio'
    );
    const config = {
        secretId,
        secretKey,
        voiceType: getVoiceType(),
        speed: Number(readArgument('speed', '-1')),
        region: readArgument('region', 'ap-guangzhou'),
    };
    const force = process.argv.includes('--force');
    const items = [
        {
            id: 'story-full',
            text: lesson.storyText,
            fileName: 'story-full.mp3',
        },
        ...lesson.scenes.map((scene, index) => ({
            id: `story-scene-${index + 1}`,
            text: scene.narrationText,
            fileName: `story-scene-${index + 1}.mp3`,
        })),
        ...lesson.quiz.map((question, index) => ({
            id: `quiz-${index + 1}`,
            text: question.prompt,
            fileName: `quiz-${index + 1}.mp3`,
        })),
        ...lesson.quiz.map((question, index) => ({
            id: `correct-${index + 1}`,
            text: question.correctText,
            fileName: `correct-${index + 1}.mp3`,
        })),
        {
            id: 'try-again',
            text: lesson.feedback.tryAgainText,
            fileName: 'try-again.mp3',
        },
        {
            id: 'lesson-complete',
            text: lesson.feedback.completeText,
            fileName: 'lesson-complete.mp3',
        },
    ];

    fs.mkdirSync(outputDirectory, { recursive: true });
    let generated = 0;
    let cached = 0;

    for (const [index, item] of items.entries()) {
        const outputPath = path.join(outputDirectory, item.fileName);
        if (!force && fs.existsSync(outputPath)) {
            cached += 1;
            console.log(`[${index + 1}/${items.length}] ${item.id}: cached`);
            continue;
        }
        const audio = await synthesize(item, config);
        fs.writeFileSync(outputPath, audio);
        generated += 1;
        console.log(`[${index + 1}/${items.length}] ${item.id}: generated`);
    }

    const metadata = {
        lessonId: lesson.id,
        voice: `tencent-${config.voiceType}`,
        speed: config.speed,
        generatedAt: new Date().toISOString(),
        files: items.map(item => ({
            id: item.id,
            text: item.text,
            file: item.fileName,
        })),
    };
    fs.writeFileSync(
        path.join(outputDirectory, 'manifest.json'),
        `${JSON.stringify(metadata, null, 2)}\n`
    );
    console.log(`Done. Generated ${generated}, cached ${cached}, voice ${metadata.voice}.`);
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
