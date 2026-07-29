# 第八个故事课：《一朵金花一个瓜》10 秒视频故事板

## 预定课程信息

- 课程序号：第八课
- 课程 ID：`cucumber-flower-08`
- 课程标题：`一朵金花一个瓜`
- 课程主题：`爱护花果`
- 首页图标：`🥒`
- 当前状态：修订提示词后重新生成的 Flow 候选已获用户批准；正式视频、腾讯云 TTS、字幕与逐字高亮已接入，并通过自动测试、构建与本地浏览器验收，待用户最终确认字幕观感和完整课程体验

> 第七课《没礼貌的风娃娃》已有单独故事板，但尚未接入 `lessons.js`。本课按用户指定保留为第八课，不挤占第七课。

## 原始素材与故事理解

- 故事画面照片：`/Users/graceshi/Downloads/IMG_0410.heic`
- 童谣与学习字照片：`/Users/graceshi/Downloads/IMG_0411.heic`
- 已规范为普通 JPEG 的故事参考：`storyboards/references/cucumber-flower-source.jpg`
- 已规范为普通 JPEG 的文字参考：`storyboards/references/cucumber-flower-text.jpg`
- 第一张照片包含四格印刷插图，用于理解黄瓜架、黄瓜藤、黄色花朵、小男孩、叔叔和柔和儿童绘本画风。
- 第二张照片用于确认童谣原文和六个学习字。
- 两张照片都不能直接作为视频构图照搬；视频中不得出现书页、格子、序号、标题、印刷文字、红色学习字、喇叭图标或思考气泡。

原故事的完整含义是：黄瓜藤上开着一朵朵黄色花，小男孩想摘一朵当喇叭玩。叔叔及时告诉他不能摘，因为每一朵黄瓜花以后都会结出一个黄瓜。

为适配 10 秒单镜头，本课保留四个最容易看懂的动作：

```text
看见黄瓜金花 → 伸手想摘 → 叔叔拦住 → 指出花后的小黄瓜，孩子明白并收回手
```

视频不让孩子真的摘下花，既保留“想摘花当喇叭”的情节，也让“不能摘”的行为结果清楚、友好。

## 本课学习字

```text
瓜、挂、朵、当、叔、说
```

逐字检查：

- `瓜`：黄瓜、一朵金花一个瓜
- `挂`：藤上挂金花
- `朵`：摘朵金花、一朵金花
- `当`：当喇叭
- `叔`：叔叔
- `说`：忙说

六个字都真实出现在最终旁白中，且不重复。

## 腾讯云 TTS 旁白稿

旁白不交给 Gemini 生成。候选视频经用户人工批准后，再使用项目现有的腾讯云 TTS 流程生成独立 MP3。

建议正式旁白沿用用户提供的童谣原文：

> 黄瓜藤上挂金花，摘朵金花当喇叭。叔叔忙说不能摘，一朵金花一个瓜。

断句朗读建议：

```text
黄瓜藤上挂金花，／摘朵金花当喇叭。／
叔叔忙说不能摘，／一朵金花一个瓜。
```

旁白共 28 个汉字（不计标点），包含全部学习字：

```text
瓜、挂、朵、当、叔、说
```

候选视频通过后，先使用腾讯云音色 `502007`、语速 `-2` 生成，实测时长为 11.064 秒，超过 10 秒正式视频。随后按流程保持原文不变、将语速调整为 `0` 并强制重新生成，最终旁白实测时长为 6.672 秒，结尾保留约 3.3 秒画面余量。没有通过改变视频速度追逐旁白。

字幕按腾讯云正式音频波形实测分为四段：

1. `0.00s`：`黄瓜藤上挂金花，`
2. `1.78s`：`摘朵金花当喇叭。`
3. `3.43s`：`叔叔忙说不能摘，`
4. `5.07s`：`一朵金花一个瓜。`

逐字高亮实测时间：

```text
0.35s 瓜　0.96s 挂　1.95s 朵　2.45s 当
3.46s 叔　4.07s 说　5.21s 朵　6.07s 瓜
```

