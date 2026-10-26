import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const require=createRequire(import.meta.url),lessons=require('../lessons.js');
const digest=paths=>createHash('sha256').update(Buffer.concat(paths.map(p=>Buffer.concat([Buffer.from(p+'\0'),read(p)])))).digest('hex');
export function manualScopes(){
 const groups=[
  ['pinyin-teaching','410 syllables and 1323 tone candidates: scope, initials/finals, neutral tone, rare/dialect contexts',['data/pinyin/scope.json','data/pinyin/syllables.json','site/pages/pinyin-chart.mjs']],
  ['audio-listening','107 legacy contextual recordings, 19 core missing recordings, per-reading and syllable needs: inventory each asset before listening; do not enable unavailable audio',['audio-manifest.json','data/reports/audio-requests.json','data/normalized/audio.json','data/editorial/review-decisions.json']],
  ['hsk-source-sampling','Human 30 source entries per edition: first/last, polyphones and boundaries; official memberships remain separate from teaching acceptance',['data/hsk/source-headwords.json','data/hsk/membership.json']],
  ...['restaurant','icebreakers'].map(id=>['scenario-'+id,id+': 3 sentences, token meanings, connected speech, actual recording and listening',['data/scenarios/scenarios.json']]),
  ...lessons.map(l=>['story-'+l.id,l.title+': board/candidate provenance, subtitles, every keyword cue, TTS listening and complete local experience',['lessons.js','story.js',...new Set([l.narrationAudio,...l.scenes.flatMap(s=>[s.video,s.audio,s.image])])]]),
  ...['safari','firefox','ios-safari','android-chrome','screen-reader','native-zoom'].map(id=>['platform-'+id,id+': record device/OS/browser version, steps, actual outcome and evidence',['site/public/site-styles.css','src/client/guest-learning.mjs','src/client/flashcards.mjs','src/client/navigation.mjs']])
 ];
 const input=JSON.parse(read('data/editorial/mvp-acceptance.json'));
 return groups.map(([id,scope,files])=>{const scopeSha256=digest(files),d=input.decisions[id];return {id,scope,files,scopeSha256,accepted:!!(d?.status==='approved'&&d.scopeSha256===scopeSha256&&d.reviewer?.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(d.date||'')&&!Number.isNaN(Date.parse(d.date))&&new Date(d.date).toISOString().slice(0,10)===d.date&&d.evidence?.trim())};});
}
