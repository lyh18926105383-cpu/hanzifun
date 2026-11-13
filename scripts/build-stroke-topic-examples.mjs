import fs from 'node:fs';
import zlib from 'node:zlib';
import {parseCedict,pinyinForms} from './data-foundation-lib.mjs';
const source=parseCedict(zlib.gunzipSync(fs.readFileSync('.cache/hf02/cedict.gz')).toString());
// Original, individually edited examples. Pronunciations are looked up, never inferred.
const rows={
 wo:[['我','我想喝水。','I would like some water.'],['我们','我们一起去公园吧。','Let’s go to the park together.'],['自我','请做一个简短的自我介绍。','Please give a short introduction of yourself.']],
 ni:[['你','你今天忙吗？','Are you busy today?'],['你们','你们住在哪里？','Where do you live?'],['你好','她笑着说：“你好！”','She smiled and said, “Hello!”']],
 hao:[['好人','他是个好人。','He is a good person.'],['好看','这本书很好看。','This book is a good read.'],['好吃','这个苹果很好吃。','This apple tastes good.']],
 shi:[['是','我是老师。','I am a teacher.'],['但是','我想去，但是没有时间。','I would like to go, but I do not have time.'],['还是','你喝茶还是喝水？','Would you like tea or water?']],
 zhong:[['中国','她明年要去中国。','She is going to China next year.'],['中心','图书馆在市中心。','The library is in the city centre.'],['中午','我们中午见。','Let’s meet at noon.']],
 guo:[['国家','你去过哪些国家？','Which countries have you visited?'],['外国','他喜欢看外国电影。','He enjoys watching foreign films.'],['中国','这是我第一次来中国。','This is my first visit to China.']],
 xue:[['学习','我每天学习中文。','I study Chinese every day.'],['学校','学校离我家很近。','The school is close to my home.'],['学生','学生们正在读书。','The students are reading.']],
 yong:[['永远','我会永远记住这一天。','I will always remember this day.'],['永久','这不是永久的安排。','This is not a permanent arrangement.'],['永恒','这首诗描写永恒的爱。','This poem describes enduring love.']]
};
const output={version:1,date:'2026-11-13',author:'HanziFun editorial team',method:'Original examples, AI-assisted and individually checked against CC-CEDICT word pronunciation and sense; no claim of separate human acceptance',entries:{}};
for(const [id,items] of Object.entries(rows))output.entries[id]=items.map(([word,sentence,translation])=>{
 const entry=source.find(e=>e.simplified===word&&/^[a-züv:0-9 ]+$/i.test(e.pinyin)&&!/^surname /.test(e.senses[0]));
 if(!entry)throw Error('Word missing from CC-CEDICT: '+word);
 return {word,pinyin:pinyinForms(entry.pinyin).marked,gloss:entry.senses.slice(0,word==='永恒'?2:3).join('; '),sentence,translation,sourceLocator:entry.sourceLocator};
});
fs.mkdirSync('content/stroke-order',{recursive:true});fs.writeFileSync('content/stroke-order/examples.json',JSON.stringify(output,null,2)+'\n');
console.log('24 original examples, 24 source-attested word readings');