第二次出现的“朵”和“瓜”也会再次高亮。“当”在“当喇叭”中按 `dàng`（四声）朗读，使用本课独立生成的练习音频，不复用“一声”的共享音频。

## 制作目标

- 使用 Gemini 一次生成一条完整视频
- 总时长：严格控制在 10 秒左右
- Gemini 生成画幅：竖版 9:16，所有关键动作位于中央 4:5 安全区
- 正式成片：用户批准候选后裁切为 720×900、4:5
- 形式：同一片黄瓜菜园中的单场景、单个连续镜头，不切镜
- Gemini 不生成旁白、角色对白、唱词、笑声或其他人声
- 允许轻柔鸟鸣、树叶和藤叶沙沙声、脚步动作音，以及不抢旁白的非人声背景音乐
- 中文旁白、题目和反馈全部使用腾讯云 TTS

## 10 秒动作时间线

| 时间 | 画面动作 | 故事信息 |
|---|---|---|
| 0.0—2.4 秒 | 黄瓜架固定在画面中央，藤上有宽大的绿叶、四朵清楚的黄色花和三个大小不同的绿色黄瓜；小男孩从右侧走近，抬头惊喜地看花 | 黄瓜藤上挂着金花 |
| 2.4—4.6 秒 | 男孩停在右侧，朝离他最近的一朵金花慢慢伸出右手，拇指和食指靠近花梗但尚未碰到；空着的左手停在嘴角旁，手掌微微朝内，五指分开并自然弯成松开的 C 形，全程不握东西 | 想摘一朵金花当喇叭 |
| 4.6—7.1 秒 | 从开头就在左后方照料菜园的叔叔迅速走近一步，温和地伸出一只张开的手挡在男孩与花之间；男孩立即停住并看向叔叔 | 叔叔忙说不能摘 |
| 7.1—10.0 秒 | 叔叔保持挡住花的手，另一只手指向同一朵花后方清楚可见的一根迷你小黄瓜，再指向旁边成熟黄瓜；男孩恍然点头并把手收回身前，花完整留在藤上 | 一朵金花会结一个瓜 |

## 固定的画面布局

- 场景是一片温暖明亮的乡间黄瓜菜园，中央只有一座简洁的竹木黄瓜架。
- 茂盛黄瓜藤固定缠绕在架子上，画面内始终只有四朵黄色五瓣花和三个清楚的绿色黄瓜：一根迷你小黄瓜紧接在男孩想摘的花后面，一根中等大小黄瓜和一根成熟黄瓜挂在附近。
- 小男孩固定在中央安全区偏右，叔叔从第一帧就位于中央安全区偏左后方，避免叔叔中途突然出现。
- 男孩想摘的目标花位于两人之间、约胸口高度，必须始终完整可见，不得被摘下、折断、遮没或变成黄瓜。
- 使用稳定中远景，同时看清男孩上半身与双手、叔叔上半身与双手、目标花、花后的小黄瓜和旁边成熟黄瓜。
- 摄影机不追踪、不旋转、不缩放，不使用转场、蒙太奇、视角变化或时间流逝特效。
- “一朵金花一个瓜”由叔叔的指向和真实可见的小黄瓜表达；不用文字、箭头、气泡、图标或花朵变形来解释。

## 角色与画风锚点

小男孩是一个原创的圆脸儿童：黑色短发、红润脸颊、芥末黄色长袖上衣、砖红色背带短裤、白袜和蓝鞋。表情好奇、活泼，动作轻柔。他只伸手但绝不碰到或摘下花。

叔叔是一个原创的年轻农人：黑色短发、友善圆脸、宽边棕色草帽、浅蓝色短袖上衣和深蓝色长裤。叔叔不发怒、不喊叫、不抓男孩，只用温和而清楚的张手阻止和指向动作。

画面采用原创儿童绘本动画风格：手绘水彩与水粉质感、柔和纸张纹理、低饱和蓝绿与暖黄色、圆润造型、清楚表情，适合 3—6 岁儿童。参考照片只用于理解角色特征、主要道具、配色和故事关系，不复制原图的四格构图或印刷内容。

