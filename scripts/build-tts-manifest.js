const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const library = require('../characters.js');
const { VERSION, buildCorpus } = require('../tts-corpus.js');

const projectRoot = path.resolve(__dirname, '..');
const audioDirectory = path.join(projectRoot, 'audio', VERSION);
const manifestPath = path.join(projectRoot, 'audio-manifest.json');
const corpusPath = path.join(audioDirectory, 'corpus.json');
const localEnvPath = path.join(projectRoot, '.env');

if (fs.existsSync(localEnvPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(localEnvPath);
}

function getHash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function findAudioFilePath(item) {
    if (!fs.existsSync(audioDirectory)) return null;

    const exactPath = path.join(audioDirectory, `${item.id}.mp3`);
    if (fs.existsSync(exactPath)) return exactPath;

    const codePoint = item.char.codePointAt(0).toString(16);
    const reusableFileName = fs.readdirSync(audioDirectory)
        .filter(fileName => fileName.endsWith(`-${codePoint}.mp3`))
        .sort()[0];
    return reusableFileName ? path.join(audioDirectory, reusableFileName) : null;
}

function buildManifestFiles(options = {}) {
    const previousVoice = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).voice : null;
    const voice = options.voice || process.env.TTS_VOICE_NAME || previousVoice || 'pending-audition';
    const corpus = buildCorpus(library);
    if (options.write !== false) {
        fs.mkdirSync(audioDirectory, { recursive: true });
        fs.writeFileSync(corpusPath, `${JSON.stringify({ version: VERSION, cards: corpus }, null, 2)}\n`);
    }

    const cards = {};
    let availableOccurrences = 0;
    for (const item of corpus) {
        const filePath = findAudioFilePath(item);
        if (!filePath) continue;
        const fileName = path.basename(filePath);
        availableOccurrences += 1;
        cards[item.char] = {
            url: `audio/${VERSION}/${fileName}`,
            text: item.text,
            pronunciation: item.pronunciation,
            sha256: getHash(filePath),
        };
    }

    const manifest = {
        version: VERSION,
        voice,
        generatedAt: new Date().toISOString(),
        available: Object.keys(cards).length,
        total: new Set(corpus.map(item => item.char)).size,
        availableOccurrences,
        totalOccurrences: corpus.length,
        cards,
    };
    if (options.write !== false) fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    return manifest;
}

if (require.main === module) {
    const manifest = buildManifestFiles();
    console.log(`TTS manifest: ${manifest.available}/${manifest.total} audio files available.`);
}

module.exports = { buildManifestFiles, findAudioFilePath, audioDirectory };
