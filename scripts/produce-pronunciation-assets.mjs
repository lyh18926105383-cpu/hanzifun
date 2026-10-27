import {prepareAssets} from './prepare-pronunciation-assets.mjs';
if(!process.argv.includes('--apply'))console.log('Pass --apply to download hash-verified recordings. --synthesize explicitly consumes configured Tencent TTS quota; otherwise missing recordings use Chinese device speech.');
else prepareAssets({onProgress:console.log,synthesizeMissing:process.argv.includes('--synthesize')}).then(console.log).catch(e=>{console.error(e.message);process.exitCode=1;});
