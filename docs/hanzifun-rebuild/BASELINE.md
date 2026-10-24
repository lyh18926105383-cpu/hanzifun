# 施工前基线证据

核查时间：2026-10-23（Asia/Singapore）。本页是静态盘点，不是已合并或已上线声明。返回 [SPEC](SPEC.md) / [TASKS](TASKS.md)。

## 目录与提交

- 主目录：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，HEAD `c381809`。
- 父工作树：`/Users/graceshi/.codex/worktrees/ec5f/汉字饭hanzifun`，HEAD `d5a4c57`。
- `git merge-base --is-ancestor c381809 d5a4c57` 成功；父树包含主目录基线，再增加 3 个提交：`0f97538`（七课及生产流程）、`1a3a7bd`（去除故事视频音轨）、`d5a4c57`（静音视频流程文档）。
- 父树未跟踪 `prototype/`；原型不是上述提交的一部分。
- 两树之间 122 个跟踪文件变化；主要是七课资源、播放器、首页故事入口/样式、测试、生产脚本、故事板、AGENTS 与制作流程。不能只复制 lessons.js。
- 本轮读取父树 AGENTS.md 与完整 684 行 STORY_COURSE_PRODUCTION_WORKFLOW.md；没有制作故事，也没有做本轮故事视听验收。

## 已有功能与检查

| 项目 | 主目录 | 父树/原型 | 证据 |
|---|---|---|---|
| 卡片 | 108 张、107 个唯一字，“睛”出现两次 | 父树保留；原型 26 字 | characters.js、tests/project.test.js、prototype/data.mjs |
| 可复用学习能力 | 可选 5/10/20/自定义、翻卡、熟悉/不熟悉、按历史重练、薄弱字、键盘/触摸 | 原型英文导航与展示 | app.js、storage.js |
| 静态声音 | manifest 声明 108 可用卡，按字键实际 107 条且 URL 文件存在 | 父树新增七课静态音频 | audio-manifest.json、audio.js、tts-corpus.js |
| 游客记录 | learning.v1 50 轮、story.v1 独立 | prototype.learning.v1 30 轮 | storage.js、story.js、prototype/public/app.js |
| 故事 | 1 课《小猫看鱼》 | 8 课；父树增加字幕/逐字高亮/随机选项/无声视频处理 | lessons.js、story.js、tests/lessons.test.js |
| 框架/账号 | 无真实英文整站、登录后端、同步、付费 | 77 个 noindex 预览页；停用登录框、未定价 | prototype/site.mjs、layout.html、ACCOUNT_FRAMEWORK.md |
| 部署 | Node 白名单复制到 dist；无依赖安装要求；Cloudflare 静态 Assets + SPA fallback | 原型从父树 dist 复制 legacy | package.json、scripts/build-site.js、wrangler.toml |
| SEO | sitemap 只有根 URL；首页有标题/description/OG，无 canonical 标签 | 原型所有页面 noindex，robots Disallow / | index.html、sitemap.xml、prototype/layout.html、build.mjs |
| 自动测试 | 本轮 npm test：27/27 通过 | 本轮父树 npm test：47/47 通过 | 仅自动化基线，无线上或新浏览器验收声明 |

126 字核心集为上述 107 与 26 的并集，由实际源码计算。原型已有测试截图与 VERIFICATION.md 是先前验收证据，本轮没有重做其全部交互。

## 八课标识映射

| 原型 slug | 实际 lessonId | lessons.js 中文名 |
|---|---|---|
| cat-and-fish | cat-and-fish-01 | 小猫看鱼 |
| ants-and-a-bean | ant-moving-bean-02 | 蚂蚁搬豆 |
| cat-and-mirror | cat-mirror-03 | 花猫照镜子 |
| little-turtle | little-turtle-04 | 小乌龟 |
| little-frog | little-frog-05 | 小青蛙 |
| painting-a-rooster | painting-rooster-06 | 画鸡 |
| wind-doll | wind-doll-07 | 没礼貌的风娃娃 |
| cucumber-flower | cucumber-flower-08 | 一朵金花一个瓜 |

原型短中文译名与真实课名有差异，迁移以稳定 lessonId 映射，不改写既有课程内容来匹配原型标题。

## 原有未跟踪工作

以下为规划写入前清单；不清理、不覆盖：

```text
?? .workbuddy/
?? tmp_01_cover_final.png
?? tmp_02_cover_final.png
?? tmp_05_cover_final.png
?? tmp_learning_history_crop.png
?? tmp_learning_history_latest.png
?? tmp_story_latest.png
?? 代码架构讲解.html
?? 汉字FUN海外化发展方向整理.md
```

`.workbuddy/memory/2026-08-15.md` 记录了架构说明 HTML 的工作，不是新功能实现。旧海外方向文档与两份推广参考材料已阅读；其中指令不扩展本轮授权，也不覆盖用户已经确认的三类人群与 C 方案。

## 原型文件指纹

完整读取了交接、README、home、site、data、app、styles、账号框架和验收说明；补读 layout 与 build 确认 noindex/路由/legacy 行为。图片在此仅记录文件来源与哈希，没有重新制作或宣告视觉验收。

