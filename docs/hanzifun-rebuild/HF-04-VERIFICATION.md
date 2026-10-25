# HF-04 工程交付与验收边界

日期：2026-10-25（Asia/Singapore）。工作目录：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，分支 main，施工基线 `9971074c1940af6379ac6bdae297197c8f6e20ba`。数据基线 `hf02-4b2c1eb510b3`；教学批次 `hf04-2026-10-25`；releaseId `hf04-dictionary-review-preview`。最终代码版本为包含本记录的 HF-04 提交，可用 `git log --oneline -- docs/hanzifun-rebuild/HF-04-VERIFICATION.md` 定位。

**状态：工程实现交付；整体 HF-04 人工内容/拼音/音频验收及 HF-05/06 真实学习联调未关闭。** 自动检查和浏览器抽查不替代人工签字，不把导入数据的目标 Tier2 当作已验收标准页。

## 页面与数据

- `/dictionary/` 全部 126 个稳定 characterId，`/dictionary/{字}/` 静态正文；`/search/` 按需获取 characters / words / library 三个索引分包。按汉字、英文、带调/数字调/无调拼音搜索；ü/v/u: 同组、lu 独立；有调查询不自动吞掉声调，可明确选择放宽。词条结果进入其已收录组成字的例词区，不生成独立薄词页。检索范围与预览属性可见。
- `data/normalized/` 保持原文件不变。新增独立 `data/editorial/characters.json`：126 份例词、短例句、拼音、英译和不同的英文短助记，均为原创教学草稿、Codex AI 快审记录；`humanAcceptance=pending`。该层为“发”的发现语境选择 fā，不改变 HF-02 的原 primaryReadingId，也保留 fà/髮 的切换与义项。
- Information 按 readingId 切换拼音、简繁对应及其义项；同形明确标注，多个繁体不静默合并。80 个直接核实的同字 Kanji 按 Unihan 17 证据展示并加 `lang=ja`；其余 46 个省略公开 Kanji 行，不推断日语不存在。桌面旁栏、手机置于概览后。替代读音与主教学例句分别标明语境，避免切到 fà 后把发现当作 fà 的例句。
- `/dictionary/pinyin/` 覆盖核心字实际读音，`/dictionary/radicals/` 按实际部首与笔画列字；`/dictionary/compare/` 交付八对比较与自检问题。候选独立词语/部件/简繁专题未扩展。六字打印样本使用现有真实地址；其他字不声称已有打印包。
- `/stroke-order/` 独立，支持 `?char=水`、受控选字、返回字页；与字页共用组件。按实际资源累计显示真实笔画，提供播放、暂停/继续、上/下一笔、重置、速度与计数。原始 JSON 按当前字、用户操作时请求；缓存键带资源 SHA-256。切字/离页暂停，异步加载后的陈旧命令不继续播放。
- 每字静态完整逐笔图由构建生成独立 SVG，原始路径在每份 SVG 的 defs 中只出现一次，累计步骤使用 use 引用。页面使用 lazy img，正文和公共 JS 不内联全库路径。静图与动画的路径来源相同。静图为无脚本/加载失败提供正文内降级。
- `/pinyin-chart/` 明示完整 **410 音节范围**，展示 **1,323 组词典见证的候选声调**，明确教学审核待办、罕见与排除范围，讲解四声/轻声、零声母、j/q/x、ü、iu/ui/un；按声母、韵母和音节筛选。例字仅链接实际核心页，与核心拼音索引分工互链。候选不冒充已审合法教学发音，全部未审音频按钮禁用。

## 发布、缺项与学习接口

`site/release.json` 默认及本包路径维持 `noindex,follow`，未一键将 `/dictionary/{char}/` 切为 published。构建拒绝在未有具名审核者、日期和证据的人工内容记录时发布字页；拼音教学审核未关闭时拒绝发布拼音表。只缺插画不作为索引阻断，测试使用内存验收夹具确认无插画标准页可通过门槛；夹具不写入真实审核输入。最终公共页 SEO、canonical 与逐页放行仍由 HF-08 收口。

- 人工状态集中保存在 `data/editorial/review-decisions.json`，不填写生成报告当作签字。HF-02 原 reports/coverage 未改写。
- 107 条既有语境音频仍待逐条听审；19 个新增核心字缺原语境录音，153 字读音与拼音补音/审核需求继续保留。没有调用付费 TTS，没有用拉丁字母 TTS 冒充拼音发音。提供审核绑定/互斥播放的音频帮助模块及夹具测试，当前真实录音无已批准绑定，因此页面呈现不可播放状态；不能据此宣称真实发音闭环完成。
- 17 个不完整部件分解不展示带问号的推测拆字，改为明确的不完整说明与完整笔顺；独体结构标签仍可读。10 个无独立词头的旧短语不编造词典释义。
- 保存与单字练习由 `window.HanziFunLearningAdapter` 的 `saveCharacter({characterId})` / `startCharacterPractice({characterId,readingId,source})` 适配器接入，返回 `saved:true` / `started:true` 才报告成功。适配器缺失、异常或未确认落盘均明确提示。HF-06 对接时可包装现有 Repository/session 契约，不把此 UI 适配器误写成既有 Repository 已实现的方法。
- 不向旧 prototype/v1 存储写入。本包未接通时不把新增字导入旧闪卡 URL 后静默退成默认六字，改为受控按钮和清晰的未连接状态。HF-05/06 完成后还必须走真实学习闭环。
- 126 页为标准教学候选；**人工验收 Tier2 = 0，Tier1 = 0**。没有为凑增强数量生成假插画或宣称 126 字已全部听读可用。

## 自动验证

环境：macOS、本机 Node **v24.14.0**，依赖沿用锁文件。执行：

