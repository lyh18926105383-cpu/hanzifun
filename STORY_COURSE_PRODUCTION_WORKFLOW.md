# 汉字饭故事课生产流程

> 适用范围：在本项目中新增、修改或验收任何故事课。
> 当前基准案例：第二课《蚂蚁搬豆》。
> 最后更新：2026-07-25。

## 开始前的硬性规则

每次生产新故事课前，必须先完整阅读本文档，再查看最近一课的故事板和 `lessons.js` 中的现有配置。

除非用户明确改变规则，默认沿用以下约束：

- 面向 3—6 岁儿童，故事简单、动作清楚、画面温暖。
- Gemini 一次生成一条完整的 10 秒视频。
- Gemini 不生成旁白或角色对白；可以根据故事需要生成合适的环境音、动作音效或背景音乐。
- 旁白、题目、反馈继续使用腾讯云 TTS。
- Gemini 原始画幅使用竖版 9:16，关键内容放在中央 4:5 安全区。
- 网页正式视频统一处理为 720×900、4:5、10 秒左右。
- 字幕必须随旁白分段切换。
- 当前字幕涉及的学习字才显示在字幕下方。
- 旁白念到某个学习字时，该字要单独高亮。
- “找一找”的选项由页面随机排列，正确答案不能固定在第一个位置。
- 候选视频必须先让用户人工确认，确认后才能进入正式资源目录。
- 未经用户要求，不部署线上版本。

## 整体流程

```text
收集原始故事素材
→ 提炼故事和学习字
→ 制作 10 秒故事板
→ 准备角色/画风参考图
→ Gemini 一次生成视频（无旁白/对白，可含音效或音乐）
→ 人工验收候选视频
→ 裁切、压缩并归档正式视频
→ 编写课程数据和全部 TTS 文案
→ 腾讯云生成固定语音
→ 配置字幕、关键词和逐字高亮时间
→ 接入首页、跟读和测验
→ 自动测试与构建
→ 内置浏览器完整验收
→ 用户最终确认
```

## 1. 收集和判断原始素材

用户通常会提供两类图片：

1. 故事内容照片，例如绘本的前后两页，用于理解完整情节。
2. 角色或画风参考图，用于约束 Gemini 中角色、道具、比例和视觉风格。

处理原则：

- 先看完所有故事照片，再总结“主角—困难—办法—结果”。
- 原始绘本照片可以用于理解故事，但如果包含大面积文字、书页边框、手指或拍摄透视，不宜直接作为唯一的视频参考图。
- 优先准备一张干净、主体清晰、接近最终画风的参考图。
- 《蚂蚁搬豆》中使用的小蚂蚁、绿色豆子和蚂蚁洞参考图是有效的，应随 Gemini 提示词一起提供。
- 如果参考图来自印刷页面，提示词必须明确要求不要生成书页、边框、印刷文字、水印或字幕。

开始制作前，应向用户确认或根据已有信息确定：

- 课程名称和课程序号。
- 完整故事含义。
- 本课学习字。
- 视频是否仍为一次生成 10 秒。
- 画幅和视觉风格是否沿用现有规则。

## 2. 提炼故事和学习字

先写一条能在 10 秒内读完的完整旁白。推荐结构：

```text
遇到问题。想到办法。请来帮助。完成目标。
```

《蚂蚁搬豆》的最终旁白：

```text
小蚂蚁用力搬豆，搬不动。想出办法，请来朋友，一起抬回家。
```

学习字必须逐个检查：

- 必须真实出现在 `storyText` 中。
- 应适合当前年龄段。
- `targetChars` 中不能重复。
- 每个学习字都要有对应的跟读项目和静态 TTS。
- 不要只从最初讨论中复制字表，要再次通读最终旁白，检查是否漏字。

《蚂蚁搬豆》最终学习字为：

```text
豆、力、用、办、法、请
```

## 3. 制作 10 秒故事板

每课先在 `storyboards/` 中创建故事板：

```text
storyboards/<lesson-slug>.md
```

故事板至少包含：

- 制作目标。
- 总时长和画幅。
- 动作时间线。
- 固定场景布局。
- 角色与画风锚点。
- Gemini 完整提示词。
- 腾讯云 TTS 旁白稿。
- 需要重点验收的风险。
- 用户批准后的正式资源路径。

### 10 秒叙事原则

- 优先使用单场景、单个连续镜头，减少角色变形和叙事断裂。
- 一条视频最多保留 3—4 个关键动作。
- 每个动作必须有明确的开始和结束。
- 先保证故事关键因果，再保留表情或装饰动作。
- 如果首次生成不稳定，优先删减摇头、转圈等非关键动作，不要删减故事的核心办法和结果。

