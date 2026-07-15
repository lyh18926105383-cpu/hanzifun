const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const library = require('../characters.js');
const { VERSION, buildCorpus } = require('../tts-corpus.js');

const projectRoot = path.resolve(__dirname, '..');
const audioDirectory = path.join(projectRoot, 'audio', VERSION);
const manifestPath = path.join(projectRoot, 'audio-manifest.json');
const corpusPath = path.join(audioDirectory, 'corpus.json');

function getHash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function buildManifestFiles(options = {}) {
    const voice = options.voice || process.env.TTS_VOICE_NAME || 'pending-audition';
    const corpus = buildCorpus(library);
    fs.mkdirSync(audioDirectory, { recursive: true });
    fs.writeFileSync(corpusPath, `${JSON.stringify({ version: VERSION, cards: corpus }, null, 2)}\n`);

    const cards = {};
    for (const item of corpus) {
        const fileName = `${item.id}.mp3`;
        const filePath = path.join(audioDirectory, fileName);
        if (!fs.existsSync(filePath)) continue;
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
        total: corpus.length,
        cards,
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    return manifest;
}

if (require.main === module) {
    const manifest = buildManifestFiles();
    console.log(`TTS manifest: ${manifest.available}/${manifest.total} audio files available.`);
}

module.exports = { buildManifestFiles, audioDirectory };