## Gemini 一次生成提示词

下面这一段作为完整提示词一次性提交，不拆分：

```text
Create a new, original children's animation using the attached clean reference
illustration as the exact visual reference for the cucumber trellis, lush green
vines, broad leaves, four yellow five-petal cucumber flowers, three green
cucumbers, one little boy, one farmer uncle, rounded proportions, warm garden
colors, linework and soft watercolor-and-gouache picture-book feeling. Use the
photographed printed page, if also attached, only as secondary context for the
story. Never show or reproduce a printed page, exact panel composition, page
border, panel border, title, number, red learning characters, trumpet, horn,
megaphone icon, thought bubble or any text.

Create one continuous 10-second vertical 9:16 video. Keep the boy, uncle,
target flower, tiny cucumber behind that flower, two other cucumbers and every
important hand action inside the central 4:5 safe area for later cropping. Use
one locked, stable medium-wide shot in the same warm countryside cucumber
garden. No cuts, transitions, montage, time jumps, time-lapse, zooms, camera
tracking, camera rotation or angle changes.

The fixed spatial layout is mandatory. Exactly one simple bamboo cucumber
trellis stands in the center. The same lush vine stays attached to it throughout.
Exactly four yellow five-petal flowers and exactly three green cucumbers remain
visible and attached to the vine. One tiny baby cucumber grows directly behind
the same target flower at chest height between the two characters. One
medium-sized cucumber and one mature cucumber hang nearby. Exactly one little
boy stands at right-center. Exactly one farmer uncle is already visible in the
left background from the first frame while calmly tending the vine.

The boy has short black hair, rosy cheeks, a mustard-yellow long-sleeve top,
brick-red suspender shorts, white socks and blue shoes. The uncle has short
black hair, a friendly round face, a wide brown straw hat, a light-blue
short-sleeve shirt and dark-blue trousers. Keep their faces, clothes, bodies,
hands and proportions unchanged.

No narration, spoken dialogue, human voices, vocal reactions, laughter, singing,
lyrics or vocal music. Very soft birds, leaf rustling, subtle footsteps and
gentle child-friendly non-vocal background music are allowed, but they must not
dominate.

0–2.4s: The camera and trellis remain completely fixed. The same little boy
takes one or two small steps into his marked place at right-center and looks up
with delighted curiosity at the same four yellow flowers. The same uncle remains
visible in the left background and quietly tends the vine. All four flowers and
all three cucumbers stay attached, still and clearly countable.

2.4–4.6s: The boy stops and slowly reaches his right hand toward the single
target flower between the two characters. His right thumb and index finger move
close to the flower stem but stop just before touching it. At the same time, his
left hand stays completely empty and fully visible beside the corner of his
mouth. The left palm faces slightly inward; all five fingers remain separated
and gently curve into a loose open C shape. The left fingers never close into a
grip or fist. No object of any kind appears inside, behind, in front of or near
the left hand or mouth. He does not speak, make a sound, touch, bend, pinch,
break or remove the flower. The flower and tiny cucumber behind it remain fully
intact and visible.

4.6–7.1s: The uncle, who has been continuously visible, quickly takes only one
step closer. With a calm, kind expression, he extends one open palm into the
space between the boy's reaching hand and the target flower, clearly signaling
“please stop.” He never grabs, pushes or scolds the boy. The boy immediately
freezes his reaching hand and turns his eyes toward the uncle. No one speaks.

7.1–10s: The uncle keeps the protective open palm near the intact flower. With
his other hand, he first points clearly to the tiny baby cucumber growing
directly behind the same flower, then points to the mature cucumber hanging
beside it. The boy looks from the flower to the tiny cucumber and then the
mature cucumber, understands, nods once and brings both hands safely back in
front of his chest. End clearly with the boy smiling, the uncle smiling, the
same intact target flower, its attached baby cucumber and the mature cucumber
all visible.

Maintain exact boy, uncle, trellis, vine, flower, leaf and cucumber continuity.
Exactly one boy, one uncle, one trellis, four yellow flowers and three green
cucumbers throughout. The target flower always remains attached and undamaged.
The baby cucumber is already present from the first frame and never grows,
morphs or transforms during the shot. Every person always has one head, two
eyes, two arms, two hands, five fingers per hand and two legs. No duplication,
morphing, merging, teleporting, extra limbs, detached fingers, other people,
other animals, tools, baskets, picked flowers, loose cucumbers, trumpets, horns,
toy horns, megaphones or any object materializing in either hand or near the
mouth, signs, arrows, speech bubbles, thought bubbles, musical-note symbols,
printed pages, panel borders, subtitles, logos, watermark, numbers or written
characters.
```