推荐时间分配：

| 时间 | 功能 |
|---|---|
| 0—3 秒 | 展示主角和困难 |
| 3—5 秒 | 主角想到办法 |
| 5—7 秒 | 帮手或关键变化出现 |
| 7—10 秒 | 完成目标并停在清楚的结尾 |

## 4. 编写 Gemini 提示词

提示词建议使用英文，以便精确描述动作和排除项。完整提示词应一次性提交，不拆成多段生成。

提示词需要包含六部分：

1. 参考图用途：角色、道具、比例、配色、线条和画风。
2. 输出规格：10 秒、竖版 9:16、中央 4:5 安全区。
3. 镜头要求：单镜头、稳定中远景、无转场。
4. 分秒动作：按时间明确写出发生什么。
5. 声音要求：无旁白、无角色对白、无人声演唱；可以有合适的环境音、动作音效或轻柔背景音乐。
6. 连贯性和排除项：角色、道具数量和形状不能变化；无文字、无水印、无多余肢体等。

可复制骨架：

```text
Use the attached illustration as the exact visual reference for the characters,
props, proportions, colors, linework and soft watercolor children's picture-book
style. Animate this scene; do not show a printed page, borders or text.

Create one continuous 10-second vertical 9:16 video. Keep all action in the
central 4:5 safe area. One stable medium-wide shot, no cuts or transitions.
No narration, spoken dialogue, voices, lyrics or vocal sounds. Natural ambience,
action sound effects and gentle background music are allowed when they support
the story and do not dominate.

0–3s: [困难]
3–5s: [想到办法]
5–7s: [关键帮助出现]
7–10s: [完成目标，清楚收尾]

Maintain exact character and prop continuity. [列出数量、肢体、形状等约束]
No duplication, morphing, merging, teleporting, extra limbs, other animals,
humans, clothes, tools, text, subtitles, logos or watermark.
```

## 5. 在 Gemini 生成并人工验收

可以使用已登录的 Gemini Mac 客户端或浏览器。客户端与浏览器不会改变模型本身的生成质量，关键是选用相同模型、参考图和提示词。

生成步骤：

1. 上传干净的角色/画风参考图。
2. 粘贴完整提示词。
3. 一次生成完整 10 秒视频。
4. 下载候选视频，先放入临时候选目录。
5. 向用户展示候选结果并等待明确批准。

### Flow 自动操作失败处理

- 使用浏览器自动操作 Flow 时，同一轮生成流程最多尝试两次。
- 如果连续两次因页面异常、上传失败或输入框故障而未能成功提交，必须停止自动重试，并询问用户是否改为手动操作 Flow。
- 用户接手后，保留已上传的参考图和已配置的生成参数，把 Flow 页面交还给用户；等待用户确认生成完成后，再继续下载和候选验收。

候选目录：

```text
storyboards/candidates/
```

该目录已被 `.gitignore` 忽略。不要把失败候选放入正式课程资源目录。

人工验收重点：

- 故事动作是否按顺序发生。
- 主角、朋友和道具数量是否正确。
- 是否出现角色复制、融合、瞬移或多余肢体。
- 道具是否保持形状、大小和颜色。
- 关键动作是否都在中央 4:5 安全区。
- 是否出现文字、水印、书页或黑边。
- 结尾是否清楚，是否有足够时间看懂结果。
- 视频中是否完全没有旁白、角色对白或其他人声。
- 如果生成了环境音、动作音效或背景音乐，判断它们是否自然、是否适合儿童、是否会干扰腾讯云 TTS。

只有用户明确说“通过”后，才进入下一步。

## 6. 处理和归档正式视频

每课正式资源目录：

```text
assets/lessons/<lesson-slug>/
├── scene-1.jpg
├── video/
│   └── story.mp4
└── audio/
```

项目提供 macOS 视频处理脚本：

```text
scripts/process-approved-video.m
```

它会：

- 截取指定时长。
- 从 9:16 画面裁切中央 4:5 区域。
- 输出 720×900。
- 输出 MP4，并为网页播放做优化。
- 输入视频存在音轨时，将原音轨一并保留到正式 MP4。

典型用法：

```bash
clang -fobjc-arc \
  -framework Foundation \
  -framework AVFoundation \
  scripts/process-approved-video.m \
  -o /tmp/process-approved-video

/tmp/process-approved-video \
  <Gemini候选.mp4> \
  assets/lessons/<lesson-slug>/video/story.mp4 \
  <纵向裁切偏移> \
  10 \
  AVAssetExportPresetMediumQuality
```

注意：

