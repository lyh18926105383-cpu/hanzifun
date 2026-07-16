const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const library = require('../characters.js');
const { buildCorpus } = require('../tts-corpus.js');
const { buildManifestFiles, audioDirectory } = require('./build-tts-manifest.js');

const API_HOST = 'tts.tencentcloudapi.com';
const API_VERSION = '2019-08-23';
const SERVICE = 'tts';

const localEnvPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(localEnvPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(localEnvPath);
}

function readArgument(name, fallback) {
    const prefix = `--${name}=`;
    const value = process.argv.find(argument => argument.startsWith(prefix));
    return value ? value.slice(prefix.length) : fallback;
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key, value, encoding) {
    return crypto.createHmac('sha256', key).update(value).digest(encoding);
}

function createAuthorization(payload, timestamp, secretId, secretKey) {
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${API_HOST}\n`;
    const signedHeaders = 'content-type;host';
    const canonicalRequest = [
        'POST',
        '/',
        '',
        canonicalHeaders,
        signedHeaders,
        sha256(payload),
    ].join('\n');
    const credentialScope = `${date}/${SERVICE}/tc3_request`;
    const stringToSign = [
        'TC3-HMAC-SHA256',
        timestamp,
        credentialScope,
        sha256(canonicalRequest),
    ].join('\n');
    const secretDate = hmac(`TC3${secretKey}`, date);
    const secretService = hmac(secretDate, SERVICE);
    const secretSigning = hmac(secretService, 'tc3_request');
    const signature = hmac(secretSigning, stringToSign, 'hex');

    return `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function synthesize(item, config) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({
        Text: item.text,
        SessionId: crypto.randomUUID(),
        ModelType: 1,
        VoiceType: config.voiceType,
        Codec: 'mp3',
        SampleRate: 24000,
        Speed: config.speed,
        Volume: 0,
        PrimaryLanguage: 1,
    });
    const authorization = createAuthorization(
        payload,
        timestamp,
        config.secretId,
        config.secretKey
    );
    const response = await fetch(`https://${API_HOST}`, {
        method: 'POST',
        headers: {
            Authorization: authorization,
            'Content-Type': 'application/json; charset=utf-8',
            Host: API_HOST,
            'X-TC-Action': 'TextToVoice',
            'X-TC-Timestamp': String(timestamp),
            'X-TC-Version': API_VERSION,
            'X-TC-Region': config.region,
        },
        body: payload,
    });
    const result = await response.json();
    if (!response.ok || result.Response?.Error || !result.Response?.Audio) {
        const error = result.Response?.Error;
        throw new Error(error ? `${error.Code}: ${error.Message}` : `HTTP ${response.status}`);
    }
    return Buffer.from(result.Response.Audio, 'base64');
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
    const secretId = process.env.TENCENTCLOUD_SECRET_ID;
    const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;
    if (!secretId || !secretKey) {
        throw new Error('Missing TENCENTCLOUD_SECRET_ID or TENCENTCLOUD_SECRET_KEY.');
    }

    const allCards = process.argv.includes('--all');
    const requestedChars = readArgument('chars', '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    const config = {
        secretId,
        secretKey,
        voiceType: Number(readArgument('voice', '502007')),
        speed: Number(readArgument('speed', '0')),
        region: readArgument('region', 'ap-guangzhou'),
        delay: Number(readArgument('delay', '1000')),
    };
    const corpus = buildCorpus(library).filter(item => {
        if (requestedChars.length > 0) return requestedChars.includes(item.char);
        return allCards || item.pilot;
    });

    fs.mkdirSync(audioDirectory, { recursive: true });
    let generated = 0;
    let cached = 0;
    for (const [index, item] of corpus.entries()) {
        const filePath = path.join(audioDirectory, `${item.id}.mp3`);
        if (fs.existsSync(filePath)) {
            cached += 1;
            console.log(`[${index + 1}/${corpus.length}] ${item.char}: cached`);
            continue;
        }
        const audio = await synthesize(item, config);
        fs.writeFileSync(filePath, audio);
        generated += 1;
        console.log(`[${index + 1}/${corpus.length}] ${item.char}: generated`);
        if (index < corpus.length - 1) await sleep(config.delay);
    }

    const voiceName = `tencent-${config.voiceType}`;
    const manifest = buildManifestFiles({ voice: voiceName });
    console.log(`Done. Generated ${generated}, cached ${cached}, manifest ${manifest.available}/${manifest.total}.`);
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    createAuthorization,
    synthesize,
};