## 参考图处理建议

- 原始故事照片包含书页、四格边框、序号、喇叭图标和思考气泡，不适合作为唯一的视频参考图。
- 原童谣文字照片不上传给 Gemini，避免模型在视频里生成汉字。
- 用户确认本故事板后，已制作并批准一张不含文字、边框、序号和气泡的干净视频参考图：

```text
storyboards/references/cucumber-flower-video-reference.png
```

- 干净参考图固定了：单座竹木黄瓜架、四朵金花、三根不同大小的黄瓜、目标花后的小黄瓜、右侧男孩、左后方叔叔，以及柔和水彩绘本画风。
- 参考图生成方式：内置图像生成工具；用户已明确表示“参考图没有问题”，批准继续候选视频制作。
- Flow 项目：`汉字饭故事课`
- Flow 上传资源名：`cucumber-flower-video-reference.png`
- Flow 上传状态：已成功

## Flow 手动提交精简提示词

自动操作 Flow 时，完整提示词和精简提示词连续两次在输入后触发客户端页面异常。根据项目生产流程，不再自动重试。用户手动生成时可选中已上传的 `cucumber-flower-video-reference.png`，保持 `视频 · 10s`、`9:16`、`x1`，粘贴下面的精简提示词：

```text
Animate the attached illustration as one continuous 10-second vertical 9:16
children's watercolor video. Match the same boy, farmer uncle, bamboo cucumber
trellis, flowers, cucumbers, clothing, faces and soft style exactly. Locked
stable medium-wide shot; keep all action in the central 4:5 safe area; no cuts,
zoom or camera motion.

0-2.4s: boy takes one or two small steps at right-center and looks happily at
the flowers; uncle is already visible at left-center. 2.4-4.6s: boy slowly
reaches toward the central yellow flower but stops just before touching it. His
left hand stays completely empty and visible beside the corner of his mouth:
palm slightly inward, all five fingers separated and gently curved into a loose
open C shape, never gripping or holding anything. No object appears in or near
his left hand or mouth. 4.6-7.1s: uncle takes one step closer and gently places
an open palm between the boy's hand and flower; boy stops and looks at him.
7.1-10s: uncle points to the tiny cucumber attached behind that flower, then the
mature cucumber; boy understands, nods once and withdraws both hands. End with
both smiling and the intact flower and cucumbers clearly visible.

No narration, dialogue, human voice, laughter, singing or lyrics. Soft birds,
leaves, footsteps and non-vocal music only. The flower is never touched, bent,
broken or picked. Keep exactly one boy, one uncle and one trellis; all original
flowers and three cucumbers remain attached and unchanged. No morphing,
duplication, extra limbs, other people, animals, tools, baskets, loose produce,
trumpet, horn, toy horn, megaphone, hand-held prop, materialized object, text,
subtitles, logos, watermark, bubbles, arrows, pages or borders.
```

用户使用修订提示词重新生成后，已明确确认视频可用。Flow 资源名为 `Boy and uncle in garden`；视频已下载到候选目录并完成关键帧复核，男孩左手始终为空，嘴边没有喇叭或其他凭空出现的道具。

## 候选视频目录

候选视频生成后只保存到：

