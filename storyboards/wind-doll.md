# 第七个故事课：《没礼貌的风娃娃》10 秒视频故事板

## 预定课程信息

- 课程序号：第七课
- 课程 ID：`wind-doll-07`
- 课程标题：`没礼貌的风娃娃`
- 课程主题：`学会讲礼貌`
- 首页图标：`🌬️`
- 当前状态：故事板、旁白和 Gemini 提示词待用户确认

> 项目中的《画鸡》目前仍是第六课故事板，尚未接入 `lessons.js`。本课按用户指定保留为第七课，不能挤占或改写第六课。

## 原始素材与故事理解

- 故事画面照片：`/Users/graceshi/Downloads/IMG_0408.HEIC`
- 童谣与学习字照片：`/Users/graceshi/Downloads/IMG_0409.heic`
- 已规范为普通 JPEG 的故事参考：`storyboards/references/wind-doll-source.jpg`
- 已规范为普通 JPEG 的文字参考：`storyboards/references/wind-doll-text.jpg`
- 第一张照片包含六格印刷插图，用于理解风娃娃、男孩、小树、麦苗和柔和儿童绘本画风。
- 第二张照片用于确认童谣含义和六个学习字。
- 两张照片都不能直接作为视频构图照搬；视频中不得出现书页、格子、序号、标题、印刷文字或红色学习字。

原故事的完整含义是：风娃娃没有礼貌，撒开腿到处乱跑；它在南边撞倒小树，又在北边踩疼麦苗，不但没有道歉，还拍手发笑。小朋友不应该学它，做人要有礼貌。

为适配 10 秒单镜头，本课保留四个最容易看懂的动作：

```text
到处乱跑 → 撞倒小树 → 踩疼麦苗并拍手笑 → 男孩摇头提醒要有礼貌
```

## 本课学习字

```text
没、腿、南、北、拍、做
```

逐字检查：

- `没`：没礼貌
- `腿`：撒开腿
- `南`：南边
- `北`：北边
- `拍`：拍手
- `做`：做人

六个字都真实出现在最终旁白中，且不重复。

## 腾讯云 TTS 旁白稿

旁白不交给 Gemini 生成。候选视频经用户人工批准后，再使用项目现有的腾讯云 TTS 流程生成独立 MP3。

建议的正式口语化旁白：

> 风娃娃没礼貌，撒开腿到处跑。南边撞倒小树，北边踩疼麦苗，还拍手笑。别学它，做人要有礼貌！

断句朗读建议：

```text
风娃娃没礼貌，／撒开腿到处跑。／
南边撞倒小树，／北边踩疼麦苗，／还拍手笑。／
别学它，／做人要有礼貌！
```

这版使用“到处跑”“撞倒小树”“踩疼麦苗”“别学它”等儿童容易理解的说法，保留原童谣的因果和礼貌主题，同时包含全部学习字：

```text
没、腿、南、北、拍、做
```

旁白共 37 个汉字（不计标点）。腾讯云音色 `502007`、语速 `0` 的首次实测时长为 10.368 秒；按流程保持视频速度不变，将腾讯云语速调整为 `1` 后，正式旁白时长为 8.616 秒，给结尾保留约 1.38 秒清楚画面。

字幕按腾讯云正式音频的实际停顿校准为四段：

1. `0.00` 秒：`风娃娃没礼貌，撒开腿到处跑。`
2. `2.83` 秒：`南边撞倒小树，北边踩疼麦苗。`
3. `5.65` 秒：`还拍手笑。`
4. `6.68` 秒：`别学它，做人要有礼貌！`

逐字高亮时间使用腾讯云正式 MP3 的 10 毫秒波形窗口和七处真实语音停顿校准：

```text
没 0.58 秒；腿 1.79 秒；南 2.83 秒；
北 4.28 秒；拍 5.76 秒；做 7.56 秒。
```

## 制作目标

- 使用 Gemini 一次生成一条完整视频
- 总时长：严格控制在 10 秒左右
- Gemini 生成画幅：竖版 9:16，所有关键动作位于中央 4:5 安全区
- 正式成片：用户批准候选后裁切为 720×900、4:5
- 形式：同一片乡间草地中的单场景、单个连续镜头，不切镜
- Gemini 不生成旁白、角色对白、笑声、唱词或其他人声
- 允许轻柔自然风声、树叶声、脚步动作音和不抢旁白的非人声背景音乐
- 中文旁白、题目和反馈全部使用腾讯云 TTS

## 10 秒动作时间线

| 时间 | 画面动作 | 故事信息 |
|---|---|---|
| 0.0—2.5 秒 | 恰好一个白色风娃娃沿短小的弧形土路快速跑动，双腿清楚交替，身后只有两条柔和风带 | 撒开腿到处跑 |
| 2.5—4.7 秒 | 风娃娃经过左侧小树，肩膀带起的一阵风把小树吹弯并轻轻倒在草地上；风娃娃不停下 | 南边撞倒小树 |
| 4.7—7.2 秒 | 同一个风娃娃跑过右侧一小片麦苗，脚踩过最前方几株，麦苗弯倒；不表现危险或受伤画面 | 北边踩疼麦苗 |
| 7.2—8.8 秒 | 风娃娃停在路中央，面对倒下的小树和麦苗，拍手两下并露出得意的无声笑脸 | 不道歉，还拍手笑 |
| 8.8—10.0 秒 | 从开头就在画面边缘观察的小男孩轻轻摇头，举起一只手做出温和的“不能这样”手势；风娃娃停止拍手，结尾定格在清楚的提醒画面 | 小朋友不学它，做人要有礼貌 |

