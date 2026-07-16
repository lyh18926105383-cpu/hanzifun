const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(projectRoot, 'dist');
const rootFiles = [
    'index.html',
    'story.html',
    'styles.css',
    'story.css',
    'app.js',
    'story.js',
    'characters.js',
    'storage.js',
    'lessons.js',
    'tts-corpus.js',
    'audio.js',
    'audio-manifest.json',
    'robots.txt',
    'sitemap.xml',
    '工具头像.png',
];

function copyFile(relativePath) {
    const source = path.join(projectRoot, relativePath);
    const destination = path.join(outputRoot, relativePath);
    if (!fs.existsSync(source)) throw new Error(`Missing site asset: ${relativePath}`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

function copyDirectory(relativePath, filter) {
    const source = path.join(projectRoot, relativePath);
    const destination = path.join(outputRoot, relativePath);
    if (!fs.existsSync(source)) throw new Error(`Missing site directory: ${relativePath}`);
    fs.cpSync(source, destination, {
        recursive: true,
        filter: currentPath => {
            if (fs.statSync(currentPath).isDirectory()) return true;
            return filter(currentPath);
        },
    });
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
rootFiles.forEach(copyFile);
copyDirectory('audio/tts-v1', currentPath => currentPath.endsWith('.mp3'));
copyDirectory('assets', currentPath => path.basename(currentPath) !== '.DS_Store');

const forbiddenNames = new Set(['.env', '.git', '.gitignore', '.DS_Store']);
const queued = [outputRoot];
let fileCount = 0;
while (queued.length > 0) {
    const directory = queued.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (forbiddenNames.has(entry.name)) {
            throw new Error(`Forbidden deployment asset: ${entry.name}`);
        }
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) queued.push(entryPath);
        else fileCount += 1;
    }
}

console.log(`Built ${fileCount} public files in dist/.`);