- 裁切偏移必须根据候选视频的真实尺寸和主体位置确定，不能盲目沿用上一课。
- 腾讯云 TTS 始终是唯一正式旁白来源，不能使用 Gemini、Flow 或其他视频模型生成的人声代替。
- 原视频的环境音、动作音效或背景音乐默认保留，但候选验收时必须先确认其中没有旁白、角色对白、唱词或其他人声。
- 正式课程通过场景字段 `videoVolume` 调低原视频声音，推荐从 `0.12` 开始试听，通常控制在 `0.08—0.15`；腾讯云旁白保持主音量。
- 原视频声音不得盖过旁白，不能影响汉字听辨。必须在本地浏览器同时播放视频与腾讯云 TTS，分别抽查开头、动作音效处和最后一句旁白。
- 页面总声音开关必须同时控制腾讯云旁白和原视频声音。关闭声音后，视频音量必须为 `0`；再次打开后恢复场景配置的低音量。
- 如果原视频包含任何人声，不能仅靠调低音量处理；必须移除该人声或更换候选视频，再进入正式资源目录。
- 从正式视频选取清楚的一帧作为 `scene-1.jpg`。
- 视频目标大小应低于 4 MiB。
- 最终核对分辨率、时长、编码、文件大小，以及音轨是否符合本课确定的保留策略。

《蚂蚁搬豆》的正式结果：

- `story.mp4`：720×900、10.00 秒、H.264、约 3 MiB。
- `scene-1.jpg`：正式故事封面和视频加载兜底图。

## 7. 在 `lessons.js` 中接入课程

先复制现有课程对象，再逐项替换。不要从零猜字段。

基础结构：

```js
{
    id: '<唯一lesson-id>',
    title: '<课程名>',
    theme: '<主题>',
    coverEmoji: '<emoji>',
    targetChars: ['字1', '字2'],
    storyText: '<完整旁白>',
    narrationAudio: 'assets/lessons/<slug>/audio/story-full.mp3',
    scenes: [],
    fallbackDuration: 10,
    practice: [],
    feedback: {},
    quiz: [],
}
```

### 场景字段

```js
{
    image: 'assets/lessons/<slug>/scene-1.jpg',
    video: 'assets/lessons/<slug>/video/story.mp4',
    audio: 'assets/lessons/<slug>/audio/story-scene-1.mp3',
    narrationText: '<本场景旁白>',
    fallbackEmoji: '<emoji>',
    alt: '<无障碍画面描述>',
    caption: '<初始字幕>',
    focusChars: ['本场景涉及的全部学习字'],
    startAt: 0,
    fallbackDuration: 10,
    cues: [],
    keywordCues: [],
}
```

### 字幕分段 `cues`

`startAt` 是相对于当前场景开始的秒数：

```js
cues: [
    {
        startAt: 0,
        text: '第一段旁白。',
        focusChars: ['本段涉及的字'],
    },
    {
        startAt: 4,
        text: '第二段旁白。',
        focusChars: ['本段涉及的字'],
    },
    {
        startAt: 7.2,
        text: '第三段旁白。',
        focusChars: [],
    },
]
```

规则：

- 字幕必须使用实际旁白内容，不要写成不同的画面概述。
- 当前字幕没有提到学习字时，`focusChars` 使用空数组。
- 不要在视频开始时一次显示所有学习字。
- 页面中的视频字幕、字幕下方字卡和视频下方文本会使用同一条 cue。

### 逐字高亮 `keywordCues`

每个学习字的高亮时间必须根据最终腾讯云音频校准：

```js
keywordCues: [
    { startAt: 1.3, char: '用', duration: 0.6 },
    { startAt: 1.7, char: '力', duration: 0.6 },
    { startAt: 2.35, char: '豆', duration: 0.65 },
]
```

规则：

- `startAt` 是旁白实际念到该字的时间。
- `duration` 通常为 0.5—0.7 秒。
- 同一时间只高亮一个字；后开始的字优先。
- 字幕切换时间和逐字高亮时间必须在浏览器中听音校准，不能只按字数平均分配。
- 高亮效果由 `.focus-char.speaking` 控制，包括变亮、放大和轻跳。

### 跟读 `practice`

每个 `targetChars` 都必须有一个跟读条目：

```js
practice: [
    {
        char: '用',
        word: '使用',
        emoji: '🛠️',
        audio: 'audio/tts-v1/002-7528.mp3',
    },
]
```

优先复用 `audio-manifest.json` 中已经生成的 108 字固定 TTS。不要为已有字重复生成另一份单字语音。

### 测验 `quiz`

每题包含：