## 固定的画面布局

- 场景是一片温暖明亮的乡间草地，中央是一条很短的弧形土路。
- 一棵小树固定在中央安全区偏左，一小片整齐麦苗固定在中央安全区偏右。
- 风娃娃只沿中央短路从左向右移动，不能绕场、飞走、瞬移或离开中央 4:5 安全区。
- 小男孩从开头就站在画面右后方边缘，手里不拿工具；前 8.8 秒只观察，最后才摇头并举手提醒。
- 使用稳定中远景，同时看清风娃娃的完整身体、小树、麦苗和男孩。
- 摄影机不追踪、不旋转、不缩放，不使用转场、蒙太奇或视角变化。
- “南边”和“北边”由旁白表达，画面不放方向牌、文字或地图符号。

## 角色与画风锚点

风娃娃是一个原创、可爱但淘气的白色云朵精灵：蓬松云朵形头发和圆润身体，灰蓝色小鼻子，淡蓝色腮红，清楚的两只手和两条腿，不穿衣服。身后始终只有两条半透明白色风带，风带是气流效果，不得变成额外手脚、尾巴、围巾或第二个角色。

小男孩是一个原创的圆脸儿童：黑色短发、黄色长袖上衣、蓝色长裤和黄色鞋，表情温和，不发怒、不追赶风娃娃。

画面采用原创儿童绘本动画风格：手绘水彩与水粉质感、柔和纸张纹理、低饱和蓝绿与暖黄色、圆润造型、清楚表情，适合 3—6 岁儿童。参考照片只用于理解角色特征、主要道具、配色和故事关系，不复制原图具体构图或印刷内容。

## Gemini 一次生成提示词

下面这一段作为完整提示词一次性提交，不拆分：

```text
Create a new, original children's animation using the attached clean reference
illustration as the exact visual reference for the single white wind doll's
fluffy cloud-like hair and body, small gray-blue nose, pale blue cheeks, two
arms, two legs, exactly two translucent white wind ribbons, rounded proportions,
warm countryside colors, linework and soft watercolor-and-gouache picture-book
feeling. Use the photographed printed page, if also attached, only as secondary
context for the story. Never show or reproduce a printed page, exact panel
composition, page border, panel border, title, number, red learning characters
or any text.

Create one continuous 10-second vertical 9:16 video. Keep the wind doll, little
tree, wheat seedlings, boy and every important action inside the central 4:5
safe area for later cropping. Use one locked, stable medium-wide shot in the
same warm countryside meadow. No cuts, transitions, montage, time jumps, zooms,
camera tracking, camera rotation or angle changes.

The fixed spatial layout is mandatory. A very short curved dirt path crosses the
center. Exactly one small leafy tree stands at left-center. One small, tidy patch
of young green wheat seedlings grows at right-center. Exactly one boy with short
black hair, a yellow long-sleeve top, blue trousers and yellow shoes stands at
the far right background from the first frame and quietly watches. No signs,
maps or direction labels.

No narration, spoken dialogue, human voices, laughter sounds, vocal sounds,
singing, lyrics or vocal music. Very soft natural wind, leaves, footsteps and
gentle child-friendly non-vocal background music are allowed, but they must not
dominate.

0–2.5s: Exactly one cute white wind doll runs quickly along the short central
path from left toward right. Its same two legs alternate clearly in a natural
running motion. Its same two translucent wind ribbons trail gently behind it.
The wind doll looks playful and careless, not frightening. The boy remains still
and watches from the background.

2.5–4.7s: The same wind doll passes close beside the same small tree without
stopping. A brief gust from its shoulder and ribbons bends the tree and gently
tips the whole little tree onto the soft grass. The tree does not break apart.
The wind doll keeps moving. The boy still watches.

4.7–7.2s: The same wind doll runs across only the front edge of the same small
wheat patch. Its two feet step over several seedlings, leaving those few stalks
visibly bent flat while the rest of the patch remains intact. Show no injury,
pain marks, tears or frightening damage.

7.2–8.8s: The wind doll stops at the center of the path with the fallen little
tree and bent seedlings both visible. It claps its same two hands exactly twice
and makes a smug, silent smiling face. There is absolutely no audible laugh,
voice or dialogue.

8.8–10s: The boy, who has remained visible in the same place throughout, gently
shakes his head once and raises one open hand in a calm “do not do that” gesture.
The wind doll immediately stops clapping and looks toward the boy with mild
surprise. End clearly with the same wind doll, boy, fallen tree and bent
seedlings all visible.

Maintain exact wind-doll, wind-ribbon, boy, tree, wheat, path and meadow
continuity. Exactly one wind doll, one boy, one little tree and one wheat patch.
The wind doll always has two arms, two hands, two legs and two wind ribbons.
The wind ribbons remain airflow effects and never become limbs, a tail, scarf,
clothes or another character. The boy never moves location, approaches, shouts
or touches the wind doll. No duplication, morphing, merging, teleporting, extra
limbs, detached body parts, other people, other animals, vehicles, tools, signs,
speech bubbles, anger symbols, injury symbols, musical-note symbols, printed
pages, panel borders, subtitles, logos, watermark, numbers or written
characters.
```

