// Local data QA surface only. Serves a bounded allowlist, never the repository root.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { root, readJSON } from './data-foundation-lib.mjs';
const chars = readJSON('data/normalized/characters.json');
const strokes = readJSON('data/strokes/manifest.json');
const coverage = readJSON('data/coverage.json');
const readings = readJSON('data/normalized/readings.json');
const sample = [...'豆龟壳肚睛冠没当相答发给正和几听水女黑臂请圆'];
const rows = sample.map(g => {
    const c = chars.find(c => c.glyph === g), s = strokes.find(s => s.glyph === g);
    return { glyph: g, primary: readings.find(r => r.readingId === c.primaryReadingId).pinyin.marked, strokeCount: s.strokeCount, url: `/strokes/${path.basename(s.url)}` };
});
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>HF-02 数据验收</title><style>
body{font:15px system-ui;margin:20px;background:#f5f4ef;color:#172b25}h1{margin:0;font-size:26px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-top:12px}.tile{background:white;border:1px solid #ccc;border-radius:8px;padding:8px;text-align:center}svg{width:100%;height:116px}p{margin:6px}button{padding:8px 20px;margin:10px}#state{color:#17533d}.note{font-size:13px;color:#555}</style>
<h1>HF-02：126 字数据 / 22 字笔顺抽查</h1><p>126 唯一字 · 108 教学位置 · 107 旧音频映射 · 410 音节</p><p class="note">多音、简繁、独体和复杂字；真实按字 JSON 路径渲染。音频待听审，无开放播放按钮。</p>
<button id="reset">从首笔开始</button><button id="step">下一笔</button><button id="all">完整字形</button><span id="state">加载中</span><div class="grid" id="grid"></div>
<script>
const rows=${JSON.stringify(rows)};let step=99;let assets=[];
function render(){document.querySelector('#grid').innerHTML=rows.map((r,i)=>{const a=assets[i];const n=Math.min(step,a.strokes.length);return '<section class="tile"><b>'+r.glyph+' '+r.primary+'</b><svg viewBox="0 0 1024 1024" aria-label="'+r.glyph+'笔画"><g transform="translate(0,900) scale(1,-1)">'+a.strokes.slice(0,n).map((d,j)=>'<path d="'+d+'" fill="'+(j===n-1?'#bd4c31':'#173d32')+'"/>').join('')+'</g></svg><div>'+n+' / '+r.strokeCount+' 笔 · zh-Hans-CN</div></section>'}).join('');document.querySelector('#state').textContent='已加载 '+assets.length+'/22：'+(step===99?'完整字形':'第 '+step+' 笔');}
Promise.all(rows.map(r=>fetch(r.url).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}))).then(a=>{assets=a;render()}).catch(e=>document.querySelector('#state').textContent='失败 '+e);
document.querySelector('#reset').onclick=()=>{step=1;render()};document.querySelector('#step').onclick=()=>{step=step===99?1:step+1;render()};document.querySelector('#all').onclick=()=>{step=99;render()};
</script></html>`;
const allowed = new Map(strokes.map(s => [`/strokes/${path.basename(s.url)}`, s.url]));
http.createServer((req, res) => {
    if (req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); }
    else if (allowed.has(req.url)) { res.setHeader('Content-Type', 'application/json'); res.end(fs.readFileSync(path.join(root, allowed.get(req.url)))); }
    else { res.writeHead(404); res.end('Not found'); }
}).listen(4172, '127.0.0.1', () => console.log(`HF-02 local QA http://127.0.0.1:4172/ (${coverage.core.strokesAvailable} available assets)`));