```js
{
    prompt: '<问题>',
    emoji: '<提示emoji>',
    choices: ['正确字', '干扰字1', '干扰字2'],
    answer: '<正确字>',
    audio: 'assets/lessons/<slug>/audio/quiz-1.mp3',
    correctText: '<正确反馈>',
    correctAudio: 'assets/lessons/<slug>/audio/correct-1.mp3',
}
```

页面会在显示每道题时随机打乱 `choices`，课程数据中不需要手工轮换正确答案位置。

题目原则：

- 先考故事理解，再考目标字识别。
- 干扰字应明显但不能荒谬。
- `answer` 必须存在于 `choices` 中。
- 如果题目答案不是本课目标字，要确认这是有意的故事理解题。

## 8. 生成腾讯云 TTS

Gemini 不生成旁白。所有正式旁白、题目朗读和语音反馈由：

```text
scripts/generate-story-tts.js
```

生成。

环境变量放在项目根目录 `.env` 或当前终端环境中：

```text
TENCENTCLOUD_SECRET_ID
TENCENTCLOUD_SECRET_KEY
```

凭证禁止写入代码、文档、日志或 Git。

### 本项目已确认的 TTS 凭证位置

当前故事课工作树没有单独的 `.env` 时，腾讯云 TTS 凭证位于同一项目主工作区：

```text
/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun/.env
```

每次运行 TTS 前按以下顺序检查：

1. 当前故事课工作树根目录的 `.env`。
2. 当前终端是否已设置 `TENCENTCLOUD_SECRET_ID` 和 `TENCENTCLOUD_SECRET_KEY`。
3. 上述主工作区的已确认 `.env` 路径。

在工作树中需要使用主工作区凭证时，只临时加载环境变量：

```bash
set -a
source '/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun/.env'
set +a
node scripts/generate-story-tts.js --lesson=<lesson-id> --speed=<speed>
```

不得把 `.env` 复制进正式资源目录，不得输出或记录密钥值，也不得提交到 Git。在判断“缺少腾讯云密钥”之前，必须先完成以上三个位置的检查。

推荐设置：

- 音色：`502007`
- 语速：`-2`
- 地域：`ap-guangzhou`
- 编码：MP3
- 采样率：24000 Hz

生成整课：

```bash
node scripts/generate-story-tts.js \
  --lesson=<lesson-id> \
  --speed=-2
```

需要覆盖已有文件时：

```bash
node scripts/generate-story-tts.js \
  --lesson=<lesson-id> \
  --speed=-2 \
  --force
```

只生成指定条目：

```bash
node scripts/generate-story-tts.js \
  --lesson=<lesson-id> \
  --speed=-2 \
  --only=story-full,quiz-1,correct-1
```

生成内容包括：

- `story-full.mp3`
- 每个场景的 `story-scene-N.mp3`
- 每道题的 `quiz-N.mp3`
- 每道题的 `correct-N.mp3`
- `try-again.mp3`
- `course-complete-v2.mp3`
- `manifest.json`

生成后检查：

- `manifest.json` 的 `lessonId`、音色和语速正确。
- 文件全部存在并可播放。
- 完整旁白时长与视频匹配。
- 旁白最后一句结束后，视频保留少量清楚的结尾画面。
- 如果只改了部分文案，只重生成受影响文件并更新清单。

可以在 `package.json` 添加便捷命令，例如：

```json
"tts:story:<short-name>": "node scripts/generate-story-tts.js --lesson=<lesson-id> --speed=-2"
```

## 9. 首页和缓存版本

在 `index.html` 增加故事课入口：

```text
story.html?lesson=<lesson-id>
```

检查：

- 课程序号、标题、主题、学习字数量正确。
- 不破坏已有课程入口。
- 无效课程参数仍能安全回到第一课。

修改以下文件后，应更新 `story.html` 中的缓存版本参数：

- `lessons.js`
- `story.js`
- `story.css`

例如：

```html
<link rel="stylesheet" href="story.css?v=story-v5">
<script src="lessons.js?v=story-v8"></script>
<script src="story.js?v=story-v8"></script>
```

如果忘记更新，浏览器可能继续使用旧脚本，导致本地看不到新效果。

## 10. 自动测试与构建

每次改动后先运行：

```bash
npm test
```

测试至少应覆盖：

- 学习字有效且不重复。
- 每个学习字存在于完整旁白。
- `practice.length` 与 `targetChars.length` 相同。
- 图片、视频和音频文件全部存在。
- 正式视频小于 4 MiB。
- 字幕 cue 覆盖正确学习字。
- 逐字高亮能在对应时间返回正确字符。
- 测验答案存在于选项中。
- 随机排列不修改原始课程数据。
- 课程链接参数能选择正确课程。

