// Curated demonstration data. These entries are not an official HSK list.
export const characters = [
  {char:'休',pinyin:'xiū',meaning:'rest',cue:'Picture a person beside a tree, taking a quiet break.',example:'我们休息一下。',translation:"Let's take a break.",component:'亻 + 木',art:'hero'},
  {char:'水',pinyin:'shuǐ',meaning:'water',cue:'Imagine a stream flowing down the middle, with little currents on either side.',example:'请给我一杯水。',translation:'A glass of water, please.',component:'水'},
  {char:'木',pinyin:'mù',meaning:'tree; wood',cue:'Imagine a tree: its trunk, spreading branches, and roots.',example:'这里有很多树木。',translation:'There are many trees here.',component:'木'},
  {char:'月',pinyin:'yuè',meaning:'moon; month',cue:'Imagine the moon hanging quietly in the evening sky.',example:'月亮很圆。',translation:'The moon is round.',component:'月'},
  {char:'山',pinyin:'shān',meaning:'mountain',cue:'See three peaks rising out of the ground.',example:'那座山很高。',translation:'That mountain is tall.',component:'山'},
  {char:'火',pinyin:'huǒ',meaning:'fire',cue:'Picture a flame reaching upward, with sparks on both sides.',example:'小心火！',translation:'Be careful with fire!',component:'火'},
  {char:'林',pinyin:'lín',meaning:'woods; a surname',cue:'Two trees standing together can bring a small wood to mind.',example:'树林很安静。',translation:'The woods are quiet.',component:'木 + 木'},
  {char:'安',pinyin:'ān',meaning:'peaceful; safe',cue:'Connect the word with a peaceful moment at home.',example:'这里很安全。',translation:'It is safe here.',component:'宀 + 女'},
  {char:'然',pinyin:'rán',meaning:'so; a word-forming element',cue:'Meet this character in 自然, nature, and 安然, peacefully.',example:'我喜欢大自然。',translation:'I like nature.',component:'灬 is a visible component'},
  {char:'明',pinyin:'míng',meaning:'bright; clear',cue:'The sun 日 and moon 月 together make a memorable image of brightness.',example:'明天见！',translation:'See you tomorrow!',component:'日 + 月'},
  {char:'朗',pinyin:'lǎng',meaning:'clear; bright',cue:'Associate it with a bright, open sky in 晴朗.',example:'今天天气晴朗。',translation:'The weather is clear today.',component:'良 + 月'},
  {char:'清',pinyin:'qīng',meaning:'clear; pure',cue:'Notice the water component 氵, and imagine a clear stream.',example:'这里的水很清。',translation:'The water here is clear.',component:'氵 + 青'},
  {char:'禾',pinyin:'hé',meaning:'grain plant',cue:'Imagine a grain plant with its ripe head bending over.',example:'禾苗长高了。',translation:'The grain seedlings have grown taller.',component:'禾'},
  {char:'中',pinyin:'zhōng',meaning:'middle; central',cue:'A line passes through the middle of a box.',example:'我在中国。',translation:'I am in China.',component:'中'},
  {char:'秋',pinyin:'qiū',meaning:'autumn',cue:'Connect the grain plant with the season of harvest.',example:'秋天到了。',translation:'Autumn has arrived.',component:'禾 + 火'},
  {char:'饼',pinyin:'bǐng',meaning:'cake; flatbread',cue:'Notice the food component 饣. Meet this character in 月饼, mooncake.',example:'我喜欢吃月饼。',translation:'I like eating mooncakes.',component:'饣 + 并'},
  {char:'团',pinyin:'tuán',meaning:'group; to gather',cue:'Imagine people gathered together inside a shared space.',example:'我们一起吃团圆饭。',translation:'We share a reunion meal.',component:'囗 + 才'},
  {char:'圆',pinyin:'yuán',meaning:'round',cue:'Think of a full moon as you read 月亮很圆.',example:'月亮很圆。',translation:'The moon is round.',component:'囗 + 员'},
  {char:'请',pinyin:'qǐng',meaning:'please; to invite',cue:'Notice the speech component 讠 and imagine a polite request.',example:'请坐。',translation:'Please sit down.',component:'讠 + 青'},
  {char:'茶',pinyin:'chá',meaning:'tea',cue:'Notice the plant component 艹 and imagine fresh tea leaves.',example:'我想喝茶。',translation:'I would like to drink tea.',component:'艹 is a visible component'},
  {char:'饭',pinyin:'fàn',meaning:'cooked rice; meal',cue:'Notice the food component 饣. Meet this character at a meal.',example:'我们吃饭吧。',translation:"Let's eat.",component:'饣 + 反'},
  {char:'豆',pinyin:'dòu',meaning:'bean',cue:'Picture the little bean that the ants work together to move.',example:'这是一颗豆子。',translation:'This is a bean.',component:'豆'},
  {char:'力',pinyin:'lì',meaning:'strength',cue:'Think of the effort needed to lift something heavy.',example:'大家一起用力。',translation:'Everyone pulls together.',component:'力'},
  {char:'用',pinyin:'yòng',meaning:'to use',cue:'Connect the character with using your hands to help.',example:'请用这个。',translation:'Please use this.',component:'用'},
  {char:'办',pinyin:'bàn',meaning:'to do; to handle',cue:'See 力 inside the shape, and remember putting effort into doing something.',example:'我们有办法。',translation:'We have a way.',component:'力 is a visible component'},
  {char:'法',pinyin:'fǎ',meaning:'method; law',cue:'Learn it in 办法, a way to solve a problem.',example:'这是一个好办法。',translation:'This is a good way.',component:'氵 + 去'}
];
export const decks = [
  {slug:'first-six',title:'Your first six characters',description:'A small introduction to shapes, meanings, and everyday words.',chars:['休','山','水','火','木','月']},
  {slug:'at-the-tea-house',title:'At the tea house',description:'Recognize the characters behind a simple, polite order.',chars:['请','水','茶','饭']},
  {slug:'mid-autumn',title:'A little Mid-Autumn Chinese',description:'Discover the moon, mooncakes, and the idea of reunion.',chars:['中','秋','月','饼','团','圆']},
  {slug:'ants-and-a-bean',title:'The ants and a bean',description:'Revisit six characters from the existing Chinese story.',chars:['豆','力','用','办','法','请']}
];
export const names = {
  calm:{name:'林安然',pinyin:'Lín Ānrán',meaning:'A quiet, composed feeling',explanation:'林 is the surname Lín. 安然 is a word associated with being peaceful or safe. Here it illustrates a calm naming direction.',chars:['林','安','然']},
  bright:{name:'林明朗',pinyin:'Lín Mínglǎng',meaning:'A bright, open feeling',explanation:'林 is the surname Lín. 明朗 evokes brightness and clarity. This curated example illustrates an optimistic naming direction.',chars:['林','明','朗']},
  nature:{name:'林清禾',pinyin:'Lín Qīnghé',meaning:'Clear water and growing grain',explanation:'林 is the surname Lín. 清 suggests clarity and 禾 a grain plant. Together they illustrate a nature-inspired naming direction.',chars:['林','清','禾']}
};
export const articles = [
  {slug:'mid-autumn-festival-chinese-characters',title:'The Mid-Autumn Festival, one character at a time.',category:'Festivals & culture',image:'festival',chars:['中','秋','月','饼','团','圆'],deck:'mid-autumn',keywords:'mid-autumn mid autumn festival mooncake chinese name 中秋节',lead:'A moon, a mooncake, and a moment to be together. Start with the characters that connect them.',sections:[
    ['Meet 中秋','The festival is called 中秋节, Zhōngqiū Jié. 中 means middle or central, 秋 means autumn, and 节 can mean festival. Read the name slowly, then look for the shapes again in a festival greeting.'],
    ['From the moon to a mooncake','月 means moon or month. Add 饼, a cake or flatbread, and you have 月饼: mooncake. A familiar object becomes a useful connection between two characters.'],
    ['A word for being together','团圆, tuányuán, means reunion. The roundness of 圆 can be a useful memory cue when you see the full moon. Try the six-character deck, then return to the words in this story.']
  ]},
  {slug:'chinese-for-your-first-business-visit',title:'Before your first business visit: start with a polite 请.',category:'Travel & business',image:'travel',chars:['请','茶','水'],deck:'at-the-tea-house',keywords:'canton fair trade business supplier travel visit polite',lead:'A useful first goal is a small, courteous exchange you can recognize and practise.',sections:[
    ['Start with a welcome','请坐, qǐng zuò, means “please sit down.” The character 请 can introduce a polite request. Notice the speech component on its left.'],
    ['Recognize a simple offer','水 is water and 茶 is tea. Recognizing these characters gives you a foothold in a menu or a small exchange during a visit.'],
    ['Build toward the situation','The business path is planned around introductions, product questions, and follow-up conversations. This sample starts with courtesy; it is not a full business vocabulary course or a current Canton Fair guide.']
  ]},
  {slug:'first-characters-for-bilingual-kids',title:'Your child’s first characters can begin with a story.',category:'Kids & families',image:'family',chars:['山','水','木','月'],deck:'first-six',keywords:'kids overseas heritage family first 50 chinese characters story bilingual',lead:'Begin with a few shapes your child can connect to something in their world.',sections:[
    ['Find something familiar','Point to a tree and then show 木. Look at a picture of mountains and explore 山. Invite your child to notice the shape, without making every moment a test.'],
    ['Keep the set small','Choose a few characters, tell a small story, and revisit them on another day. A successful first session can be as simple as recognizing one character together.'],
    ['Let a story carry the practice','Our existing Chinese story library offers short picture stories with character learning. Parents can explore alongside their children, then return to a related flashcard set.']
  ]}
];
export const stories = [
  {slug:'cat-and-fish',title:'The kitten and the fish',zh:'小猫和小鱼',id:'cat-and-fish-01'},
  {slug:'ants-and-a-bean',title:'The ants and a bean',zh:'蚂蚁搬豆',id:'ant-moving-bean-02'},
  {slug:'cat-and-mirror',title:'The kitten and the mirror',zh:'小猫照镜子',id:'cat-mirror-03'},
  {slug:'little-turtle',title:'The little turtle',zh:'小乌龟',id:'little-turtle-04'},
  {slug:'little-frog',title:'The little frog',zh:'小青蛙',id:'little-frog-05'},
  {slug:'painting-a-rooster',title:'Painting a rooster',zh:'画公鸡',id:'painting-rooster-06'},
  {slug:'wind-doll',title:'The little wind',zh:'风娃娃',id:'wind-doll-07'},
  {slug:'cucumber-flower',title:'The cucumber flower',zh:'黄瓜花',id:'cucumber-flower-08'}
];