## 参考图处理建议

- 原始故事画面照片包含书页、六格边框、序号和印刷标题，不适合作为唯一的视频参考图。
- 用户确认本故事板后，已制作一张不含文字、边框和序号的干净视频参考图：`storyboards/references/wind-doll-video-reference.png`。
- 干净参考图固定了：单个白色风娃娃、两条风带、黄色上衣男孩、左侧小树、右侧麦苗、中央弧形小路和柔和水彩绘本画风。
- 原童谣文字照片不上传给 Gemini，避免模型在视频里生成汉字。

## 候选视频目录

候选视频 1 已生成并保存到：

```text
storyboards/candidates/wind-doll-candidate-1.mp4
```

候选视频 1 的初步技术检查：

- 来源：Gemini 视频生成页面，使用 Omni 生成
- 参考图：`storyboards/references/wind-doll-video-reference.png`
- 画幅：720×1280、9:16
- 时长：10.005 秒
- 视频：H.264、24 fps
- 音频：AAC、48000 Hz、双声道
- 文件大小：约 2.4 MiB
- 初步抽帧：只有一个风娃娃和一个男孩；小树倒下、风娃娃经过麦苗、合手拍掌、男孩举手提醒的顺序存在；无书页、格子、文字或水印
- 待人工重点确认：麦苗弯倒是否足够清楚；拍手是否容易看懂；音轨中是否完全没有人声；整体故事动作是否自然

用户已明确回复“候选1通过”。候选视频 1 已进入正式处理流程。

## 用户批准后的正式资源路径

```text
assets/lessons/wind-doll/
├── scene-1.jpg
├── video/
│   └── story.mp4
└── audio/
```

已归档的正式结果：

- 正式视频：`assets/lessons/wind-doll/video/story.mp4`
- 正式封面：`assets/lessons/wind-doll/scene-1.jpg`
- 视频规格：720×900、10.00 秒、H.264、24 fps、约 1.0 MiB
- 原声音轨：保留 AAC 双声道音轨，页面使用 `videoVolume: 0.12`
- 正式旁白：`assets/lessons/wind-doll/audio/story-full.mp3`
- 腾讯云清单：`assets/lessons/wind-doll/audio/manifest.json`
- 腾讯云音色与语速：`tencent-502007`、`1`
- 完整旁白实测时长：8.616 秒

## 首次生成重点验收

1. 动作是否严格按“跑动—小树倒下—麦苗弯倒—拍手笑—男孩摇头提醒”的顺序发生。
2. 是否从头到尾只有一个风娃娃，始终保持两只手、两条腿和两条风带。
3. 两条风带是否始终只是气流效果，没有变成额外肢体、尾巴、围巾或第二个风娃娃。
4. 小树是否只有一棵，只是轻轻倒在草地上；麦苗是否只有前方几株弯倒，没有出现危险或惊吓画面。
5. 小男孩是否从开头就位于画面边缘，最后只做温和的摇头和举手提醒，没有突然出现、追赶、发怒或说话。
6. 是否完全没有旁白、对白、笑声、唱词或其他人声。
7. 风声、树叶声、脚步声或背景音乐是否轻柔自然，不会干扰腾讯云旁白。
8. 所有角色和关键动作是否全部位于中央 4:5 安全区。
9. 是否没有书页、六格边框、序号、标题、文字、字幕、水印、方向牌或黑边。
10. 结尾是否清楚看到风娃娃停止拍手、男孩作出提醒，以及倒下的小树和弯倒的麦苗。

如果首次生成无法稳定完成全部动作，下一版优先删去开头的长距离跑动，把风娃娃直接放在小树旁开始；不删减“小树倒下”“麦苗弯倒”“拍手笑”和“男孩提醒”四个核心因果节点。

## 人工确认状态

- [x] 用户确认故事板、旁白和 Gemini 提示词
- [x] 用户批准 Gemini 候选视频
- [ ] 用户确认字幕和逐字高亮效果
- [ ] 用户最终通过本地完整课程体验

## 本地技术验收记录

- `npm test`：43 项全部通过。
- `npm run build:site`：构建成功，共输出 396 个文件。
- 故事页可正常加载正式视频、腾讯云旁白、封面和六字课程数据。
- 实测字幕随旁白切换，关键字“没、腿、南、北、拍、做”按设定时间逐字高亮。
- 声音开关可正常静音和恢复；故事结束后可进入跟读。
- 六字跟读顺序正确：没 → 腿 → 南 → 北 → 拍 → 做。
- 三道问答完整跑通；错误答案会显示重试提示，最终完成页显示 3 / 3。
- 浏览器控制台无错误或警告。