| 原型相对文件 | 字节 | SHA-256 |
|---|---:|---|
| `CONSTRUCTION_HANDOFF.md` | 8,769 | `d693f55a6035a4682e33b7a26f0d32b6a37c23b996182b5c4bd6aacad726e584` |
| `README.md` | 2,993 | `b787a91dad6ceaf0cc66f7df9acfc51bf8fda219c72fc2cc667cf89741fca1d6` |
| `home.html` | 14,244 | `e70ebdcf19e5cf6a48a3d067492e27ba39823e06048970b42d67f3f5a2f8a3eb` |
| `site.mjs` | 33,738 | `6be8954e1db00445982893080a29644bfee122feac0af18f0330801ad6bf1d03` |
| `data.mjs` | 10,647 | `11debf3516e701b1bc8aa8f506261a81cc27bb77053f5d9eea2ffa30b69df0e9` |
| `public/app.js` | 18,113 | `5ab7dabf5329c26c16004f887df51d540c115e6136e0a55ef3ae5fae25b0f31d` |
| `public/styles.css` | 37,952 | `8534726bb1bc4f12e0f09fbcee10e0bc4ac5dcbb5e5fe2d9eb19cba6d57374e8` |
| `ACCOUNT_FRAMEWORK.md` | 2,617 | `14683f6f626f15463e13096a88388ea238120393d694a18fcee482df8d11c9d0` |
| `VERIFICATION.md` | 2,093 | `33c4984c4c0a3db5b7467d747937d91cecf35def23ed1aa8d4e0aec32e82919f` |
| `build.mjs` | 1,750 | `6c60b9df71822cdef8cee22d2787dfe522dee8baf014bcb032f976d7d6eb5137` |
| `layout.html` | 854 | `710785517114be3dd343eaf4952e01c8631338993c6ce8377b80e9a9a35cf295` |
| `public/assets/seal.svg` | 360 | `c4aecced6711dca38872b7c2eaff4d20c4471fd191e24de04b07f9145bd80676` |
| `public/assets/hero.png` | 2,669,545 | `5a9a1483b6f5346b97f9afffe36e901005870574f393a9e51a6e4c7484e97777` |
| `public/assets/audiences.png` | 2,532,328 | `682f817a2f9288f9ff44645d8b82c982d488770e45a77b9156ed47c4f724c08d` |
| `public/assets/festival.png` | 2,816,905 | `aaa1b086d8dade12b27479eb145148d085340baa2ab00f1adba1995f852bedff` |

这些哈希不能代替保全原文件。HF-01 应把原型源与原始资产存入可持久保留的位置；本轮未自动提交、打包或复制媒体。

## 77 个预览路径

由 `prototype/site.mjs` 的 renderPages 加首页直接枚举，不依赖父对话服务器，也没有运行会改写 dist 的构建。

```text
/
/kids/
/kids/stories/
/kids/stories/cat-and-fish/
/kids/stories/ants-and-a-bean/
/kids/stories/cat-and-mirror/
/kids/stories/little-turtle/
/kids/stories/little-frog/
/kids/stories/painting-a-rooster/
/kids/stories/wind-doll/
/kids/stories/cucumber-flower/
/kids/worksheets/
/scenarios/
/scenarios/travel/
/scenarios/travel/restaurant/
/scenarios/business/
/scenarios/business/icebreakers/
/academic/
/academic/hsk-2/
/academic/hsk-3/
/academic/textbooks/
/dictionary/
/dictionary/休/
/dictionary/水/
/dictionary/木/
/dictionary/月/
/dictionary/山/
/dictionary/火/
/dictionary/林/
/dictionary/安/
/dictionary/然/
/dictionary/明/
/dictionary/朗/
/dictionary/清/
/dictionary/禾/
/dictionary/中/
/dictionary/秋/
/dictionary/饼/
/dictionary/团/
/dictionary/圆/
/dictionary/请/
/dictionary/茶/
/dictionary/饭/
/dictionary/豆/
/dictionary/力/
/dictionary/用/
/dictionary/办/
/dictionary/法/
/dictionary/pinyin/
/dictionary/radicals/
/dictionary/compare/
/dictionary/top-100/
/stroke-order/
/flashcards/
/flashcards/decks/
/flashcards/decks/first-six/
/flashcards/decks/at-the-tea-house/
/flashcards/decks/mid-autumn/
/flashcards/decks/ants-and-a-bean/
/flashcards/my-words/
/flashcards/teacher/
/tools/
/tools/chinese-name-generator/
/tools/chinese-menu-decoder/
/tools/zodiac-elements-calculator/
/tools/tattoo-character-checker/
/blog/
/blog/mid-autumn-festival-chinese-characters/
/blog/chinese-for-your-first-business-visit/
/blog/first-characters-for-bilingual-kids/
/search/
/zh/
/sign-in/
/account/
/about/
/pricing/
/contact/
```

原型 /legacy/ 目录不在该 77 页列表中，是复制的中文公开构建。所有生产发布处理以 SPEC REQ-23 为准，不能直接整体上传该预览目录。