```text
storyboards/candidates/cucumber-flower-candidate-1.mp4
```

该候选已经用户明确批准，现已进入正式资源目录，并完成腾讯云 TTS 与 `lessons.js` 接入。

## 用户批准后的正式资源路径

```text
assets/lessons/cucumber-flower/
├── scene-1.jpg
├── video/
│   └── story.mp4
└── audio/
    ├── story-full.mp3
    ├── story-scene-1.mp3
    ├── practice-duo.mp3
    ├── practice-dang.mp3
    ├── quiz-1.mp3 … quiz-3.mp3
    ├── correct-1.mp3 … correct-3.mp3
    ├── try-again.mp3
    ├── course-complete-v2.mp3
    └── manifest.json
```

正式视频由已批准的 720×1280、10 秒 Flow 候选裁切为中央 4:5，裁切纵向偏移量为 `190`。成片为 H.264 720×900、24 fps，保留 AAC 双声道环境声，总时长 10.000 秒，文件大小 3,997,041 字节（低于 4 MiB 上限）。封面从正式视频 `9.8s` 提取。

## 首次生成重点验收

1. 是否严格按“看见金花—伸手想摘—叔叔拦住—指出花后小黄瓜—男孩收手点头”的顺序发生。
2. 男孩是否只靠近目标花但从未碰到、折断或摘下花。
3. 叔叔是否从第一帧就可见，是否只做温和张手阻止和指向动作，没有突然出现、抓人、发怒或说话。
4. 是否从头到尾只有一个男孩、一个叔叔、一座黄瓜架、四朵金花和三个黄瓜，数量、形状、颜色和位置保持一致。
5. 目标花后的小黄瓜是否从第一帧就存在并清楚可见，没有用花朵变形、快速生长或魔法变化表达结果。
6. 是否完全没有旁白、对白、笑声、唱词或其他人声。
7. 鸟鸣、藤叶声、脚步声或背景音乐是否轻柔自然，不会干扰腾讯云旁白。
8. 两个人物、目标花、花后小黄瓜、成熟黄瓜和所有关键手部动作是否全部位于中央 4:5 安全区。
9. 是否没有书页、四格边框、序号、标题、文字、字幕、水印、箭头、气泡、喇叭图标或黑边。
10. 结尾是否清楚看到孩子已收回手、目标花仍完整、叔叔指出小黄瓜，故事结果一眼能懂。

首个 Flow 候选把“左手在嘴边”的手势错误理解成了凭空出现的小喇叭，因此未通过。重新生成时必须检查：左手从头到尾是否完全空着、五指是否始终可见、嘴边是否没有任何实体或半透明道具。如果修订提示词后仍出现喇叭、号角、扩音器或其他手持物，下一版删除左手嘴边手势，只保留“右手接近花但未触碰”；不删减“叔叔拦住”“指出花后小黄瓜”“男孩收手点头”三个核心因果节点。

## 人工确认状态

- [x] 用户确认故事板、旁白和 Gemini 提示词
- [x] 用户批准 Gemini 候选视频
- [ ] 用户确认字幕和逐字高亮效果
- [ ] 用户最终通过本地完整课程体验

## 本地验收记录

- `npm test`：45 项全部通过。
- `npm run build:site`：构建成功，共输出 411 个公开文件。
- 首页：故事课总数显示为 8，且可进入“第 8 课 · 一朵金花一个瓜”。
- 故事播放：正式 4:5 视频正常加载，10.00 秒播放完成后开放跟读按钮。
- 字幕：四段字幕分别在 `0.00s / 1.78s / 3.43s / 5.07s` 切换。
- 逐字高亮：`瓜、挂、朵、当、叔、说、朵、瓜` 八个实测点全部正常。
- 跟读：六张字卡均加载已归档固定音频，其中“当”使用本课四声专用音频。
- 找一找：三道题均可完成，答错会播放重试反馈，答对后顺序进入下一题。
- 完成页：显示六个学习字和 `3 / 3 题答对`；浏览器控制台无错误或警告。