构建静态站点：

```bash
npm run build:site
```

构建结果位于：

```text
dist/
```

不要直接修改 `dist/`。它是构建产物，会被下一次构建覆盖。

## 11. 本地浏览器验收

启动本地站点：

```bash
python3 -m http.server 4173 --directory dist
```

打开：

```text
http://127.0.0.1:4173/story.html?lesson=<lesson-id>
```

修改并重新构建后，必须刷新页面再测试。

### 完整验收路径

按真实用户流程走完：

1. 首页能看到新课程。
2. 点击后进入正确的 `lesson` 参数。
3. 开场标题、主题和学习字数量正确。
4. 点击“开始听故事”。
5. 视频和腾讯云旁白同时启动。
6. 腾讯云 TTS 旁白清晰；原视频音效或音乐以低音量同时播放且不能盖过旁白，视频中不得出现 Gemini、Flow 或其他模型生成的旁白、角色对白、唱词或其他人声。
7. 字幕按旁白切换。
8. 当前字幕只显示相关学习字。
9. 每个学习字在被念到时逐字高亮。
10. 旁白结束后停在故事尾帧，并开放“跟着读一读”。
11. 跟读顺序和学习字数量正确。
12. “找一找”每题选项顺序随机。
13. 错误答案触发重试反馈。
14. 正确答案触发正确反馈并进入下一题。
15. 完成页分数和学习字正确。
16. 浏览器控制台没有课程代码的错误或警告。

### 时间同步验收

至少在以下位置抽查：

- 第一段字幕开始后。
- 每次字幕切换后约 0.3—0.8 秒。
- 每个 `keywordCues.startAt` 附近。
- 最后一段旁白和视频结尾。

如果高亮提前或滞后：

1. 以 `audio.currentTime` 为准记录真实时间。
2. 调整 `keywordCues.startAt`。
3. 重新构建并刷新。
4. 再次播放验证。

不要通过修改视频速度来追逐 TTS；优先调整旁白稿、TTS 语速和 cue 时间。

## 12. 人工确认点

以下步骤必须让用户确认：

- 故事板和 Gemini 提示词是否符合想要的故事。
- Gemini 候选视频是否通过。
- 字幕和逐字高亮的视觉效果是否合适。
- 本地完整课程体验是否最终通过。

用户确认之前：

- 不要替换已批准的正式视频。
- 不要删除候选素材。
- 不要部署线上版本。
- 不要把尚未确认的效果称为最终完成。

## 13. 完成定义

一节新故事课只有同时满足以下条件才算完成：

- [ ] 已阅读本文档。
- [ ] 原始故事和参考图已确认。
- [ ] 故事板已保存到 `storyboards/`。
- [ ] Gemini 提示词已保存。
- [ ] 用户批准了候选视频。
- [ ] 正式视频和封面已归档。
- [ ] 完整旁白能在 10 秒内自然读完。
- [ ] 腾讯云 TTS 全部生成并有 `manifest.json`。
- [ ] `lessons.js` 已配置完整。
- [ ] 所有学习字都有跟读项目。
- [ ] 字幕随旁白切换。
- [ ] 字幕相关学习字按段显示。
- [ ] 逐字高亮与旁白同步。
- [ ] 测验选项随机排列。
- [ ] 首页入口已增加。
- [ ] 缓存版本已更新。
- [ ] `npm test` 全部通过。
- [ ] `npm run build:site` 成功。
- [ ] 内置浏览器完整流程无报错。
- [ ] 用户完成最终验收。

## 14. 《蚂蚁搬豆》可复用经验

这次生产第二课得到的关键经验：

- 一张清楚的角色参考图对保持小蚂蚁、豆子和画风一致非常有用，应提供给 Gemini。
- 10 秒里使用单场景连续镜头，比多个镜头更容易保持角色和道具连续。
- 旁白不交给 Gemini，可以稳定复用腾讯云音色并独立调节节奏。
- 先生成最终旁白音频，再校准字幕和逐字高亮，时间会更准确。
- 学习字必须在最终旁白完成后再次复查，否则容易漏掉像“用”这样的字。
- 字幕不能只是固定的画面概述，应直接对应当前正在播放的旁白。
- 字幕下方不能一次显示全课所有字，只显示当前段涉及的字。
- 逐字高亮要以真实音频时间为准，而不是只按文字长度推测。
- 测验随机化应由通用页面逻辑处理，不要在每课数据里手工调整答案位置。
- 每次修改脚本或课程数据后必须更新缓存版本，否则容易误以为新功能没有生效。
