# Hanzifun Rebuild - 跨 Agent 实时交接日志 (PROGRESS)

## 当前所处阶段
- **大阶段**：Phase 1：主站上线（基线整合、126 字字典及 Information、独立笔顺页与拼音表、本机闪卡、两场景、两版 HSK 1 级）
- **当前执行任务**：HF-05 独立引擎/组件验收完成；下一步 HF-06 本机持久化与真实学习联调。HF-02/04 人工内容/拼音/音频验收仍待关闭。
- **状态**：HF-01、HF-03、HF-05（独立范围）已完成；HF-02 与 HF-04 均保留人工验收缺口。用户 2026-10-25 明确授权 HF-04 按缺项安全降级/noindex 预览实施，工程交付不等于前置人工验收通过；精确接续见记录 05。

---

## 交接记录 (Handover Log)

### [记录 01] - 规划基线冻结 (By Codex)
- **已完成**：
  - 完成 `SPEC.md` (v1.2)、`BASELINE.md`、`FILE_ARCHITECTURE.md`、`SOURCES.md`、`VERIFICATION.md`、`DICTIONARY_REFERENCE_REVIEW.md` 的创建与对齐。
  - 完成 `TASKS.md` 及 `tasks/HF-01-baseline.md` 至 `HF-18` 的任务拆解。
- **下一步行动**：
  - 接手的 Agent 请先阅读 `TASKS.md`、`BASELINE.md` 和 `tasks/HF-01-baseline.md`，开始执行第一个基线整合任务。

### [记录 02] - HF-01 基线整合完成 (By WorkBuddy, 2026-10-25)
- **已完成**：
  - `git merge origin/main`（`d5a4c57`）并入父树七课故事课 + 生产流程；解决根 `AGENTS.md` add/add 冲突（保留多 Agent 规范 + 追加故事课规则）。
  - 原型源归档至 `docs/hanzifun-rebuild/archive/prototype/`（15 个关键文件 SHA-256 与 BASELINE 指纹一致；排除 `dist/` 构建产物）。
  - 生成 `baseline/INTEGRATION.md` 与 `contracts/` 四项契约（`routes.json`、`learning-event.schema.json`、`content.schema.json`、`repository-interface.md`）。
  - `npm test` 47/47 全绿；白名单构建 411 文件，无敏感/候选文件泄露，149 处课程资源引用校验 0 缺失。
- **本包修改/新增文件**：
  - 新增：`docs/hanzifun-rebuild/archive/prototype/`（19 个源文件）、`baseline/INTEGRATION.md`、`contracts/`（4 个文件）。
  - 修改：`AGENTS.md`（追加故事课规则）；merge 带入父树 `assets/lessons/*`、`storyboards/*`、`lessons.js`、`story.js`、`styles.css`、`story.css/html`、`index.html`、`package.json`、`scripts/*`、`tests/lessons.test.js`、`STORY_COURSE_PRODUCTION_WORKFLOW.md`、`README.md`、`.gitignore`。
- **遗留问题**：
  - `audio-manifest.json` 声明 `available/total=108`，按字键实际 107 条（“睛”去重），HF-02 收敛。
  - 故事课视听回归需按 `STORY_COURSE_PRODUCTION_WORKFLOW.md` 完整流程人工确认，自动测试不替代。
  - 生产 URL/主机/部署状态待 HF-17/18 上线前核实。
- **下一个 Agent 精确切入点**：
  - 读 `tasks/HF-02-data-foundation.md`（字典/笔顺数据与来源管线）、`tasks/HF-03-site-shell.md`（C 方案框架与七段首页）、`tasks/HF-05-review-engine.md`（复习调度），三者可按文件边界并行；均以本包冻结的契约为准。