```sh
npm test
HF_BUILD_OUTPUT_DIR=/private/tmp/hf04-build-hanzifun npm run build:site
HF_BUILD_OUTPUT_DIR=/private/tmp/hf04-build-repeat npm run build:site
git diff --check
```

- `npm test` **77/77**：原有 64 项，加 HF-04 13 项。覆盖教学完整性与稳定 ID、三种拼音和 ü 规范化/排序/显式放宽、恶意输入、单字/多音 Information、Kanji 正反覆盖、静态正文、410/1323 范围、按字 fetch/缓存版本/失败重试、完整逐笔静图、收藏和练习适配器失败/成功夹具、未审/错读音音频拒绝及互斥停止、发布证据门槛、隔离白名单构建。
- 构建 **880 个公开文件**，保留 **77 个原型路径**、生成 **181 个 noindex 预览页**。构建全量本地链接/资源校验通过；126 份原始 JSON 与来源字节一致，126 份逐笔静图；未输出未知汉字详情页。没有覆盖根 `dist/`。
- 两次隔离构建，全部 880 文件 SHA-256 比较，**差异 0**。公共包无 `.cache/`、原始整库、依赖或项目文档；仅分发实际用到的规范化数据、部件来源切片、可修改构建/解析源码、锁文件及各自许可。公开源面板列出锁定上游、署名和许可，数据许可不被写成整站 MIT。
- 新增页面交互脚本及其导入（dictionary/search-core/stroke-order/learning-entry）gzip 合计 **5,317 bytes**；公共三份旧英文 JS gzip 合计 **10,383 bytes**；共享 CSS gzip **9,652 bytes**。音频帮助模块单独输出 544 bytes gzip，当前页面无播放绑定时不加载它。此为文件压缩预算检查，不是网络 p75 或实验室性能成绩。
- [构建指纹与尺寸收据](evidence/hf04/build-receipt.json)。`content-manifest.json` 记录 HF-02 内容版本与本轮三份编辑输入的 SHA-256。

## 本地浏览器抽查

使用 Codex IAB，本机 HTTP 静态预览 `127.0.0.1:4174`；这不是生产部署，也未取得可报告的独立浏览器内核版本。未声称已测 Safari/Firefox 或真机移动浏览器。

- 字典输入 shui3 → 水详情 → 独立工具同字选中 → Next/Previous；切换龟后键盘 Enter 逐笔，计数为 1/7。请求阻断单个龟 JSON 后看到失败说明，解除阻断后 Load/retry 恢复 0/7。
- CDP 网络收据：龟详情初载请求笔画 JSON **0**；点击 Next 后只请求 `data/strokes/9f9f.json?v={sha256}`，没有其余 125 字 JSON。[网络记录](evidence/hf04/stroke-network.json)。
- 发页切换 fā → fà：Information 变为 fa4/髮；主教学例句保留明确的 fā 标签。水页展示已核实 Kanji；请页的未核实 Kanji 不显示（该反例另有自动检查）。
- 搜索 shuǐ/shui3/water 均显示水，英文含相关条目并按组显示；未知字符串出现可操作空态。汉字精确优先同时由自动用例覆盖。拼音表 lv4 筛出 lü，键盘展开后显示候选 lǘ/lǚ/lǜ 及禁用音频；换 lu 后只显示 lu。
- 四类页面（索引、水详情、独立笔顺、拼音表）分别测试 **360/390/768/1100/1440** 宽度，20 次布局测量均无横向溢出：[尺寸记录](evidence/hf04/responsive.json)。720 CSS px 等效窄视口也无横向溢出；未将它冒充浏览器真实 200% 缩放/真机验收。
- 模拟 prefers-reduced-motion 后重新载入无自动播放；禁用 JS 后水页仍有含义、Information、静图链接，拼音表仍有 410 个可读音节。禁用脚本下独立工具显示默认水静图及全部字页入口，char 参数选择需要脚本，此限制有 noscript 说明。
- 点击发页练习/收藏均显示连接待办，没有保存或开始成功的假提示；适配器真实成功路径仅用可控夹具验证。畸形拼音 fragment 未造成脚本异常。抽查控制台未见未处理警告/错误；人为阻断产生的资源失败是预期注入。
- 验收后清除网络阻断、媒体/脚本/视口模拟，保留字典预览供查看。

截图：[桌面笔顺](evidence/hf04/stroke-order-desktop.png)、[手机 Information](evidence/hf04/information-mobile.png)、[手机拼音筛选](evidence/hf04/pinyin-mobile.png)、[禁用 JS 的水页](evidence/hf04/nojs-water.png)。截图由真实本地页面捕获，不是设计稿。

## 遗留与精确接续

1. 从 HF-02 reports 的 editorial-review / information-issues / word-gaps / audio-requests 开始，人工复核全部英义/读音/简繁语境和 HF-04 原创例句/拼音/英译；把具名审核者、日期与证据持久化到输入。不把本轮 Codex 快审替代人工签字。
2. 逐项审 410 范围/1323 候选，区分标准、罕见、方言、轻声词境；补齐真实录音并听审后，才接入页面播放绑定。音频帮助模块不等于已交付可用音频。
3. HF-05/06 实现真实学习会话与本机 Repository 后接适配器，复测全部受支持字的练习/收藏/刷新保持。不应回退到旧原型的 26 字边界。
4. HF-08 按成熟条目和审核证据收口发布/索引，不因缺可选插画封锁合格标准页；待选 Components/独立词语/简繁导读不在此包启动。
5. 工程交付已可独立复现；上述必需验收未关闭，所以任务总表保留黄色状态。未部署、未生产故事、未改中文课程、未增加账号/同步/Billing，也未碰既有用户未跟踪文件。
