import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const topicCatalog=JSON.parse(fs.readFileSync(new URL('../data/stroke-order/catalog.json',import.meta.url),'utf8'));
export const exampleIds=['wo','ni','hao','shi','zhong','guo','xue','yong'];
export const exampleGlyphs=[...'我你好是中国学永'];
export const exampleId=g=>exampleIds[exampleGlyphs.indexOf(g)];
export const topicCharacter=g=>topicCatalog.characters.find(c=>c.glyph===g);
export const exampleCharacters=exampleGlyphs.map(topicCharacter);
export const exampleCopy=JSON.parse(fs.readFileSync(new URL('../content/stroke-order/examples.json',import.meta.url),'utf8'));
const raw=new Map();
export function topicStroke(c){
 if(!c)throw Error('No source record for requested stroke character');
 if(!raw.has(c.codepoint)){
  const bytes=fs.readFileSync(new URL('..'+c.assetUrl,import.meta.url));
  if(createHash('sha256').update(bytes).digest('hex')!==c.assetSha256)throw Error('Changed upstream stroke bytes: '+c.glyph);
  const value=JSON.parse(bytes);if(value.strokes.length!==c.strokeCount||value.medians.length!==c.strokeCount||c.strokeTypes.length!==c.strokeCount)throw Error('Stroke count/sequence mismatch: '+c.glyph);
  raw.set(c.codepoint,value);
 }
 return raw.get(c.codepoint);
}