### [记录 03] - HF-02 数据基座实现交付，人工验收待关闭 (By Codex, 2026-10-25)
- **工作目录/范围**：主仓库 `/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，main；没有使用旧 worktree，没有覆盖既有未跟踪文件，没有制作故事/引入账号同步 Billing/部署。
- **已完成**：
  - Node.js 可复用下载/提取、规范化构建、schema/资源/覆盖/离线确定性验证、本地预览脚本；原始压缩包及大数据仅存忽略的 `.cache/hf02/`。
  - 核心 107+26−7=126 唯一字、153 字读音、126 份未修改笔画 JSON、Information、85 旧多字词/短语（75 字典词头、10 缺项）；所有生成数据带来源定位，许可分别保存。
  - 410 个显式范围音节、1,323 组词典见证的音节/声调候选；审核与实际音频分开，playable=false。HSK 只交付版本/清单类型/范围决策契约，不宣称已导入清单。
  - “睛”第19/87位独立 cardId → char:775b → 同一个019音频；manifest 按字107、按位置108，生成器/契约1.1同步；不改变原108卡与录音。
  - CC-CEDICT 2026-10-23、Unihan17、hanzi-writer-data2.0.1、MMH固定commit及实际SHA-256/许可落锁；MMH部件字典LGPL与笔画Arphic分开，字段指南按17版解释地区计数。
  - 80个Kanji同字由kJoyoKanji=2010直接支持，46个所查字段未证明，不写否定；四个语境主读音修正：壳ké、肚dù、说shuō、听tīng。
- **文件列表**：
  - 新增 `.gitattributes`（上游许可原文保留原空白，不改写法律文本）；新增 `scripts/{data-foundation-lib,fetch-content-sources,build-data-foundation,validate-data-foundation,preview-data-foundation}.mjs`、`tests/data-foundation.test.mjs`、`package-lock.json`。
  - 新增 `data/README.md`、`sources.lock.json`、`coverage.json`、`core-manifest.json`、`legacy-occurrences.json`、`editorial-decisions.json`、`normalized/`、`pinyin/`、`strokes/`、`schemas/`、`source-extracts/`、`licenses/`、`reports/`（含来源升级模板）。
  - 修改 `.gitignore`、`package.json`、`audio-manifest.json`、`scripts/build-tts-manifest.js`、`docs/hanzifun-rebuild/contracts/content.schema.json`（只改音频统计语义/版本）。
  - 新增 `docs/hanzifun-rebuild/HF-02-VERIFICATION.md` 与 `evidence/hf02/` 三张本地浏览器截图；更新 TASKS、PROGRESS、HF-02任务状态。
- **验证结果**：`npm test` 58/58；`node scripts/validate-data-foundation.mjs` PASS（两次离线重建与入库产物逐字节一致）；`npm run build:site` 411白名单文件，无缓存/原始源/依赖泄漏；Ajv8.20.0安装审计0漏洞。Codex本地浏览器抽查22字完整字形与逐笔切换。
- **遗留事项/验收边界**：
  - 126字的全部英义/读音/简繁语境人工快审尚未签字；Codex只完成逐项摘要源对照，不能当完整人工验收。拼音410范围及1323候选声调需教学复核，尤其罕见/方言/轻声词境。
  - 107旧语境录音尚未重新逐条听审，不能冒充纯音节。19新增核心字无原语境音频；153字读音及拼音音频补录/听审需求均已列出，没有消耗付费TTS。
  - 17个原始部件分解含“？”已列问题报告；10个旧短语无字典独立词头，保留原教学位置，不造词典释义。
  - 完整Tier2教学页仍为0，短助记/例句/练习入口由HF-04接入；缺插画不构成发布阻碍。当前data目录未被旧站白名单构建公开。
- **下一个 Agent 精确切入点**：
  1. 先读本记录、TASKS与当前指定任务；数据接口读 `data/README.md`，验证证据读 `HF-02-VERIFICATION.md`。
  2. 继续HF-02验收时，从 `data/reports/editorial-review.json`、`information-issues.json`、`word-gaps.json`、`audio-requests.json` 逐项处理；审核结论应持久化到输入并接入构建，不能手改会被覆盖的生成报告，未听审音频不开放。
  3. HF-04消费 normalized/、strokes/manifest 与 pinyin/；按字加载笔画，发布时带许可/署名；不要整库复制source-extracts或.cache。主站/HSK页面未在本包实现。

### [记录 04] - HF-03 站点外壳与路由完成 (By Codex, 2026-10-25)
- **工作目录/范围**：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，仅执行 HF-03；未触碰已存在的未跟踪用户文件，也未改写根 `dist/`。
- **已完成**：
  - 将已归档原型改造成 `site/` 维护结构：数据/渲染、基础布局、七段首页、路由表、静态占位模板、共享英文样式和预览配置；首页保留逐字确认副标题、三类人群、三项卖点与六个 HTML FAQ。
  - 覆盖 77 个原型路径的逐项映射，并补充 HF-02 的 126 个受控字典路由及拼音表、政策、数据来源、条款和 404 骨架。`site/release.json` 将默认状态绑定到 `noindex,follow`；预览/计划页面输出对应 robots meta，发布状态策略切换到 `index,follow`。本次没有把未完成英文页开放索引。
  - 桌面/手机导航包含 All Characters、Stroke Order、Pinyin Chart、HSK 2.0/3.0；两套 HSK 入口、Pricing、Sign in、中文与免费闪卡链接均落到契约路径。通过 Escape、焦点返回、字典子导航、键盘翻卡和 FAQ 展开检查。
  - 英文静态输出使用 `/site-assets/` 版本化新资源；原中文 `/zh/`、故事播放器 `/story.html?lesson=...` 和原课程资源继续按旧路径输出。Wrangler 404 配置改为真实 `/404.html`；未知路径不会伪装成首页 200。
- **文件列表**：
  - 新增：`site/data.mjs`、`site/site.mjs`、`site/pages/home.html`、`site/pages/route-stubs.mjs`、`site/layouts/base.html`、`site/routes.mjs`、`site/release.json`、`site/public/site-styles.css`。
  - 新增：`public/site-assets/{hero,audiences,festival}.hf03-v1.jpg`、`public/site-assets/seal.hf03-v1.svg`、`src/client/navigation.mjs`、`src/client/site-preview.js`、`tests/site-shell.test.mjs`、`docs/hanzifun-rebuild/HF-03-VERIFICATION.md`。
  - 修改：`scripts/build-site.js`、`wrangler.toml`、`docs/hanzifun-rebuild/tasks/HF-03-site-shell.md`、`docs/hanzifun-rebuild/TASKS.md`、`docs/hanzifun-rebuild/PROGRESS.md`。
- **验证结果**：最终 `npm test` 64/64（含原有 58 项与 HF-03 新增 6 项）；`HF_BUILD_OUTPUT_DIR=/private/tmp/hf03-build-hanzifun npm run build:site` 成功，输出 601 个公开文件、映射 77 个原型路径并生成 181 个 `noindex` 预览页。隔离输出路径保留原 `dist/`。本地浏览器 360/390/768/1100/1440 宽度均无横向溢出，720 CSS px 等效放大视口无溢出；减少动态效果下无非零 transition；手机/桌面导航、键盘 Escape、焦点、翻卡和 FAQ 均完成交互检查。首页与移动导航截图已在浏览器验收会话捕获并供本次检查；截图接口返回会话图像，没有另存为仓库 PNG。
- **遗留问题**：HF-02 人工英文释义/读音语境、拼音教学声调和音频逐项听审仍未关闭；Phase 2/3 占位页依照当前 release 策略均不可索引。截图目前仅随本会话验收快照保留，未写入项目证据目录。
- **下一个 Agent 精确切入点**：先依 HF-02 验收记录继续完成人工内容/拼音/音频复核；HF-04 在 HF-02 相关验收关闭后读取其数据接口，将 `data/normalized/`、`data/strokes/`、`data/pinyin/` 接入 [HF-03 路由与页面挂载点](tasks/HF-03-site-shell.md)；公开内容索引策略留给 HF-08 按质量门槛放行。

### [记录 05] - HF-04 工程交付，人工内容/音频与学习联调待关闭 (By Codex, 2026-10-25)
- **工作目录/范围**：指定 Desktop 主仓库 main；仅 HF-04，保持 Phase 1。用户明确授权先按审核/缺音安全策略实施并在验证后 commit。未覆盖原 dist 或用户既有未跟踪工作。
- **已交付**：
  - 126 静态详情与全部字索引、按 readingId 更新的 Information、源证支持的 80 个 Kanji；拼音/部首索引、八对比较、按需搜索三分包和来源许可面板。
  - 原创 126 条例词、句子/拼音/英译及独立短助记，持久化 Codex 快审、批次和人工 pending。发的发现教学读音 fā 在独立编辑层选择，保留 HF-02 原始归一化文件及 fà/髮 对应。
  - 独立 `/stroke-order/` 的 char 选字、播放/暂停/上下笔/速度/重置；与详情共用原始按字 JSON 与 126 份完整静态逐笔 SVG。公共 JS 无全库路径，用户操作前不请求任何笔画 JSON；单字缓存键带源文件 SHA-256。
  - `/pinyin-chart/` 完整 410 音节范围与 1323 候选声调、初韵母筛选、ü 别名、零声母/轻声说明和已存在例字互链。所有待审音频明确禁用；未冒充已审教学音频。
  - 收藏/练习适配器仅在明确成功返回时报告成功；未接通显示待办，不把新增字静默送入旧原型默认卡组。审核输入和构建放行门槛接入；release 仍 noindex。
- **新增文件**：
  - `data/editorial/{characters,comparisons,review-decisions}.json`。
  - `site/dictionary-data.mjs`、`site/components/stroke-order.mjs`、`site/pages/{dictionary,stroke-order,pinyin-chart}.mjs`。
  - `src/client/{dictionary,search-core,stroke-order,learning-entry,audio-player}.mjs`、`tests/dictionary.test.mjs`。
  - `docs/hanzifun-rebuild/HF-04-VERIFICATION.md`、`evidence/hf04/`（四张真实页面截图、布局/网络/构建收据）。
- **修改文件**：`scripts/build-site.js`、`site/public/site-styles.css`、`site/release.json`、本日志、TASKS、当前 HF-04 任务说明。
- **验证**：`npm test` **77/77**（原64+新增13）；隔离构建880文件、77原型路径、181 noindex预览页，全量资源检查通过；两次构建全部文件SHA-256差异0。4类页面×5档宽度无横向溢出；实际完成数字调搜索→水详情→独立同字笔顺、龟键盘逐笔、单字失败重试、发多音/简繁、lu/lü筛选、无JS正文/静图/410表、减少动态无自动播放及未连接学习入口检查。证据和明确未测范围见 HF-04-VERIFICATION。
- **遗留/不可冒充**：人工英义/简繁/拼音/例句验收与音频听审未关闭；107旧语境录音不冒充纯音节、19字原语境缺音仍存在；17不完整部件不瞎拆，10短语不造释义。人工验收Tier2与Tier1均0。HF-05/06未接，真实学习闭环未验收。未生产部署、未添加账号同步Billing、未生成或修改故事。浏览器抽查不是Safari/Firefox/真机或真实p75验证。
- **下一个 Agent 精确切入点**：
  1. 读本记录、TASKS、当前指定任务与 `HF-04-VERIFICATION.md`；继续人工审核时从 HF-02 四份问题报告及 `data/editorial/` 输入开始，不能在生成报告里填假签字。
  2. HF-06 对接 `window.HanziFunLearningAdapter.saveCharacter({characterId})` / `startCharacterPractice({characterId,readingId,source})`，分别明确返回 saved/started，包装真实 Repository/session，不改原v1记录；补做真实落盘/续练联调。
  3. 音节教学审核和真实录音绑定后接入播放；本包仅有失败关闭的帮助模块和夹具，不宣称真实发音完成。HF-08 按审核与标准页质量逐页放行，不能因缺插画阻塞成熟Tier2。

### [记录 06] - HF-05 复习引擎与独立组件完成 (By Codex, 2026-10-25)
- **工作目录/范围**：指定 Desktop 主仓库，实现前 HEAD `f586268`；仅 HF-05，用户明确授权实现、验证和 git commit。保留既有未跟踪文件；没有修改故事/原中文记录/生产部署/账号同步Billing。
- **交付**：interval-v1 stage0—6与1/3/7/14/30/60天、again10分钟；到期优先/稳定cardId/独立新额度；固定IANA额度时区与UTC有效时钟；UUID、内容/卡片/会话revision、日志重放与去重。冻结卡序/内容、先翻后评、暂停恢复、free追加再看、唯一完成、未保存重试及恢复导出。睛19/87卡独立排程，char:775b唯一字统计去重。
- **新增文件**：`src/learning/{scheduler,events,session}.mjs`；`src/client/flashcards.mjs`、`flashcards.css`；`tests/{review-engine,review-session,flashcards}.test.mjs`；`tests/fixtures/hf05-preview.html`；`scripts/verify-review-browser.mjs`；`HF-05-INTEGRATION.md`、`HF-05-VERIFICATION.md` 与 `evidence/hf05/{receipt,checks}.json`、两张真实浏览器截图（文档/证据均位于本目录）。
- **修改文件**：本 PROGRESS、TASKS、`tasks/HF-05-review-engine.md`。没有改 frozen schema 或 Repository 契约、公开构建/路由、原 dist。
- **验证**：`npm test` **98/98**，原77+新增21；覆盖到期前后一毫秒/阶段/额度/时区DST/回拨/UUID与评价槽位幂等/120次性质检查/组件提交与焦点/模拟旧标签页revision冲突。隔离构建880文件、77原型路径、181 noindex页且测试夹具未发布。真实Chrome155隔离夹具完成键盘、暂停刷新恢复、失败重试、完成刷新去重及360/390/768/1100/1440无横向溢出。源码指纹、命令及精确范围见HF-05-VERIFICATION。
- **遗留与边界**：HF-06真实localStorage、旧记录迁移、隐私窗口与跨标签页写锁尚未实现/验收；浏览器夹具用专用sessionStorage及合成内容，不能冒充真实学习闭环。IANA额度账本固定首次排程时区，暂不提供额度时区迁移；立即再看只追加未结束会话，结束重练由宿主新建free会话。HF-02/04人工/音频缺口不变；未测Safari/Firefox/真机/真实屏幕阅读器。
- **下一个 Agent 精确切入点**：先读本记录、TASKS及当前指定任务，再读 `HF-05-INTEGRATION.md`。按用户决定优先遵循repository-interface.md用localStorage单键确定性快照；保留旧hanzifun.learning.v1只读原文与导入批次，隐私模式失败明确未保存。封装commit事务（event+projection+cursor），检查日志head/length与session revision、相同事务重试优先ack，写锁防跨标签页覆盖。接HF-04 `window.HanziFunLearningAdapter` 的saveCharacter/startCharacterPractice，成功保存初始快照才返回started；真实四组卡和字典入口完成落盘/续练验收后再关闭HF-04学习联调缺口。
